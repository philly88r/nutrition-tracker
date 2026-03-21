import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Tag, ArrowLeft, Apple, Menu, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const getPostImage = (post) => post.featured_image || `${API_URL}/blog/image/${post.slug}`;

const decodeEntities = (str) => {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/blog/slug/${slug}`).then(r => r.json()),
      fetch(`${API_URL}/blog/recent?limit=6`).then(r => r.json()),
      fetch(`${API_URL}/blog/categories`).then(r => r.json()),
    ]).then(([postData, recentData, catsData]) => {
      if (postData.error) {
        navigate('/404', { replace: true });
        return;
      }
      setPost(postData);
      setRecent(recentData);
      setCategories(catsData);

      // Update page title and meta for SEO
      document.title = decodeEntities(postData.seo_title || postData.title);
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', postData.seo_description || postData.excerpt || '');
    }).catch(() => navigate('/404', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
    </div>
  );

  if (!post) return null;

  const cats = (() => { try { return JSON.parse(post.categories_json || '[]'); } catch { return []; } })();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/logo-dark.png" alt="Logo" className="h-14 w-14 object-contain" />
            <span className="font-bold text-base">NutriTrack</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/blog" className="hover:text-gray-900 dark:hover:text-white">Blog</Link>
            {categories.slice(0, 4).map(c => (
              <Link key={c.category_slug} to={`/blog/category/${c.category_slug}`}
                className="hover:text-gray-900 dark:hover:text-white capitalize">{c.category}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900">Sign In</Link>
            <Link to="/login?tab=signup" className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-lg">
              Get Started Free
            </Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 space-y-2">
            <Link to="/blog" className="block py-2 text-sm text-gray-700 dark:text-gray-300">All Posts</Link>
            {categories.slice(0, 5).map(c => (
              <Link key={c.category_slug} to={`/blog/category/${c.category_slug}`}
                className="block py-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{c.category}</Link>
            ))}
            <Link to="/login?tab=signup" className="block py-2 text-sm font-bold text-indigo-600">Get Started Free →</Link>
          </div>
        )}
      </nav>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_300px] gap-12">

          {/* Article */}
          <article>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
              <Link to="/" className="hover:text-indigo-600">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-indigo-600">Blog</Link>
              {post.category && (
                <>
                  <span>/</span>
                  <Link to={`/blog/category/${post.category_slug}`} className="hover:text-indigo-600 capitalize">{post.category}</Link>
                </>
              )}
            </div>

            {/* Category badge */}
            {post.category && (
              <Link to={`/blog/category/${post.category_slug}`}
                className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 capitalize">
                {post.category}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
              {decodeEntities(post.title)}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at)}
              </div>
              {post.modified_at && post.modified_at !== post.published_at && (
                <span className="text-xs">Updated {formatDate(post.modified_at)}</span>
              )}
            </div>

            {/* Featured image — real or AI-generated */}
            <img
              src={getPostImage(post)}
              alt={decodeEntities(post.title)}
              className="w-full rounded-xl mb-8 object-cover max-h-96"
              loading="lazy"
            />

            {/* Content */}
            <div
              className="wp-content prose prose-lg prose-gray dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto
                prose-table:w-full prose-table:border-collapse
                prose-th:bg-indigo-50 prose-th:dark:bg-indigo-900/30 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-gray-200
                prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-200 prose-td:dark:border-gray-700
                prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 dark:prose-blockquote:bg-indigo-900/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags / categories */}
            {cats.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                {cats.map(slug => (
                  <Link key={slug} to={`/blog/category/${slug}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-indigo-700 text-xs font-medium rounded-full transition-colors">
                    <Tag className="w-3 h-3" />{slug}
                  </Link>
                ))}
              </div>
            )}

            {/* CTA Banner */}
            <div className="mt-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-8 text-white text-center">
              <div className="text-2xl font-black mb-2">Track everything you just read about</div>
              <p className="text-blue-200 mb-6 text-sm">NutriTrack's AI coach searches the web for accurate nutrition info — and knows your exact goals.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/login?tab=signup"
                  className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-blue-50 transition-all text-sm">
                  Start Free — No Credit Card
                </Link>
                <Link to="/login?tab=book"
                  className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl text-sm border border-white/20">
                  I Have the Book
                </Link>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">

            {/* App promo */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
              <img src="/images/logo-dark.png" alt="Logo" className="h-14 w-14 object-contain mb-3" />
              <h3 className="font-bold text-base mb-2">Track Your Nutrition</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                AI coach with live web search. Log meals, build grocery lists, scan labels.
              </p>
              <Link to="/login?tab=signup"
                className="block w-full py-2.5 text-center text-sm font-bold bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all">
                Get Started Free
              </Link>
            </div>

            {/* Recent posts */}
            {recent.length > 0 && (
              <div>
                <h3 className="font-bold text-base mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">Recent Posts</h3>
                <div className="space-y-4">
                  {recent.filter(r => r.slug !== slug).slice(0, 5).map(r => (
                    <Link key={r.slug} to={`/${r.slug}`} className="flex gap-3 group">
                      <img src={getPostImage(r)} alt={r.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                      <div>
                        <p className="text-sm font-medium leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{r.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(r.published_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h3 className="font-bold text-base mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">Categories</h3>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <Link key={cat.category_slug} to={`/blog/category/${cat.category_slug}`}
                      className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <span className="text-sm capitalize group-hover:text-indigo-600 transition-colors">{cat.category}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{cat.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
