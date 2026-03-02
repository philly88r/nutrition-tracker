import { Hono } from 'hono';
import { verify } from '../utils/jwt.js';

const profile = new Hono();

// JWT middleware
profile.use('/*', async (c, next) => {
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

// Get user profile
profile.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    const db = c.env.DB;

    let profileData = await db.prepare(
      'SELECT * FROM user_profiles WHERE user_id = ?'
    ).bind(userId).first();

    if (!profileData) {
      // Return empty profile if doesn't exist
      return c.json({
        user_id: userId,
        name: null,
        age: null,
        gender: null,
        weight: null,
        weight_unit: 'lbs',
        height: null,
        height_unit: 'inches',
        activity_level: 1.375,
        goal: 'maintain'
      });
    }

    return c.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Create or update user profile
profile.put('/', async (c) => {
  try {
    const userId = c.get('userId');
    const { name, age, gender, weight, weight_unit, height, height_unit, activity_level, goal } = await c.req.json();
    const db = c.env.DB;

    // Check if profile exists
    const existing = await db.prepare(
      'SELECT id FROM user_profiles WHERE user_id = ?'
    ).bind(userId).first();

    if (existing) {
      // Update existing profile
      await db.prepare(`
        UPDATE user_profiles SET
          name = ?, age = ?, gender = ?, weight = ?, weight_unit = ?,
          height = ?, height_unit = ?, activity_level = ?, goal = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(name, age, gender, weight, weight_unit, height, height_unit, activity_level, goal, userId).run();
    } else {
      // Create new profile
      await db.prepare(`
        INSERT INTO user_profiles (user_id, name, age, gender, weight, weight_unit, height, height_unit, activity_level, goal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(userId, name, age, gender, weight, weight_unit, height, height_unit, activity_level, goal).run();
    }

    return c.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

export default profile;
