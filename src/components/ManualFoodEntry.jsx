import React, { useState } from 'react';

/**
 * Manual Food Entry Component
 * Allows users to manually add foods that aren't in the USDA database
 */
const ManualFoodEntry = ({ onAddFood }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    servingSize: 100,
    servingUnit: 'g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'brand' || name === 'servingUnit' 
        ? value 
        : Number(value)
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Food name is required';
    }
    
    if (formData.servingSize <= 0) {
      newErrors.servingSize = 'Serving size must be greater than 0';
    }
    
    if (formData.calories < 0) {
      newErrors.calories = 'Calories cannot be negative';
    }
    
    if (formData.protein < 0) {
      newErrors.protein = 'Protein cannot be negative';
    }
    
    if (formData.carbs < 0) {
      newErrors.carbs = 'Carbs cannot be negative';
    }
    
    if (formData.fat < 0) {
      newErrors.fat = 'Fat cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create food object
    const foodToAdd = {
      id: `manual_${Date.now()}`,
      name: formData.name,
      brand: formData.brand || '',
      category: 'Custom',
      servingSize: formData.servingSize,
      servingUnit: formData.servingUnit,
      calories: formData.calories,
      protein: formData.protein,
      carbs: formData.carbs,
      fat: formData.fat,
      fiber: formData.fiber || 0,
      sugar: formData.sugar || 0
    };
    
    onAddFood(foodToAdd);
    
    // Reset form
    setFormData({
      name: '',
      brand: '',
      servingSize: 100,
      servingUnit: 'g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    });
  };

  // Calculate calories from macros
  const calculateCaloriesFromMacros = () => {
    const proteinCals = formData.protein * 4;
    const carbsCals = formData.carbs * 4;
    const fatCals = formData.fat * 9;
    return Math.round(proteinCals + carbsCals + fatCals);
  };

  const calculatedCalories = calculateCaloriesFromMacros();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Manual Food Entry</h2>
      <p className="text-sm text-gray-600 mb-4">
        Add a custom food that's not in the USDA database
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Food Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Food Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Homemade Chicken Salad"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Brand (Optional) */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Brand (Optional)
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g., Homemade"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Serving Size */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="servingSize" className="block text-sm font-medium text-gray-700 mb-1">
              Serving Size <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="servingSize"
              name="servingSize"
              value={formData.servingSize}
              onChange={handleChange}
              min="0"
              step="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.servingSize ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.servingSize && (
              <p className="mt-1 text-sm text-red-600">{errors.servingSize}</p>
            )}
          </div>
          <div>
            <label htmlFor="servingUnit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              id="servingUnit"
              name="servingUnit"
              value={formData.servingUnit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="g">grams (g)</option>
              <option value="ml">milliliters (ml)</option>
              <option value="oz">ounces (oz)</option>
              <option value="cup">cup</option>
              <option value="tbsp">tablespoon (tbsp)</option>
              <option value="tsp">teaspoon (tsp)</option>
              <option value="piece">piece</option>
              <option value="serving">serving</option>
            </select>
          </div>
        </div>

        {/* Macronutrients Section */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Macronutrients (per serving)
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Protein */}
            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Protein (g)
                </span>
              </label>
              <input
                type="number"
                id="protein"
                name="protein"
                value={formData.protein}
                onChange={handleChange}
                min="0"
                step="0.1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.protein ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.protein && (
                <p className="mt-1 text-sm text-red-600">{errors.protein}</p>
              )}
            </div>

            {/* Carbs */}
            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Carbs (g)
                </span>
              </label>
              <input
                type="number"
                id="carbs"
                name="carbs"
                value={formData.carbs}
                onChange={handleChange}
                min="0"
                step="0.1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.carbs ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.carbs && (
                <p className="mt-1 text-sm text-red-600">{errors.carbs}</p>
              )}
            </div>

            {/* Fat */}
            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-1">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Fat (g)
                </span>
              </label>
              <input
                type="number"
                id="fat"
                name="fat"
                value={formData.fat}
                onChange={handleChange}
                min="0"
                step="0.1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fat ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fat && (
                <p className="mt-1 text-sm text-red-600">{errors.fat}</p>
              )}
            </div>

            {/* Fiber */}
            <div>
              <label htmlFor="fiber" className="block text-sm font-medium text-gray-700 mb-1">
                Fiber (g)
              </label>
              <input
                type="number"
                id="fiber"
                name="fiber"
                value={formData.fiber}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Calories Section */}
        <div className="border-t border-gray-200 pt-4">
          <div>
            <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
              Calories (kcal) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="calories"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              min="0"
              step="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.calories ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.calories && (
              <p className="mt-1 text-sm text-red-600">{errors.calories}</p>
            )}
            {calculatedCalories > 0 && (
              <p className="mt-1 text-sm text-gray-600">
                💡 Calculated from macros: ~{calculatedCalories} kcal
                {Math.abs(formData.calories - calculatedCalories) > 10 && (
                  <span className="text-orange-600 ml-1">
                    (Difference: {Math.abs(formData.calories - calculatedCalories)} kcal)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Sugar (Optional) */}
          <div className="mt-4">
            <label htmlFor="sugar" className="block text-sm font-medium text-gray-700 mb-1">
              Sugar (g) - Optional
            </label>
            <input
              type="number"
              id="sugar"
              name="sugar"
              value={formData.sugar}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Macro Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800 font-medium mb-1">📊 Macro Info:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Protein & Carbs: 4 calories per gram</li>
            <li>• Fat: 9 calories per gram</li>
            <li>• Total from macros: {calculatedCalories} kcal</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            Add to Tracker
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualFoodEntry;
