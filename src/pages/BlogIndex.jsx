import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Calendar, Search, Apple, Menu, X, ArrowRight } from 'lucide-react';

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
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function BlogIndex() {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [menuOpen, setMenuOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (categorySlug) params.set('category', categorySlug);
    if (search) params.set('search', search);

    Promise.all([
      fetch(`${API_URL}/blog/posts?${params}`).then(r => r.json()),
      fetch(`${API_URL}/blog/categories`).then(r => r.json()),
    ]).then(([postsData, catsData]) => {
      setPosts(postsData.posts || []);
      setTotal(postsData.total || 0);
      setPages(postsData.pages || 1);
      setCategories(catsData);
    }).finally(() => setLoading(false));
  }, [page, categorySlug, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(search ? { q: search } : {});
  };

  const activeCategory = categories.find(c => c.category_slug === categorySlug);

  useEffect(() => {
    document.title = activeCategory
      ? `${activeCategory.category} Articles | Integrative Health Journal`
      : 'Health & Nutrition Blog | Integrative Health Journal';
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/logo-dark.png" alt="Logo" className="h-12 w-12 object-contain" />
            <span className="font-bold">NutriTrack</span>
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/blog" className={`hover:text-gray-900 dark:hover:text-white ${!categorySlug ? 'text-indigo-600 font-medium' : ''}`}>All Posts</Link>
            {categories.slice(0, 5).map(c => (
              <Link key={c.category_slug} to={`/blog/category/${c.category_slug}`}
                className={`hover:text-gray-900 dark:hover:text-white capitalize ${categorySlug === c.category_slug ? 'text-indigo-600 font-medium' : ''}`}>
                {c.category}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300">Sign In</Link>
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
            <Link to="/blog" className="block py-2 text-sm">All Posts</Link>
            {categories.map(c => (
              <Link key={c.category_slug} to={`/blog/category/${c.category_slug}`}
                className="block py-2 text-sm capitalize">{c.category}</Link>
            ))}
          </div>
        )}
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-black mb-3">
            {activeCategory ? `${activeCategory.category} Articles` : 'Integrative Health Journal'}
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            {activeCategory
              ? `${activeCategory.count} articles on ${activeCategory.category}`
              : `${total} evidence-based articles on nutrition, fitness, and integrative health`}
          </p>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/20 placeholder-blue-200 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
            />
            <button type="submit"
              className="px-5 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-blue-50 transition-all text-sm flex items-center gap-2">
              <Search className="w-4 h-4" /> Search
            </button>
          </form>
        </div>
      </div>

      {/* Category pills */}
      <div className="border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 min-w-max">
          <Link to="/blog"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!categorySlug ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            All
          </Link>
          {categories.map(c => (
            <Link key={c.category_slug} to={`/blog/category/${c.category_slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize whitespace-nowrap ${categorySlug === c.category_slug ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {c.category} <span className="opacity-60 text-xs">({c.count})</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100 dark:bg-gray-800" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                  <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No posts found</p>
            <Link to="/blog" className="text-indigo-600 text-sm mt-2 inline-block">Clear filters</Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Link key={post.slug} to={`/${post.slug}`}
                  className="group rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-gray-100/50 dark:hover:shadow-black/20 transition-all hover:-translate-y-0.5">
                  <img src={getPostImage(post)} alt={decodeEntities(post.title)}
                    className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform" loading="lazy" />
                  <div className="p-5">
                    {post.category && (
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        {post.category}
                      </span>
                    )}
                    <h2 className="font-bold text-base mt-1 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {decodeEntities(post.title)}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.published_at)}
                      </div>
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {page > 1 && (
                  <button onClick={() => setSearchParams({ page: page - 1 })}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    ← Previous
                  </button>
                )}
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => setSearchParams({ page: p })}
                      className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                        p === page
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                      {p}
                    </button>
                  );
                })}
                {page < pages && (
                  <button onClick={() => setSearchParams({ page: page + 1 })}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    Next →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
