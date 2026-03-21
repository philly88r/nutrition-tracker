-- Migration: Upgrade existing users who have KDP book codes to pro

-- Update users who exist in both tables to pro status
UPDATE users
SET 
    subscription_status = 'pro',
    subscription_type = 'book_lifetime',
    auth_type = 'kdp',
    pin_hash = (SELECT pin_hash FROM kdp_users WHERE kdp_users.email = users.email),
    access_code_hash = (SELECT access_code_hash FROM kdp_users WHERE kdp_users.email = users.email)
WHERE email IN (SELECT email FROM kdp_users)
  AND (subscription_status != 'pro' OR subscription_type IS NULL);

-- Verify: count users who are now pro via book code
SELECT 
    COUNT(*) as total_book_users,
    SUM(CASE WHEN subscription_status = 'pro' THEN 1 ELSE 0 END) as pro_users
FROM users 
WHERE email IN (SELECT email FROM kdp_users);
