import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MacroTracker from '../components/MacroTracker';
import { useNutritionContext } from '../hooks/useNutritionContext';
import { getCentralDate } from '../utils/dateUtils';

const FoodDiary = () => {
  const { state } = useNutritionContext();
  const [foodLog, setFoodLog] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getCentralDate());
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    // Load food log from localStorage
    const loadFoodLog = () => {
      try {
        const storedLog = localStorage.getItem('foodLog');
        
        if (storedLog) {
          const parsedLog = JSON.parse(storedLog);
          const filteredLog = parsedLog.filter(entry => entry.date === selectedDate);
          
          setFoodLog(filteredLog);
          
          // Calculate totals
          const totals = filteredLog.reduce((acc, entry) => {
            acc.calories += entry.calories || 0;
            acc.protein += entry.protein || 0;
            acc.carbs += entry.carbs || 0;
            acc.fat += entry.fat || 0;
            return acc;
          }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
          
          setDailyTotals(totals);
        }
      } catch (err) {
        console.error('Error loading food log:', err);
      }
    };
    
    loadFoodLog();
  }, [selectedDate]);

  // Group food entries by meal type
  const mealGroups = foodLog.reduce((groups, entry) => {
    const group = groups[entry.mealType] || [];
    group.push(entry);
    groups[entry.mealType] = group;
    return groups;
  }, {});

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Handle removing a food entry
  const handleRemoveEntry = (entryId) => {
    try {
      const storedLog = localStorage.getItem('foodLog');
      
      if (storedLog) {
        const parsedLog = JSON.parse(storedLog);
        const updatedLog = parsedLog.filter(entry => entry.id !== entryId);
        
        localStorage.setItem('foodLog', JSON.stringify(updatedLog));
        
        // Update state
        const filteredLog = updatedLog.filter(entry => entry.date === selectedDate);
        setFoodLog(filteredLog);
        
        // Recalculate totals
        const totals = filteredLog.reduce((acc, entry) => {
          acc.calories += entry.calories || 0;
          acc.protein += entry.protein || 0;
          acc.carbs += entry.carbs || 0;
          acc.fat += entry.fat || 0;
          return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        setDailyTotals(totals);
      }
    } catch (err) {
      console.error('Error removing food entry:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Food Diary</h1>
        <Link 
          to="/add-food" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Food
        </Link>
      </div>
      
      {/* Date selector */}
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Select Date
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Daily totals */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Daily Nutrition Summary</h2>
        
        {/* Calories Display */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Calories</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-700">{dailyTotals.calories}</span>
              <span className="text-gray-500 ml-1">/ {state.dailyGoals.calories}</span>
              <span className="text-sm text-gray-500 ml-1">kcal</span>
            </div>
          </div>
          <div className="mt-3 h-3 bg-blue-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.min((dailyTotals.calories / state.dailyGoals.calories) * 100, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-600 text-right">
            {((dailyTotals.calories / state.dailyGoals.calories) * 100).toFixed(0)}% of daily goal
          </div>
        </div>

        {/* Macro Tracker */}
        <MacroTracker 
          totals={dailyTotals} 
          goals={state.dailyGoals}
          showPercentages={true}
        />
      </div>
      
      {/* Meal sections */}
      {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
        <div key={mealType} className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold capitalize">{mealType}</h2>
          </div>
          
          {mealGroups[mealType] && mealGroups[mealType].length > 0 ? (
            <div className="divide-y divide-gray-200">
              {mealGroups[mealType].map(entry => {
                // Calculate macro percentages for this entry
                const entryProteinCal = (entry.protein || 0) * 4;
                const entryCarbsCal = (entry.carbs || 0) * 4;
                const entryFatCal = (entry.fat || 0) * 9;
                const entryTotalMacroCal = entryProteinCal + entryCarbsCal + entryFatCal;
                
                return (
                  <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{entry.name}</div>
                        {entry.brand && (
                          <div className="text-sm text-gray-500">{entry.brand}</div>
                        )}
                        <div className="text-sm text-gray-500">
                          {entry.servings} × {entry.servingSize}{entry.servingUnit}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="text-right">
                          <div className="font-semibold text-blue-700">{entry.calories} kcal</div>
                          <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              <span>P: {(entry.protein || 0).toFixed(1)}g</span>
                              {entryTotalMacroCal > 0 && (
                                <span className="text-gray-400">
                                  ({((entryProteinCal / entryTotalMacroCal) * 100).toFixed(0)}%)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                              <span>C: {(entry.carbs || 0).toFixed(1)}g</span>
                              {entryTotalMacroCal > 0 && (
                                <span className="text-gray-400">
                                  ({((entryCarbsCal / entryTotalMacroCal) * 100).toFixed(0)}%)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <span>F: {(entry.fat || 0).toFixed(1)}g</span>
                              {entryTotalMacroCal > 0 && (
                                <span className="text-gray-400">
                                  ({((entryFatCal / entryTotalMacroCal) * 100).toFixed(0)}%)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveEntry(entry.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remove entry"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Macro visual bar for each entry */}
                    {entryTotalMacroCal > 0 && (
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-200 mt-2">
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${(entryProteinCal / entryTotalMacroCal) * 100}%` }}
                          title={`Protein: ${((entryProteinCal / entryTotalMacroCal) * 100).toFixed(0)}%`}
                        />
                        <div 
                          className="bg-yellow-500" 
                          style={{ width: `${(entryCarbsCal / entryTotalMacroCal) * 100}%` }}
                          title={`Carbs: ${((entryCarbsCal / entryTotalMacroCal) * 100).toFixed(0)}%`}
                        />
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${(entryFatCal / entryTotalMacroCal) * 100}%` }}
                          title={`Fat: ${((entryFatCal / entryTotalMacroCal) * 100).toFixed(0)}%`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No {mealType} entries for this day</p>
              <p className="mt-2">
                <Link 
                  to="/add-food" 
                  className="text-blue-600 hover:underline"
                >
                  Add food
                </Link>
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FoodDiary;
