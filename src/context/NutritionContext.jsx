import { createContext, useReducer, useEffect, useRef, useContext, useCallback } from 'react';
import nutritionReducer from './nutritionReducer';
import { loadUserData, saveUserData } from '../services/storageService';
import { foodEntriesAPI, groceryAPI } from '../services/apiService';
import AuthContext from './AuthContext';

// Initial state
const initialState = {
  user: null,
  dailyGoals: {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    fiber: 30
  },
  dailyTotals: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  },
  foodEntries: [],
  customFoods: [],
  settings: {
    theme: 'light',
    measurementSystem: 'metric',
    language: 'en',
    notifications: true,
    mealNames: ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
  },
  loading: false,
  error: null,
  currentDate: new Date().toISOString().split('T')[0]
};

// Create context
const NutritionContext = createContext(initialState);

// Provider component
export const NutritionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(nutritionReducer, initialState);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  const { isAuthenticated } = useContext(AuthContext);
  
  // Calculate daily totals whenever food entries or current date changes
  useEffect(() => {
    try {
      const today = state.currentDate;
      
      // Ensure we have an array to work with
      if (!Array.isArray(state.foodEntries)) {
        return;
      }
      
      // Filter entries for today
      const todayEntries = state.foodEntries.filter(entry => {
        if (!entry) return false;
        return entry.date === today;
      });
      
      // Calculate totals
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      
      todayEntries.forEach(entry => {
        if (!entry) return;
        
        totals.calories += parseFloat(entry.calories || 0);
        totals.protein += parseFloat(entry.protein || 0);
        totals.carbs += parseFloat(entry.carbs || 0);
        totals.fat += parseFloat(entry.fat || 0);
        totals.fiber += parseFloat(entry.fiber || 0);
      });
      
      // Round to 1 decimal place for macros, whole number for calories
      totals.calories = Math.round(totals.calories);
      totals.protein = Math.round(totals.protein * 10) / 10;
      totals.carbs = Math.round(totals.carbs * 10) / 10;
      totals.fat = Math.round(totals.fat * 10) / 10;
      totals.fiber = Math.round(totals.fiber * 10) / 10;
      
      dispatch({ type: 'UPDATE_DAILY_TOTALS', payload: totals });
    } catch (error) {
      console.error('Error calculating daily totals:', error);
    }
  }, [state.foodEntries, state.currentDate]);

  // Action creator to load user data
  async function loadData() {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load user data from storage service
      const data = await loadUserData();
      
      // Also check localStorage for legacy food entries
      const storedLog = localStorage.getItem('foodLog');
      let foodEntries = data.foodEntries || [];
      
      // If we have entries in localStorage, merge them with what we got from storage service
      if (storedLog) {
        const localEntries = JSON.parse(storedLog);
        if (Array.isArray(localEntries) && localEntries.length > 0) {
          // Create a map of existing entries by ID to avoid duplicates
          const existingEntriesMap = new Map(
            foodEntries.map(entry => [entry.id, entry])
          );
          
          // Add local entries that don't exist in the main storage
          localEntries.forEach(entry => {
            if (!existingEntriesMap.has(entry.id)) {
              foodEntries.push(entry);
            }
          });
        }
      }
      
      // Combine data
      const combinedData = {
        ...data,
        foodEntries
      };
      
      dispatch({ type: 'SET_USER_DATA', payload: combinedData });
      
      return combinedData;
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  // Action creator to save user data
  async function saveData() {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Use stateRef.current so we always save the latest state, not a stale closure
      await saveUserData(stateRef.current);
      // Also save current food entries to localStorage as a backup
      try {
        localStorage.setItem('foodLog_backup', JSON.stringify(state.foodEntries));
      } catch (e) {
        console.warn('Could not save backup to localStorage', e);
      }
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  // Enhanced dispatch that handles async actions
  function enhancedDispatch(action) {
    if (typeof action === 'function') {
      return action(dispatch, () => state);
    }

    if (action.type === 'LOAD_USER_DATA') {
      return loadData();
    }

    if (action.type === 'SAVE_USER_DATA') {
      return saveData();
    }

    dispatch(action);
    
    // Sync specific actions to backend immediately
    if (action.type === 'ADD_FOOD_ENTRY' && action.payload) {
      foodEntriesAPI.create({
        id: action.payload.id,
        date: action.payload.date,
        mealType: action.payload.mealType || 'Snacks',
        name: action.payload.name,
        brand: action.payload.brand || '',
        category: action.payload.category || null,
        servingSize: action.payload.servingSize || 1,
        servingUnit: action.payload.servingUnit || 'serving',
        servings: action.payload.servings || 1,
        calories: action.payload.calories || 0,
        protein: action.payload.protein || 0,
        carbs: action.payload.carbs || 0,
        fat: action.payload.fat || 0,
        fiber: action.payload.fiber || 0,
        sugar: action.payload.sugar || 0,
        sodium: action.payload.sodium || 0
      }).catch(err => console.error('Failed to sync food entry to backend:', err));
    }
    
    if (action.type === 'DELETE_FOOD_ENTRY' && action.payload) {
      foodEntriesAPI.delete(action.payload).catch(err => console.error('Failed to delete food entry from backend:', err));
    }
    
    // Auto-save after data-changing actions
    if (['ADD_FOOD_ENTRY', 'UPDATE_FOOD_ENTRY', 'DELETE_FOOD_ENTRY', 
         'CLEAR_FOOD_ENTRIES_FOR_DAY', 'UPDATE_DAILY_GOALS', 'UPDATE_SETTINGS'].includes(action.type)) {
      setTimeout(() => {
        saveData();
      }, 100);
    }
    
    return action;
  }

  // Reload data whenever auth state changes (login/logout)
  useEffect(() => {
    loadData().catch(err => {
      console.error('NutritionContext: Failed to load data:', err);
    });
  }, [isAuthenticated]);
  
  return (
    <NutritionContext.Provider value={{ 
      state,
      dispatch: enhancedDispatch
    }}>
      {children}
    </NutritionContext.Provider>
  );
};

export default NutritionContext;
