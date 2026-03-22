-- Recreate daily_goals with UNIQUE constraint on user_id to support proper UPSERT
CREATE TABLE daily_goals_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  calories INTEGER NOT NULL DEFAULT 2000,
  protein INTEGER NOT NULL DEFAULT 150,
  carbs INTEGER NOT NULL DEFAULT 200,
  fat INTEGER NOT NULL DEFAULT 65,
  fiber INTEGER NOT NULL DEFAULT 30,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO daily_goals_new SELECT id, user_id, calories, protein, carbs, fat, fiber, created_at, updated_at FROM daily_goals;
DROP TABLE daily_goals;
ALTER TABLE daily_goals_new RENAME TO daily_goals;
