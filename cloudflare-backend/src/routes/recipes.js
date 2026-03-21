import { Hono } from 'hono';
import { verify } from '../utils/jwt.js';

const recipes = new Hono();

// JWT middleware
recipes.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }
  try {
    const token = authHeader.substring(7);
    const decoded = await verify(token, c.env.JWT_SECRET);
    c.set('userId', decoded.userId);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Get all saved recipes
recipes.get('/', async (c) => {
  const userId = c.get('userId');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM saved_recipes WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all();
  return c.json(results);
});

// Get single recipe
recipes.get('/:id', async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();
  const recipe = await c.env.DB.prepare(
    'SELECT * FROM saved_recipes WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first();
  if (!recipe) return c.json({ error: 'Recipe not found' }, 404);
  return c.json(recipe);
});

// Delete recipe
recipes.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();
  const result = await c.env.DB.prepare(
    'DELETE FROM saved_recipes WHERE id = ? AND user_id = ?'
  ).bind(id, userId).run();
  if (result.meta.changes === 0) return c.json({ error: 'Recipe not found' }, 404);
  return c.json({ message: 'Recipe deleted' });
});

export default recipes;
