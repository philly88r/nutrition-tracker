import React, { useState, useEffect } from 'react';
import { searchFoods, getFoodDetails, convertUsdaFoodToAppFormat } from '../services/usdaApiService';
import MacroTracker from '../components/MacroTracker';
import { groceryAPI } from '../services/apiService';

const GroceryList = () => {
  const [groceryItems, setGroceryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('item');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualFood, setManualFood] = useState({
    name: '',
    category: 'Other',
    quantity: 1,
    unit: 'item'
  });
  
  // Load grocery list from backend on mount
  useEffect(() => {
    const loadGroceryItems = async () => {
      try {
        const items = await groceryAPI.getAll();
        setGroceryItems(items || []);
      } catch (error) {
        console.error('Failed to load grocery items from backend:', error);
        // Fallback to localStorage
        const storedList = localStorage.getItem('groceryList');
        if (storedList) {
          setGroceryItems(JSON.parse(storedList));
        }
      }
    };
    loadGroceryItems();
  }, []);
  
  // Save grocery list to localStorage as backup
  useEffect(() => {
    localStorage.setItem('groceryList', JSON.stringify(groceryItems));
  }, [groceryItems]);
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedFood(null);
    
    try {
      const results = await searchFoods(searchTerm);
      setSearchResults(results.foods || []);
      
      if (results.foods?.length === 0) {
        setError('No foods found matching your search term.');
      }
    } catch (err) {
      setError(`Error searching for foods: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle food selection
  const handleSelectFood = async (food) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const foodDetails = await getFoodDetails(food.fdcId);
      const formattedFood = convertUsdaFoodToAppFormat(foodDetails);
      setSelectedFood(formattedFood);
      
      // Set default unit based on food category
      if (formattedFood.category === 'Fruits' || formattedFood.category === 'Vegetables') {
        setUnit('lb');
      } else if (formattedFood.category === 'Dairy') {
        setUnit('gal');
      } else {
        setUnit('item');
      }
    } catch (err) {
      setError(`Error getting food details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add food to grocery list
  const addToGroceryList = () => {
    if (!selectedFood) return;
    
    const groceryItem = {
      id: `gl_${Date.now()}`,
      usdaFoodId: selectedFood.id,
      name: selectedFood.name,
      brand: selectedFood.brand || '',
      category: selectedFood.category,
      quantity,
      unit,
      checked: false,
      nutritionPer100g: {
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        fiber: selectedFood.fiber || 0,
        sugar: selectedFood.sugar || 0,
        sodium: selectedFood.sodium || 0,
      }
    };
    
    setGroceryItems(prev => [...prev, groceryItem]);
    
    // Sync to backend (flatten nutritionPer100g)
    groceryAPI.create({
      id: groceryItem.id,
      name: groceryItem.name,
      brand: groceryItem.brand,
      category: groceryItem.category,
      quantity: groceryItem.quantity,
      unit: groceryItem.unit,
      checked: groceryItem.checked,
      calories: groceryItem.nutritionPer100g?.calories || 0,
      protein: groceryItem.nutritionPer100g?.protein || 0,
      carbs: groceryItem.nutritionPer100g?.carbs || 0,
      fat: groceryItem.nutritionPer100g?.fat || 0,
      fiber: groceryItem.nutritionPer100g?.fiber || 0
    }).catch(err => console.error('Failed to sync grocery item to backend:', err));
    
    // Reset form
    setSelectedFood(null);
    setSearchTerm('');
    setSearchResults([]);
    setQuantity(1);
    setUnit('item');
  };
  
  // Toggle item checked status
  const toggleItemChecked = (itemId) => {
    setGroceryItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  // Remove item from grocery list
  const removeItem = (itemId) => {
    setGroceryItems(prev => prev.filter(item => item.id !== itemId));
    // Sync to backend
    groceryAPI.delete(itemId).catch(err => console.error('Failed to delete grocery item from backend:', err));
  };
  
  // Clear checked items
  const clearCheckedItems = () => {
    setGroceryItems(prev => prev.filter(item => !item.checked));
  };
  
  // Clear entire list
  const clearAllItems = () => {
    if (window.confirm('Are you sure you want to clear your entire grocery list?')) {
      setGroceryItems([]);
    }
  };
  
  // Add manual food entry
  const addManualFood = (e) => {
    e.preventDefault();
    
    if (!manualFood.name.trim()) return;
    
    const groceryItem = {
      id: `gl_${Date.now()}`,
      name: manualFood.name,
      brand: '',
      category: manualFood.category,
      quantity: manualFood.quantity,
      unit: manualFood.unit,
      checked: false,
      nutritionPer100g: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    };
    
    setGroceryItems(prev => [...prev, groceryItem]);
    
    // Sync to backend (flatten nutritionPer100g)
    groceryAPI.create({
      id: groceryItem.id,
      name: groceryItem.name,
      brand: groceryItem.brand,
      category: groceryItem.category,
      quantity: groceryItem.quantity,
      unit: groceryItem.unit,
      checked: groceryItem.checked,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    }).catch(err => console.error('Failed to sync grocery item to backend:', err));
    
    // Reset form
    setManualFood({
      name: '',
      category: 'Other',
      quantity: 1,
      unit: 'item'
    });
    setShowManualEntry(false);
  };
  
  // Get items for the current category
  const filteredItems = activeCategory === 'All' 
    ? groceryItems 
    : groceryItems.filter(item => item.category === activeCategory);
  
  // Get unique categories from grocery items
  const uniqueCategories = ['All', ...new Set(groceryItems.map(item => item.category))].filter(Boolean);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Grocery List</h1>
      
      {/* Add Item Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add Items</h2>
          <button
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
          >
            {showManualEntry ? 'Search USDA' : '+ Manual Entry'}
          </button>
        </div>
        
        {showManualEntry ? (
          /* Manual Entry Form */
          <form onSubmit={addManualFood} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                value={manualFood.name}
                onChange={(e) => setManualFood({...manualFood, name: e.target.value})}
                placeholder="e.g., Bananas, Milk, Bread..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={manualFood.quantity}
                  onChange={(e) => setManualFood({...manualFood, quantity: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={manualFood.unit}
                  onChange={(e) => setManualFood({...manualFood, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="item">item(s)</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                  <option value="gal">gal</option>
                  <option value="qt">qt</option>
                  <option value="pkg">package</option>
                  <option value="box">box</option>
                  <option value="bag">bag</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={manualFood.category}
                onChange={(e) => setManualFood({...manualFood, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Dairy">Dairy</option>
                <option value="Meat">Meat</option>
                <option value="Grains">Grains</option>
                <option value="Snacks">Snacks</option>
                <option value="Beverages">Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add to List
            </button>
          </form>
        ) : (
          /* USDA Search Form */
          <>
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700">
                <strong>USDA Data Source:</strong> Information provided by food brand owners is label data. Brand owners are responsible for descriptions, nutrient data and ingredient information. USDA calculates values per 100g or 100ml from values per serving. Values calculated from %DV use current daily values for an adult 2,000 calorie diet (21 CFR 101.9(c)).
              </p>
            </div>
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
          </>
        )}
        
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
                {selectedFood.fiber > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                    <span className="font-medium">Fiber:</span>
                    <span>{selectedFood.fiber}g</span>
                  </div>
                )}
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
              <h4 className="text-sm font-medium mb-1">Quantity:</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="0.1"
                  step="0.1"
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="item">item</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                  <option value="gal">gal</option>
                  <option value="qt">qt</option>
                  <option value="pt">pt</option>
                  <option value="pkg">pkg</option>
                  <option value="can">can</option>
                  <option value="bunch">bunch</option>
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
                onClick={addToGroceryList}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add to Grocery List
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Grocery List Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold">My Grocery List</h2>
          <div className="flex gap-2">
            <button
              onClick={clearCheckedItems}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
              disabled={!groceryItems.some(item => item.checked)}
            >
              Clear Checked
            </button>
            <button
              onClick={clearAllItems}
              className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50"
              disabled={groceryItems.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>
        
        {/* Category tabs */}
        {groceryItems.length > 0 && (
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex">
              {uniqueCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 whitespace-nowrap ${
                    activeCategory === category 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Grocery items */}
        {filteredItems.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredItems.map(item => {
              // Calculate macro percentages for this item
              const proteinCal = (item.nutritionPer100g.protein || 0) * 4;
              const carbsCal = (item.nutritionPer100g.carbs || 0) * 4;
              const fatCal = (item.nutritionPer100g.fat || 0) * 9;
              const totalMacroCal = proteinCal + carbsCal + fatCal;
              
              return (
                <li key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItemChecked(item.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className={`font-medium ${item.checked ? 'line-through text-gray-400' : ''}`}>
                            {item.name}
                          </div>
                          {item.brand && (
                            <div className="text-sm text-gray-500">{item.brand}</div>
                          )}
                          <div className="text-sm text-gray-500 mt-1">
                            Quantity: {item.quantity} {item.unit}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-semibold text-blue-700">
                            {item.nutritionPer100g.calories} kcal
                          </div>
                          <div className="text-xs text-gray-500">per 100g</div>
                        </div>
                      </div>
                      
                      {/* Macro breakdown */}
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span>Protein: {item.nutritionPer100g.protein.toFixed(1)}g</span>
                            {totalMacroCal > 0 && (
                              <span className="text-gray-400">
                                ({((proteinCal / totalMacroCal) * 100).toFixed(0)}%)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            <span>Carbs: {item.nutritionPer100g.carbs.toFixed(1)}g</span>
                            {totalMacroCal > 0 && (
                              <span className="text-gray-400">
                                ({((carbsCal / totalMacroCal) * 100).toFixed(0)}%)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span>Fat: {item.nutritionPer100g.fat.toFixed(1)}g</span>
                            {totalMacroCal > 0 && (
                              <span className="text-gray-400">
                                ({((fatCal / totalMacroCal) * 100).toFixed(0)}%)
                              </span>
                            )}
                          </div>
                          {item.nutritionPer100g.fiber > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                              <span>Fiber: {item.nutritionPer100g.fiber.toFixed(1)}g</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Macro visual bar */}
                        {totalMacroCal > 0 && (
                          <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-200 mt-2">
                            <div 
                              className="bg-red-500" 
                              style={{ width: `${(proteinCal / totalMacroCal) * 100}%` }}
                              title={`Protein: ${((proteinCal / totalMacroCal) * 100).toFixed(0)}%`}
                            />
                            <div 
                              className="bg-yellow-500" 
                              style={{ width: `${(carbsCal / totalMacroCal) * 100}%` }}
                              title={`Carbs: ${((carbsCal / totalMacroCal) * 100).toFixed(0)}%`}
                            />
                            <div 
                              className="bg-green-500" 
                              style={{ width: `${(fatCal / totalMacroCal) * 100}%` }}
                              title={`Fat: ${((fatCal / totalMacroCal) * 100).toFixed(0)}%`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            {groceryItems.length === 0 ? (
              <p>Your grocery list is empty. Add items using the search above.</p>
            ) : (
              <p>No items in the selected category.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Nutritional Summary */}
      {groceryItems.length > 0 && (() => {
        const totalCalories = groceryItems.reduce((sum, item) => sum + item.nutritionPer100g.calories, 0);
        const totalProtein = groceryItems.reduce((sum, item) => sum + item.nutritionPer100g.protein, 0);
        const totalCarbs = groceryItems.reduce((sum, item) => sum + item.nutritionPer100g.carbs, 0);
        const totalFat = groceryItems.reduce((sum, item) => sum + item.nutritionPer100g.fat, 0);
        const totalFiber = groceryItems.reduce((sum, item) => sum + (item.nutritionPer100g.fiber || 0), 0);
        
        const proteinCal = totalProtein * 4;
        const carbsCal = totalCarbs * 4;
        const fatCal = totalFat * 9;
        const totalMacroCal = proteinCal + carbsCal + fatCal;
        
        return (
          <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <h2 className="text-xl font-bold">Grocery List Nutrition Summary</h2>
              <p className="text-sm text-blue-100 mt-1">
                Combined nutrition for all items (per 100g each)
              </p>
            </div>
            
            <div className="p-6">
              {/* Total Calories */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Calories</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-blue-700">
                      {totalCalories.toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">kcal</span>
                  </div>
                </div>
              </div>

              {/* Macro Breakdown */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Macronutrient Breakdown</h3>
                
                {/* Calorie Distribution Bar */}
                {totalMacroCal > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-6 rounded-full overflow-hidden flex">
                        <div
                          className="bg-red-500"
                          style={{ width: `${(proteinCal / totalMacroCal) * 100}%` }}
                          title={`Protein: ${((proteinCal / totalMacroCal) * 100).toFixed(0)}%`}
                        />
                        <div
                          className="bg-yellow-500"
                          style={{ width: `${(carbsCal / totalMacroCal) * 100}%` }}
                          title={`Carbs: ${((carbsCal / totalMacroCal) * 100).toFixed(0)}%`}
                        />
                        <div
                          className="bg-green-500"
                          style={{ width: `${(fatCal / totalMacroCal) * 100}%` }}
                          title={`Fat: ${((fatCal / totalMacroCal) * 100).toFixed(0)}%`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-500" />
                        <span className="text-gray-600">
                          Protein: {((proteinCal / totalMacroCal) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-yellow-500" />
                        <span className="text-gray-600">
                          Carbs: {((carbsCal / totalMacroCal) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-green-500" />
                        <span className="text-gray-600">
                          Fat: {((fatCal / totalMacroCal) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Individual Macros */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="text-xs text-gray-600">Protein</span>
                    </div>
                    <div className="text-2xl font-bold text-red-700">
                      {totalProtein.toFixed(1)}g
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {proteinCal.toFixed(0)} kcal
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span className="text-xs text-gray-600">Carbs</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-700">
                      {totalCarbs.toFixed(1)}g
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {carbsCal.toFixed(0)} kcal
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-xs text-gray-600">Fat</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {totalFat.toFixed(1)}g
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {fatCal.toFixed(0)} kcal
                    </div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                      <span className="text-xs text-gray-600">Fiber</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-700">
                      {totalFiber.toFixed(1)}g
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {groceryItems.length} items
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Info Note */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>📊 Note:</strong> This summary shows combined nutrition for 100g of each item in your list. 
                  Actual totals will vary based on the quantities you purchase.
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default GroceryList;
