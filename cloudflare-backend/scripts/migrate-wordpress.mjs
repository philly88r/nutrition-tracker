// WordPress → D1 migration script
// Usage: node scripts/migrate-wordpress.mjs

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WP_BASE = 'https://integrativehealthjournal.com/wp-json/wp/v2';
const CREDENTIALS = Buffer.from('fitnest33:1iQz Jaiz tryp sSHK eQB7 DXRJ').toString('base64');
const PER_PAGE = 100;
const OUTPUT_SQL = path.join(__dirname, '..', 'migrations', 'seed_blog_posts.sql');

async function wpFetch(endpoint) {
  const res = await fetch(`${WP_BASE}${endpoint}`, {
    headers: { 'Authorization': `Basic ${CREDENTIALS}` }
  });
  if (!res.ok) throw new Error(`WP API error ${res.status}: ${endpoint}`);
  return { data: await res.json(), headers: res.headers };
}

async function fetchAllPosts() {
  const first = await wpFetch(`/posts?per_page=1&_fields=id&status=publish`);
  const total = parseInt(first.headers.get('x-wp-total') || '0');
  const pages = Math.ceil(total / PER_PAGE);
  console.log(`Fetching ${total} posts across ${pages} pages...`);

  const allPosts = [];
  for (let page = 1; page <= pages; page++) {
    process.stdout.write(`  Page ${page}/${pages}...`);
    const { data } = await wpFetch(
      `/posts?per_page=${PER_PAGE}&page=${page}&status=publish&_fields=id,slug,title,excerpt,content,date,modified,categories,tags,featured_media,yoast_head_json`
    );
    allPosts.push(...data);
    console.log(` +${data.length} (total: ${allPosts.length})`);
    await new Promise(r => setTimeout(r, 300));
  }
  return allPosts;
}

async function fetchCategories() {
  const { data } = await wpFetch('/categories?per_page=100');
  const map = {};
  data.forEach(c => { map[c.id] = { name: c.name.replace(/&amp;/g, '&'), slug: c.slug }; });
  return map;
}

async function fetchFeaturedImage(mediaId) {
  if (!mediaId) return null;
  try {
    const { data } = await wpFetch(`/media/${mediaId}?_fields=source_url`);
    return data.source_url || null;
  } catch {
    return null;
  }
}

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function stripHTML(html) {
  return (html || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').trim();
}

async function main() {
  console.log('Starting WordPress → D1 migration...\n');

  const [categories, posts] = await Promise.all([
    fetchCategories(),
    fetchAllPosts()
  ]);

  console.log(`\nFetched ${posts.length} posts. Fetching featured images...`);

  const postsWithMedia = posts.filter(p => p.featured_media > 0);
  console.log(`${postsWithMedia.length} posts have featured images`);
  const imageCache = {};
  for (let i = 0; i < postsWithMedia.length; i++) {
    if (i % 25 === 0) process.stdout.write(`  Image ${i}/${postsWithMedia.length}\n`);
    const p = postsWithMedia[i];
    imageCache[p.featured_media] = await fetchFeaturedImage(p.featured_media);
    await new Promise(r => setTimeout(r, 150));
  }

  console.log('\nBuilding SQL...');

  const lines = [
    `-- WordPress migration from integrativehealthjournal.com`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- Total posts: ${posts.length}`,
    ``,
    `DELETE FROM blog_posts;`,
    ``
  ];

  for (const post of posts) {
    const slug = post.slug;
    const title = post.title?.rendered || '';
    const content = post.content?.rendered || '';
    const excerpt = post.excerpt?.rendered || '';
    const publishedAt = post.date ? post.date.replace('T', ' ') : null;
    const modifiedAt = post.modified ? post.modified.replace('T', ' ') : null;

    const catIds = post.categories || [];
    const catNames = catIds.map(id => categories[id]?.name || '').filter(Boolean);
    const catSlugs = catIds.map(id => categories[id]?.slug || '').filter(Boolean);
    const primaryCategory = catNames[0] || 'Health';
    const primaryCategorySlug = catSlugs[0] || 'health';

    const featuredImage = imageCache[post.featured_media] || null;

    const yoast = post.yoast_head_json || {};
    const seoTitle = yoast.title || stripHTML(title);
    const rawExcerpt = stripHTML(excerpt);
    const seoDesc = yoast.description || rawExcerpt.slice(0, 160);

    lines.push(
      `INSERT OR IGNORE INTO blog_posts (slug, title, content, excerpt, published_at, modified_at, category, category_slug, categories_json, featured_image, seo_title, seo_description) VALUES (` +
      [
        escapeSQL(slug),
        escapeSQL(stripHTML(title)),
        escapeSQL(content),
        escapeSQL(rawExcerpt.slice(0, 500)),
        escapeSQL(publishedAt),
        escapeSQL(modifiedAt),
        escapeSQL(primaryCategory),
        escapeSQL(primaryCategorySlug),
        escapeSQL(JSON.stringify(catSlugs)),
        escapeSQL(featuredImage),
        escapeSQL(seoTitle.slice(0, 200)),
        escapeSQL(seoDesc.slice(0, 300))
      ].join(', ') +
      `);`
    );
  }

  fs.writeFileSync(OUTPUT_SQL, lines.join('\n'));
  console.log(`SQL written to: ${OUTPUT_SQL}`);
  console.log(`\nApplying to D1 (remote)...`);

  try {
    execSync(`npx wrangler d1 execute nutrition-tracker-db --file=migrations/seed_blog_posts.sql --remote`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('\n✅ Migration complete! All posts are in D1.');
  } catch (err) {
    console.error('\nD1 execute failed. Run manually:');
    console.error('cd cloudflare-backend && npx wrangler d1 execute nutrition-tracker-db --file=migrations/seed_blog_posts.sql --remote');
  }
}

main().catch(console.error);
