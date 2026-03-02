import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    dailyGoals: {
      calories: 2000,
      protein: 50,
      carbs: 275,
      fat: 78
    },
    units: 'metric', // 'metric' or 'imperial'
    theme: 'light', // 'light' or 'dark'
    notifications: true
  });

  useEffect(() => {
    // Load settings from localStorage
    try {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  }, []);

  const handleSettingsChange = (category, field, value) => {
    const newSettings = { ...settings };
    
    if (category) {
      newSettings[category][field] = value;
    } else {
      newSettings[field] = value;
    }
    
    setSettings(newSettings);
    
    // Save to localStorage
    try {
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* Daily Goals */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Daily Nutrition Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
              Calories (kcal)
            </label>
            <input
              type="number"
              id="calories"
              value={settings.dailyGoals.calories}
              onChange={(e) => handleSettingsChange('dailyGoals', 'calories', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">
              Protein (g)
            </label>
            <input
              type="number"
              id="protein"
              value={settings.dailyGoals.protein}
              onChange={(e) => handleSettingsChange('dailyGoals', 'protein', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-1">
              Carbohydrates (g)
            </label>
            <input
              type="number"
              id="carbs"
              value={settings.dailyGoals.carbs}
              onChange={(e) => handleSettingsChange('dailyGoals', 'carbs', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-1">
              Fat (g)
            </label>
            <input
              type="number"
              id="fat"
              value={settings.dailyGoals.fat}
              onChange={(e) => handleSettingsChange('dailyGoals', 'fat', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Preferences */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="units" className="block text-sm font-medium text-gray-700 mb-1">
              Units
            </label>
            <select
              id="units"
              value={settings.units}
              onChange={(e) => handleSettingsChange(null, 'units', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="metric">Metric (g, ml)</option>
              <option value="imperial">Imperial (oz, fl oz)</option>
            </select>
          </div>
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => handleSettingsChange(null, 'theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingsChange(null, 'notifications', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Enable notifications</span>
          </label>
        </div>
      </div>
      
      {/* Data Management */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
        <p className="text-gray-600 mb-4">
          Your nutrition data is stored locally on your device. You can export or clear your data using the options below.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              const data = {
                foodLog: JSON.parse(localStorage.getItem('foodLog') || '[]'),
                savedFoods: JSON.parse(localStorage.getItem('savedFoods') || '[]'),
                settings: settings
              };
              
              const dataStr = JSON.stringify(data);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              
              const exportFileDefaultName = 'nutrition-tracker-data.json';
              
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Export Data
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
                localStorage.removeItem('foodLog');
                localStorage.removeItem('savedFoods');
                alert('Data cleared successfully');
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Clear Data
          </button>
        </div>
      </div>
      
      {/* About */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">About</h2>
        <p className="text-gray-600 mb-2">
          Nutrition Tracker v1.0.0
        </p>
        <p className="text-gray-600">
          This application uses the USDA FoodData Central API for accurate nutritional information.
        </p>
      </div>
    </div>
  );
};

export default Settings;
