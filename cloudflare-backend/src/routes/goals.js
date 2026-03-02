import { Hono } from 'hono';
import { verify } from '../utils/jwt.js';

const goals = new Hono();

// JWT middleware
goals.use('/*', async (c, next) => {
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

// Get user's daily goals
goals.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    const db = c.env.DB;

    let goalsData = await db.prepare(
      'SELECT * FROM daily_goals WHERE user_id = ?'
    ).bind(userId).first();

    if (!goalsData) {
      // Create default goals
      await db.prepare(`
        INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fiber)
        VALUES (?, 2000, 150, 200, 65, 30)
      `).bind(userId).run();

      goalsData = await db.prepare(
        'SELECT * FROM daily_goals WHERE user_id = ?'
      ).bind(userId).first();
    }

    return c.json(goalsData);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Update daily goals
goals.put('/', async (c) => {
  try {
    const userId = c.get('userId');
    const { calories, protein, carbs, fat, fiber } = await c.req.json();
    const db = c.env.DB;

    const result = await db.prepare(`
      UPDATE daily_goals SET
        calories = ?, protein = ?, carbs = ?, fat = ?, fiber = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(calories, protein, carbs, fat, fiber, userId).run();

    if (result.meta.changes === 0) {
      // Create if doesn't exist
      await db.prepare(`
        INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fiber)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(userId, calories, protein, carbs, fat, fiber).run();
    }

    return c.json({ message: 'Goals updated successfully' });
  } catch (error) {
    console.error('Error updating goals:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

export default goals;
