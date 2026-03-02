import { Hono } from 'hono';
import { verify } from '../utils/jwt.js';

const foodEntries = new Hono();

// JWT middleware
foodEntries.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const decoded = await verify(token, c.env.JWT_SECRET);
    c.set('userId', decoded.userId);
    c.set('email', decoded.email);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Get all food entries
foodEntries.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    const db = c.env.DB;

    const { results } = await db.prepare(`
      SELECT * FROM food_entries 
      WHERE user_id = ? 
      ORDER BY date DESC, created_at DESC
    `).bind(userId).all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching food entries:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Get food entries for date range
foodEntries.get('/range', async (c) => {
  try {
    const userId = c.get('userId');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const db = c.env.DB;

    const { results } = await db.prepare(`
      SELECT * FROM food_entries 
      WHERE user_id = ? AND date >= ? AND date <= ?
      ORDER BY date DESC, created_at DESC
    `).bind(userId, startDate, endDate).all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching food entries:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Create food entry
foodEntries.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const entry = await c.req.json();
    const db = c.env.DB;

    await db.prepare(`
      INSERT INTO food_entries (
        id, user_id, date, name, brand, category, meal_type,
        serving_size, serving_unit, servings,
        calories, protein, carbs, fat, fiber, sugar, sodium
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      entry.id,
      userId,
      entry.date,
      entry.name,
      entry.brand || null,
      entry.category || null,
      entry.mealType,
      entry.servingSize,
      entry.servingUnit,
      entry.servings,
      entry.calories,
      entry.protein,
      entry.carbs,
      entry.fat,
      entry.fiber || 0,
      entry.sugar || 0,
      entry.sodium || 0
    ).run();

    return c.json({ message: 'Food entry created', entry }, 201);
  } catch (error) {
    console.error('Error creating food entry:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Update food entry
foodEntries.put('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const entry = await c.req.json();
    const db = c.env.DB;

    const result = await db.prepare(`
      UPDATE food_entries SET
        date = ?, name = ?, brand = ?, category = ?, meal_type = ?,
        serving_size = ?, serving_unit = ?, servings = ?,
        calories = ?, protein = ?, carbs = ?, fat = ?,
        fiber = ?, sugar = ?, sodium = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      entry.date,
      entry.name,
      entry.brand || null,
      entry.category || null,
      entry.mealType,
      entry.servingSize,
      entry.servingUnit,
      entry.servings,
      entry.calories,
      entry.protein,
      entry.carbs,
      entry.fat,
      entry.fiber || 0,
      entry.sugar || 0,
      entry.sodium || 0,
      id,
      userId
    ).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Food entry not found' }, 404);
    }

    return c.json({ message: 'Food entry updated' });
  } catch (error) {
    console.error('Error updating food entry:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Delete food entry
foodEntries.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const db = c.env.DB;

    const result = await db.prepare(
      'DELETE FROM food_entries WHERE id = ? AND user_id = ?'
    ).bind(id, userId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Food entry not found' }, 404);
    }

    return c.json({ message: 'Food entry deleted' });
  } catch (error) {
    console.error('Error deleting food entry:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Bulk sync food entries
foodEntries.post('/sync', async (c) => {
  try {
    const userId = c.get('userId');
    const { entries } = await c.req.json();
    const db = c.env.DB;

    // Use batch for better performance
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO food_entries (
        id, user_id, date, name, brand, category, meal_type,
        serving_size, serving_unit, servings,
        calories, protein, carbs, fat, fiber, sugar, sodium
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const batch = entries.map(entry => 
      stmt.bind(
        entry.id,
        userId,
        entry.date,
        entry.name,
        entry.brand || null,
        entry.category || null,
        entry.mealType,
        entry.servingSize,
        entry.servingUnit,
        entry.servings,
        entry.calories,
        entry.protein,
        entry.carbs,
        entry.fat,
        entry.fiber || 0,
        entry.sugar || 0,
        entry.sodium || 0
      )
    );

    await db.batch(batch);

    return c.json({ message: `${entries.length} entries synced successfully` });
  } catch (error) {
    console.error('Error syncing food entries:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

export default foodEntries;
