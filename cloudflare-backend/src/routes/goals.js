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
      // Check if user exists in users table (for regular users) or kdp_users table (for KDP buyers)
      const regularUser = await db.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
      const kdpUser = await db.prepare('SELECT id FROM kdp_users WHERE id = ?').bind(userId).first();
      
      if (!regularUser && !kdpUser) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Create default goals - only if user exists
      try {
        await db.prepare(`
          INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fiber)
          VALUES (?, 2000, 150, 200, 65, 30)
        `).bind(userId).run();

        goalsData = await db.prepare(
          'SELECT * FROM daily_goals WHERE user_id = ?'
        ).bind(userId).first();
      } catch (insertError) {
        console.error('Error creating default goals:', insertError);
        // Return default values without saving if insert fails
        goalsData = {
          user_id: userId,
          calories: 2000,
          protein: 150,
          carbs: 200,
          fat: 65,
          fiber: 30
        };
      }
    }

    return c.json(goalsData);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return c.json({ error: 'Server error', details: error.message }, 500);
  }
});

// Update daily goals
goals.put('/', async (c) => {
  try {
    const userId = c.get('userId');
    const { calories, protein, carbs, fat, fiber } = await c.req.json();
    const db = c.env.DB;

    // UPSERT — inserts on first save, updates on all subsequent saves
    await db.prepare(`
      INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fiber, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        calories = excluded.calories,
        protein = excluded.protein,
        carbs = excluded.carbs,
        fat = excluded.fat,
        fiber = excluded.fiber,
        updated_at = CURRENT_TIMESTAMP
    `).bind(userId, calories, protein, carbs, fat, fiber).run();

    return c.json({ message: 'Goals updated successfully' });
  } catch (error) {
    console.error('Error updating goals:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

export default goals;
