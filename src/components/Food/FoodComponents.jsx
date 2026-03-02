import React from 'react';
import { Card, Badge, ProgressBar } from '../UI/Elements';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { formatNutrientValue } from '../../utils/helpers';

// Food Item component for displaying a food item in a list
export const FoodItem = ({ 
  food, 
  onClick, 
  onEdit = null, 
  onDelete = null,
  showActions = true,
  measurementSystem = 'metric',
  showNutrients = true,
  className = '',
  ...props
}) => {
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(food);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(food.id);
  };
  
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={() => onClick && onClick(food)}
      {...props}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{food.name}</h3>
          {food.brand && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{food.brand}</p>
          )}
          
          <div className="mt-1 flex items-center">
            <Badge variant="default" size="sm">
              {food.category || 'Uncategorized'}
            </Badge>
            
            <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
            
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatNutrientValue(food.servingSize, 'servingSize', measurementSystem)} {food.servingUnit}
            </span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-1">
            {onEdit && (
              <button
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={handleEdit}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            
            {onDelete && (
              <button
                className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                onClick={handleDelete}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
      
      {showNutrients && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Calories</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatNutrientValue(food.calories, 'calories')}
            </p>
          </div>
          
          <div>
            <p className="text-gray-500 dark:text-gray-400">Protein</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatNutrientValue(food.protein, 'protein')}
            </p>
          </div>
          
          <div>
            <p className="text-gray-500 dark:text-gray-400">Carbs</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatNutrientValue(food.carbs, 'carbs')}
            </p>
          </div>
          
          <div>
            <p className="text-gray-500 dark:text-gray-400">Fat</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatNutrientValue(food.fat, 'fat')}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

// Food Entry Item component for displaying a food log entry
export const FoodEntryItem = ({
  entry,
  onEdit = null,
  onDelete = null,
  measurementSystem = 'metric',
  className = '',
  ...props
}) => {
  const { food, servingSize, meal, date } = entry;
  
  // Calculate nutrient values based on serving size
  const servingMultiplier = servingSize / food.servingSize;
  
  const calories = Math.round(food.calories * servingMultiplier);
  const protein = Math.round((food.protein * servingMultiplier) * 10) / 10;
  const carbs = Math.round((food.carbs * servingMultiplier) * 10) / 10;
  const fat = Math.round((food.fat * servingMultiplier) * 10) / 10;
  
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(entry);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(entry.id);
  };
  
  return (
    <div 
      className={`p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}
      {...props}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{food.name}</h3>
          {food.brand && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{food.brand}</p>
          )}
          
          <div className="mt-1 flex items-center">
            <Badge variant="default" size="sm">
              {meal}
            </Badge>
            
            <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
            
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatNutrientValue(servingSize, 'servingSize', measurementSystem)} {food.servingUnit}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {onEdit && (
            <button
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={handleEdit}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
          
          {onDelete && (
            <button
              className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              onClick={handleDelete}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Calories</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatNutrientValue(calories, 'calories')}
          </p>
        </div>
        
        <div>
          <p className="text-gray-500 dark:text-gray-400">Protein</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatNutrientValue(protein, 'protein')}
          </p>
        </div>
        
        <div>
          <p className="text-gray-500 dark:text-gray-400">Carbs</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatNutrientValue(carbs, 'carbs')}
          </p>
        </div>
        
        <div>
          <p className="text-gray-500 dark:text-gray-400">Fat</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatNutrientValue(fat, 'fat')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Meal Group component for grouping food entries by meal
export const MealGroup = ({
  title,
  entries = [],
  onAddFood,
  onEditEntry,
  onDeleteEntry,
  measurementSystem = 'metric',
  className = '',
  ...props
}) => {
  // Calculate total nutrients for this meal
  const mealTotals = entries.reduce((totals, entry) => {
    const servingMultiplier = entry.servingSize / entry.food.servingSize;
    
    totals.calories += Math.round(entry.food.calories * servingMultiplier) || 0;
    totals.protein += Math.round((entry.food.protein * servingMultiplier) * 10) / 10 || 0;
    totals.carbs += Math.round((entry.food.carbs * servingMultiplier) * 10) / 10 || 0;
    totals.fat += Math.round((entry.food.fat * servingMultiplier) * 10) / 10 || 0;
    
    return totals;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  return (
    <Card 
      className={className}
      title={title}
      action={
        <button
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onAddFood}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      }
      {...props}
    >
      {entries.length > 0 ? (
        <div className="space-y-3">
          {/* Meal totals */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Calories</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatNutrientValue(mealTotals.calories, 'calories')}
                </p>
              </div>
              
              <div>
                <p className="text-gray-500 dark:text-gray-400">Protein</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatNutrientValue(mealTotals.protein, 'protein')}
                </p>
              </div>
              
              <div>
                <p className="text-gray-500 dark:text-gray-400">Carbs</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatNutrientValue(mealTotals.carbs, 'carbs')}
                </p>
              </div>
              
              <div>
                <p className="text-gray-500 dark:text-gray-400">Fat</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatNutrientValue(mealTotals.fat, 'fat')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Food entries */}
          <div className="space-y-2 mt-3">
            {entries.map(entry => (
              <FoodEntryItem
                key={entry.id}
                entry={entry}
                onEdit={onEditEntry}
                onDelete={onDeleteEntry}
                measurementSystem={measurementSystem}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-gray-500 dark:text-gray-400">No foods added to this meal yet.</p>
          <button
            className="mt-2 text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary"
            onClick={onAddFood}
          >
            Add food
          </button>
        </div>
      )}
    </Card>
  );
};

// Nutrition Summary component
export const NutritionSummary = ({ 
  totals, 
  goals,
  measurementSystem = 'metric',
  className = '',
  ...props
}) => {
  // Calculate percentages
  const caloriesPercentage = Math.min(Math.round((totals.calories / goals.calories) * 100), 100);
  const proteinPercentage = Math.min(Math.round((totals.protein / goals.protein) * 100), 100);
  const carbsPercentage = Math.min(Math.round((totals.carbs / goals.carbs) * 100), 100);
  const fatPercentage = Math.min(Math.round((totals.fat / goals.fat) * 100), 100);
  
  // Calculate remaining
  const remainingCalories = Math.max(goals.calories - totals.calories, 0);
  const remainingProtein = Math.max(goals.protein - totals.protein, 0);
  const remainingCarbs = Math.max(goals.carbs - totals.carbs, 0);
  const remainingFat = Math.max(goals.fat - totals.fat, 0);
  
  return (
    <Card 
      title="Daily Nutrition Summary"
      className={className}
      {...props}
    >
      <div className="space-y-4">
        {/* Calories */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Calories</span>
            <span>
              {formatNutrientValue(totals.calories, 'calories')} / {formatNutrientValue(goals.calories, 'calories')}
            </span>
          </div>
          <ProgressBar
            value={totals.calories}
            total={goals.calories}
            variant="primary"
            size="lg"
          />
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {remainingCalories > 0 ? 
              `${formatNutrientValue(remainingCalories, 'calories')} remaining` : 
              'Goal reached'
            }
          </div>
        </div>
        
        {/* Macronutrients grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Protein */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Protein</span>
              <span>
                {formatNutrientValue(totals.protein, 'protein')} / {formatNutrientValue(goals.protein, 'protein')}
              </span>
            </div>
            <ProgressBar
              value={totals.protein}
              total={goals.protein}
              variant="protein"
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {remainingProtein > 0 ? 
                `${formatNutrientValue(remainingProtein, 'protein')} remaining` : 
                'Goal reached'
              }
            </div>
          </div>
          
          {/* Carbs */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Carbs</span>
              <span>
                {formatNutrientValue(totals.carbs, 'carbs')} / {formatNutrientValue(goals.carbs, 'carbs')}
              </span>
            </div>
            <ProgressBar
              value={totals.carbs}
              total={goals.carbs}
              variant="carbs"
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {remainingCarbs > 0 ? 
                `${formatNutrientValue(remainingCarbs, 'carbs')} remaining` : 
                'Goal reached'
              }
            </div>
          </div>
          
          {/* Fat */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Fat</span>
              <span>
                {formatNutrientValue(totals.fat, 'fat')} / {formatNutrientValue(goals.fat, 'fat')}
              </span>
            </div>
            <ProgressBar
              value={totals.fat}
              total={goals.fat}
              variant="fat"
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {remainingFat > 0 ? 
                `${formatNutrientValue(remainingFat, 'fat')} remaining` : 
                'Goal reached'
              }
            </div>
          </div>
        </div>
        
        {/* Macronutrient distribution */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Macronutrient Distribution
          </h4>
          
          <div className="flex h-4 rounded-full overflow-hidden">
            <div 
              className="bg-macros-protein"
              style={{ width: `${totals.macroDistribution?.protein || 0}%` }}
            ></div>
            <div 
              className="bg-macros-carbs"
              style={{ width: `${totals.macroDistribution?.carbs || 0}%` }}
            ></div>
            <div 
              className="bg-macros-fat"
              style={{ width: `${totals.macroDistribution?.fat || 0}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-1 text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-macros-protein mr-1"></div>
              <span>{totals.macroDistribution?.protein || 0}% Protein</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-macros-carbs mr-1"></div>
              <span>{totals.macroDistribution?.carbs || 0}% Carbs</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-macros-fat mr-1"></div>
              <span>{totals.macroDistribution?.fat || 0}% Fat</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default {
  FoodItem,
  FoodEntryItem,
  MealGroup,
  NutritionSummary
};
