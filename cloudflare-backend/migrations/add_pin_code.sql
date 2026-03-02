-- Add PIN code column to users table
ALTER TABLE users ADD COLUMN pin_code TEXT DEFAULT '123456';
ALTER TABLE users ADD COLUMN pin_enabled INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN pin_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Create index for faster PIN lookups
CREATE INDEX IF NOT EXISTS idx_users_pin ON users(pin_code);
