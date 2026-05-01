-- RLS POLICIES FOR LEARNNOVA
-- Run these SQL commands in Supabase SQL Editor

-- ============================================
-- 1. QUIZZES TABLE - RLS POLICIES
-- ============================================

-- Enable RLS on quizzes table
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can see ALL quizzes (published and unpublished)
CREATE POLICY "Admins can view all quizzes" ON quizzes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'tutor')
    )
  );

-- Policy 2: Students/Learners can only see published quizzes
CREATE POLICY "Students can view published quizzes" ON quizzes
  FOR SELECT
  USING (
    published = true 
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'tutor')
    )
  );

-- Policy 3: Admins and tutors can create quizzes
CREATE POLICY "Admins and tutors can create quizzes" ON quizzes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'tutor')
    )
  );

-- Policy 4: Admins and tutors can update all quizzes
CREATE POLICY "Admins and tutors can update quizzes" ON quizzes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'tutor')
    )
  );

-- Policy 5: Admins and tutors can delete quizzes
CREATE POLICY "Admins and tutors can delete quizzes" ON quizzes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'tutor')
    )
  );

-- ============================================
-- 2. QUIZ_QUESTIONS TABLE - RLS POLICIES
-- ============================================

-- Enable RLS on quiz_questions table
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins and tutors can view all questions
CREATE POLICY "Admins and tutors can view all questions" ON quiz_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'tutor')
    )
  );

-- Policy 2: Students can view questions only for published quizzes
CREATE POLICY "Students can view questions for published quizzes" ON quiz_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = quiz_questions.quiz_id 
      AND (
        quizzes.published = true
        OR EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND users.role IN ('admin', 'tutor')
        )
      )
    )
  );

-- Policy 3: Admins and tutors can create questions
CREATE POLICY "Admins and tutors can create questions" ON quiz_questions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'tutor')
    )
  );

-- Policy 4: Admins and tutors can update questions
CREATE POLICY "Admins and tutors can update questions" ON quiz_questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'tutor')
    )
  );

-- Policy 5: Admins and tutors can delete questions
CREATE POLICY "Admins and tutors can delete questions" ON quiz_questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'tutor')
    )
  );

-- ============================================
-- 3. VERIFY POLICIES (run these to check)
-- ============================================

-- View all RLS policies on quizzes table:
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'quizzes';

-- View all RLS policies on quiz_questions table:
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'quiz_questions';
