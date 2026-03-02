import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  GEMINI_API_KEY: string
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())

// --- AI HELPER ---
const callGemini = async (systemPrompt: string, userPrompt: string, apiKey: string) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser Input: ${userPrompt}` }]
      }],
      generationConfig: { response_mime_type: "application/json" }
    })
  })
  const json: any = await response.json()
  return json.candidates?.[0]?.content?.parts?.[0]?.text
}

// --- ENDPOINTS ---

// 1. AI "Lazy Log" (Natural Language to JSON)
app.post('/v1/ai-log', async (c) => {
  const { mealDescription } = await c.req.json()
  const systemPrompt = `You are a nutrition expert. Parse the user's meal description into a JSON object.
  Format: { "name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "servingSize": number, "servingUnit": string }.
  Estimate accurately based on standard portions.`
  
  const result = await callGemini(systemPrompt, mealDescription, c.env.GEMINI_API_KEY)
  return c.json(JSON.parse(result))
})

// 2. AI Nutrition Coach
app.post('/v1/coach', async (c) => {
  const { history, goals } = await c.req.json()
  const systemPrompt = `Analyze the user's recent food history against their goals: ${JSON.stringify(goals)}.
  Provide 2-3 sentences of actionable, encouraging coaching advice. Format as JSON: { "advice": string }.`
  
  const result = await callGemini(systemPrompt, JSON.stringify(history), c.env.GEMINI_API_KEY)
  return c.json(JSON.parse(result))
})

// 3. Recipe URL Scraper (AI-Powered)
app.post('/v1/scrape-recipe', async (c) => {
  const { url } = await c.req.json()
  
  // Note: In a real app, you would use Firecrawl or a fetcher here.
  // We'll simulate the scrape by fetching the HTML and letting Gemini parse it.
  const htmlResponse = await fetch(url)
  const html = await htmlResponse.text()
  
  const systemPrompt = `Extract nutrition information per serving from this recipe HTML. 
  Format: { "name": string, "calories": number, "protein": number, "carbs": number, "fat": number }.`
  
  const result = await callGemini(systemPrompt, html.substring(0, 10000), c.env.GEMINI_API_KEY)
  return c.json(JSON.parse(result))
})

export default app
