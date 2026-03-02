import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UsdaFoodSearch from '../components/UsdaFoodSearch';
import ManualFoodEntry from '../components/ManualFoodEntry';
import { useNutritionContext } from '../hooks/useNutritionContext';

/**
 * Page for adding foods to the daily log
 * Supports both USDA API search and manual entry
 */
const AddFoodPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useNutritionContext();
  const [activeTab, setActiveTab] = useState('usda'); // 'usda' or 'manual'

  // Handle adding a new food from USDA to saved foods
  const handleAddUsdaFood = (usdaFood) => {
    // Create a food entry with the current date
    const foodEntry = {
      id: `entry_${Date.now()}`,
      date: state.currentDate,
      name: usdaFood.name || usdaFood.description,
      brand: usdaFood.brand || '',
      calories: usdaFood.calories || 0,
      protein: usdaFood.protein || 0,
      carbs: usdaFood.carbs || 0,
      fat: usdaFood.fat || 0,
      fiber: usdaFood.fiber || 0,
      sugar: usdaFood.sugar || 0,
      mealType: 'lunch', // Default meal type - lowercase to match DailyFoodLog
      servingSize: usdaFood.servingSize || 100,
      servingUnit: usdaFood.servingUnit || 'g',
      servings: 1
    };
    
    // Add to food entries
    dispatch({ type: 'ADD_FOOD_ENTRY', payload: foodEntry });
    
    // Save data to storage (will be handled by the reducer and context)
    dispatch({ type: 'SAVE_USER_DATA' });
    
    // Navigate back to dashboard
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Food to Log</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
        >
          ← Back
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('usda')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'usda'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                USDA Database Search
              </span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'manual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Manual Entry
              </span>
            </button>
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'usda' ? (
          <div>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>🔍 Search the USDA FoodData Central database</strong> for accurate nutritional information on thousands of foods. All macro data is automatically calculated.
              </p>
              <p className="text-xs text-blue-700 mt-2 pt-2 border-t border-blue-200">
                <strong>Data Source:</strong> Information provided by food brand owners is label data. Brand owners are responsible for descriptions, nutrient data and ingredient information. USDA calculates values per 100g or 100ml from values per serving. Values calculated from %DV use current daily values for an adult 2,000 calorie diet (21 CFR 101.9(c)).
              </p>
            </div>
            <UsdaFoodSearch onAddFood={handleAddUsdaFood} />
          </div>
        ) : (
          <div>
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✏️ Manually enter food information</strong> for items not in the USDA database, such as homemade meals or restaurant dishes.
              </p>
            </div>
            <ManualFoodEntry onAddFood={handleAddUsdaFood} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFoodPage;
