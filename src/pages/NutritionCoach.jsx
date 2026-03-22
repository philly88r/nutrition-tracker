import React, { useState, useRef, useEffect } from 'react';
import { Camera, Send, Loader2, ShoppingCart, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNutritionContext } from '../hooks/useNutritionContext';
import ReactMarkdown from 'react-markdown';

const NutritionCoach = () => {
  const { state, dispatch } = useNutritionContext();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your AI Nutrition Coach powered by Kimi K2.5. I can help you with:

• **Should I eat this?** — Tell me what you're thinking of eating or upload a nutrition label photo
• **Check against your goals** — I'll search for accurate nutrition info and analyze if it fits your daily targets
• **Build your grocery list** — Get a personalized shopping list saved directly to your Grocery List tab
• **Review your grocery list** — I'll check if your planned groceries align with your goals

What would you like help with today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groceryStore, setGroceryStore] = useState(
    localStorage.getItem('preferredGroceryStore') || ''
  );
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle store name reply after coach asks for it
  const detectStoreReply = (text) => {
    const stores = ['walmart', 'kroger', 'publix', 'aldi', 'whole foods', 'costco', 'target', 'safeway', 'wegmans', 'heb', 'trader joe', 'meijer', 'food lion', 'giant', 'stop & shop'];
    const lower = text.toLowerCase();
    return stores.find(s => lower.includes(s)) || (lower.length < 30 && !lower.includes(' ') ? text.trim() : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !image) return;

    const userMessage = { role: 'user', content: input.trim(), image: imagePreview };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Check if user is answering the store question
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    const isAnsweringStore = lastAssistantMsg?.content?.includes('grocery store do you shop at');
    let activeStore = groceryStore;

    if (isAnsweringStore) {
      const detectedStore = detectStoreReply(input.trim());
      if (detectedStore) {
        activeStore = detectedStore;
        setGroceryStore(detectedStore);
        localStorage.setItem('preferredGroceryStore', detectedStore);
      }
    }

    setInput('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', input.trim());

      const context = {
        dailyGoals: state.dailyGoals,
        dailyTotals: state.dailyTotals,
        remainingCalories: (state.dailyGoals?.calories || 0) - (state.dailyTotals?.calories || 0),
        remainingProtein: (state.dailyGoals?.protein || 0) - (state.dailyTotals?.protein || 0),
        remainingCarbs: (state.dailyGoals?.carbs || 0) - (state.dailyTotals?.carbs || 0),
        remainingFat: (state.dailyGoals?.fat || 0) - (state.dailyTotals?.fat || 0),
        groceryItems: state.groceryItems || [],
        groceryStore: activeStore
      };
      formData.append('context', JSON.stringify(context));

      // Send last 10 messages for conversation context (skip the welcome message)
      const conversationHistory = updatedMessages.slice(1, -1).slice(-10).map(m => ({
        role: m.role,
        content: m.content || ''
      }));
      formData.append('conversation', JSON.stringify(conversationHistory));

      if (image) formData.append('image', image);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/coach`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 403 && data.error === 'pro_required') {
        setMessages(prev => [...prev, { role: 'assistant', content: '__upgrade__' }]);
        setLoading(false);
        removeImage();
        return;
      }

      if (!response.ok && !data.response) {
        throw new Error(data.error || 'Failed to get coach response');
      }

      // Handle grocery list saved action
      if (data.action === 'grocery_list_saved') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          grocerySaved: true,
          itemsSaved: data.itemsSaved
        }]);
        // Refresh grocery list in context
        dispatch({ type: 'LOAD_USER_DATA' });
      } else if (data.action === 'meal_logged') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response
        }]);
        // Refresh food entries so dashboard updates immediately
        dispatch({ type: 'LOAD_USER_DATA' });
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response
        }]);
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I ran into an issue: ${error.message}. Please try again.`
      }]);
    } finally {
      setLoading(false);
      removeImage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">AI Nutrition Coach</h1>
              <p className="text-blue-100 text-xs mt-0.5">Powered by Kimi K2.5 · Web Search Enabled</p>
            </div>
            {groceryStore && (
              <div className="text-right">
                <p className="text-xs text-blue-200">Shopping at</p>
                <p className="text-sm font-semibold capitalize">{groceryStore}</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}>
                {message.image && (
                  <img src={message.image} alt="Uploaded" className="mb-2 rounded max-w-full h-auto" />
                )}
                {message.content === '__upgrade__' ? (
                  <div className="text-sm">
                    <p className="font-semibold mb-2">The AI Nutrition Coach requires a Pro subscription.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 text-xs">Get unlimited AI coaching, label scanning, grocery list building and more for just $4.99/month.</p>
                    <Link to="/upgrade" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                      <Sparkles className="w-3.5 h-3.5" /> Upgrade to Pro
                    </Link>
                  </div>
                ) : null}
                <div className={`text-sm prose prose-sm max-w-none dark:prose-invert ${message.content === '__upgrade__' ? 'hidden' : ''}`}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      h1: ({ children }) => <h1 className="text-base font-bold mb-1">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                {message.grocerySaved && (
                  <div className="mt-2 flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {message.itemsSaved} items saved to your Grocery List tab
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300 italic">
                  Hang tight — checking multiple sources for accuracy...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 rounded border border-gray-300" />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Upload nutrition label photo"
            >
              <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about nutrition..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || (!input.trim() && !image)}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-2 flex gap-2 flex-wrap">
            <button
              onClick={() => setInput('Should I eat this? ')}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              Should I eat this?
            </button>
            <button
              onClick={() => setInput('I just ate ')}
              className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-full transition-colors"
            >
              Log a meal
            </button>
            <button
              onClick={() => setInput('Help me build a grocery list for the week')}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors flex items-center gap-1"
            >
              <ShoppingCart className="w-3 h-3" /> Build grocery list
            </button>
            <button
              onClick={() => setInput('Review my current grocery list')}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              Review grocery list
            </button>
            <button
              onClick={() => setInput('Find me a recipe for ')}
              className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-full transition-colors"
            >
              Find a recipe
            </button>
            {groceryStore && (
              <button
                onClick={() => {
                  setGroceryStore('');
                  localStorage.removeItem('preferredGroceryStore');
                }}
                className="px-3 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-full transition-colors"
              >
                Change store
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionCoach;
