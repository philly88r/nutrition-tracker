/**
 * Nutrition Coach handler — Hono context-aware so it can write to D1
 *
 * Grocery list and recipe saving use a SEPARATE structured JSON call (json_schema)
 * so there is no fragile parsing of chat responses.
 * The chat call is only used for conversational replies.
 */

const callKimiChat = async (env, messages) => {
  let response;
  try {
    response = await env.AI.run('@cf/moonshotai/kimi-k2.5', {
      messages,
      stream: false,
      max_tokens: 4000,
      web_search_options: { search_context_size: 'medium' }
    });
  } catch {
    // Fallback without web search
    response = await env.AI.run('@cf/moonshotai/kimi-k2.5', {
      messages,
      stream: false,
      max_tokens: 4000
    });
  }

  const content =
    response?.choices?.[0]?.message?.content
    || response?.choices?.[0]?.text
    || response?.response
    || response?.result?.response
    || (typeof response === 'string' ? response : null);

  if (!content) return null;

  // Strip any leaked tool call XML
  return content
    .replace(/<function_calls>[\s\S]*?<\/function_calls>/gi, '')
    .replace(/<invoke[\s\S]*?<\/invoke>/gi, '')
    .replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, '')
    .trim();
};

const callKimiStructured = async (env, userPrompt, schema) => {
  // Try json_schema format first (no web_search — they are incompatible together)
  let raw = null;
  try {
    const response = await env.AI.run('@cf/moonshotai/kimi-k2.5', {
      messages: [
        { role: 'system', content: 'You are a nutrition assistant. Respond only with valid JSON matching the schema provided.' },
        { role: 'user', content: userPrompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'structured_output', schema, strict: true }
      },
      stream: false,
      max_tokens: 8000
    });
    raw = response?.choices?.[0]?.message?.content || response?.response || null;
  } catch (e) {
    console.error('json_schema call failed:', e.message);
  }

  // Fallback: plain call asking for JSON, with web search
  if (!raw) {
    const response = await env.AI.run('@cf/moonshotai/kimi-k2.5', {
      messages: [
        { role: 'system', content: 'You are a nutrition assistant. You MUST respond with ONLY valid JSON, no markdown, no explanation. Just the raw JSON object.' },
        { role: 'user', content: userPrompt }
      ],
      web_search_options: { search_context_size: 'medium' },
      stream: false,
      max_tokens: 8000
    });
    raw = response?.choices?.[0]?.message?.content || response?.response || null;
    // Strip code fences if present
    if (raw) {
      const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fence) raw = fence[1].trim();
      raw = raw.replace(/<function_calls>[\s\S]*?<\/function_calls>/gi, '').trim();
    }
  }

  if (!raw) throw new Error('No structured response from AI');
  return JSON.parse(raw);
};

