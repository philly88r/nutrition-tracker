-- Migration: Add missing columns for KDP users and migrate existing book code users

-- Add columns needed for KDP users
ALTER TABLE users ADD COLUMN pin_hash TEXT;
ALTER TABLE users ADD COLUMN auth_type TEXT DEFAULT 'standard';
ALTER TABLE users ADD COLUMN subscription_type TEXT;
ALTER TABLE users ADD COLUMN access_code_hash TEXT;
ALTER TABLE users ADD COLUMN last_login_at DATETIME;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_auth_type ON users(auth_type);
CREATE INDEX IF NOT EXISTS idx_users_access_code ON users(access_code_hash);
