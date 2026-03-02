-- Add initial users with PIN codes
-- User 1: PIN 888888
INSERT INTO users (email, password_hash, pin_code, pin_enabled, name)
VALUES ('user888888@macrotracker.app', '$2a$10$dummyhashforuser888888', '888888', 1, 'User 888888');

-- User 2: PIN 777777
INSERT INTO users (email, password_hash, pin_code, pin_enabled, name)
VALUES ('user777777@macrotracker.app', '$2a$10$dummyhashforuser777777', '777777', 1, 'User 777777');

-- Get the user IDs (will be auto-incremented)
-- Create default daily goals for user with PIN 888888
INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fiber)
SELECT id, 2000, 150, 200, 65, 30 FROM users WHERE pin_code = '888888';

-- Create default settings for user with PIN 888888
INSERT INTO user_settings (user_id, theme, measurement_system, language, notifications)
SELECT id, 'light', 'metric', 'en', 1 FROM users WHERE pin_code = '888888';

-- Create default daily goals for user with PIN 777777
INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fiber)
SELECT id, 2000, 150, 200, 65, 30 FROM users WHERE pin_code = '777777';

-- Create default settings for user with PIN 777777
INSERT INTO user_settings (user_id, theme, measurement_system, language, notifications)
SELECT id, 'light', 'metric', 'en', 1 FROM users WHERE pin_code = '777777';
