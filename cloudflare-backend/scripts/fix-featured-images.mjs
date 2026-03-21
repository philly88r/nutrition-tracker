// Extract first image from content and set as featured_image where null
// Usage: node scripts/fix-featured-images.mjs

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WP_BASE = 'https://integrativehealthjournal.com/wp-json/wp/v2';
const PER_PAGE = 100;

async function fetchPage(page) {
  const res = await fetch(
    `${WP_BASE}/posts?per_page=${PER_PAGE}&page=${page}&status=publish&_fields=slug,content`
  );
  return res.json();
}

function extractFirstImage(html) {
  if (!html) return null;
  const match = html.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif)[^"]*)"/i);
  return match ? match[1].split('?')[0] : null; // strip query params
}

async function main() {
  console.log('Fetching all posts to extract featured images...');

  const firstRes = await fetch(`${WP_BASE}/posts?per_page=1&status=publish`);
  const total = parseInt(firstRes.headers.get('x-wp-total') || '0');
  const pages = Math.ceil(total / PER_PAGE);
  console.log(`${total} posts across ${pages} pages\n`);

  const updates = []; // { slug, image }

  for (let page = 1; page <= pages; page++) {
    process.stdout.write(`Page ${page}/${pages}...`);
    const posts = await fetchPage(page);
    for (const post of posts) {
      const img = extractFirstImage(post.content?.rendered);
      if (img) updates.push({ slug: post.slug, image: img });
    }
    console.log(` ${updates.length} images found so far`);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nTotal posts with images: ${updates.length}`);
  console.log('Building SQL updates...');

  // Build SQL in batches of 100 statements
  const BATCH = 100;
  let totalUpdated = 0;

  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    const sql = batch
      .map(u => `UPDATE blog_posts SET featured_image = '${u.image.replace(/'/g, "''")}' WHERE slug = '${u.slug.replace(/'/g, "''")}' AND featured_image IS NULL;`)
      .join('\n');

    const tmpFile = path.join(__dirname, '..', 'migrations', `_tmp_images_${i}.sql`);
    fs.writeFileSync(tmpFile, sql);

    try {
      execSync(
        `npx wrangler d1 execute nutrition-tracker-db --file=migrations/_tmp_images_${i}.sql --remote`,
        { stdio: 'pipe', cwd: path.join(__dirname, '..') }
      );
      totalUpdated += batch.length;
      console.log(`  Updated batch ${Math.floor(i/BATCH)+1} (${totalUpdated}/${updates.length})`);
    } catch (err) {
      console.error(`  Batch ${i} failed:`, err.message);
    } finally {
      fs.unlinkSync(tmpFile);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n✅ Done! ${totalUpdated} posts now have featured images.`);
}

main().catch(console.error);
