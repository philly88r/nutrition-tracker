import { Hono } from 'hono';
import { verify } from '../utils/jwt.js';

const payments = new Hono();

// Helper: call Stripe API
const stripe = async (env, method, path, body = null) => {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body ? new URLSearchParams(body).toString() : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Stripe error');
  return data;
};

// JWT middleware (all except webhook)
payments.use('/create-checkout', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);
  try {
    const decoded = await verify(authHeader.substring(7), c.env.JWT_SECRET);
    c.set('userId', decoded.userId);
    c.set('userEmail', decoded.email);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

payments.use('/portal', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);
  try {
    const decoded = await verify(authHeader.substring(7), c.env.JWT_SECRET);
    c.set('userId', decoded.userId);
    c.set('userEmail', decoded.email);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Create Stripe Checkout session
payments.post('/create-checkout', async (c) => {
  try {
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    const db = c.env.DB;

    // Get or create Stripe customer
    let user = await db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?').bind(userId).first();
    let customerId = user?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe(c.env, 'POST', '/customers', { email: userEmail });
      customerId = customer.id;
      await db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').bind(customerId, userId).run();
    }

    const session = await stripe(c.env, 'POST', '/checkout/sessions', {
      customer: customerId,
      mode: 'subscription',
      'line_items[0][price]': c.env.STRIPE_PRICE_ID,
      'line_items[0][quantity]': '1',
      success_url: `${c.env.FRONTEND_URL}/upgrade?success=true`,
      cancel_url: `${c.env.FRONTEND_URL}/upgrade?canceled=true`,
      'subscription_data[metadata][userId]': String(userId),
    });

    return c.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Customer portal (manage/cancel subscription)
payments.post('/portal', async (c) => {
  try {
    const userId = c.get('userId');
    const db = c.env.DB;

    const user = await db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?').bind(userId).first();
    if (!user?.stripe_customer_id) return c.json({ error: 'No subscription found' }, 404);

    const session = await stripe(c.env, 'POST', '/billing_portal/sessions', {
      customer: user.stripe_customer_id,
      return_url: `${c.env.FRONTEND_URL}/upgrade`,
    });

    return c.json({ url: session.url });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Stripe webhook
payments.post('/webhook', async (c) => {
  try {
    const body = await c.req.text();
    const sig = c.req.header('stripe-signature');

    // Verify webhook signature
    const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && sig) {
      // Cloudflare Workers crypto verification
      const parts = sig.split(',').reduce((acc, part) => {
        const [key, val] = part.split('=');
        acc[key] = val;
        return acc;
      }, {});

      const timestamp = parts.t;
      const expectedSig = parts.v1;
      const payload = `${timestamp}.${body}`;

      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const computed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
      const computedHex = Array.from(new Uint8Array(computed)).map(b => b.toString(16).padStart(2, '0')).join('');

      if (computedHex !== expectedSig) {
        return new Response('Invalid signature', { status: 400 });
      }
    }

    const event = JSON.parse(body);
    const db = c.env.DB;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      await db.prepare(`
        UPDATE users SET subscription_status = 'pro', stripe_subscription_id = ? WHERE stripe_customer_id = ?
      `).bind(subscriptionId, customerId).run();
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      await db.prepare(`
        UPDATE users SET subscription_status = 'pro' WHERE stripe_customer_id = ?
      `).bind(invoice.customer).run();
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed') {
      const obj = event.data.object;
      await db.prepare(`
        UPDATE users SET subscription_status = 'free' WHERE stripe_customer_id = ?
      `).bind(obj.customer).run();
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 400 });
  }
});

// Get subscription status
payments.get('/status', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);
  try {
    const decoded = await verify(authHeader.substring(7), c.env.JWT_SECRET);
    const user = await c.env.DB.prepare(
      'SELECT subscription_status, stripe_customer_id FROM users WHERE id = ?'
    ).bind(decoded.userId).first();
    return c.json({ status: user?.subscription_status || 'free' });
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

export default payments;
