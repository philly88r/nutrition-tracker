import localforage from 'localforage';
import { foodEntriesAPI, goalsAPI, groceryAPI, profileAPI } from './apiService';

// Configure localforage for offline backup
localforage.config({
  name: 'NutritionTracker',
  storeName: 'nutrition_data'
});

// Save all user data to backend AND local backup
export const saveUserData = async (data) => {
  try {
    // Remove circular references and functions
    const sanitizedData = JSON.parse(JSON.stringify(data));
    
    // Save to backend API (with error handling)
    const savePromises = [];
    
    // Save goals to backend
    if (sanitizedData.dailyGoals) {
      savePromises.push(
        goalsAPI.update(sanitizedData.dailyGoals).catch(err => {
          console.warn('Failed to sync goals to backend:', err);
        })
      );
    }
    
    // Note: Food entries are saved individually when added/updated, not in bulk here
    // Grocery items are saved individually when added/updated
    
    await Promise.all(savePromises);
    
    // Also save to localforage as offline backup
    await Promise.all([
      localforage.setItem('user', sanitizedData.user),
      localforage.setItem('dailyGoals', sanitizedData.dailyGoals),
      localforage.setItem('dailyTotals', sanitizedData.dailyTotals),
      localforage.setItem('foodEntries', sanitizedData.foodEntries),
      localforage.setItem('customFoods', sanitizedData.customFoods),
      localforage.setItem('settings', sanitizedData.settings),
      localforage.setItem('currentDate', sanitizedData.currentDate)
    ]);
    
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

// Load all user data from backend (with local fallback)
export const loadUserData = async () => {
  try {
    // Try to load from backend first
    let foodEntries = [];
    let dailyGoals = null;
    let groceryItems = [];
    
    try {
      // Load from backend API
      console.log('StorageService: Fetching data from backend...');
      const [foodData, goalsData, profileData] = await Promise.all([
        foodEntriesAPI.getAll().catch(err => {
          console.error('Failed to fetch food entries:', err);
          return [];
        }),
        goalsAPI.get().catch(err => {
          console.error('Failed to fetch goals:', err);
          return null;
        }),
        profileAPI.get().catch(err => {
          console.error('Failed to fetch profile:', err);
          return null;
        })
      ]);
      
      console.log('StorageService: Backend data received:', {
        foodEntriesCount: foodData?.length || 0,
        hasGoals: !!goalsData,
        hasProfile: !!profileData
      });
      
      foodEntries = foodData || [];
      dailyGoals = goalsData;
      
      // Save profile name to localStorage for quick access
      if (profileData && profileData.name) {
        localStorage.setItem('userName', profileData.name);
      }
    } catch (apiError) {
      console.warn('Failed to load from backend, using local data:', apiError);
    }
    
    // Load remaining data from localforage (local-only data)
    const [
      user,
      localGoals,
      dailyTotals,
      localFoodEntries,
      customFoods,
      settings,
      currentDate
    ] = await Promise.all([
      localforage.getItem('user'),
      localforage.getItem('dailyGoals'),
      localforage.getItem('dailyTotals'),
      localforage.getItem('foodEntries'),
      localforage.getItem('customFoods'),
      localforage.getItem('settings'),
      localforage.getItem('currentDate')
    ]);
    
    // Use backend data if available, otherwise use local
    if (!dailyGoals && localGoals) {
      dailyGoals = localGoals;
    }
    if (foodEntries.length === 0 && localFoodEntries && localFoodEntries.length > 0) {
      foodEntries = localFoodEntries;
    }
    
    // Legacy localStorage migration - only for first-time migration
    let legacyFoodEntries = [];
    
    try {
      // Check main legacy storage (only if backend is empty)
      if (foodEntries.length === 0) {
        const storedLog = localStorage.getItem('foodLog');
        if (storedLog) {
          legacyFoodEntries = JSON.parse(storedLog);
          console.log('Found legacy food entries in localStorage:', legacyFoodEntries.length);
          // Remove after reading
          localStorage.removeItem('foodLog');
        }
      }
    } catch (e) {
      console.error('Error parsing localStorage data:', e);
    }
    
    // Merge legacy food entries with localforage entries
    let mergedFoodEntries = foodEntries || [];
    if (legacyFoodEntries.length > 0) {
      // Create a map of existing entries by ID to avoid duplicates
      const existingEntriesMap = new Map(
        mergedFoodEntries.map(entry => [entry.id, entry])
      );
      
      // Add local entries that don't exist in the main storage
      legacyFoodEntries.forEach(entry => {
        if (!existingEntriesMap.has(entry.id)) {
          mergedFoodEntries.push(entry);
        }
      });
    }
    
    // Always use backend data as primary source
    const result = {
      user: user || null,
      dailyGoals: dailyGoals || {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 65,
        fiber: 30
      },
      dailyTotals: dailyTotals || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      },
      foodEntries: mergedFoodEntries,
      customFoods: customFoods || [],
      settings: settings || {
        theme: 'light',
        measurementSystem: 'metric',
        language: 'en',
        notifications: true,
        mealNames: ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
      },
      currentDate: currentDate || new Date().toISOString().split('T')[0]
    };
    
    // If we migrated data, save it immediately
    if (legacyFoodEntries.length > 0) {
      await saveUserData(result);
      console.log('Migrated legacy data to localforage');
    }
    
    return result;
  } catch (error) {
    console.error('Error loading user data:', error);
    throw error;
  }
};

// Clear all data (for logout or reset)
export const clearUserData = async () => {
  try {
    await localforage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
};

// Export data to JSON file (for backup)
export const exportUserData = async () => {
  try {
    const data = await loadUserData();
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileName = `nutrition_data_backup_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};

// Import data from JSON file
export const importUserData = async (fileData) => {
  try {
    let data;
    
    if (typeof fileData === 'string') {
      data = JSON.parse(fileData);
    } else {
      data = fileData;
    }
    
    // Validate data structure (basic validation)
    const requiredKeys = [
      'dailyGoals', 'foodEntries', 'customFoods', 'settings'
    ];
    
    const hasRequiredKeys = requiredKeys.every(key => 
      Object.prototype.hasOwnProperty.call(data, key)
    );
    
    if (!hasRequiredKeys) {
      throw new Error('Invalid data format: Missing required properties');
    }
    
    // Save the imported data
    await saveUserData(data);
    
    return data;
  } catch (error) {
    console.error('Error importing user data:', error);
    throw error;
  }
};
