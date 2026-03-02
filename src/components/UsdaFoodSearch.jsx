import React, { useState, useEffect, useCallback } from 'react';
import { searchFoods, getFoodDetails, convertUsdaFoodToAppFormat } from '../services/usdaApiService';

/**
 * Component for searching USDA food database and adding items to the tracker
 */
const UsdaFoodSearch = ({ onAddFood }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servingSize, setServingSize] = useState(100);
  const [servingUnit, setServingUnit] = useState('g');

  // Debounced search function
  const performSearch = useCallback(async (term) => {
    if (!term.trim() || term.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await searchFoods(term);
      setSearchResults(results.foods || []);
      
      if (results.foods?.length === 0) {
        setError('No foods found matching your search term.');
      }
    } catch (err) {
      setError(`Error searching for foods: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-search as user types (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  // Handle food selection
  const handleSelectFood = async (food) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const foodDetails = await getFoodDetails(food.fdcId);
      const formattedFood = convertUsdaFoodToAppFormat(foodDetails);
      setSelectedFood(formattedFood);
    } catch (err) {
      setError(`Error getting food details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding food to tracker
  const handleAddFood = () => {
    if (!selectedFood) return;
    
    // Create a copy of the selected food with the user-specified serving size
    const foodToAdd = {
      ...selectedFood,
      servingSize,
      servingUnit
    };
    
    // Calculate nutrition values based on serving size if different from 100g
    if (servingSize !== 100) {
      const ratio = servingSize / 100;
      
      // Adjust all nutrient values based on serving size
      Object.keys(foodToAdd).forEach(key => {
        // Only adjust numeric values that are nutrients
        if (typeof foodToAdd[key] === 'number' && 
            key !== 'servingSize' && 
            key !== 'fdcId') {
          foodToAdd[key] = +(foodToAdd[key] * ratio).toFixed(1);
        }
      });
    }
    
    onAddFood(foodToAdd);
    
    // Reset states
    setSelectedFood(null);
    setSearchTerm('');
    setSearchResults([]);
    setServingSize(100);
    setServingUnit('g');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Search USDA Food Database</h2>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a food..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Search results */}
      {searchResults.length > 0 && !selectedFood && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Search Results:</h3>
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            <ul className="divide-y divide-gray-200">
              {searchResults.map((food) => (
                <li 
                  key={food.fdcId}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectFood(food)}
                >
                  <div className="font-medium">{food.description}</div>
                  {food.brandName && (
                    <div className="text-sm text-gray-500">{food.brandName}</div>
                  )}
                  <div className="text-xs text-gray-400">
                    {food.foodCategory || 'Uncategorized'} • USDA ID: {food.fdcId}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Selected food details */}
      {selectedFood && (
        <div className="mb-4 p-4 border border-gray-200 rounded-md">
          <h3 className="font-medium mb-2">Selected Food:</h3>
          <div className="mb-3">
            <div className="font-medium">{selectedFood.name}</div>
            {selectedFood.brand && (
              <div className="text-sm text-gray-500">{selectedFood.brand}</div>
            )}
            <div className="text-xs text-gray-400">
              Category: {selectedFood.category}
            </div>
          </div>
          
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-2">Nutrition (per 100g):</h4>
            
            {/* Calories */}
            <div className="mb-3 p-2 bg-blue-50 rounded">
              <div className="text-sm font-semibold text-blue-700">
                Calories: {selectedFood.calories} kcal
              </div>
            </div>
            
            {/* Macros with color coding */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="font-medium">Protein:</span>
                <span>{selectedFood.protein}g</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFood.protein * 4).toFixed(0)} kcal)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="font-medium">Carbs:</span>
                <span>{selectedFood.carbs}g</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFood.carbs * 4).toFixed(0)} kcal)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="font-medium">Fat:</span>
                <span>{selectedFood.fat}g</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFood.fat * 9).toFixed(0)} kcal)
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                <span className="font-medium">Fiber:</span>
                <span>{selectedFood.fiber}g</span>
              </div>
              {selectedFood.sugar > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="w-3 h-3 rounded-full bg-pink-400"></span>
                  <span className="font-medium">Sugar:</span>
                  <span>{selectedFood.sugar}g</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Serving Size:</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={servingSize}
                onChange={(e) => setServingSize(Number(e.target.value))}
                min="0"
                step="1"
                className="w-20 px-2 py-1 border border-gray-300 rounded-md"
              />
              <select
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md"
              >
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="oz">oz</option>
                <option value="cup">cup</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setSelectedFood(null)}
              className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
            >
              Back to Results
            </button>
            <button
              onClick={handleAddFood}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add to Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsdaFoodSearch;
