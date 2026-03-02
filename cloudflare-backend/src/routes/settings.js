import { Hono } from 'hono';
import { verify } from '../utils/jwt.js';

const settings = new Hono();

// JWT middleware
settings.use('/*', async (c, next) => {
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

// Get user settings
settings.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    const db = c.env.DB;

    let userSettings = await db.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).bind(userId).first();

    if (!userSettings) {
      // Create default settings
      await db.prepare(`
        INSERT INTO user_settings (user_id, theme, measurement_system, language, notifications)
        VALUES (?, 'light', 'metric', 'en', 1)
      `).bind(userId).run();

      userSettings = await db.prepare(
        'SELECT * FROM user_settings WHERE user_id = ?'
      ).bind(userId).first();
    }

    return c.json(userSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Update user settings
settings.put('/', async (c) => {
  try {
    const userId = c.get('userId');
    const { theme, measurement_system, language, notifications } = await c.req.json();
    const db = c.env.DB;

    const result = await db.prepare(`
      UPDATE user_settings SET
        theme = ?, measurement_system = ?, language = ?, notifications = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(theme, measurement_system, language, notifications ? 1 : 0, userId).run();

    if (result.meta.changes === 0) {
      // Create if doesn't exist
      await db.prepare(`
        INSERT INTO user_settings (user_id, theme, measurement_system, language, notifications)
        VALUES (?, ?, ?, ?, ?)
      `).bind(userId, theme, measurement_system, language, notifications ? 1 : 0).run();
    }

    return c.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

export default settings;
