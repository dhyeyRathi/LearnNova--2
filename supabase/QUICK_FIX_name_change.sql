-- Quick fix: Run this SQL in your Supabase SQL Editor
-- This adds the last_name_change column and proper RLS policies

-- 1. Add the last_name_change column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_name_change TIMESTAMP WITH TIME ZONE;

-- 2. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "allow_all_select_users" ON users;
DROP POLICY IF EXISTS "allow_all_update_users" ON users;

-- 4. Create new policies
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all profiles"
ON users
FOR SELECT
TO authenticated
USING (true);

-- 5. Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_last_name_change ON users(last_name_change);

-- Done! You can now update your name with a 15-day cooldown
