import React, { useState } from 'react';
import { Send, Eye, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const AdminEmail = () => {
  const [title, setTitle] = useState('🎉 New Feature: AI Nutrition Coach is Here!');
  const [updates, setUpdates] = useState([
    'AI Nutrition Coach - Ask "Should I eat this?" and get instant advice',
    'Upload nutrition label photos - Kimi AI reads them automatically',
    'Build grocery lists with one message - AI adds items to your list',
    'All book purchasers now have FREE Pro access - thank you!',
    'New Saved Recipes feature - Find and save recipes from the web'
  ]);
  const [ctaUrl, setCtaUrl] = useState('https://macronutritiontracker.netlify.app/nutrition-coach');
  const [ctaText, setCtaText] = useState('Try the AI Coach');
  const [testMode, setTestMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const addUpdate = () => setUpdates([...updates, '']);
  const removeUpdate = (index) => setUpdates(updates.filter((_, i) => i !== index));
  const updateItem = (index, value) => {
    const newUpdates = [...updates];
    newUpdates[index] = value;
    setUpdates(newUpdates);
  };

  const handlePreview = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/preview-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, updates, ctaUrl, ctaText })
      });
      
      const data = await response.json();
      if (response.ok) {
        setPreview(data.html);
      } else {
        setError(data.error || 'Failed to generate preview');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/send-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          updates: updates.filter(u => u.trim()),
          ctaUrl,
          ctaText,
          testMode
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || data.setup || 'Failed to send emails');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📧 Send Product Update</h1>
        <p className="text-gray-600 mt-1">Send email updates to all NutriTrack users</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Updates List */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What's New (bullet points)</label>
          <div className="space-y-2">
            {updates.map((update, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={update}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={`Update ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {updates.length > 1 && (
                  <button
                    onClick={() => removeUpdate(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addUpdate}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add another update
          </button>
        </div>

        {/* CTA Button */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Link URL</label>
            <input
              type="url"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Test Mode */}
        <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
          <input
            type="checkbox"
            id="testMode"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="testMode" className="text-sm text-yellow-800">
            <span className="font-semibold">Test Mode</span> — Only send to first 3 users (recommended for testing)
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSend}
            disabled={loading || updates.filter(u => u.trim()).length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {testMode ? 'Send Test Emails' : 'Send to All Users'}
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
              {error.includes('RESEND_API_KEY') && (
                <p className="text-red-600 text-sm mt-2">
                  Run: <code className="bg-red-100 px-1 rounded">wrangler secret put RESEND_API_KEY</code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">
                {result.testMode 
                  ? `Test emails sent to ${result.emailsSent} users` 
                  : `Emails sent to all ${result.emailsSent} users!`}
              </p>
              <p className="text-green-600 text-sm">
                Total users in database: {result.totalUsers}
              </p>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Email Preview</h3>
            <div 
              className="border border-gray-300 rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How to send emails:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Sign up at <a href="https://resend.com" target="_blank" className="underline">resend.com</a> (free tier: 3,000 emails/month)</li>
          <li>Get your API key and add it: <code className="bg-blue-100 px-1 rounded">wrangler secret put RESEND_API_KEY</code></li>
          <li>Verify your domain or use the default Resend domain</li>
          <li>Toggle OFF "Test Mode" to send to all users</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminEmail;
