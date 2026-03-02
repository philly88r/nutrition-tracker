import { useState, useEffect, useCallback } from 'react';
import { searchFoods, getFoodDetails, convertUsdaFoodToAppFormat } from '../services/usdaApiService';

/**
 * Custom hook to manage food data from USDA API
 * @param {Object} options - Configuration options
 * @param {boolean} options.loadSavedFoods - Whether to load user saved foods from storage
 * @returns {Object} - Food data and related functions
 */
const useFoodData = (options = { loadSavedFoods: true }) => {
  const [foods, setFoods] = useState([]);
  const [savedFoods, setSavedFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize foods data
  useEffect(() => {
    const initializeFoods = async () => {
      try {
        let allFoods = [];
        
        // Load saved foods from local storage if specified
        if (options.loadSavedFoods) {
          try {
            const savedFoodsJson = localStorage.getItem('savedFoods');
            if (savedFoodsJson) {
              const parsedSavedFoods = JSON.parse(savedFoodsJson);
              setSavedFoods(parsedSavedFoods);
              allFoods = [...parsedSavedFoods];
            }
          } catch (err) {
            console.error('Error loading saved foods:', err);
          }
        }
        
        setFoods(allFoods);
      } catch (err) {
        setError('Error initializing food data');
        console.error('Error initializing food data:', err);
      }
    };
    
    initializeFoods();
  }, [options.loadSavedFoods]);

  /**
   * Search for foods using the USDA API
   * @param {string} query - Search term
   * @returns {Promise} - Promise resolving to search results
   */
  const searchUsdaFoods = useCallback(async (query) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await searchFoods(query);
      return results.foods || [];
    } catch (err) {
      setError(`Error searching for foods: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get food details from USDA API by FDC ID
   * @param {string} fdcId - The FDC ID of the food
   * @returns {Promise} - Promise resolving to food details in app format
   */
  const getUsdaFoodDetails = useCallback(async (fdcId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const foodDetails = await getFoodDetails(fdcId);
      return convertUsdaFoodToAppFormat(foodDetails);
    } catch (err) {
      setError(`Error getting food details: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add a food item to the foods list and save to local storage
   * @param {Object} food - Food item to add
   */
  const addFood = useCallback((food) => {
    // Generate a unique ID if not present
    const newFood = food.id ? food : { ...food, id: `custom_${Date.now()}` };
    
    // Add to saved foods
    const updatedSavedFoods = [...savedFoods, newFood];
    setSavedFoods(updatedSavedFoods);
    
    // Save to local storage
    try {
      localStorage.setItem('savedFoods', JSON.stringify(updatedSavedFoods));
    } catch (err) {
      console.error('Error saving food to local storage:', err);
    }
    
    // Update foods list
    setFoods(currentFoods => [...currentFoods, newFood]);
  }, [savedFoods]);

  /**
   * Remove a food item from saved foods
   * @param {string} foodId - ID of the food to remove
   */
  const removeFood = useCallback((foodId) => {
    // Remove from saved foods
    const updatedSavedFoods = savedFoods.filter(food => food.id !== foodId);
    setSavedFoods(updatedSavedFoods);
    
    // Save to local storage
    try {
      localStorage.setItem('savedFoods', JSON.stringify(updatedSavedFoods));
    } catch (err) {
      console.error('Error saving updated foods to local storage:', err);
    }
    
    // Update foods list
    setFoods(currentFoods => currentFoods.filter(food => food.id !== foodId));
  }, [savedFoods]);

  return {
    foods,
    savedFoods,
    isLoading,
    error,
    searchUsdaFoods,
    getUsdaFoodDetails,
    addFood,
    removeFood
  };
};

export default useFoodData;
