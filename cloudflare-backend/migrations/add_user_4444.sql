-- Add temporary user with PIN code 4444
-- User: PIN 4444 (Temporary Access)
INSERT INTO users (email, password_hash, pin_code, pin_enabled, name)
VALUES ('user4444@macrotracker.app', '$2a$10$dummyhashforuser4444', '4444', 1, 'Temporary User');

-- Create default daily goals for user with PIN 4444
INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fiber)
SELECT id, 2000, 150, 200, 65, 30 FROM users WHERE pin_code = '4444';

-- Create default settings for user with PIN 4444
INSERT INTO user_settings (user_id, theme, measurement_system, language, notifications)
SELECT id, 'light', 'metric', 'en', 1 FROM users WHERE pin_code = '4444';
