import { Hono } from 'hono';

const blog = new Hono();

// GET /blog/posts — paginated list (no auth required)
blog.get('/posts', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '12');
  const category = c.req.query('category') || null;
  const search = c.req.query('search') || null;
  const offset = (page - 1) * limit;

  let where = '1=1';
  const binds = [];

  if (category) {
    where += ' AND category_slug = ?';
    binds.push(category);
  }
  if (search) {
    where += ' AND (title LIKE ? OR excerpt LIKE ?)';
    binds.push(`%${search}%`, `%${search}%`);
  }

  const countResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM blog_posts WHERE ${where}`
  ).bind(...binds).first();

  const posts = await c.env.DB.prepare(
    `SELECT id, slug, title, excerpt, published_at, category, category_slug, featured_image, seo_description
     FROM blog_posts WHERE ${where}
     ORDER BY published_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...binds, limit, offset).all();

  return c.json({
    posts: posts.results || [],
    total: countResult?.total || 0,
    page,
    limit,
    pages: Math.ceil((countResult?.total || 0) / limit)
  });
});

// GET /blog/categories — all categories
blog.get('/categories', async (c) => {
  const cats = await c.env.DB.prepare(
    `SELECT category, category_slug, COUNT(*) as count
     FROM blog_posts
     GROUP BY category_slug
     ORDER BY count DESC`
  ).all();
  return c.json(cats.results || []);
});

// GET /blog/slug/:slug — single post by slug (no auth required)
blog.get('/slug/:slug', async (c) => {
  const slug = c.req.param('slug');
  const post = await c.env.DB.prepare(
    `SELECT * FROM blog_posts WHERE slug = ?`
  ).bind(slug).first();

  if (!post) return c.json({ error: 'Not found' }, 404);
  return c.json(post);
});

// GET /blog/recent — latest N posts for sidebars/widgets
blog.get('/recent', async (c) => {
  const limit = parseInt(c.req.query('limit') || '5');
  const posts = await c.env.DB.prepare(
    `SELECT slug, title, published_at, featured_image, category, category_slug
     FROM blog_posts ORDER BY published_at DESC LIMIT ?`
  ).bind(limit).all();
  return c.json(posts.results || []);
});

// GET /blog/image/:slug — AI-generated featured image for posts without one
// Cloudflare caches the response so it only generates once per slug
blog.get('/image/:slug', async (c) => {
  const slug = c.req.param('slug');

  // Get post title for the prompt
  const post = await c.env.DB.prepare(
    `SELECT title, category FROM blog_posts WHERE slug = ?`
  ).bind(slug).first();

  if (!post) return c.json({ error: 'Not found' }, 404);

  // Simple abstract prompt — no people, no text, no faces
  const prompt = `Abstract minimal background, soft gradient colors, simple geometric shapes, clean and modern, health and wellness theme, no text, no people, no faces, flat design, pastel tones, professional`;

  try {
    const response = await c.env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
      prompt,
      num_steps: 20,
    });

    // response is a ReadableStream of image bytes
    return new Response(response, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable', // cache for 1 year
        'CDN-Cache-Control': 'max-age=31536000',
      },
    });
  } catch (err) {
    console.error('Image generation failed:', err);
    return c.json({ error: 'Image generation failed' }, 500);
  }
});

export default blog;
