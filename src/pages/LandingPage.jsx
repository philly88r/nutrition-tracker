import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Brain, ShoppingCart, BookOpen, BarChart2, Calculator,
  Camera, Search, Zap, CheckCircle, ArrowRight, Star, Menu, X,
  MessageSquare, Apple, Target, TrendingUp, ChevronDown
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'AI Coach', href: '#ai-coach' },
  { label: 'Pricing', href: '#pricing' },
];

const FEATURES = [
  {
    icon: Brain,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    title: 'AI Nutrition Coach',
    desc: 'Ask anything. Kimi K2.5 searches the web live to give you real, accurate nutrition answers — not guesses.',
  },
  {
    icon: Camera,
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    title: 'Snap & Log',
    desc: 'Point your camera at any nutrition label. The AI reads it, logs the macros, and adds it to your diary instantly.',
  },
  {
    icon: ShoppingCart,
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    title: 'Smart Grocery Lists',
    desc: 'Tell the AI your goals and your store. It builds a full week of groceries tailored to hit your macros — saved straight to your list.',
  },
  {
    icon: BookOpen,
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    title: 'Recipe Finder',
    desc: 'Say "find me a high-protein pasta" and the AI finds the recipe, calculates macros, and saves it to your library.',
  },
  {
    icon: Search,
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    title: 'USDA Food Database',
    desc: 'Search 400,000+ foods from the USDA database with verified nutrition data. Add any food in seconds.',
  },
  {
    icon: Calculator,
    color: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    title: 'Macro Calculator',
    desc: 'Set your goals based on your body, activity level, and targets. The app tracks your progress against them every day.',
  },
  {
    icon: BarChart2,
    color: 'from-teal-500 to-green-500',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    title: 'Progress Reports',
    desc: 'See your nutrition trends over time. Spot patterns, celebrate wins, and stay on track with visual progress charts.',
  },
  {
    icon: MessageSquare,
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    title: 'Log By Describing',
    desc: '"I had a chicken breast with rice and broccoli." That\'s it. The AI figures out the macros and logs it for you.',
  },
];

const COACH_EXAMPLES = [
  { q: 'Should I eat this Chipotle bowl?', a: '🔍 Searching Chipotle nutrition data... A Chipotle chicken bowl with rice, black beans, fajita veggies, and salsa is about 655 calories with 51g protein. You have 820 calories and 49g protein left today — this fits perfectly!' },
  { q: 'Build me a grocery list for the week', a: '🛒 Building your high-protein grocery list for Walmart... Added 22 items to your Grocery List tab! Chicken breast, Greek yogurt, eggs, salmon, sweet potatoes, broccoli, spinach and more — all optimized for your 2,200 calorie / 180g protein goals.' },
  { q: 'Find me a high-protein pasta recipe', a: '🍝 Found it! High-Protein Chicken Pasta — 48g protein, 520 calories per serving. Saved to your Recipes tab! Ingredients: 4oz pasta, 6oz chicken breast, 2 cups spinach, cherry tomatoes, olive oil, parmesan.' },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    desc: 'Everything you need to start tracking',
    cta: 'Get Started Free',
    ctaLink: '/login',
    highlight: false,
    features: [
      'Food diary & daily logging',
      'USDA food database (400k+ foods)',
      'Macro calculator & goal setting',
      'Grocery list',
      'Saved recipes (view)',
      'Progress reports',
      'Manual food entry',
    ],
  },
  {
    name: 'Pro',
    price: '$4.99',
    period: '/mo',
    desc: 'Unlimited AI coach access',
    cta: 'Upgrade to Pro',
    ctaLink: '/upgrade',
    highlight: true,
    badge: 'MOST POPULAR',
    features: [
      'Everything in Free',
      'AI Nutrition Coach — unlimited',
      'Snap nutrition labels with camera',
      '"Should I eat this?" analysis',
      'AI-built grocery lists',
      'AI recipe finder & saver',
      'Log meals by describing them',
      'Kimi K2.5 + live web search',
    ],
  },
  {
    name: 'Pro Yearly',
    price: '$49.99',
    period: '/yr',
    desc: 'Best value — 2 months free',
    cta: 'Get Yearly',
    ctaLink: '/upgrade',
    highlight: false,
    badge: 'SAVE 17%',
    features: [
      'Everything in Pro',
      'One-time annual payment',
      '2 months free vs monthly',
      'Priority support',
    ],
  },
];

