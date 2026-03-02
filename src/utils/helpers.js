import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, isValid } from 'date-fns';

// Generate a unique ID with optional prefix
export const generateId = (prefix = '') => {
  return `${prefix}${uuidv4()}`;
};

// Format date from ISO string
export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    if (!isValid(date)) return '';
    
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Format number with specified decimal places
export const formatNumber = (num, decimalPlaces = 0) => {
  if (num === undefined || num === null) return '';
  
  return Number(num).toFixed(decimalPlaces);
};

// Calculate total nutrients for a day
export const calculateDailyNutrients = (foodEntries, date) => {
  // Filter entries for the specified date
  const entriesForDay = foodEntries.filter(entry => entry.date === date);
  
  // Initialize totals
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    potassium: 0,
    vitaminA: 0,
    vitaminC: 0,
    calcium: 0,
    iron: 0
  };
  
  // Sum up all nutrients
  entriesForDay.forEach(entry => {
    // Scale nutrients based on serving size
    const servingMultiplier = entry.servingSize / entry.food.servingSize;
    
    totals.calories += (entry.food.calories * servingMultiplier) || 0;
    totals.protein += (entry.food.protein * servingMultiplier) || 0;
    totals.carbs += (entry.food.carbs * servingMultiplier) || 0;
    totals.fat += (entry.food.fat * servingMultiplier) || 0;
    totals.fiber += (entry.food.fiber * servingMultiplier) || 0;
    totals.sugar += (entry.food.sugar * servingMultiplier) || 0;
    totals.sodium += (entry.food.sodium * servingMultiplier) || 0;
    totals.cholesterol += (entry.food.cholesterol * servingMultiplier) || 0;
    totals.potassium += (entry.food.potassium * servingMultiplier) || 0;
    totals.vitaminA += (entry.food.vitaminA * servingMultiplier) || 0;
    totals.vitaminC += (entry.food.vitaminC * servingMultiplier) || 0;
    totals.calcium += (entry.food.calcium * servingMultiplier) || 0;
    totals.iron += (entry.food.iron * servingMultiplier) || 0;
  });
  
  // Round values to appropriate decimal places
  Object.keys(totals).forEach(key => {
    if (key === 'calories') {
      totals[key] = Math.round(totals[key]);
    } else {
      totals[key] = Math.round(totals[key] * 10) / 10;
    }
  });
  
  return totals;
};

// Calculate percentage of daily goal
export const calculatePercentage = (value, goal) => {
  if (!goal) return 0;
  
  const percentage = (value / goal) * 100;
  return Math.min(Math.round(percentage), 100);
};

// Calculate remaining macro for the day
export const calculateRemaining = (consumed, goal) => {
  if (!goal) return 0;
  
  return Math.max(goal - consumed, 0);
};

// Calculate macronutrient distribution
export const calculateMacroDistribution = (totals) => {
  const { protein, carbs, fat } = totals;
  
  // Calculate calories from each macro
  const proteinCalories = protein * 4; // 4 calories per gram of protein
  const carbsCalories = carbs * 4; // 4 calories per gram of carbs
  const fatCalories = fat * 9; // 9 calories per gram of fat
  
  const totalMacroCalories = proteinCalories + carbsCalories + fatCalories;
  
  if (totalMacroCalories === 0) {
    return {
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }
  
  return {
    protein: Math.round((proteinCalories / totalMacroCalories) * 100),
    carbs: Math.round((carbsCalories / totalMacroCalories) * 100),
    fat: Math.round((fatCalories / totalMacroCalories) * 100)
  };
};

// Format nutrient value with units
export const formatNutrientValue = (value, nutrient, measurementSystem = 'metric') => {
  if (value === undefined || value === null) return '';
  
  // Define units based on nutrient type
  const units = {
    calories: 'kcal',
    protein: 'g',
    carbs: 'g',
    fat: 'g',
    fiber: 'g',
    sugar: 'g',
    sodium: measurementSystem === 'metric' ? 'mg' : 'mg',
    cholesterol: measurementSystem === 'metric' ? 'mg' : 'mg',
    potassium: measurementSystem === 'metric' ? 'mg' : 'mg',
    vitaminA: measurementSystem === 'metric' ? 'µg' : 'IU',
    vitaminC: 'mg',
    calcium: 'mg',
    iron: 'mg',
    servingSize: measurementSystem === 'metric' ? 'g' : 'oz'
  };
  
  // Round appropriately based on nutrient
  let formattedValue;
  if (nutrient === 'calories') {
    formattedValue = Math.round(value);
  } else if (['protein', 'carbs', 'fat', 'fiber', 'sugar'].includes(nutrient)) {
    formattedValue = Math.round(value * 10) / 10;
  } else {
    formattedValue = Math.round(value);
  }
  
  return `${formattedValue} ${units[nutrient] || ''}`;
};

// Group food entries by meal
export const groupByMeal = (foodEntries, date, mealNames) => {
  // Filter entries for the specified date
  const entriesForDay = foodEntries.filter(entry => entry.date === date);
  
  // Create object with meal names as keys
  const meals = mealNames.reduce((acc, meal) => {
    acc[meal] = [];
    return acc;
  }, {});
  
  // Group entries by meal
  entriesForDay.forEach(entry => {
    if (meals[entry.meal]) {
      meals[entry.meal].push(entry);
    } else {
      // If meal doesn't exist, add to "Other"
      if (!meals['Other']) {
        meals['Other'] = [];
      }
      meals['Other'].push(entry);
    }
  });
  
  return meals;
};

// Convert measurements if needed
export const convertMeasurement = (value, from, to, unit) => {
  if (from === to) return value;
  
  // Conversion factors
  const conversionFactors = {
    // Weight
    g_to_oz: 0.035274,
    oz_to_g: 28.3495,
    // Volume
    ml_to_flOz: 0.033814,
    flOz_to_ml: 29.5735,
  };
  
  if (unit === 'weight') {
    if (from === 'metric' && to === 'imperial') {
      return value * conversionFactors.g_to_oz;
    } else if (from === 'imperial' && to === 'metric') {
      return value * conversionFactors.oz_to_g;
    }
  } else if (unit === 'volume') {
    if (from === 'metric' && to === 'imperial') {
      return value * conversionFactors.ml_to_flOz;
    } else if (from === 'imperial' && to === 'metric') {
      return value * conversionFactors.flOz_to_ml;
    }
  }
  
  return value;
};

// Search and filter foods
export const searchFoods = (foods, query) => {
  if (!query) return foods;
  
  const lowerCaseQuery = query.toLowerCase();
  
  return foods.filter(food => 
    food.name.toLowerCase().includes(lowerCaseQuery) ||
    (food.brand && food.brand.toLowerCase().includes(lowerCaseQuery))
  );
};
