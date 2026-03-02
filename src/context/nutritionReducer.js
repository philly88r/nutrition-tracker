// Nutrition Reducer - Manages state updates
const nutritionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER_DATA':
      return {
        ...state,
        ...action.payload,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
      
    case 'LOAD_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    // Daily goals actions
    case 'UPDATE_DAILY_GOALS':
      return {
        ...state,
        dailyGoals: {
          ...state.dailyGoals,
          ...action.payload
        }
      };
      
    case 'UPDATE_DAILY_TOTALS':
      return {
        ...state,
        dailyTotals: {
          ...state.dailyTotals,
          ...action.payload
        }
      };
      
    case 'CALCULATE_DAILY_TOTALS':
      // This is just a signal action that will be caught by the context
      // to trigger a recalculation of daily totals
      return state;
    
    // Food entry actions
    case 'ADD_FOOD_ENTRY':
      return {
        ...state,
        foodEntries: [...state.foodEntries, action.payload]
      };
      
    case 'UPDATE_FOOD_ENTRY':
      return {
        ...state,
        foodEntries: state.foodEntries.map(entry => 
          entry.id === action.payload.id ? { ...entry, ...action.payload } : entry
        )
      };
      
    case 'DELETE_FOOD_ENTRY':
      return {
        ...state,
        foodEntries: state.foodEntries.filter(entry => entry.id !== action.payload)
      };
      
    case 'CLEAR_FOOD_ENTRIES_FOR_DAY':
      return {
        ...state,
        foodEntries: state.foodEntries.filter(entry => entry.date !== action.payload)
      };
      
    // Custom food actions
    case 'ADD_CUSTOM_FOOD':
      return {
        ...state,
        customFoods: [...state.customFoods, action.payload]
      };
      
    case 'UPDATE_CUSTOM_FOOD':
      return {
        ...state,
        customFoods: state.customFoods.map(food => 
          food.id === action.payload.id ? { ...food, ...action.payload } : food
        )
      };
      
    case 'DELETE_CUSTOM_FOOD':
      return {
        ...state,
        customFoods: state.customFoods.filter(food => food.id !== action.payload)
      };
      
    // Settings actions
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
      
    case 'RESET_SETTINGS':
      return {
        ...state,
        settings: {
          theme: 'light',
          measurementSystem: 'metric',
          language: 'en',
          notifications: true,
          mealNames: ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
        }
      };
      
    // Date actions
    case 'SET_CURRENT_DATE':
      return {
        ...state,
        currentDate: action.payload
      };
      
    // User actions
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
      
    case 'UPDATE_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };

    // Default case
    default:
      return state;
  }
};

export default nutritionReducer;
