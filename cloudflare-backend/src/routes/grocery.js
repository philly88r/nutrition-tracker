import { Hono } from 'hono';
import { verify } from '../utils/jwt.js';

const grocery = new Hono();

// JWT middleware (same as other routes)
grocery.use('/*', async (c, next) => {
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

// Get all grocery items
grocery.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    const db = c.env.DB;

    const { results } = await db.prepare(
      'SELECT * FROM grocery_items WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching grocery items:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Create grocery item
grocery.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const item = await c.req.json();
    const db = c.env.DB;

    await db.prepare(`
      INSERT INTO grocery_items (
        id, user_id, name, brand, category, quantity, unit, checked,
        calories, protein, carbs, fat, fiber
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      item.id,
      userId,
      item.name,
      item.brand || null,
      item.category || null,
      item.quantity,
      item.unit,
      item.checked ? 1 : 0,
      item.calories || null,
      item.protein || null,
      item.carbs || null,
      item.fat || null,
      item.fiber || null
    ).run();

    return c.json({ message: 'Grocery item created', item }, 201);
  } catch (error) {
    console.error('Error creating grocery item:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Update grocery item
grocery.put('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const item = await c.req.json();
    const db = c.env.DB;

    const result = await db.prepare(`
      UPDATE grocery_items SET
        name = ?, brand = ?, category = ?, quantity = ?, unit = ?, checked = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      item.name,
      item.brand || null,
      item.category || null,
      item.quantity,
      item.unit,
      item.checked ? 1 : 0,
      id,
      userId
    ).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Grocery item not found' }, 404);
    }

    return c.json({ message: 'Grocery item updated' });
  } catch (error) {
    console.error('Error updating grocery item:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Delete grocery item
grocery.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const db = c.env.DB;

    const result = await db.prepare(
      'DELETE FROM grocery_items WHERE id = ? AND user_id = ?'
    ).bind(id, userId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Grocery item not found' }, 404);
    }

    return c.json({ message: 'Grocery item deleted' });
  } catch (error) {
    console.error('Error deleting grocery item:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

export default grocery;
