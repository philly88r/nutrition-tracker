import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { sign, verify } from '@tsndr/cloudflare-worker-jwt';

const auth = new Hono();

// Register new user
auth.post('/register', async (c) => {
  try {
    const { email, password, pin } = await c.req.json();
    const db = c.env.DB;

    // Validate input
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // Validate PIN (optional, defaults to 123456)
    const userPin = pin || '123456';
    if (!/^\d{6}$/.test(userPin)) {
      return c.json({ error: 'PIN must be 6 digits' }, 400);
    }

    // Check if user exists
    const existingUser = await db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user with PIN
    const result = await db.prepare(
      'INSERT INTO users (email, password_hash, pin_code, pin_enabled) VALUES (?, ?, ?, 1)'
    ).bind(email, passwordHash, userPin).run();

    const userId = result.meta.last_row_id;

    // Create default daily goals
    await db.prepare(`
      INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fiber)
      VALUES (?, 2000, 150, 200, 65, 30)
    `).bind(userId).run();

    // Create default settings
    await db.prepare(`
      INSERT INTO user_settings (user_id, theme, measurement_system, language, notifications)
      VALUES (?, 'light', 'metric', 'en', 1)
    `).bind(userId).run();

    // Generate JWT
    const token = await sign(
      { userId, email, exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) },
      c.env.JWT_SECRET
    );

    return c.json({
      message: 'User created successfully',
      token,
      user: { id: userId, email }
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Server error during registration' }, 500);
  }
});

// Login user
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const db = c.env.DB;

    // Validate input
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Find user
    const user = await db.prepare(
      'SELECT id, email, password_hash FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT
    const token = await sign(
      { userId: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) },
      c.env.JWT_SECRET
    );

    return c.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Server error during login' }, 500);
  }
});

// Verify token
auth.get('/verify', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.substring(7);
    const isValid = await verify(token, c.env.JWT_SECRET);
    if (!isValid) {
      return c.json({ error: 'Invalid token', valid: false }, 401);
    }
    const decoded = JSON.parse(atob(token.split('.')[1]));

    return c.json({
      valid: true,
      user: { id: decoded.userId, email: decoded.email }
    });
  } catch (error) {
    return c.json({ error: 'Invalid token', valid: false }, 401);
  }
});

// Verify PIN
auth.post('/verify-pin', async (c) => {
  try {
    const { email, pin } = await c.req.json();
    const db = c.env.DB;

    if (!pin) {
      return c.json({ error: 'PIN is required' }, 400);
    }

    // Find user by PIN code (not email)
    const user = await db.prepare(
      'SELECT id, email, pin_code, pin_enabled, name FROM users WHERE pin_code = ?'
    ).bind(pin).first();

    if (!user) {
      return c.json({ error: 'Invalid PIN' }, 401);
    }

    if (!user.pin_enabled) {
      return c.json({ error: 'PIN authentication is disabled' }, 400);
    }

    // Generate JWT token
    const token = await sign(
      { userId: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) },
      c.env.JWT_SECRET
    );

    return c.json({
      message: 'PIN verified successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('PIN verification error:', error);
    return c.json({ error: 'Server error during PIN verification' }, 500);
  }
});

// Update PIN
auth.put('/update-pin', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.substring(7);
    const isValid = await verify(token, c.env.JWT_SECRET);
    if (!isValid) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userId = decoded.userId;

    const { currentPin, newPin } = await c.req.json();
    const db = c.env.DB;

    if (!currentPin || !newPin) {
      return c.json({ error: 'Current PIN and new PIN are required' }, 400);
    }

    if (!/^\d{6}$/.test(newPin)) {
      return c.json({ error: 'New PIN must be 6 digits' }, 400);
    }

    // Verify current PIN
    const user = await db.prepare(
      'SELECT pin_code FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    if (user.pin_code !== currentPin) {
      return c.json({ error: 'Current PIN is incorrect' }, 401);
    }

    // Update PIN
    await db.prepare(
      'UPDATE users SET pin_code = ?, pin_updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newPin, userId).run();

    return c.json({ message: 'PIN updated successfully' });
  } catch (error) {
    console.error('PIN update error:', error);
    return c.json({ error: 'Server error during PIN update' }, 500);
  }
});

// Get user PIN status
auth.get('/pin-status', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.substring(7);
    const isValid = await verify(token, c.env.JWT_SECRET);
    if (!isValid) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userId = decoded.userId;

    const db = c.env.DB;
    const user = await db.prepare(
      'SELECT pin_enabled FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      pinEnabled: user.pin_enabled === 1
    });
  } catch (error) {
    console.error('PIN status error:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

export default auth;
