-- Fix daily_goals table to remove foreign key constraint
-- This allows both regular users and KDP users to have goals

-- Drop the existing table
DROP TABLE IF EXISTS daily_goals;

-- Recreate without foreign key constraint
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_id ON daily_goals(user_id);
