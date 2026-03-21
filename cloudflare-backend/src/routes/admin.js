import { Hono } from 'hono';
import { sendBatchEmails, productUpdateTemplate } from '../utils/email.js';

const admin = new Hono();

// Middleware to check if user is admin
const requireAdmin = async (c, next) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  
  // Check if user has admin role (you can customize this check)
  // For now, we'll check if email ends with admin or is the owner's email
  const user = await db.prepare('SELECT email FROM users WHERE id = ?').bind(userId).first();
  
  const adminEmails = [
    'admin@macronutritiontracker.com',
    'owner@macronutritiontracker.com'
    // Add your admin emails here
  ];
  
  if (!user || !adminEmails.includes(user.email)) {
    return c.json({ error: 'Admin access required' }, 403);
  }
  
  return next();
};

// Get all user emails for admin
admin.get('/users/emails', async (c) => {
  try {
    const db = c.env.DB;
    const users = await db.prepare('SELECT email FROM users WHERE email IS NOT NULL').all();
    
    return c.json({
      count: users.results.length,
      emails: users.results.map(u => u.email)
    });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Send product update email to all users
admin.post('/send-update', async (c) => {
  try {
    const { title, updates, ctaUrl, ctaText, testMode } = await c.req.json();
    
    if (!title || !updates || !Array.isArray(updates) || updates.length === 0) {
      return c.json({ error: 'Title and updates array are required' }, 400);
    }
    
    // Get all user emails
    const db = c.env.DB;
    const users = await db.prepare('SELECT email FROM users WHERE email IS NOT NULL').all();
    const emails = users.results.map(u => u.email);
    
    if (emails.length === 0) {
      return c.json({ error: 'No users found to email' }, 400);
    }
    
    // In test mode, only send to a few test addresses
    const targetEmails = testMode 
      ? emails.slice(0, 3) 
      : emails;
    
    // Generate email template
    const { html, text } = productUpdateTemplate({
      title,
      updates,
      ctaUrl: ctaUrl || 'https://macronutritiontracker.netlify.app',
      ctaText: ctaText || 'Check it out'
    });
    
    // Check if Resend API key is configured
    if (!c.env.RESEND_API_KEY) {
      return c.json({ 
        error: 'RESEND_API_KEY not configured',
        setup: 'Add RESEND_API_KEY to your wrangler secrets: wrangler secret put RESEND_API_KEY'
      }, 500);
    }
    
    // Send emails
    const results = await sendBatchEmails(c.env.RESEND_API_KEY, {
      to: targetEmails,
      subject: title,
      html,
      text,
      from: 'NutriTrack <updates@integrativehealthjournal.com>'
    });
    
    return c.json({
      success: true,
      testMode: testMode || false,
      emailsSent: targetEmails.length,
      totalUsers: emails.length,
      results
    });
    
  } catch (error) {
    console.error('Send update error:', error);
    return c.json({ error: error.message || 'Failed to send emails' }, 500);
  }
});

// Preview email template
admin.post('/preview-email', async (c) => {
  try {
    const { title, updates, ctaUrl, ctaText } = await c.req.json();
    
    const { html, text } = productUpdateTemplate({
      title: title || 'New Updates!',
      updates: updates || ['Feature 1', 'Feature 2'],
      ctaUrl: ctaUrl || 'https://macronutritiontracker.netlify.app',
      ctaText: ctaText || 'Check it out'
    });
    
    return c.json({ html, text });
  } catch (error) {
    console.error('Preview error:', error);
    return c.json({ error: 'Failed to generate preview' }, 500);
  }
});

export default admin;
