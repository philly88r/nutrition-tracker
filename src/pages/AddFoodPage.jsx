import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UsdaFoodSearch from '../components/UsdaFoodSearch';
import ManualFoodEntry from '../components/ManualFoodEntry';
import AiQuickLog from '../components/AiQuickLog';
import { useNutritionContext } from '../hooks/useNutritionContext';

/**
 * Page for adding foods to the daily log
 * Supports USDA Search, Manual Entry, and AI Quick Log
 */
const AddFoodPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useNutritionContext();
  const [activeTab, setActiveTab] = useState('usda'); // 'usda' or 'manual'

  const processAndAddFood = (foodData) => {
    const foodEntry = {
      id: `entry_${Date.now()}`,
      date: state.currentDate,
      name: foodData.name || foodData.description,
      brand: foodData.brand || '',
      calories: foodData.calories || 0,
      protein: foodData.protein || 0,
      carbs: foodData.carbs || 0,
      fat: foodData.fat || 0,
      fiber: foodData.fiber || 0,
      sugar: foodData.sugar || 0,
      mealType: 'lunch',
      servingSize: foodData.servingSize || 100,
      servingUnit: foodData.servingUnit || 'g',
      servings: 1
    };
    
    dispatch({ type: 'ADD_FOOD_ENTRY', payload: foodEntry });
    dispatch({ type: 'SAVE_USER_DATA' });
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Nutrition Entry</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 font-medium transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* NEW: AI Quick Log Section */}
      <AiQuickLog onFoodDetected={processAndAddFood} />
      
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
              USDA Search
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'manual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manual Entry
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'usda' ? (
          <UsdaFoodSearch onAddFood={processAndAddFood} />
        ) : (
          <ManualFoodEntry onAddFood={processAndAddFood} />
        )}
      </div>
    </div>
  );
};

export default AddFoodPage;
