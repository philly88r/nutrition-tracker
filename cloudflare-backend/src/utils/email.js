/**
 * Email service using Resend API
 * Works with Cloudflare Workers
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

const DEFAULT_FROM = 'NutriTrack <updates@integrativehealthjournal.com>';

/**
 * Send a single email
 */
export const sendEmail = async (resendApiKey, { to, subject, html, text, from = DEFAULT_FROM }) => {
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email');
  }

  return await response.json();
};

/**
 * Send batch emails (Resend supports up to 100 recipients per request)
 */
export const sendBatchEmails = async (resendApiKey, { to, subject, html, text, from = 'NutriTrack <updates@macronutritiontracker.netlify.app>' }) => {
  const batchSize = 100;
  const results = [];
  
  for (let i = 0; i < to.length; i += batchSize) {
    const batch = to.slice(i, i + batchSize);
    
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: batch,
        subject,
        html,
        text
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Batch ${i / batchSize + 1} failed: ${error.message || 'Unknown error'}`);
    }

    results.push(await response.json());
  }

  return results;
};

/**
 * Product update email template
 */
export const productUpdateTemplate = ({ title, updates, ctaUrl, ctaText = 'Check it out' }) => {
  const updateList = updates.map(u => `<li style="margin-bottom: 8px;">${u}</li>`).join('');
  
  return {
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 ${title}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi there!</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">We've been busy improving NutriTrack. Here's what's new:</p>
    
    <ul style="font-size: 15px; padding-left: 20px; margin-bottom: 25px;">
      ${updateList}
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${ctaUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">${ctaText}</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      Thanks for being part of the NutriTrack community!<br>
      — The NutriTrack Team
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
    <p>You received this because you're a NutriTrack user.</p>
    <p><a href="https://macronutritiontracker.netlify.app/settings" style="color: #6b7280;">Update preferences</a></p>
  </div>
</body>
</html>`,
    text: `${title}\n\nHi there!\n\nWe've been busy improving NutriTrack. Here's what's new:\n\n${updates.map(u => '- ' + u).join('\n')}\n\n${ctaText}: ${ctaUrl}\n\nThanks for being part of the NutriTrack community!\n— The NutriTrack Team`
  };
};
