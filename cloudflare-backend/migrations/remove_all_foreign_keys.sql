-- Remove all foreign key constraints to fix FOREIGN KEY errors
-- This allows KDP users (in kdp_users table) to use the app

-- Drop and recreate daily_goals without foreign key
DROP TABLE IF EXISTS daily_goals;
CREATE TABLE daily_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    calories INTEGER NOT NULL DEFAULT 2000,
    protein INTEGER NOT NULL DEFAULT 150,
    carbs INTEGER NOT NULL DEFAULT 200,
    fat INTEGER NOT NULL DEFAULT 65,
    fiber INTEGER NOT NULL DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_daily_goals_user_id ON daily_goals(user_id);

-- Drop and recreate food_entries without foreign key
DROP TABLE IF EXISTS food_entries;
CREATE TABLE food_entries (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    meal_type TEXT NOT NULL,
    serving_size REAL NOT NULL,
    serving_unit TEXT NOT NULL,
    servings REAL NOT NULL DEFAULT 1,
    calories REAL NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    fiber REAL DEFAULT 0,
    sugar REAL DEFAULT 0,
    sodium REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_food_entries_user_id ON food_entries(user_id);
CREATE INDEX idx_food_entries_date ON food_entries(date);

-- Drop and recreate user_profiles without foreign key
DROP TABLE IF EXISTS user_profiles;
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    name TEXT,
    age INTEGER,
    gender TEXT,
    weight REAL,
    weight_unit TEXT DEFAULT 'lbs',
    height REAL,
    height_unit TEXT DEFAULT 'inches',
    activity_level REAL DEFAULT 1.375,
    goal TEXT DEFAULT 'maintain',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Drop and recreate custom_foods without foreign key
DROP TABLE IF EXISTS custom_foods;
CREATE TABLE custom_foods (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    serving_size REAL NOT NULL,
    serving_unit TEXT NOT NULL,
    calories REAL NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    fiber REAL DEFAULT 0,
    sugar REAL DEFAULT 0,
    sodium REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_custom_foods_user_id ON custom_foods(user_id);

-- Drop and recreate grocery_items without foreign key
DROP TABLE IF EXISTS grocery_items;
CREATE TABLE grocery_items (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    quantity REAL,
    unit TEXT,
    purchased INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_grocery_items_user_id ON grocery_items(user_id);

-- Drop and recreate user_settings without foreign key
DROP TABLE IF EXISTS user_settings;
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    theme TEXT DEFAULT 'light',
    notifications_enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