export const coachHandler = async (c) => {
  try {
    const formData = await c.req.formData();
    const message = formData.get('message') || '';
    const contextStr = formData.get('context');
    const imageFile = formData.get('image');
    const conversationStr = formData.get('conversation');

    const context = contextStr ? JSON.parse(contextStr) : {};
    const userId = c.get('userId');
    const db = c.env.DB;

    const isGroceryBuild = /build.*(grocery|shopping|groceries|list)|grocery.*(list|week)|shopping.*(list|week)/i.test(message);
    const isUpdateMeal = /\b(change|update|edit|modify|correct|fix|adjust|move)\b.{0,80}(slice|piece|serving|cup|gram|oz|portion|amount|calorie|entry|log|date|\d+(st|nd|rd|th))|from \d+\s*(slice|piece|serving|cup|gram|oz|st|nd|rd|th)?\s*to \d+|i (actually|just)? ?(had|ate) \d+\b|\bmove (it|that|my|the)\b/i.test(message);
    const isRecipeRequest = !isUpdateMeal && /find.*(recipe|meal|dish)|search.*(recipe|meal)|recipe.*(for|with|that)|make.*(recipe|meal)|save.*(recipe|this)/i.test(message);
    const isLogMeal = !isUpdateMeal && /^(log|i (just |had |ate |consumed |just ate |just had )|just ate|just had|log (my|a|this)|add (this|to my log|to my diary))/i.test(message);
    const isLogImage = !!imageFile && /log|add to (my )?(log|diary)|ate|had|consumed/i.test(message);
    const hasStore = context.groceryStore && context.groceryStore.trim() !== '';

    // Build base64 image once if present (chunked to avoid stack overflow)
    let imageUrl = null;
    if (imageFile) {
      const imageBytes = await imageFile.arrayBuffer();
      const bytes = new Uint8Array(imageBytes);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.byteLength; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      imageUrl = `data:${imageFile.type};base64,${btoa(binary)}`;
    }

    // --- UPDATE / EDIT / MOVE A LOGGED MEAL ---
    if (isUpdateMeal) {
      // Search last 7 days so moves across dates work
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const { results: recentEntries } = await db.prepare(
        `SELECT id, name, date, meal_type, servings, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar
         FROM food_entries WHERE user_id = ? AND date >= ? ORDER BY date DESC, created_at DESC LIMIT 30`
      ).bind(userId, sevenDaysAgo).all();

      if (!recentEntries || recentEntries.length === 0) {
        return c.json({ response: "I don't see any recent food entries to update. Try logging your meal first!" });
      }

      const updateSchema = {
        type: 'object',
        properties: {
          entryId:        { type: 'string', description: 'ID of the entry to update' },
          newDate:        { type: 'string', description: 'New date YYYY-MM-DD — same as current date if not moving' },
          newServings:    { type: 'number', description: 'New serving count — same as current if not changing' },
          newCalories:    { type: 'number' },
          newProtein:     { type: 'number' },
          newCarbs:       { type: 'number' },
          newFat:         { type: 'number' },
          newFiber:       { type: 'number' },
          newSugar:       { type: 'number' },
          newServingSize: { type: 'number' },
          newServingUnit: { type: 'string' }
        },
        required: ['entryId', 'newDate', 'newServings', 'newCalories', 'newProtein', 'newCarbs', 'newFat', 'newFiber', 'newSugar', 'newServingSize', 'newServingUnit']
      };

      const entriesList = recentEntries.map(e =>
        `ID:${e.id} | Date:${e.date} | ${e.name} | ${e.servings}x${e.serving_size}${e.serving_unit} | ${e.calories}cal ${e.protein}g prot ${e.carbs}g carb ${e.fat}g fat`
      ).join('\n');

      // Determine current year/month for resolving day-of-month references like "the 21st"
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

      const prompt = `User wants to edit or move a logged meal entry. Their message: "${message}"

Recent logged entries (last 7 days):
${entriesList}

Current year/month: ${currentYear}-${currentMonth}
When the user says "the 21st" or "the 22nd" they mean day ${currentYear}-${currentMonth}-21 or ${currentYear}-${currentMonth}-22.

Identify the correct entry by name match. If moving to a different date, set newDate to the target YYYY-MM-DD. If only changing servings, scale nutrition proportionally. If not changing nutrition, keep the existing values. Return all fields.`;

      const update = await callKimiStructured(c.env, prompt, updateSchema);
      const entry = recentEntries.find(e => e.id === update.entryId);

      if (!entry) {
        return c.json({ response: "I couldn't find that entry in your recent log. Could you be more specific about which food to update?" });
      }

      await db.prepare(
        `UPDATE food_entries SET date=?, servings=?, serving_size=?, serving_unit=?, calories=?, protein=?, carbs=?, fat=?, fiber=?, sugar=?
         WHERE id=? AND user_id=?`
      ).bind(
        update.newDate || entry.date,
        update.newServings,
        update.newServingSize || entry.serving_size,
        update.newServingUnit || entry.serving_unit,
        update.newCalories, update.newProtein, update.newCarbs,
        update.newFat, update.newFiber, update.newSugar,
        update.entryId, userId
      ).run();

      const dateChanged = update.newDate && update.newDate !== entry.date;
      const response = dateChanged
        ? `Done! **${entry.name}** moved from ${entry.date} to ${update.newDate}. ✅ Refresh the screen to see the changes.`
        : `Updated! **${entry.name}** changed to ${update.newServings} serving(s) — ${update.newCalories} kcal, ${update.newProtein}g protein, ${update.newCarbs}g carbs, ${update.newFat}g fat. ✅ Refresh the screen to see the changes.`;

      return c.json({ response, action: 'meal_logged' });
    }

    // --- GROCERY LIST ---
    if (isGroceryBuild) {
      if (!hasStore) {
        return c.json({
          response: "I'd love to build your grocery list! 🛒 What grocery store do you shop at? (e.g. Walmart, Kroger, Publix, Aldi, Whole Foods, Costco) — I'll pull items actually available there.",
          action: 'ask_grocery_store'
        });
      }

      const grocerySchema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name:     { type: 'string' },
                brand:    { type: 'string' },
                category: { type: 'string' },
                quantity: { type: 'number' },
                unit:     { type: 'string' },
                calories: { type: 'number' },
                protein:  { type: 'number' },
                carbs:    { type: 'number' },
                fat:      { type: 'number' },
                fiber:    { type: 'number' }
              },
              required: ['name', 'brand', 'category', 'quantity', 'unit', 'calories', 'protein', 'carbs', 'fat', 'fiber']
            }
          }
        },
        required: ['items']
      };

      const prompt = `Search ${context.groceryStore} for real grocery items that align with these daily macro goals:
- Calories: ${context.dailyGoals?.calories || 2000} kcal
- Protein: ${context.dailyGoals?.protein || 150}g
- Carbs: ${context.dailyGoals?.carbs || 200}g
- Fat: ${context.dailyGoals?.fat || 65}g
User request: "${message}"
Return 10-15 specific grocery items available at ${context.groceryStore} with accurate nutrition per serving.`;

      const result = await callKimiStructured(c.env, prompt, grocerySchema);
      const items = result.items || [];

      for (const item of items) {
        const id = crypto.randomUUID();
        await db.prepare(`
          INSERT INTO grocery_items (id, user_id, name, brand, category, quantity, unit, checked, calories, protein, carbs, fat, fiber)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
        `).bind(
          id, userId,
          item.name, item.brand || null, item.category || null,
          item.quantity || 1, item.unit || 'each',
          item.calories || null, item.protein || null,
          item.carbs || null, item.fat || null, item.fiber || null
        ).run();
      }

      return c.json({
        response: `Done! I added **${items.length} items** to your list. Check the **Grocery List** tab in the menu! 🛒`,
        action: 'grocery_list_saved',
        itemsSaved: items.length
      });
    }

    // --- RECIPE ---
    if (isRecipeRequest) {
      const recipeSchema = {
        type: 'object',
        properties: {
          name:         { type: 'string' },
          description:  { type: 'string' },
          source_url:   { type: 'string' },
          servings:     { type: 'number' },
          prep_time:    { type: 'string' },
          cook_time:    { type: 'string' },
          calories:     { type: 'number' },
          protein:      { type: 'number' },
          carbs:        { type: 'number' },
          fat:          { type: 'number' },
          fiber:        { type: 'number' },
          tags:         { type: 'array', items: { type: 'string' } },
          ingredients:  { type: 'array', items: { type: 'string' } },
          instructions: { type: 'array', items: { type: 'string' } }
        },
        required: ['name', 'description', 'source_url', 'servings', 'prep_time', 'cook_time', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'tags', 'ingredients', 'instructions']
      };

      const prompt = `Search the web and find a real recipe matching: "${message}"
User macro goals — Calories: ${context.dailyGoals?.calories || 2000}, Protein: ${context.dailyGoals?.protein || 150}g, Carbs: ${context.dailyGoals?.carbs || 200}g, Fat: ${context.dailyGoals?.fat || 65}g.
Return one specific real recipe with accurate nutrition info per serving, full ingredients list, and step-by-step instructions.`;

      const recipe = await callKimiStructured(c.env, prompt, recipeSchema);
      const id = crypto.randomUUID();

      await db.prepare(`
        INSERT INTO saved_recipes (id, user_id, name, source_url, description, ingredients, instructions, servings, prep_time, cook_time, calories, protein, carbs, fat, fiber, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, userId,
        recipe.name, recipe.source_url || null, recipe.description || null,
        JSON.stringify(recipe.ingredients || []),
        JSON.stringify(recipe.instructions || []),
        recipe.servings || 1,
        recipe.prep_time || null, recipe.cook_time || null,
        recipe.calories || null, recipe.protein || null,
        recipe.carbs || null, recipe.fat || null, recipe.fiber || null,
        JSON.stringify(recipe.tags || [])
      ).run();

      return c.json({
        response: `Found it! **"${recipe.name}"** has been saved. Check the **Saved Recipes** tab in the menu! 📖`,
        action: 'recipe_saved'
      });
    }

    // --- LOG A MEAL (text or image) ---
    if (isLogMeal || isLogImage) {
      const logSchema = {
        type: 'object',
        properties: {
          name:        { type: 'string' },
          brand:       { type: 'string' },
          calories:    { type: 'number' },
          protein:     { type: 'number' },
          carbs:       { type: 'number' },
          fat:         { type: 'number' },
          fiber:       { type: 'number' },
          sugar:       { type: 'number' },
          servingSize: { type: 'number' },
          servingUnit: { type: 'string' },
          mealType:    { type: 'string' }
        },
        required: ['name', 'brand', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'servingSize', 'servingUnit', 'mealType']
      };

      let entry;

      if (imageUrl) {
        // Vision call — extract nutrition directly from the image
        const visionResponse = await c.env.AI.run('@cf/moonshotai/kimi-k2.5', {
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition assistant. Analyze the food or nutrition label in the image and respond with ONLY valid JSON. No markdown, no explanation.'
            },
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: imageUrl } },
                {
                  type: 'text',
                  text: `Extract the nutrition information from this image and return JSON with these exact fields:
{"name":"food name","brand":"brand or empty string","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0,"servingSize":1,"servingUnit":"serving","mealType":"Snacks"}
Use the label values if visible. Determine mealType as Breakfast/Lunch/Dinner/Snacks. Message context: "${message}"`
                }
              ]
            }
          ],
          stream: false,
          max_tokens: 1000
        });

        let raw = visionResponse?.choices?.[0]?.message?.content || visionResponse?.response || null;
        if (raw) {
          const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (fence) raw = fence[1].trim();
          raw = raw.replace(/<function_calls>[\s\S]*?<\/function_calls>/gi, '').trim();
          entry = JSON.parse(raw);
        }
      }

      // Fallback to text-based structured call if no image or vision failed
      if (!entry) {
        const prompt = `Search for accurate nutrition data and parse this meal description into structured data: "${message}"
Determine the meal type (Breakfast, Lunch, Dinner, or Snacks) from context or time of day.
Return accurate nutrition values per serving.`;
        entry = await callKimiStructured(c.env, prompt, logSchema);
      }
      const entryId = crypto.randomUUID();
      const today = new Date().toISOString().slice(0, 10);

      await db.prepare(`
        INSERT INTO food_entries (id, user_id, date, name, brand, category, meal_type, serving_size, serving_unit, servings, calories, protein, carbs, fat, fiber, sugar, sodium)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, 0)
      `).bind(
        entryId, userId, today,
        entry.name || 'AI Logged Meal',
        entry.brand || '',
        null,
        entry.mealType || 'Snacks',
        entry.servingSize || 1,
        entry.servingUnit || 'serving',
        entry.calories || 0,
        entry.protein  || 0,
        entry.carbs    || 0,
        entry.fat      || 0,
        entry.fiber    || 0,
        entry.sugar    || 0
      ).run();

      return c.json({
        response: `Logged! **${entry.name}** added to your ${entry.mealType || 'food diary'} — ${entry.calories} kcal, ${entry.protein}g protein, ${entry.carbs}g carbs, ${entry.fat}g fat. ✅ **Refresh the screen to see it on your Dashboard.**`,
        action: 'meal_logged'
      });
    }

    // --- GENERAL CHAT ---
    const userGoals = `User goals: ${context.dailyGoals?.calories || 2000} kcal, ${context.dailyGoals?.protein || 150}g protein, ${context.dailyGoals?.carbs || 200}g carbs, ${context.dailyGoals?.fat || 65}g fat. Consumed today: ${context.dailyTotals?.calories || 0} kcal, ${context.dailyTotals?.protein || 0}g protein.`;

    const chatMessages = [
      { role: 'system', content: `You are an expert AI Nutrition Coach. Use web search for accurate nutrition data. ${userGoals} Be concise, friendly, and use emojis occasionally.` }
    ];

    // Prior conversation context
    if (conversationStr) {
      try {
        const prev = JSON.parse(conversationStr);
        for (const msg of prev.slice(-6)) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            chatMessages.push({ role: msg.role, content: msg.content || '' });
          }
        }
      } catch (_) {}
    }

    // Image support
    if (imageUrl) {
      chatMessages.push({
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl } },
          { type: 'text', text: message || 'Analyze this nutrition label. Tell me exactly what it contains (calories, protein, carbs, fat) and whether I should eat it based on my remaining macros today.' }
        ]
      });
    } else {
      chatMessages.push({ role: 'user', content: message });
    }

    const reply = await callKimiChat(c.env, chatMessages);

    if (!reply) {
      return c.json({ response: "I'm having trouble connecting right now. Please try again in a moment." });
    }

    return c.json({ response: reply });

  } catch (error) {
    console.error('Coach error:', error);
    return c.json({ response: `Something went wrong: ${error.message}. Please try again.` });
  }
};
