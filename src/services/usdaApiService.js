/**
 * USDA FoodData Central API Service
 * 
 * This service provides methods to interact with the USDA FoodData Central API
 * Documentation: https://fdc.nal.usda.gov/api-guide.html
 */

// USDA API key
const API_KEY = 'ymWcU3UwOAebazqGt40gaWLaqbiwgimbGAlLWZEs';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

/**
 * Search for foods in the USDA database
 * @param {string} query - Search term
 * @param {number} pageSize - Number of results to return (default: 20)
 * @param {number} pageNumber - Page number (default: 1)
 * @param {string} dataType - Type of data to return (Survey, Foundation, SR Legacy, Branded)
 * @returns {Promise} - Promise resolving to search results
 */
export const searchFoods = async (query, pageSize = 20, pageNumber = 1, dataType = '') => {
  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      query,
      pageSize,
      pageNumber,
      ...(dataType && { dataType })
    });
    
    const response = await fetch(`${BASE_URL}/foods/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching foods:', error);
    throw error;
  }
};

/**
 * Get detailed food information by FDC ID
 * @param {string} fdcId - The FDC ID of the food
 * @param {Array} nutrients - Optional array of nutrient IDs to include
 * @returns {Promise} - Promise resolving to food details
 */
export const getFoodDetails = async (fdcId, nutrients = []) => {
  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      ...(nutrients.length > 0 && { nutrients: nutrients.join(',') })
    });
    
    const response = await fetch(`${BASE_URL}/food/${fdcId}?${params}`);
    
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting food details:', error);
    throw error;
  }
};

/**
 * Get multiple foods by their FDC IDs
 * @param {Array} fdcIds - Array of FDC IDs
 * @param {Array} nutrients - Optional array of nutrient IDs to include
 * @returns {Promise} - Promise resolving to array of food details
 */
export const getFoodsByIds = async (fdcIds, nutrients = []) => {
  try {
    const params = new URLSearchParams({
      api_key: API_KEY
    });
    
    const response = await fetch(`${BASE_URL}/foods?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fdcIds,
        format: 'full',
        nutrients: nutrients
      })
    });
    
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting foods by IDs:', error);
    throw error;
  }
};

/**
 * Get list of available nutrient IDs
 * @returns {Promise} - Promise resolving to list of nutrients
 */
export const getNutrients = async () => {
  try {
    const params = new URLSearchParams({
      api_key: API_KEY
    });
    
    const response = await fetch(`${BASE_URL}/nutrients?${params}`);
    
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting nutrients:', error);
    throw error;
  }
};

/**
 * Convert USDA food data to app format
 * @param {Object} usdaFood - Food data from USDA API
 * @returns {Object} - Food data in app format
 */
export const convertUsdaFoodToAppFormat = (usdaFood) => {
  // Extract basic food information
  const food = {
    id: `usda_${usdaFood.fdcId}`,
    name: usdaFood.description,
    brand: usdaFood.brandName || "",
    category: getCategoryFromUSDAFood(usdaFood),
    servingSize: 100, // Default to 100g
    servingUnit: "g",
    // Initialize nutrients with zeros
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

  // Map USDA nutrient IDs to our app's properties
  const nutrientMap = {
    1008: "calories", // Energy (kcal)
    1003: "protein", // Protein
    1005: "carbs",   // Carbohydrates
    1004: "fat",     // Total lipid (fat)
    1079: "fiber",   // Fiber
    2000: "sugar",   // Total sugars
    1093: "sodium",  // Sodium
    1253: "cholesterol", // Cholesterol
    1092: "potassium",   // Potassium
    1106: "vitaminA",    // Vitamin A
    1162: "vitaminC",    // Vitamin C
    1087: "calcium",     // Calcium
    1089: "iron"         // Iron
  };

  // Extract nutrients if available
  if (usdaFood.foodNutrients) {
    usdaFood.foodNutrients.forEach(nutrient => {
      const nutrientId = nutrient.nutrient?.id || nutrient.nutrientId;
      const appProperty = nutrientMap[nutrientId];
      
      if (appProperty && nutrient.amount !== undefined && nutrient.amount !== null) {
        // Round to 1 decimal place for better display
        food[appProperty] = Math.round(nutrient.amount * 10) / 10;
      }
    });
  }

  // Log the extracted food data for debugging
  console.log('Converted USDA food:', {
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber
  });

  return food;
};

/**
 * Determine food category based on USDA food data
 * @param {Object} usdaFood - Food data from USDA API
 * @returns {string} - Category name
 */
function getCategoryFromUSDAFood(usdaFood) {
  // Try to map USDA food categories to our app categories
  const foodCategory = usdaFood.foodCategory?.description || '';
  const lowerCategory = foodCategory.toLowerCase();
  
  if (lowerCategory.includes('meat') || lowerCategory.includes('poultry')) {
    return 'Meat & Poultry';
  } else if (lowerCategory.includes('fish') || lowerCategory.includes('seafood')) {
    return 'Fish & Seafood';
  } else if (lowerCategory.includes('grain') || lowerCategory.includes('cereal') || lowerCategory.includes('pasta')) {
    return 'Grains';
  } else if (lowerCategory.includes('vegetable')) {
    return 'Vegetables';
  } else if (lowerCategory.includes('fruit')) {
    return 'Fruits';
  } else if (lowerCategory.includes('dairy') || lowerCategory.includes('milk') || lowerCategory.includes('cheese')) {
    return 'Dairy';
  } else if (lowerCategory.includes('egg')) {
    return 'Eggs';
  } else if (lowerCategory.includes('nut') || lowerCategory.includes('seed')) {
    return 'Nuts & Seeds';
  } else if (lowerCategory.includes('bean') || lowerCategory.includes('legume') || lowerCategory.includes('pea')) {
    return 'Legumes';
  } else if (lowerCategory.includes('oil') || lowerCategory.includes('fat')) {
    return 'Oils & Fats';
  } else {
    return 'Other';
  }
}
