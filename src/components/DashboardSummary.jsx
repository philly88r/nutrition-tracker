import React from 'react';
import { Link } from 'react-router-dom';
import MacroTracker from './MacroTracker';
import { useNutritionContext } from '../hooks/useNutritionContext';

/**
 * Dashboard Summary Component
 * Shows daily nutrition overview with calories and macros
 */
const DashboardSummary = () => {
  const { state } = useNutritionContext();
  const userName = localStorage.getItem('userName') || 'User';

  const dailyTotals = state.dailyTotals || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const dailyGoals = state.dailyGoals || { calories: 2000, protein: 150, carbs: 200, fat: 65, fiber: 30 };

  // Calculate calorie percentage
  const caloriePercentage = dailyGoals.calories > 0 
    ? Math.min((dailyTotals.calories / dailyGoals.calories) * 100, 100) 
    : 0;
  
  const caloriesRemaining = Math.max(0, dailyGoals.calories - dailyTotals.calories);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {userName}'s Nutrition
            </h2>
            <p className="text-blue-100 text-sm">
              {new Date(state.currentDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <Link
            to="/macro-calculator"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Calculate Goals
          </Link>
        </div>
      </div>

      <div className="p-6">
        {/* Calories Section */}
        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Calories</h3>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-700">
                {dailyTotals.calories.toFixed(0)}
              </span>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-xl text-gray-600">
                {dailyGoals.calories}
              </span>
              <span className="text-sm text-gray-500 ml-1">kcal</span>
            </div>
          </div>
          
          {/* Calorie Progress Bar */}
          <div className="relative">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  caloriePercentage > 100 
                    ? 'bg-red-500' 
                    : caloriePercentage > 90 
                    ? 'bg-yellow-500' 
                    : 'bg-blue-600'
                }`}
                style={{ width: `${caloriePercentage}%` }}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-gray-600">
              {caloriePercentage.toFixed(0)}% of daily goal
            </span>
            {caloriesRemaining > 0 ? (
              <span className="text-green-600 font-medium">
                {caloriesRemaining.toFixed(0)} kcal remaining
              </span>
            ) : (
              <span className="text-orange-600 font-medium">
                +{Math.abs(caloriesRemaining).toFixed(0)} kcal over goal
              </span>
            )}
          </div>
        </div>

        {/* Macros Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Macronutrients</h3>
          <MacroTracker 
            totals={dailyTotals} 
            goals={dailyGoals}
            showPercentages={true}
          />
        </div>

        {/* Quick Stats */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Protein Goal</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-red-600">
                  {((dailyTotals.protein / dailyGoals.protein) * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-gray-500">complete</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Carbs Goal</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-yellow-600">
                  {((dailyTotals.carbs / dailyGoals.carbs) * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-gray-500">complete</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Fat Goal</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-green-600">
                  {((dailyTotals.fat / dailyGoals.fat) * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-gray-500">complete</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Fiber</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-purple-600">
                  {dailyTotals.fiber?.toFixed(1) || 0}g
                </span>
                <span className="text-xs text-gray-500">
                  / {dailyGoals.fiber}g
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
