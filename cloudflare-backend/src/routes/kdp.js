import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { sign } from '@tsndr/cloudflare-worker-jwt';

const kdp = new Hono();

const hashCode = async (code) => {
  const data = new TextEncoder().encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Validate shared book code
kdp.post('/validate-code', async (c) => {
  try {
    const { code } = await c.req.json();
    if (!code) {
      return c.json({ error: 'Code is required' }, 400);
    }
    const db = c.env.DB;
    const codeHash = await hashCode(code);
    const record = await db.prepare(
      'SELECT code_hash, active, max_uses, used_count FROM kdp_access_codes WHERE code_hash = ?'
    ).bind(codeHash).first();

    if (!record || record.active !== 1) {
      return c.json({ error: 'Invalid code' }, 403);
    }
    if (record.max_uses !== null && record.used_count >= record.max_uses) {
      return c.json({ error: 'Code usage limit reached' }, 403);
    }
    return c.json({ valid: true });
  } catch (error) {
    console.error('KDP validate-code error:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Register KDP user (code + email + 6-digit pin)
kdp.post('/register', async (c) => {
  try {
    const { code, email, pin } = await c.req.json();
    if (!code || !email || !pin) {
      return c.json({ error: 'Code, email, and PIN are required' }, 400);
    }
    if (!/^\d{6}$/.test(pin)) {
      return c.json({ error: 'PIN must be 6 digits' }, 400);
    }

    const db = c.env.DB;
    const codeHash = await hashCode(code);

    const access = await db.prepare(
      'SELECT code_hash, active, max_uses, used_count FROM kdp_access_codes WHERE code_hash = ?'
    ).bind(codeHash).first();
    if (!access || access.active !== 1) {
      return c.json({ error: 'Invalid code' }, 403);
    }
    if (access.max_uses !== null && access.used_count >= access.max_uses) {
      return c.json({ error: 'Code usage limit reached' }, 403);
    }

    const existing = await db.prepare(
      'SELECT id FROM kdp_users WHERE email = ?'
    ).bind(email).first();
    if (existing) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    const pinHash = await bcrypt.hash(pin, 10);

    const result = await db.prepare(
      'INSERT INTO kdp_users (email, pin_hash, access_code_hash) VALUES (?, ?, ?)'
    ).bind(email, pinHash, codeHash).run();
    const userId = result.meta.last_row_id;

    // Update used count (only on registration)
    await db.prepare(
      'UPDATE kdp_access_codes SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP WHERE code_hash = ?'
    ).bind(codeHash).run();

    const token = await sign(
      { userId, email, auth_type: 'kdp', exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) },
      c.env.JWT_SECRET
    );

    return c.json({
      message: 'KDP registration successful',
      token,
      user: { id: userId, email, authType: 'kdp' }
    }, 201);
  } catch (error) {
    console.error('KDP register error:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

// Login KDP user with email + PIN
kdp.post('/login', async (c) => {
  try {
    const { email, pin } = await c.req.json();
    if (!email || !pin) {
      return c.json({ error: 'Email and PIN are required' }, 400);
    }
    const db = c.env.DB;
    const user = await db.prepare(
      'SELECT id, email, pin_hash FROM kdp_users WHERE email = ?'
    ).bind(email).first();
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    const isMatch = await bcrypt.compare(pin, user.pin_hash);
    if (!isMatch) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    await db.prepare(
      'UPDATE kdp_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(user.id).run();

    const token = await sign(
      { userId: user.id, email: user.email, auth_type: 'kdp', exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) },
      c.env.JWT_SECRET
    );

    return c.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, authType: 'kdp' }
    });
  } catch (error) {
    console.error('KDP login error:', error);
    return c.json({ error: 'Server error' }, 500);
  }
});

export default kdp;
