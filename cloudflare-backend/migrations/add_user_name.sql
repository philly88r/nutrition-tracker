-- Add name column to users table
ALTER TABLE users ADD COLUMN name TEXT;

-- Add name to user_profiles table as well
ALTER TABLE user_profiles ADD COLUMN name TEXT;
