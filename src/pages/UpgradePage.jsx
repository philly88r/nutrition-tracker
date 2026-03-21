import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Check, Zap, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const STRIPE_MONTHLY_LINK = import.meta.env.VITE_STRIPE_MONTHLY_LINK;
const STRIPE_YEARLY_LINK = import.meta.env.VITE_STRIPE_YEARLY_LINK;

const FREE_FEATURES = [
  'Food diary & daily logging',
  'USDA food database search',
  'Macro calculator',
  'Grocery list',
  'Saved recipes (view)',
  'Progress reports',
  'Manual food entry',
];

const PRO_FEATURES = [
  'Everything in Free',
  'AI Nutrition Coach — unlimited messages',
  'Upload nutrition label photos for analysis',
  '"Should I eat this?" AI analysis',
  'AI builds your grocery list from your store',
  'AI finds & saves recipes to your library',
  'Log meals by just describing them',
  'Kimi K2.5 with live web search',
];

const UpgradePage = () => {
  const [status, setStatus] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const location = useLocation();

  const token = localStorage.getItem('authToken');
  const headers = { Authorization: `Bearer ${token}` };

  const params = new URLSearchParams(location.search);
  const success = params.get('success');
  const canceled = params.get('canceled');

  useEffect(() => {
    fetch(`${API_URL}/payments/status`, { headers })
      .then(r => r.json())
      .then(d => setStatus(d.status))
      .catch(() => setStatus('free'));
  }, [success]);

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch(`${API_URL}/payments/portal`, { method: 'POST', headers });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Could not open billing portal.');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" /> Upgrade to Pro
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
          Unlock the AI Nutrition Coach
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Get unlimited access to your personal AI coach — powered by Kimi K2.5 with live web search.
          Scan labels, build grocery lists, find recipes, and log meals just by describing them.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-center text-green-700 dark:text-green-400 font-medium">
          🎉 Welcome to Pro! Your AI Nutrition Coach is now unlocked.
        </div>
      )}
      {canceled && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-center text-yellow-700 dark:text-yellow-400">
          Checkout canceled. You can upgrade anytime.
        </div>
      )}

      {status === 'pro' && !success && (
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl text-center text-indigo-700 dark:text-indigo-300 font-medium">
          ✅ You're on Pro! Full AI Nutrition Coach access is active.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Free */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Free</h2>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">$0<span className="text-base font-normal text-gray-500">/mo</span></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Everything you need to track nutrition</p>
          </div>
          <ul className="space-y-2.5 mb-6">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <div className="w-full py-2.5 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg">
            Current plan
          </div>
        </div>

        {/* Pro */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
            BEST VALUE
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <h2 className="text-lg font-bold">Pro</h2>
            </div>
            <div className="text-3xl font-extrabold mt-1">$4.99<span className="text-base font-normal text-blue-200">/mo</span></div>
            <p className="text-sm text-blue-200 mt-1">Unlimited AI coach access</p>
          </div>
          <ul className="space-y-2.5 mb-6">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-blue-100">
                <Check className="w-4 h-4 text-yellow-300 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>

          {status === 'pro' ? (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              {portalLoading ? 'Opening...' : 'Manage Subscription'}
            </button>
          ) : (
            <div className="space-y-2">
              <a
                href={STRIPE_MONTHLY_LINK}
                className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Monthly — $4.99/mo
              </a>
              <a
                href={STRIPE_YEARLY_LINK}
                className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                Yearly — $49.99 (save 17%)
              </a>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        Payments processed securely by Stripe. Cancel anytime from your billing portal.
      </p>
    </div>
  );
};

export default UpgradePage;
