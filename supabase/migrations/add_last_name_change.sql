-- Migration: Add last_name_change column to users table
-- This enables the 15-day cooldown period for name changes

-- Add last_name_change column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_name_change TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_last_name_change ON users(last_name_change);

-- Add comment
COMMENT ON COLUMN users.last_name_change IS 'Timestamp of the last name change, used to enforce 15-day cooldown';
