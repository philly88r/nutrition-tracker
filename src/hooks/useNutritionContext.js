import { useContext } from 'react';
import NutritionContext from '../context/NutritionContext';

export const useNutritionContext = () => {
  const context = useContext(NutritionContext);
  
  if (context === undefined) {
    throw new Error('useNutritionContext must be used within a NutritionProvider');
  }
  
  return context;
};
