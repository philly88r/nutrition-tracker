-- Migration: Move kdp_users to users table with pro subscription status
-- This ensures all existing book code users get pro access

-- First, check if users table has the required columns
PRAGMA table_info(users);

-- If users table doesn't exist, create it with proper schema for KDP users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    pin_hash TEXT,
    password_hash TEXT,
    access_code_hash TEXT,
    subscription_status TEXT DEFAULT 'free',
    subscription_type TEXT,
    auth_type TEXT DEFAULT 'standard',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME
);

-- Migrate existing kdp_users to users table with pro status
INSERT OR IGNORE INTO users (
    email, 
    pin_hash, 
    access_code_hash, 
    subscription_status, 
    subscription_type, 
    auth_type,
    created_at,
    last_login_at
)
SELECT 
    k.email,
    k.pin_hash,
    k.access_code_hash,
    'pro',              -- Give pro status
    'book_lifetime',    -- Book lifetime subscription
    'kdp',              -- KDP auth type
    k.created_at,
    k.last_login_at
FROM kdp_users k
LEFT JOIN users u ON k.email = u.email
WHERE u.id IS NULL;  -- Only migrate if not already in users table

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on subscription_status for filtering
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_status);

-- Verify migration
SELECT 
    COUNT(*) as total_book_users,
    SUM(CASE WHEN subscription_status = 'pro' THEN 1 ELSE 0 END) as pro_users
FROM users 
WHERE auth_type = 'kdp';
