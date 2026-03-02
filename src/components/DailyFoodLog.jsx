import React from 'react';
import { Link } from 'react-router-dom';
import MacroTracker from './MacroTracker';
import { useNutritionContext } from '../hooks/useNutritionContext';

const DailyFoodLog = ({ entries, date, onRemoveEntry }) => {
  const { state } = useNutritionContext();
  const userName = localStorage.getItem('userName') || 'Your';
  
  // Calculate totals
  const totals = entries.reduce((acc, entry) => {
    acc.calories += entry.calories || 0;
    acc.protein += entry.protein || 0;
    acc.carbs += entry.carbs || 0;
    acc.fat += entry.fat || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Group entries by meal type
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const entriesByMeal = mealTypes.map(mealType => ({
    type: mealType,
    entries: entries.filter(entry => entry.mealType === mealType)
  }));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h2 className="text-xl font-bold">{userName}'s Nutrition Tracker</h2>
        <p className="text-sm text-blue-100 mt-1">
          {new Date(date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Nutrition Summary */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Nutrition Summary</h3>
        
        {/* Calories Display */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Calories</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-700">{totals.calories.toFixed(0)}</span>
              <span className="text-gray-500 ml-1">/ {state.dailyGoals.calories}</span>
              <span className="text-sm text-gray-500 ml-1">kcal</span>
            </div>
          </div>
          <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.min((totals.calories / state.dailyGoals.calories) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Macro Tracker */}
        <MacroTracker 
          totals={totals} 
          goals={state.dailyGoals}
          showPercentages={true}
        />
      </div>

      {/* Food entries by meal */}
      {entries.length > 0 ? (
        <div>
          {entriesByMeal.map(meal => (
            meal.entries.length > 0 && (
              <div key={meal.type} className="border-b border-gray-200 last:border-b-0">
                <div className="px-4 py-2 bg-gray-50">
                  <h3 className="font-medium capitalize">{meal.type}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {meal.entries.map(entry => {
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
                              onClick={() => onRemoveEntry(entry.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              aria-label="Remove food entry"
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
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <p>No food entries for this day</p>
          <p className="mt-2">
            <Link 
              to="/add-food" 
              className="text-blue-600 hover:underline"
            >
              Add your first food item
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyFoodLog;
