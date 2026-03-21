import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import authRoutes from './routes/auth';
import foodEntriesRoutes from './routes/foodEntries';
import goalsRoutes from './routes/goals';
import groceryRoutes from './routes/grocery';
import settingsRoutes from './routes/settings';
import profileRoutes from './routes/profile';
import kdpRoutes from './routes/kdp';
import aiRoutes from './routes/ai';
import recipesRoutes from './routes/recipes';
import paymentsRoutes from './routes/payments';
import blogRoutes from './routes/blog';
import adminRoutes from './routes/admin';

const app = new Hono();

// CORS middleware
app.use('/*', cors({
  origin: (origin) => {
    const allowed = [
      'https://macronutritiontracker.netlify.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    return allowed.includes(origin) ? origin : allowed[0];
  },
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Nutrition Tracker API'
  });
});

// Mount routes
app.route('/auth', authRoutes);
app.route('/food-entries', foodEntriesRoutes);
app.route('/goals', goalsRoutes);
app.route('/grocery', groceryRoutes);
app.route('/settings', settingsRoutes);
app.route('/profile', profileRoutes);
app.route('/kdp', kdpRoutes);
app.route('/ai', aiRoutes);
app.route('/recipes', recipesRoutes);
app.route('/payments', paymentsRoutes);
app.route('/blog', blogRoutes);
app.route('/admin', adminRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
