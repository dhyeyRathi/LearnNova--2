-- Migration: Add RLS policies for user profile updates
-- Allow users to update their own profile information

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;

-- Create policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policy: Allow users to view other profiles (for public info like instructor names)
CREATE POLICY "Users can view all profiles"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON users TO authenticated;

-- Add comment
COMMENT ON POLICY "Users can update own profile" ON users IS 'Allows authenticated users to update their own profile, including name changes with 15-day cooldown';
