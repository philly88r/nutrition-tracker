import { Hono } from 'hono';
import { verify } from '../utils/jwt.js';
import { coachHandler } from './coach.js';

const ai = new Hono();

const callWorkersAI = async (userPrompt, env) => {
  try {
    // Define JSON schema for structured output
    const nutritionSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the food item' },
        brand: { type: 'string', description: 'Brand name (empty string if unknown)' },
        calories: { type: 'number', description: 'Calories per serving' },
        protein: { type: 'number', description: 'Protein in grams' },
        carbs: { type: 'number', description: 'Carbohydrates in grams' },
        fat: { type: 'number', description: 'Fat in grams' },
        fiber: { type: 'number', description: 'Fiber in grams' },
        sugar: { type: 'number', description: 'Sugar in grams' },
        servingSize: { type: 'number', description: 'Serving size quantity' },
        servingUnit: { type: 'string', description: 'Serving size unit (e.g., cup, oz, grams)' }
      },
      required: ['name', 'brand', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'servingSize', 'servingUnit']
    };

    const response = await env.AI.run('@cf/moonshotai/kimi-k2.5', {
      messages: [
        { 
          role: 'system', 
          content: 'You are a nutrition expert. Use web search to find accurate, up-to-date nutrition data for foods. Parse meal descriptions into structured nutrition data with verified information from reliable sources.' 
        },
        { 
          role: 'user', 
          content: `Search the web for accurate nutrition information and parse this meal description into nutrition data: ${userPrompt}` 
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'nutrition_data',
          schema: nutritionSchema,
          strict: true
        }
      },
      web_search_options: {
        search_context_size: 'medium'
      },
      stream: false,
      max_tokens: 1000
    });

    // Workers AI uses OpenAI-compatible format
    if (!response || !response.choices || !response.choices[0]) {
      console.error('Invalid Workers AI response:', response);
      throw new Error('Workers AI returned invalid response structure');
    }

    const message = response.choices[0].message;
    if (!message || !message.content) {
      console.error('No content in Workers AI message:', message);
      throw new Error('Workers AI message has no content');
    }

    // With json_schema, content should be clean JSON
    return JSON.parse(message.content);
  } catch (error) {
    console.error('Workers AI call failed:', error);
    throw error;
  }
};

// JWT middleware
ai.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const decoded = await verify(token, c.env.JWT_SECRET);
    c.set('userId', decoded.userId);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

ai.post('/log', async (c) => {
  try {
    const userId = c.get('userId');
    const { mealDescription, mealType = 'Snacks', date } = await c.req.json();

    if (!mealDescription) {
      return c.json({ error: 'mealDescription is required' }, 400);
    }

    // Call Workers AI with structured output
    const parsed = await callWorkersAI(mealDescription, c.env);
    
    if (!parsed) {
      return c.json({ error: 'AI did not return a response' }, 502);
    }

    const entryId = crypto.randomUUID();
    const entryDate = date || new Date().toISOString().slice(0, 10);

    await c.env.DB.prepare(`
      INSERT INTO food_entries (
        id, user_id, date, name, brand, category, meal_type,
        serving_size, serving_unit, servings,
        calories, protein, carbs, fat, fiber, sugar, sodium
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      entryId,
      userId,
      entryDate,
      parsed.name || 'AI Logged Meal',
      parsed.brand || '',
      null, // category - not provided by AI
      mealType,
      parsed.servingSize || 1,
      parsed.servingUnit || 'serving',
      1, // servings - always 1 for AI entries
      parsed.calories || 0,
      parsed.protein || 0,
      parsed.carbs || 0,
      parsed.fat || 0,
      parsed.fiber || 0,
      parsed.sugar || 0,
      0 // sodium - not provided by AI
    ).run();

    return c.json({
      message: 'AI entry logged',
      entry: {
        id: entryId,
        date: entryDate,
        mealType,
        name: parsed.name || 'AI Logged Meal',
        brand: parsed.brand || '',
        category: null,
        servingSize: parsed.servingSize || 1,
        servingUnit: parsed.servingUnit || 'serving',
        servings: 1,
        calories: parsed.calories || 0,
        protein: parsed.protein || 0,
        carbs: parsed.carbs || 0,
        fat: parsed.fat || 0,
        fiber: parsed.fiber || 0,
        sugar: parsed.sugar || 0,
        sodium: 0,
        synced: true
      }
    }, 201);
  } catch (error) {
    console.error('AI log error:', error);
    return c.json({ error: 'Failed to process AI log' }, 500);
  }
});

// Nutrition Coach endpoint — requires pro subscription or book owner access
ai.post('/coach', async (c, next) => {
  const userId = c.get('userId');
  const user = await c.env.DB.prepare(
    'SELECT subscription_status, subscription_type, auth_type FROM users WHERE id = ?'
  ).bind(userId).first();

  const hasAccess = user && (
    user.subscription_status === 'pro' ||
    user.auth_type === 'kdp' ||
    user.subscription_type === 'book_lifetime'
  );

  if (!hasAccess) {
    return c.json({ error: 'pro_required', message: 'The AI Nutrition Coach requires a Pro subscription.' }, 403);
  }
  return next();
}, coachHandler);

export default ai;
