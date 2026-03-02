import React, { useState } from 'react';
import { Sparkles, Loader2, Send } from 'lucide-react';

const AiQuickLog = ({ onFoodDetected }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickLog = async () => {
    if (!input) return;
    setIsProcessing(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/ai-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealDescription: input })
      });
      
      const foodData = await response.json();
      onFoodDetected(foodData);
      setInput('');
    } catch (error) {
      console.error('AI Log Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-tight">AI Quick Log (Beta)</h3>
      </div>
      
      <div className="flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. I had two scrambled eggs and a piece of toast..."
          className="flex-1 px-4 py-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
        />
        <button 
          onClick={handleQuickLog}
          disabled={isProcessing || !input}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Log
        </button>
      </div>
      <p className="text-[10px] text-indigo-400 mt-2 italic">Powered by Gemini 3 Flash Preview</p>
    </div>
  );
};

export default AiQuickLog;
