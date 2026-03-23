# LearnNova Database Setup Guide

## Overview
This guide provides instructions for setting up the LearnNova database schema in Supabase.

## Database Files

- **`schema.sql`** - Complete schema with all table definitions, indexes, and triggers
- **`migrations/001_create_learnnova_schema.sql`** - Database migration file containing the initial schema

## Prerequisites

- Supabase account with a project created
- Project URL: https://supabase.com/dashboard/project/vmboecjnswsygdzlugxq
- Database name: `LearnNova` (already created but empty)

## Setup Method 1: Using Supabase SQL Editor (Recommended for Quick Setup)

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your LearnNova project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute Schema**
   - Open the `supabase/schema.sql` file
   - Copy all the SQL content
   - Paste it into the SQL Editor
   - Click "Run" (or Cmd/Ctrl + Enter)

4. **Verify Success**
   - Go to "Tables" in the left sidebar
   - You should see all the new tables created:
     - users
     - courses
     - lessons
     - course_enrollments
     - user_progress
     - quizzes
     - quiz_questions
     - quiz_attempts
     - course_invitations
     - tutor_applications
     - course_reviews
     - certificates
     - notifications
     - announcements
     - discussions
     - discussion_replies
     - kv_store
     - badges

## Setup Method 2: Using Supabase CLI (Recommended for Version Control)

### Prerequisites
- Install Supabase CLI: `npm install -g supabase`
- Authenticate: `supabase login`

### Steps:

1. **Navigate to Project Directory**
   ```bash
   cd "c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2"
   ```

2. **Run Migration**
   ```bash
   supabase db push
   ```
   This will execute the migration file and update your remote database.

## Table Structure

### Core Tables

#### **users**
- Stores user accounts (learners, tutors, admins)
- Fields: email, name, role, avatar_url, bio, points, badge_level, is_verified, is_active

#### **courses**
- Main course information
- Fields: title, description, instructor_id, category, cover_image, duration, rating, views, visibility, access_rule (open/payment/invitation), tags

#### **lessons**
- Lessons within courses
- Fields: course_id, title, content, video_url, video_duration, sequence_number

#### **course_enrollments**
- Tracks which users are enrolled in which courses
- Fields: user_id, course_id, enrolled_at, is_completed, progress_percentage

#### **user_progress**
- Detailed progress tracking per course
- Fields: user_id, course_id, completed_lessons (array), time_spent_minutes, last_accessed

#### **quizzes**
- Quiz definitions
- Fields: course_id, lesson_id, title, passing_score, time_limit_minutes, show_correct_answers

#### **quiz_questions**
- Individual quiz questions
- Fields: quiz_id, question_text, question_type, options (JSON), correct_answer, explanation, points

#### **quiz_attempts**
- User quiz attempt records
- Fields: user_id, quiz_id, score, percentage, is_passed, time_spent_minutes, answers (JSON)

#### **Other Tables**
- **badges**: Achievement definitions (Beginner, Learner, Scholar, Expert, Master)
- **course_invitations**: Invitation-only course access management
- **tutor_applications**: Tutor application submissions
- **course_reviews**: User reviews and ratings
- **certificates**: Completion certificates
- **notifications**: User notifications
- **announcements**: Course announcements
- **discussions**: Discussion threads
- **discussion_replies**: Discussion thread replies
- **kv_store**: Key-value store for miscellaneous data

## Key Features

### Automatic Timestamps
All tables with `created_at` and `updated_at` fields have automatic triggers that update `updated_at` whenever the row is modified.

### Foreign Key Constraints
- All relationships are enforced with foreign keys
- CASCADE deletes are enabled where appropriate
- Data integrity is maintained automatically

### Indexes
Performance indexes are created on:
- User email (unique lookups)
- User role (filtering by user type)
- Course relationships (fastest queries)
- Enrollment and progress tracking
- Quiz and attempt history

### Enums & Constraints
- Role: `learner`, `tutor`, `admin`
- Access Rule: `open`, `payment`, `invitation`
- Visibility: `public`, `signed-in`, `private`
- Question Type: `multiple-choice`, `true-false`, `short-answer`, `essay`
- Application Status: `pending`, `approved`, `rejected`

## Sample Data

To populate the database with sample data, you can uncomment the sample data section at the end of `schema.sql` and execute it.

### Example Badges
```sql
INSERT INTO badges (level, name, description, min_points, color) VALUES
(1, 'Beginner', 'Complete your first lesson', 0, '#4CAF50'),
(2, 'Learner', 'Earn 100 points', 100, '#2196F3'),
(3, 'Scholar', 'Earn 500 points', 500, '#FF9800'),
(4, 'Expert', 'Earn 1000 points', 1000, '#F44336'),
(5, 'Master', 'Earn 2500 points', 2500, '#9C27B0');
```

## Environment Variables

Ensure your `.env.local` file contains:
```
VITE_SUPABASE_URL=https://vmboecjnswsygdzlugxq.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Troubleshooting

### Issue: "relation already exists"
**Solution**: The tables are already created. You can:
1. Drop tables and re-run: `DROP TABLE IF EXISTS table_name CASCADE;`
2. Or use `IF NOT EXISTS` in creation statements (already included)

### Issue: Foreign key constraint failure
**Solution**: Ensure you:
1. Create parent tables first (users before courses)
2. Insert data in the correct order
3. Use valid UUIDs for foreign key references

### Issue: Indexes already exist
**Solution**: All index creation statements use `IF NOT EXISTS`, so they can be safely re-run.

## Next Steps

1. **Connect Application to Database**
   - Update your auth context to use real Supabase authentication
   - Replace mock data with actual database queries
   - Implement API endpoints for CRUD operations

2. **Create Row Level Security (RLS) Policies**
   - Implement security policies to control data access by user role
   - Prevent unauthorized access to sensitive data

3. **Add Authentication**
   - Set up Supabase Auth for user registration and login
   - Implement JWT tokens in the API

4. **Create API Functions**
   - Set up Supabase Edge Functions or API routes
   - Handle complex queries and business logic

## Support

For more information:
- Supabase Documentation: https://supabase.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs
- Supabase Dashboard: https://supabase.com/dashboard
