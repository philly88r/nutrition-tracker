import React from 'react';

/**
 * MacroTracker Component
 * Displays macronutrient breakdown with visual progress bars and percentages
 * 
 * Key Macro Information:
 * - Protein: 4 calories per gram (10-35% of daily intake)
 * - Carbs: 4 calories per gram (45-65% of daily intake)
 * - Fat: 9 calories per gram (20-35% of daily intake)
 */
const MacroTracker = ({ totals, goals, showPercentages = true, compact = false }) => {
  // Calculate percentages of goals
  const getPercentage = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  // Calculate calorie contribution from each macro
  const getCaloriesFromMacro = (grams, caloriesPerGram) => {
    return grams * caloriesPerGram;
  };

  // Calculate percentage of total calories from each macro
  const getMacroCaloriePercentage = (grams, caloriesPerGram, totalCalories) => {
    if (!totalCalories || totalCalories === 0) return 0;
    const macroCalories = getCaloriesFromMacro(grams, caloriesPerGram);
    return ((macroCalories / totalCalories) * 100).toFixed(1);
  };

  const proteinCalories = getCaloriesFromMacro(totals.protein, 4);
  const carbsCalories = getCaloriesFromMacro(totals.carbs, 4);
  const fatCalories = getCaloriesFromMacro(totals.fat, 9);
  const totalMacroCalories = proteinCalories + carbsCalories + fatCalories;

  const macros = [
    {
      name: 'Protein',
      current: totals.protein,
      goal: goals.protein,
      unit: 'g',
      color: 'bg-red-500',
      lightColor: 'bg-red-100',
      textColor: 'text-red-700',
      caloriesPerGram: 4,
      recommendedRange: '10-35%'
    },
    {
      name: 'Carbs',
      current: totals.carbs,
      goal: goals.carbs,
      unit: 'g',
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      caloriesPerGram: 4,
      recommendedRange: '45-65%'
    },
    {
      name: 'Fat',
      current: totals.fat,
      goal: goals.fat,
      unit: 'g',
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-700',
      caloriesPerGram: 9,
      recommendedRange: '20-35%'
    }
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {macros.map((macro) => {
          const percentage = getPercentage(macro.current, macro.goal);
          const caloriePercentage = getMacroCaloriePercentage(
            macro.current,
            macro.caloriesPerGram,
            totalMacroCalories
          );

          return (
            <div key={macro.name} className={`p-2 rounded-md ${macro.lightColor}`}>
              <div className="text-xs text-gray-600">{macro.name}</div>
              <div className={`text-sm font-bold ${macro.textColor}`}>
                {macro.current.toFixed(1)}{macro.unit}
              </div>
              {showPercentages && (
                <div className="text-xs text-gray-500">
                  {caloriePercentage}% of cals
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Macro Pie Chart Visual */}
      {showPercentages && totalMacroCalories > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Calorie Distribution</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-8 rounded-full overflow-hidden flex">
              {macros.map((macro) => {
                const caloriePercentage = getMacroCaloriePercentage(
                  macro.current,
                  macro.caloriesPerGram,
                  totalMacroCalories
                );
                return (
                  <div
                    key={macro.name}
                    className={macro.color}
                    style={{ width: `${caloriePercentage}%` }}
                    title={`${macro.name}: ${caloriePercentage}%`}
                  />
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {macros.map((macro) => {
              const caloriePercentage = getMacroCaloriePercentage(
                macro.current,
                macro.caloriesPerGram,
                totalMacroCalories
              );
              return (
                <div key={macro.name} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${macro.color}`} />
                  <span className="text-gray-600">
                    {macro.name}: {caloriePercentage}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Recommended ranges: Protein {macros[0].recommendedRange}, Carbs {macros[1].recommendedRange}, Fat {macros[2].recommendedRange}
          </div>
        </div>
      )}

      {/* Individual Macro Progress Bars */}
      {macros.map((macro) => {
        const percentage = getPercentage(macro.current, macro.goal);
        const caloriePercentage = getMacroCaloriePercentage(
          macro.current,
          macro.caloriesPerGram,
          totalMacroCalories
        );
        const remaining = Math.max(0, macro.goal - macro.current);

        return (
          <div key={macro.name} className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">{macro.name}</span>
                {showPercentages && totalMacroCalories > 0 && (
                  <span className="text-xs text-gray-500">
                    ({caloriePercentage}% of calories)
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <span className={`font-semibold ${macro.textColor}`}>
                  {macro.current.toFixed(1)}
                </span>
                <span className="text-gray-400"> / {macro.goal}</span>
                <span className="text-gray-500">{macro.unit}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative">
              <div className={`h-3 rounded-full ${macro.lightColor}`}>
                <div
                  className={`h-3 rounded-full ${macro.color} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {percentage.toFixed(0)}% of daily goal
              </span>
              {remaining > 0 && (
                <span>
                  {remaining.toFixed(1)}{macro.unit} remaining
                </span>
              )}
              {macro.current > macro.goal && (
                <span className="text-orange-600 font-medium">
                  +{(macro.current - macro.goal).toFixed(1)}{macro.unit} over goal
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Calories from Macros */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Calories from Macros</span>
          <span className="font-semibold text-gray-800">
            {totalMacroCalories.toFixed(0)} kcal
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Protein: {proteinCalories.toFixed(0)} • 
          Carbs: {carbsCalories.toFixed(0)} • 
          Fat: {fatCalories.toFixed(0)}
        </div>
      </div>
    </div>
  );
};

export default MacroTracker;
