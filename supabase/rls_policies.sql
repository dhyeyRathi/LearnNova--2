-- LearnNova Row Level Security (RLS) Policies
-- These policies control data access based on user roles and ownership

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Tutors and admins can view student profiles (limited fields)
CREATE POLICY "Instructors view student profiles"
  ON users
  FOR SELECT
  USING (role IN ('tutor', 'admin'));

-- Users can insert their own profile during signup
CREATE POLICY "Users insert own profile"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Service role can insert (for signup triggers)
CREATE POLICY "Service role insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- COURSES TABLE POLICIES
-- ============================================================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Public courses: everyone can view
CREATE POLICY "View published public courses"
  ON courses
  FOR SELECT
  USING (is_published = true AND visibility = 'public');

-- Signed-in users can view signed-in courses
CREATE POLICY "Authenticated users view signed-in courses"
  ON courses
  FOR SELECT
  USING (is_published = true AND visibility = 'signed-in' AND auth.uid() IS NOT NULL);

-- Users can view their own enrolled courses
CREATE POLICY "Users view enrolled courses"
  ON courses
  FOR SELECT
  USING (
    id IN (
      SELECT course_id FROM course_enrollments WHERE user_id = auth.uid()
    )
  );

-- Instructors can view and edit their own courses
CREATE POLICY "Instructors manage own courses"
  ON courses
  FOR UPDATE
  USING (instructor_id = auth.uid());

CREATE POLICY "Instructors view own courses"
  ON courses
  FOR SELECT
  USING (instructor_id = auth.uid());

-- Admins can view all courses
CREATE POLICY "Admins view all courses"
  ON courses
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- LESSONS TABLE POLICIES
-- ============================================================================

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Users can view lessons of courses they're enrolled in
CREATE POLICY "Users view lesson content"
  ON lessons
  FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE
        (is_published = true AND visibility = 'public') OR
        (is_published = true AND visibility = 'signed-in' AND auth.uid() IS NOT NULL) OR
        (id IN (SELECT course_id FROM course_enrollments WHERE user_id = auth.uid()))
    )
  );

-- Instructors can manage lessons in their courses
CREATE POLICY "Instructors manage course lessons"
  ON lessons
  FOR ALL
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- COURSE_ENROLLMENTS TABLE POLICIES
-- ============================================================================

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users view own enrollments"
  ON course_enrollments
  FOR SELECT
  USING (user_id = auth.uid());

-- Instructors can view enrollments in their courses
CREATE POLICY "Instructors view course enrollments"
  ON course_enrollments
  FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

-- Users can enroll in courses (insert)
CREATE POLICY "Users can enroll in courses"
  ON course_enrollments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own enrollment progress
CREATE POLICY "Users update own enrollment"
  ON course_enrollments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- USER_PROGRESS TABLE POLICIES
-- ============================================================================

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own progress
CREATE POLICY "Users manage own progress"
  ON user_progress
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Instructors can view student progress in their courses
CREATE POLICY "Instructors view student progress"
  ON user_progress
  FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- QUIZZES TABLE POLICIES
-- ============================================================================

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Users can view published quizzes in courses they're enrolled in
CREATE POLICY "Users view quiz content"
  ON quizzes
  FOR SELECT
  USING (
    is_published = true AND
    (
      course_id IN (
        SELECT id FROM courses WHERE
          (visibility = 'public') OR
          (id IN (SELECT course_id FROM course_enrollments WHERE user_id = auth.uid()))
      )
    )
  );

-- Instructors can manage quizzes in their courses
CREATE POLICY "Instructors manage quizzes"
  ON quizzes
  FOR ALL
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- QUIZ_QUESTIONS TABLE POLICIES
-- ============================================================================

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Users can view questions for quizzes they have access to
CREATE POLICY "Users view quiz questions"
  ON quiz_questions
  FOR SELECT
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE is_published = true
    )
  );

-- Instructors can manage questions in their quizzes
CREATE POLICY "Instructors manage quiz questions"
  ON quiz_questions
  FOR ALL
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE
        course_id IN (
          SELECT id FROM courses WHERE instructor_id = auth.uid()
        )
    )
  );

-- ============================================================================
-- QUIZ_ATTEMPTS TABLE POLICIES
-- ============================================================================

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own attempts
CREATE POLICY "Users manage own quiz attempts"
  ON quiz_attempts
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Instructors can view attempts for their course quizzes
CREATE POLICY "Instructors view quiz attempts"
  ON quiz_attempts
  FOR SELECT
  USING (
    quiz_id IN (
      SELECT id FROM quizzes WHERE
        course_id IN (
          SELECT id FROM courses WHERE instructor_id = auth.uid()
        )
    )
  );

-- ============================================================================
-- COURSE_INVITATIONS TABLE POLICIES
-- ============================================================================

ALTER TABLE course_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations sent to them
CREATE POLICY "Users view own invitations"
  ON course_invitations
  FOR SELECT
  USING (user_id = auth.uid());

-- Instructors can manage invitations for their courses
CREATE POLICY "Instructors manage course invitations"
  ON course_invitations
  FOR ALL
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

-- ============================================================================
-- COURSE_REVIEWS TABLE POLICIES
-- ============================================================================

ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view published course reviews
CREATE POLICY "View course reviews"
  ON course_reviews
  FOR SELECT
  USING (true);

-- Users can create, view, and edit their own reviews
CREATE POLICY "Users manage own reviews"
  ON course_reviews
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own notifications
CREATE POLICY "Users manage own notifications"
  ON notifications
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- DISCUSSIONS TABLE POLICIES
-- ============================================================================

ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

-- Users can view discussions in courses they're enrolled in or that are public
CREATE POLICY "Users view accessible discussions"
  ON discussions
  FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE
        (visibility = 'public') OR
        (id IN (SELECT course_id FROM course_enrollments WHERE user_id = auth.uid()))
    )
  );

-- Users can create discussions in courses they're enrolled in
CREATE POLICY "Users create discussions"
  ON discussions
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    course_id IN (
      SELECT course_id FROM course_enrollments WHERE user_id = auth.uid()
    )
  );

-- Users can update their own discussions
CREATE POLICY "Users update own discussions"
  ON discussions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- DISCUSSION_REPLIES TABLE POLICIES
-- ============================================================================

ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

-- Users can view replies to discussions they can access
CREATE POLICY "Users view discussion replies"
  ON discussion_replies
  FOR SELECT
  USING (
    discussion_id IN (
      SELECT id FROM discussions WHERE
        course_id IN (
          SELECT id FROM courses WHERE
            (visibility = 'public') OR
            (id IN (SELECT course_id FROM course_enrollments WHERE user_id = auth.uid()))
        )
    )
  );

-- Users can create replies in discussions they can access
CREATE POLICY "Users create discussion replies"
  ON discussion_replies
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    discussion_id IN (
      SELECT id FROM discussions WHERE
        course_id IN (
          SELECT course_id FROM course_enrollments WHERE user_id = auth.uid()
        )
    )
  );

-- Users can update their own replies
CREATE POLICY "Users update own replies"
  ON discussion_replies
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
