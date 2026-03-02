import React, { useEffect } from 'react';
import { useNutritionContext } from '../hooks/useNutritionContext';

/**
 * Component that ensures data persistence by saving to localStorage directly
 * This is a fallback mechanism in case localforage isn't working properly
 */
const DataPersister = () => {
  const { state } = useNutritionContext();
  
  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      console.log('DataPersister: Saving data to localStorage');
      localStorage.setItem('nutrition_data_direct', JSON.stringify({
        foodEntries: state.foodEntries,
        dailyGoals: state.dailyGoals,
        settings: state.settings,
        currentDate: state.currentDate
      }));
    } catch (error) {
      console.error('DataPersister: Error saving to localStorage', error);
    }
  }, [state.foodEntries, state.dailyGoals, state.settings, state.currentDate]);
  
  // This component doesn't render anything
  return null;
};

export default DataPersister;
