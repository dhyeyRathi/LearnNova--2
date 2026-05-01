-- ENABLE RLS ON QUIZ_QUESTIONS TABLE
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- CREATE RLS POLICIES FOR QUIZ_QUESTIONS TABLE

-- ADMINS/TUTORS: Can view all quiz questions
CREATE POLICY "admin_tutor_select_questions" ON quiz_questions
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'tutor')
    )
  );

-- STUDENTS: Can view questions only for published quizzes
CREATE POLICY "student_select_published_questions" ON quiz_questions
  FOR SELECT
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE is_published = true
    )
    OR auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'tutor')
    )
  );

-- ADMINS/TUTORS: Can insert quiz questions
CREATE POLICY "admin_tutor_insert_questions" ON quiz_questions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'tutor')
    )
  );

-- ADMINS/TUTORS: Can update quiz questions
CREATE POLICY "admin_tutor_update_questions" ON quiz_questions
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'tutor')
    )
  );

-- ADMINS/TUTORS: Can delete quiz questions
CREATE POLICY "admin_tutor_delete_questions" ON quiz_questions
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'tutor')
    )
  );
