import { foodEntriesAPI, goalsAPI, groceryAPI, profileAPI } from './apiService';
import localforage from 'localforage';

/**
 * Migrate all existing localStorage/localforage data to backend database
 * This should be run once after user logs in
 */
export const migrateLocalDataToBackend = async () => {
  try {
    console.log('Starting data migration to backend...');
    
    // Load all local data
    const [
      dailyGoals,
      foodEntries,
      groceryItems
    ] = await Promise.all([
      localforage.getItem('dailyGoals'),
      localforage.getItem('foodEntries'),
      localforage.getItem('groceryList')
    ]);
    
    const migrationResults = {
      goals: false,
      foodEntries: 0,
      groceryItems: 0,
      errors: []
    };
    
    // Migrate daily goals
    if (dailyGoals) {
      try {
        await goalsAPI.update(dailyGoals);
        migrationResults.goals = true;
        console.log('✅ Migrated daily goals');
      } catch (err) {
        console.error('Failed to migrate goals:', err);
        migrationResults.errors.push({ type: 'goals', error: err.message });
      }
    }
    
    // Migrate food entries
    if (foodEntries && Array.isArray(foodEntries) && foodEntries.length > 0) {
      console.log(`Migrating ${foodEntries.length} food entries...`);
      
      for (const entry of foodEntries) {
        try {
          await foodEntriesAPI.create({
            id: entry.id,
            date: entry.date,
            meal_type: entry.mealType || 'Snacks',
            food_name: entry.name,
            brand: entry.brand || '',
            serving_size: entry.servingSize || 1,
            serving_unit: entry.servingUnit || 'serving',
            calories: entry.calories || 0,
            protein: entry.protein || 0,
            carbs: entry.carbs || 0,
            fat: entry.fat || 0,
            fiber: entry.fiber || 0,
            sugar: entry.sugar || 0,
            sodium: entry.sodium || 0,
            usda_food_id: entry.usdaFoodId || null
          });
          migrationResults.foodEntries++;
        } catch (err) {
          console.error(`Failed to migrate food entry ${entry.id}:`, err);
          migrationResults.errors.push({ type: 'foodEntry', id: entry.id, error: err.message });
        }
      }
      console.log(`✅ Migrated ${migrationResults.foodEntries} food entries`);
    }
    
    // Migrate grocery items
    if (groceryItems && Array.isArray(groceryItems) && groceryItems.length > 0) {
      console.log(`Migrating ${groceryItems.length} grocery items...`);
      
      for (const item of groceryItems) {
        try {
          await groceryAPI.create({
            id: item.id,
            name: item.name,
            brand: item.brand || '',
            category: item.category || 'Other',
            quantity: item.quantity || 1,
            unit: item.unit || 'item',
            checked: item.checked ? 1 : 0,
            usda_food_id: item.usdaFoodId || null,
            calories: item.nutritionPer100g?.calories || 0,
            protein: item.nutritionPer100g?.protein || 0,
            carbs: item.nutritionPer100g?.carbs || 0,
            fat: item.nutritionPer100g?.fat || 0,
            fiber: item.nutritionPer100g?.fiber || 0,
            sugar: item.nutritionPer100g?.sugar || 0,
            sodium: item.nutritionPer100g?.sodium || 0
          });
          migrationResults.groceryItems++;
        } catch (err) {
          console.error(`Failed to migrate grocery item ${item.id}:`, err);
          migrationResults.errors.push({ type: 'groceryItem', id: item.id, error: err.message });
        }
      }
      console.log(`✅ Migrated ${migrationResults.groceryItems} grocery items`);
    }
    
    // Mark migration as complete
    localStorage.setItem('dataMigrationComplete', 'true');
    localStorage.setItem('dataMigrationDate', new Date().toISOString());
    
    console.log('Migration complete:', migrationResults);
    return migrationResults;
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

/**
 * Check if migration has been completed
 */
export const isMigrationComplete = () => {
  return localStorage.getItem('dataMigrationComplete') === 'true';
};

/**
 * Force re-migration (for testing or if migration failed)
 */
export const resetMigrationFlag = () => {
  localStorage.removeItem('dataMigrationComplete');
  localStorage.removeItem('dataMigrationDate');
};
