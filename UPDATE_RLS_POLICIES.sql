-- DROP EXISTING OVERLY PERMISSIVE RLS POLICIES
DROP POLICY IF EXISTS "allow_all_delete_quizzes" ON quizzes;
DROP POLICY IF EXISTS "allow_all_insert_quizzes" ON quizzes;
DROP POLICY IF EXISTS "allow_all_select_quizzes" ON quizzes;
DROP POLICY IF EXISTS "allow_all_update_quizzes" ON quizzes;

-- MAKE SURE RLS IS ENABLED
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- QUIZZES TABLE - NEW ROLE-BASED POLICIES
-- ============================================

-- ADMINS: Can SELECT all quizzes (published and unpublished)
CREATE POLICY "admin_select_all_quizzes" ON quizzes
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- TUTORS: Can SELECT all quizzes
CREATE POLICY "tutor_select_all_quizzes" ON quizzes
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'tutor'
    )
  );

-- STUDENTS: Can SELECT only published quizzes
CREATE POLICY "student_select_published_quizzes" ON quizzes
  FOR SELECT
  USING (
    (is_published = true) 
    OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'tutor'))
  );

-- ADMINS: Can INSERT quizzes
CREATE POLICY "admin_insert_quizzes" ON quizzes
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- TUTORS: Can INSERT quizzes
CREATE POLICY "tutor_insert_quizzes" ON quizzes
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'tutor')
  );

-- ADMINS: Can UPDATE all quizzes
CREATE POLICY "admin_update_quizzes" ON quizzes
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- TUTORS: Can UPDATE quizzes they created
CREATE POLICY "tutor_update_own_quizzes" ON quizzes
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'tutor')
  );

-- ADMINS: Can DELETE quizzes
CREATE POLICY "admin_delete_quizzes" ON quizzes
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- TUTORS: Can DELETE quizzes
CREATE POLICY "tutor_delete_quizzes" ON quizzes
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'tutor')
  );

-- ============================================
-- QUIZ_QUESTIONS TABLE - POLICIES
-- ============================================

-- Drop existing policies on quiz_questions if any
DROP POLICY IF EXISTS "allow_all_select_quiz_questions" ON quiz_questions;
DROP POLICY IF EXISTS "allow_all_insert_quiz_questions" ON quiz_questions;
DROP POLICY IF EXISTS "allow_all_update_quiz_questions" ON quiz_questions;
DROP POLICY IF EXISTS "allow_all_delete_quiz_questions" ON quiz_questions;

-- ADMINS/TUTORS: Can SELECT all questions
CREATE POLICY "admin_tutor_select_questions" ON quiz_questions
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'tutor')
    )
  );

-- STUDENTS: Can SELECT questions only for published quizzes
CREATE POLICY "student_select_published_questions" ON quiz_questions
  FOR SELECT
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE published = true
    )
    OR auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'tutor')
    )
  );

-- ADMINS/TUTORS: Can INSERT questions
CREATE POLICY "admin_tutor_insert_questions" ON quiz_questions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'tutor')
    )
  );

-- ADMINS/TUTORS: Can UPDATE questions
CREATE POLICY "admin_tutor_update_questions" ON quiz_questions
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'tutor')
    )
  );

-- ADMINS/TUTORS: Can DELETE questions
CREATE POLICY "admin_tutor_delete_questions" ON quiz_questions
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'tutor')
    )
  );
