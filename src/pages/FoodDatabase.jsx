import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useFoodData from '../hooks/useFoodData';

const FoodDatabase = () => {
  const { savedFoods, removeFood } = useFoodData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter foods based on search term and category
  const filteredFoods = savedFoods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (food.brand && food.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Check if a food is from the USDA database
  const isUsdaFood = (foodId) => {
    return typeof foodId === 'string' && foodId.startsWith('usda_');
  };

  // Check if a food is a custom saved food
  const isCustomFood = (foodId) => {
    return typeof foodId === 'string' && foodId.startsWith('custom_');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved USDA Foods</h1>
        <div className="flex gap-2">
          <Link 
            to="/add-food" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add USDA Food
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="md:w-2/3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Saved USDA Foods
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Category filter */}
          <div className="md:w-1/3">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {Array.from(new Set(savedFoods.map(food => food.category))).sort().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Foods list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold">Foods ({filteredFoods.length})</h2>
        </div>
        
        {filteredFoods.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredFoods.map(food => (
              <div key={food.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">{food.name}</span>
                      {isUsdaFood(food.id) && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">USDA</span>
                      )}
                      {isCustomFood(food.id) && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Custom</span>
                      )}
                    </div>
                    {food.brand && (
                      <div className="text-sm text-gray-500">{food.brand}</div>
                    )}
                    <div className="text-sm text-gray-500">
                      Category: {food.category}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-right mr-4">
                      <div className="font-medium">{food.calories} kcal</div>
                      <div className="text-sm text-gray-500">
                        per {food.servingSize}{food.servingUnit}
                      </div>
                      <div className="text-sm text-gray-500">
                        P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                      </div>
                    </div>
                    
                    {(isUsdaFood(food.id) || isCustomFood(food.id)) && (
                      <button
                        onClick={() => removeFood(food.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                        aria-label="Remove food"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No foods found matching your criteria</p>
            <p className="mt-2">
              <Link 
                to="/add-food" 
                className="text-blue-600 hover:underline"
              >
                Add a new food
              </Link>
            </p>
          </div>
        )}
      </div>
      
      {/* USDA Database Info */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
        <h2 className="text-lg font-semibold mb-2">About USDA FoodData Central</h2>
        <p className="mb-4">
          This application exclusively uses the USDA FoodData Central database for accurate nutritional information. Foods you save from the database will appear here for quick access.
        </p>
        <Link 
          to="/add-food" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search USDA Database
        </Link>
      </div>
    </div>
  );
};

export default FoodDatabase;
