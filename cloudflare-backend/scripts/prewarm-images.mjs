// Pre-warm AI image cache for all posts without featured images
// Hits each endpoint so Cloudflare generates + caches the image
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = 'https://nutrition-tracker-api.private-label-products.workers.dev';
const CONCURRENCY = 3;

// Fetch slugs directly from D1
console.log('Fetching slugs from D1...');
const raw = execSync(
  `npx wrangler d1 execute nutrition-tracker-db --command="SELECT slug FROM blog_posts WHERE featured_image IS NULL ORDER BY published_at DESC;" --remote`,
  { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
);
const slugs = [...raw.matchAll(/"slug":\s*"([^"]+)"/g)].map(m => m[1]);
console.log(`Found ${slugs.length} posts without images.\n`);

console.log(`Pre-warming ${slugs.length} AI images with concurrency ${CONCURRENCY}...\n`);

let done = 0;
let failed = 0;

async function generateOne(slug) {
  try {
    const res = await fetch(`${API}/blog/image/${slug}`);
    if (res.ok) {
      done++;
    } else {
      failed++;
      console.log(`  ✗ ${slug} (${res.status})`);
    }
  } catch (err) {
    failed++;
    console.log(`  ✗ ${slug}: ${err.message}`);
  }
  if ((done + failed) % 25 === 0) {
    console.log(`  Progress: ${done + failed}/${slugs.length} (${done} ok, ${failed} failed)`);
  }
}

// Process in chunks of CONCURRENCY
for (let i = 0; i < slugs.length; i += CONCURRENCY) {
  const batch = slugs.slice(i, i + CONCURRENCY);
  await Promise.all(batch.map(generateOne));
  // Small pause between batches
  await new Promise(r => setTimeout(r, 500));
}

console.log(`\n✅ Done! ${done} images generated, ${failed} failed.`);
