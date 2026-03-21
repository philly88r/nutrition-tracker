-- Migration: Migrate existing kdp_users to users table with pro subscription

-- Migrate existing kdp_users to users table with pro status
INSERT INTO users (
    email, 
    pin_hash, 
    access_code_hash, 
    subscription_status, 
    subscription_type, 
    auth_type,
    created_at,
    last_login_at,
    password_hash
)
SELECT 
    k.email,
    k.pin_hash,
    k.access_code_hash,
    'pro',              -- Give pro status
    'book_lifetime',    -- Book lifetime subscription
    'kdp',              -- KDP auth type
    k.created_at,
    k.last_login_at,
    k.pin_hash          -- Use pin_hash as password_hash for compatibility
FROM kdp_users k
LEFT JOIN users u ON k.email = u.email
WHERE u.id IS NULL;  -- Only migrate if not already in users table

-- Verify migration
SELECT 
    COUNT(*) as total_book_users,
    SUM(CASE WHEN subscription_status = 'pro' THEN 1 ELSE 0 END) as pro_users
FROM users 
WHERE auth_type = 'kdp';
