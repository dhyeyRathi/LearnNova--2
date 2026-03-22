-- ============================================================================
-- SUPER PERMISSIVE RLS POLICIES FOR DEVELOPMENT
-- ============================================================================

-- DROP ALL EXISTING POLICIES
DROP POLICY IF EXISTS "Users view own profile" ON users;
DROP POLICY IF EXISTS "Users update own profile" ON users;
DROP POLICY IF EXISTS "Instructors view student profiles" ON users;
DROP POLICY IF EXISTS "Users insert own profile" ON users;
DROP POLICY IF EXISTS "Service role insert users" ON users;
DROP POLICY IF EXISTS "View published public courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users view signed-in courses" ON courses;
DROP POLICY IF EXISTS "Users view enrolled courses" ON courses;
DROP POLICY IF EXISTS "Instructors manage own courses" ON courses;
DROP POLICY IF EXISTS "Instructors view own courses" ON courses;
DROP POLICY IF EXISTS "Admins view all courses" ON courses;
DROP POLICY IF EXISTS "Users view lesson content" ON lessons;
DROP POLICY IF EXISTS "Instructors manage course lessons" ON lessons;
DROP POLICY IF EXISTS "Users view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Instructors view course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can enroll in courses" ON course_enrollments;
DROP POLICY IF EXISTS "Users update own enrollment" ON course_enrollments;
DROP POLICY IF EXISTS "Users manage own progress" ON user_progress;
DROP POLICY IF EXISTS "Instructors view student progress" ON user_progress;
DROP POLICY IF EXISTS "Users view quiz content" ON quizzes;
DROP POLICY IF EXISTS "Instructors manage quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users view quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Instructors manage quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Users manage own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Instructors view quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users view own invitations" ON course_invitations;
DROP POLICY IF EXISTS "Instructors manage course invitations" ON course_invitations;
DROP POLICY IF EXISTS "View course reviews" ON course_reviews;
DROP POLICY IF EXISTS "Users manage own reviews" ON course_reviews;
DROP POLICY IF EXISTS "Users manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Users view accessible discussions" ON discussions;
DROP POLICY IF EXISTS "Users create discussions" ON discussions;
DROP POLICY IF EXISTS "Users update own discussions" ON discussions;
DROP POLICY IF EXISTS "Users view discussion replies" ON discussion_replies;
DROP POLICY IF EXISTS "Users create discussion replies" ON discussion_replies;
DROP POLICY IF EXISTS "Users update own replies" ON discussion_replies;

-- ============================================================================
-- USERS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_users" ON users FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_users" ON users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_users" ON users FOR DELETE USING (true);

-- ============================================================================
-- COURSES TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_courses" ON courses FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_courses" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_courses" ON courses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_courses" ON courses FOR DELETE USING (true);

-- ============================================================================
-- LESSONS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_lessons" ON lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_lessons" ON lessons FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_lessons" ON lessons FOR DELETE USING (true);

-- ============================================================================
-- COURSE_ENROLLMENTS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_enrollments" ON course_enrollments FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_enrollments" ON course_enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_enrollments" ON course_enrollments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_enrollments" ON course_enrollments FOR DELETE USING (true);

-- ============================================================================
-- USER_PROGRESS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_progress" ON user_progress FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_progress" ON user_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_progress" ON user_progress FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_progress" ON user_progress FOR DELETE USING (true);

-- ============================================================================
-- QUIZZES TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_quizzes" ON quizzes FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_quizzes" ON quizzes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_quizzes" ON quizzes FOR DELETE USING (true);

-- ============================================================================
-- QUIZ_QUESTIONS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_quiz_questions" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_quiz_questions" ON quiz_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_quiz_questions" ON quiz_questions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_quiz_questions" ON quiz_questions FOR DELETE USING (true);

-- ============================================================================
-- QUIZ_ATTEMPTS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_attempts" ON quiz_attempts FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_attempts" ON quiz_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_attempts" ON quiz_attempts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_attempts" ON quiz_attempts FOR DELETE USING (true);

-- ============================================================================
-- COURSE_INVITATIONS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_invitations" ON course_invitations FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_invitations" ON course_invitations FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_invitations" ON course_invitations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_invitations" ON course_invitations FOR DELETE USING (true);

-- ============================================================================
-- COURSE_REVIEWS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_reviews" ON course_reviews FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_reviews" ON course_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_reviews" ON course_reviews FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_reviews" ON course_reviews FOR DELETE USING (true);

-- ============================================================================
-- NOTIFICATIONS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_notifications" ON notifications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_notifications" ON notifications FOR DELETE USING (true);

-- ============================================================================
-- DISCUSSIONS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_discussions" ON discussions FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_discussions" ON discussions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_discussions" ON discussions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_discussions" ON discussions FOR DELETE USING (true);

-- ============================================================================
-- DISCUSSION_REPLIES TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_replies" ON discussion_replies FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_replies" ON discussion_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_replies" ON discussion_replies FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_replies" ON discussion_replies FOR DELETE USING (true);

-- ============================================================================
-- BADGES TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_badges" ON badges FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_badges" ON badges FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_badges" ON badges FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_badges" ON badges FOR DELETE USING (true);

-- ============================================================================
-- CERTIFICATES TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_certificates" ON certificates FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_certificates" ON certificates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_certificates" ON certificates FOR DELETE USING (true);

-- ============================================================================
-- ANNOUNCEMENTS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_announcements" ON announcements FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_announcements" ON announcements FOR DELETE USING (true);

-- ============================================================================
-- TUTOR_APPLICATIONS TABLE - VERY PERMISSIVE
-- ============================================================================
CREATE POLICY "allow_all_select_apps" ON tutor_applications FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_apps" ON tutor_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_apps" ON tutor_applications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete_apps" ON tutor_applications FOR DELETE USING (true);