// Scroll helper
const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [coachIdx, setCoachIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [typing, setTyping] = useState(true);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated]);

  // Typewriter effect for hero
  const HERO_PHRASES = [
    'your macros',
    'your grocery list',
    'your nutrition goals',
    'what to eat tonight',
    'your meal prep plan',
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const phrase = HERO_PHRASES[phraseIdx];
    let i = typed.length;
    if (typing) {
      if (i < phrase.length) {
        const t = setTimeout(() => setTyped(phrase.slice(0, i + 1)), 60);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 1800);
        return () => clearTimeout(t);
      }
    } else {
      if (i > 0) {
        const t = setTimeout(() => setTyped(phrase.slice(0, i - 1)), 30);
        return () => clearTimeout(t);
      } else {
        setPhraseIdx((phraseIdx + 1) % HERO_PHRASES.length);
        setTyping(true);
      }
    }
  }, [typed, typing, phraseIdx]);

  // Rotate coach examples
  useEffect(() => {
    const t = setInterval(() => setCoachIdx(i => (i + 1) % COACH_EXAMPLES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/images/logo-dark.png" alt="Logo" className="h-14 w-14 object-contain" />
            <span className="text-lg font-bold">NutriTrack</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href.slice(1))}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                {l.label}
              </button>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/login?tab=signup" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-500/25">
              Get Started Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 space-y-3">
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => { scrollTo(l.href.slice(1)); setMenuOpen(false); }}
                className="block w-full text-left text-sm text-gray-700 dark:text-gray-300 py-2">
                {l.label}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg">
                Sign In
              </Link>
              <Link to="/login?tab=signup" onClick={() => setMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-bold bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-violet-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-indigo-100 dark:border-indigo-700">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Kimi K2.5 with live web search
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight mb-6">
            Your AI knows
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              {typed}<span className="animate-pulse">|</span>
            </span>
          </h1>

          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            NutriTrack is the only nutrition app with an AI coach that actually searches the web —
            so every answer is accurate, personalized, and current. No guessing. No generic advice.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link to="/login?tab=signup"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-base font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2">
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login?tab=book"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-base font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" /> I Have the Book
            </Link>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            No credit card required · Free forever · Book owners get Pro access included
          </p>

          {/* Hero screenshot */}
          <div className="mt-16 relative max-w-2xl mx-auto">
            {/* Glow */}
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-75" />
            {/* App frame */}
            <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 ring-1 ring-black/5">
              <img
                src="/images/app-hero-screenshot.png"
                alt="NutriTrack AI Nutrition Coach — real Chipotle recommendation"
                className="w-full h-auto"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-xl px-4 py-2 border border-gray-100 dark:border-gray-700 flex items-center gap-2 whitespace-nowrap">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live web search · Real answers</span>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button onClick={() => scrollTo('features')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
              <span className="text-xs">See what it can do</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { num: '400K+', label: 'Foods in database' },
            { num: 'Live', label: 'Web search powered' },
            { num: '8', label: 'AI-powered features' },
            { num: '$0', label: 'To get started' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black">{s.num}</div>
              <div className="text-blue-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Everything you need.<br />
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Nothing you don't.</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
              Built for real people with real goals — not just fitness influencers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={`${f.bg} rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── AI COACH SPOTLIGHT ── */}
      <section id="ai-coach" className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                <Brain className="w-3.5 h-3.5" /> AI NUTRITION COACH
              </div>
              <h2 className="text-4xl font-black mb-6 leading-tight">
                Like having a dietitian
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  in your pocket. 24/7.
                </span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8">
                Most nutrition apps give you a database. NutriTrack gives you a coach that <strong className="text-gray-800 dark:text-gray-200">searches the web in real time</strong> to answer your exact question — with your exact goals in mind.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Target, text: 'Knows your daily goals and remaining macros' },
                  { icon: Search, text: 'Searches the web live for accurate nutrition data' },
                  { icon: ShoppingCart, text: 'Saves grocery lists directly to your app' },
                  { icon: BookOpen, text: 'Finds and saves recipes to your library' },
                  { icon: Camera, text: 'Reads nutrition labels from photos' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live chat demo */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Chat header */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">AI Nutrition Coach</div>
                    <div className="text-indigo-200 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                      Searching the web · Kimi K2.5
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 min-h-[280px]">
                <div className="flex justify-end">
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%]">
                    {COACH_EXAMPLES[coachIdx].q}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[85%] leading-relaxed">
                    {COACH_EXAMPLES[coachIdx].a}
                  </div>
                </div>
                <div className="flex gap-1 justify-center pt-2">
                  {COACH_EXAMPLES.map((_, i) => (
                    <button key={i} onClick={() => setCoachIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === coachIdx ? 'bg-indigo-600 w-4' : 'bg-gray-300 dark:bg-gray-600'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Input bar */}
              <div className="border-t border-gray-100 dark:border-gray-700 p-3">
                <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                  <span className="text-xs text-gray-400 flex-1">Ask me anything about nutrition...</span>
                  <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO PATHS ── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Two ways to get in</h2>
            <p className="text-gray-500 dark:text-gray-400">Pick your path — both get you full access to the core app.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Book owner */}
            <Link to="/login?tab=book"
              className="group relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl p-8 border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all hover:shadow-xl hover:shadow-amber-500/10">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full mb-3">
                BOOK OWNERS
              </div>
              <h3 className="text-xl font-black mb-2">I Have the Book</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                Purchased the companion book? Enter your code to unlock the app. Your book includes full Pro access — the AI coach, all features, everything.
              </p>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                Enter your book code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* New user */}
            <Link to="/login?tab=signup"
              className="group relative bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-2xl p-8 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-xl hover:shadow-indigo-500/10">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded-full mb-3">
                NEW USERS
              </div>
              <h3 className="text-xl font-black mb-2">Create Free Account</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                No book? No problem. Sign up free and get instant access to the full nutrition tracker. Upgrade to Pro anytime for the AI coach.
              </p>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                Sign up free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Simple, honest pricing</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Start free. Upgrade when you want the AI coach. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-6 border ${
                plan.highlight
                  ? 'bg-gradient-to-br from-indigo-600 to-blue-600 border-indigo-500 text-white shadow-2xl shadow-indigo-500/30 scale-[1.02]'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-black ${
                    plan.highlight ? 'bg-yellow-400 text-yellow-900' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  }`}>
                    {plan.badge}
                  </div>
                )}
                <div className="mb-5">
                  <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : ''}`}>{plan.name}</h3>
                  <div className={`text-3xl font-black ${plan.highlight ? 'text-white' : ''}`}>
                    {plan.price}<span className={`text-base font-normal ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm mt-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>{plan.desc}</p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-yellow-300' : 'text-green-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={plan.ctaLink}
                  className={`block w-full py-3 text-center text-sm font-bold rounded-xl transition-all ${
                    plan.highlight
                      ? 'bg-white text-indigo-600 hover:bg-blue-50'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
            Payments processed securely by Stripe · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-white mb-4">
                Ready to actually hit your goals?
              </h2>
              <p className="text-blue-200 mb-8 text-lg">
                Join thousands of people using NutriTrack to eat smarter, not harder.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/login?tab=signup"
                  className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-blue-50 transition-all text-sm flex items-center justify-center gap-2 shadow-xl">
                  Start Free Today <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login?tab=book"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 border border-white/20">
                  <BookOpen className="w-4 h-4" /> Enter Book Code
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/logo-dark.png" alt="Logo" className="h-12 w-12 object-contain" />
            <span className="font-bold">NutriTrack</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/login" className="hover:text-gray-800 dark:hover:text-gray-200">Sign In</Link>
            <Link to="/login?tab=signup" className="hover:text-gray-800 dark:hover:text-gray-200">Sign Up</Link>
            <Link to="/upgrade" className="hover:text-gray-800 dark:hover:text-gray-200">Pricing</Link>
            <Link to="/contact" className="hover:text-gray-800 dark:hover:text-gray-200">Contact</Link>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} NutriTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
