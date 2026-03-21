UPDATE users SET subscription_status = 'pro', subscription_type = 'book_lifetime' WHERE auth_type = 'kdp' AND (subscription_status != 'pro' OR subscription_status IS NULL);
