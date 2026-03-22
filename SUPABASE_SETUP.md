# LearnNova Setup Guide - Supabase Integration

## Quick Start

You've been provided with Supabase credentials and a complete database schema. Follow these steps to set up your LearnNova app.

## Step 1: Database Schema Setup

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/vmboecjnswsygdzlugxq

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Copy and Execute Schema**
   - Open `/supabase/schema.sql` in your project
   - Copy ALL content
   - Paste into the SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait for completion (you'll see "Success" notification)

4. **Verify Tables Created**
   - Go to "Tables" in the left sidebar
   - You should see 17 new tables:
     - users, badges, courses, lessons, course_enrollments
     - user_progress, quizzes, quiz_questions, quiz_attempts
     - course_invitations, tutor_applications, course_reviews
     - certificates, notifications, announcements
     - discussions, discussion_replies, kv_store

## Step 2: Enable Row Level Security (RLS)

### Using Supabase Dashboard

1. **Open SQL Editor again**
2. **Copy RLS Policies**
   - Open `/supabase/rls_policies.sql`
   - Copy ALL content
3. **Execute Policies**
   - Paste into SQL Editor
   - Click "Run"
   - Wait for completion

### What RLS Does
- Ensures users can only access their own data
- Allows instructors to view student progress
- Prevents unauthorized access to courses
- Manages discussion and enrollment visibility

## Step 3: Set Up Supabase Authentication

### Configure Auth Settings

1. **Go to Auth Settings**
   - Click "Authentication" → "Providers" in left sidebar
   - Look for "Email" provider (should be enabled by default)

2. **Configure Email Authentication**
   - Keep "Enable Email Provider" checked
   - Set password requirements (minimum 6 characters)
   - Save

3. **Note About Auth**
   - The current app uses Supabase Auth. Users can sign up with email/password
   - Passwords are hashed by Supabase (never stored in plain text)
   - Users table is linked to Supabase auth.users

## Step 4: Verify Environment Variables

Your `.env.local` file already has the correct credentials:

```
VITE_SUPABASE_URL=https://vmboecjnswsygdzlugxq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

These are automatically loaded by Vite.

## Step 5: Test the Setup

1. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The app runs on http://localhost:5174

2. **Test Signup**
   - Go to http://localhost:5174/signup
   - Create an account with test email: `testuser@learnnova.com`
   - Password: `password123`
   - Click "Create Account"

3. **Verify in Supabase**
   - Go to Supabase Dashboard
   - Go to "Authentication" → "Users"
   - You should see your test user
   - Go to "Tables" → "users" 
   - You should see your user profile

4. **Test Login**
   - Log out (if still logged in)
   - Go to http://localhost:5174/login
   - Sign in with your test email
   - Should be redirected to /courses

## Step 6: Set Up Initial Demo Data (Optional)

To add sample courses and data:

1. **Create Sample Admin/Instructor User**
   ```
   Email: instructor@learnnova.com
   Password: password123
   ```

2. **Use Supabase Editor to Insert Badges**
   ```sql
   INSERT INTO badges (level, name, description, min_points, color) VALUES
   (1, 'Beginner', 'Start your journey', 0, '#4CAF50'),
   (2, 'Learner', 'Earn 100 points', 100, '#2196F3'),
   (3, 'Scholar', 'Earn 500 points', 500, '#FF9800'),
   (4, 'Expert', 'Earn 1000 points', 1000, '#F44336'),
   (5, 'Master', 'Earn 2500 points', 2500, '#9C27B0');
   ```

3. **Insert Sample Courses** (you'll need instructor_id from users table)
   - Get your instructor UUID from the users table
   - Update the SQL below with your UUID:
   ```sql
   INSERT INTO courses (
     title, description, instructor_id, instructor_name, level, 
     category, duration, cover_image, is_published, visibility, tags
   ) VALUES
   ('Web Development Basics', 'Learn HTML, CSS, and JavaScript fundamentals', 
    'YOUR-INSTRUCTOR-UUID', 'John Doe', 'beginner', 'Web Development', 
    '4 weeks', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500', 
    true, 'public', ARRAY['web', 'development', 'javascript']),
   ('Advanced React', 'Master React hooks, context, and performance optimization',
    'YOUR-INSTRUCTOR-UUID', 'Jane Smith', 'advanced', 'Web Development',
    '6 weeks', 'https://images.unsplash.com/photo-1633356122544-f134ef2944f5?w=500',
    true, 'public', ARRAY['react', 'javascript', 'web development']);
   ```

## Architecture Overview

### User Roles

```
┌─────────────────┐
│  Learner        │ - Takes courses
│  (Default)      │ - Completes lessons
│                 │ - Takes quizzes
└─────────────────┘

┌─────────────────┐
│  Tutor/         │ - Creates courses
│  Instructor     │ - Creates lessons
│                 │ - Creates quizzes
│                 │ - Grades assignments
│                 │ - Views student progress
└─────────────────┘

┌─────────────────┐
│  Admin          │ - Manages all users
│                 │ - Manages all courses
│                 │ - System configuration
│                 │ - Reports and analytics
└─────────────────┘
```

### Data Flow

```
User Signup/Login
      ↓
Supabase Auth creates auth.users record
      ↓
App creates users table record
      ↓
AuthContext syncs with user state
      ↓
App displays user dashboard
```

### Key Tables & Relationships

```
users (1) ──→ (many) courses              instructor creates courses
users (1) ──→ (many) course_enrollments   user enrolls in courses
courses (1) ──→ (many) lessons            course has lessons
courses (1) ──→ (many) quizzes            course has quizzes
quizzes (1) ──→ (many) quiz_questions     quiz has questions
users (1) ──→ (many) user_progress        track user progress
```

## Troubleshooting

### Issue: "User doesn't exist" on signup
**Solution:** Check that the users table has been created. Verify in the Supabase dashboard under "Tables".

### Issue: "Foreign key constraint violation"
**Solution:** The tables were created out of order. Drop all tables and re-run the schema.sql file.

### Issue: "RLS policy violation"
**Solution:** RLS policies are too strict. Verify policies are enabled correctly in the SQL editor.

### Issue: Cannot see login/signup forms
**Solution:** 
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server (npm run dev)
- Check console for errors (F12)

### Issue: "SUPABASE_URL is missing"
**Solution:** Ensure .env.local file exists with all three environment variables:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Next Steps

1. ✅ Database schema created
2. ✅ RLS policies applied
3. ✅ Authentication configured
4. ⏳ Add sample courses (optional)
5. ⏳ Implement course creation UI (for instructors)
6. ⏳ Connect course data to frontend
7. ⏳ Set up email notifications

## UI Consistency

The homepage now uses DashboardLayout with sidebar for authenticated users. All pages use the same design system:

- **Color Scheme**: #2C3E6B (primary), #7A766F (secondary), #1A1F2E (text)
- **Typography**: Space Grotesk for headings
- **Components**: Radix UI with Tailwind CSS
- **Spacing**: 4px base unit
- **Animations**: Motion for smooth transitions

## Support

For more information:
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com

## Files Created/Modified

### New Files
- `/src/utils/supabase/client.ts` - Supabase client & auth functions
- `/src/utils/supabase/init.ts` - Database initialization helper
- `/supabase/rls_policies.sql` - Row Level Security policies
- `/supabase/schema.sql` - Complete database schema
- `/supabase/migrations/001_create_learnnova_schema.sql` - Migration file
- `/.env.local` - Environment variables

### Modified Files
- `/src/app/context/AuthContext.tsx` - Real Supabase auth instead of mock
- `/src/app/pages/LoginPage.tsx` - Async login with error handling
- `/src/app/pages/SignupPage.tsx` - Async signup with validation
- `/src/app/pages/HomePage.tsx` - DashboardLayout wrapped for consistency
- `/package.json` - Added @supabase/supabase-js
