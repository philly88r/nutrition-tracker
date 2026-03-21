import React, { useState, useEffect } from 'react';
import { BookOpen, Trash2, Clock, Users, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const SavedRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const token = localStorage.getItem('authToken');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRecipes = async () => {
    try {
      const res = await fetch(`${API_URL}/recipes`, { headers });
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await fetch(`${API_URL}/recipes/${id}`, { method: 'DELETE', headers });
      setRecipes(prev => prev.filter(r => r.id !== id));
      if (expanded === id) setExpanded(null);
    } catch (err) {
      console.error('Failed to delete recipe:', err);
    } finally {
      setDeleting(null);
    }
  };

  const parseJSON = (val, fallback = []) => {
    if (!val) return fallback;
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return fallback; }
  };

  const macroColor = (label) => {
    if (label === 'Calories') return 'bg-orange-100 text-orange-700';
    if (label === 'Protein') return 'bg-blue-100 text-blue-700';
    if (label === 'Carbs') return 'bg-yellow-100 text-yellow-700';
    if (label === 'Fat') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Recipes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Recipes saved by your AI Nutrition Coach</p>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No recipes saved yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ask your AI Nutrition Coach to find a recipe — it will be saved here automatically.
          </p>
          <p className="text-xs text-blue-500 mt-3">Try: "Find me a high-protein chicken recipe"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe) => {
            const ingredients = parseJSON(recipe.ingredients);
            const instructions = parseJSON(recipe.instructions);
            const tags = parseJSON(recipe.tags);
            const isOpen = expanded === recipe.id;

            return (
              <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                {/* Header row */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{recipe.name}</h2>
                      {recipe.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{recipe.description}</p>
                      )}

                      {/* Time + servings */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {recipe.prep_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Prep: {recipe.prep_time}
                          </span>
                        )}
                        {recipe.cook_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Cook: {recipe.cook_time}
                          </span>
                        )}
                        {recipe.servings && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {recipe.servings} servings
                          </span>
                        )}
                      </div>

                      {/* Macros */}
                      {(recipe.calories || recipe.protein) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {[
                            { label: 'Calories', val: recipe.calories, unit: 'kcal' },
                            { label: 'Protein', val: recipe.protein, unit: 'g' },
                            { label: 'Carbs', val: recipe.carbs, unit: 'g' },
                            { label: 'Fat', val: recipe.fat, unit: 'g' },
                          ].filter(m => m.val).map(m => (
                            <span key={m.label} className={`px-2 py-0.5 rounded-full text-xs font-medium ${macroColor(m.label)}`}>
                              {m.label}: {m.val}{m.unit}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {recipe.source_url && (
                        <a
                          href={recipe.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View original recipe"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        disabled={deleting === recipe.id}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete recipe"
                      >
                        {deleting === recipe.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setExpanded(isOpen ? null : recipe.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isOpen
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isOpen ? 'Hide' : 'View Recipe'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded: ingredients + instructions */}
                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-5 grid md:grid-cols-2 gap-6">
                    {ingredients.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm uppercase tracking-wide">Ingredients</h3>
                        <ul className="space-y-1.5">
                          {ingredients.map((ing, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                              {ing}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {instructions.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm uppercase tracking-wide">Instructions</h3>
                        <ol className="space-y-2">
                          {instructions.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedRecipes;
