import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'learner' | 'tutor' | 'admin';
  avatar_url?: string;
  bio?: string;
  points: number;
  badge_level: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  last_name_change?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  cover_image?: string;
  duration?: string;
  rating: number;
  rating_count: number;
  views: number;
  is_published: boolean;
  visibility: 'public' | 'signed-in' | 'private';
  access_rule: 'open' | 'payment' | 'invitation';
  price?: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  type?: string;
  description?: string;
  content?: string;
  video_url?: string;
  video_duration?: number;
  reading_time_minutes?: number;
  sequence_number: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  resources?: Array<{id: string; title: string; url: string; type: string}>;
  duration?: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  is_completed: boolean;
  completed_at?: string;
  progress_percentage: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string;
  completed_lessons: string[];
  time_spent_minutes: number;
  last_accessed: string;
  created_at: string;
  updated_at: string;
}

// Helper functions
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email_confirmed_at) {
      return null;
    }

    // Get user profile from the users table with longer timeout
    const profilePromise = supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Add a 8 second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
    );

    const { data: profile, error: profileError } = await Promise.race([
      profilePromise,
      timeoutPromise
    ]) as any;

    if (profileError) {
      console.warn('Error fetching user profile:', profileError);
      // Return null if profile doesn't exist yet
      return null;
    }

    return profile as User;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

export async function signUp(email: string, password: string, name: string, role: 'learner' | 'tutor' = 'learner') {
  try {
    // Hardcode to production URL
    const emailRedirectUrl = 'https://learn-nova-odoo.netlify.app/confirm-email';
    console.log('🔍 SignUp - Email redirect URL:', emailRedirectUrl);

    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
        emailRedirectTo: emailRedirectUrl,
      },
    });

    // Check for actual auth errors that should prevent signup
    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      throw authError;
    }
    if (!user) {
      throw new Error('Sign up failed - no user returned');
    }

    // If we get here, the signup was successful
    console.log('✅ SignUp successful - user created, email sent:', {
      id: user.id,
      email: user.email,
      emailConfirmed: user.email_confirmed_at,
    });

    // Don't create user profile here during signup - it will be created during email confirmation
    // This avoids refresh token errors since the user doesn't have a confirmed session yet

    // Return a temporary user object for the UI, actual profile created during confirmation
    return {
      id: user.id,
      email,
      name,
      role,
      points: 0,
      badge_level: 0,
      is_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as User;
  } catch (error: any) {
    console.error('SignUp error:', error);

    // Only throw for actual signup failures, not secondary issues
    if (error?.message?.includes('User already registered') ||
        error?.message?.includes('already registered') ||
        error?.message?.includes('Password') ||
        error?.message?.includes('Invalid email') ||
        error?.message?.includes('signup disabled')) {
      throw error;
    }

    // For other errors, log them but don't prevent successful signup
    console.warn('Secondary signup error (not blocking):', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('email-not-confirmed');
      }
      throw error;
    }
    if (!user) throw new Error('Sign in failed');

    // Check if email is verified
    if (!user.email_confirmed_at) {
      throw new Error('email-not-confirmed');
    }

    // Wait a moment for auth locks to settle
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Get user profile with timeout
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // Add a 5 second timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (profileError) {
        console.warn('Profile fetch error, creating profile:', profileError);
        
        // If profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || email,
            name: user.user_metadata?.name || email.split('@')[0] || 'User',
            role: user.user_metadata?.role || 'learner',
            points: 0,
            badge_level: 0,
            is_verified: true,  // Mark as verified since email is confirmed
            is_active: true,
          })
          .select()
          .single();

        if (createError) throw createError;
        return newProfile as User;
      }

      // Update is_verified in database if not already
      if (!profile.is_verified) {
        await supabase
          .from('users')
          .update({ is_verified: true })
          .eq('id', user.id);
      }

      return profile as User;
    } catch (error: any) {
      if (error.message === 'Profile fetch timeout') {
        throw new Error('Sign in timeout. Please check your internet connection.');
      }
      throw error;
    }
  } catch (error: any) {
    console.error('SignIn error:', error);
    throw error;
  }
}

export async function verifyEmailToken(token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) throw error;
    if (!data.user) throw new Error('Email verification failed');

    // Create user profile in database after successful email verification
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
        role: data.user.user_metadata?.role || 'learner',
        points: 0,
        badge_level: 0,
        is_verified: true,  // Mark as verified since email is now confirmed
        is_active: true,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Don't throw error here - email is verified even if profile creation fails
      // Profile will be created during first login if needed
    }

    return data.user;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
}

export async function resendConfirmationEmail(email: string) {
  try {
    // Hardcode to production URL
    const emailRedirectUrl = 'https://learn-nova-odoo.netlify.app/confirm-email';
    console.log('🔍 Resend - Email redirect URL:', emailRedirectUrl);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: emailRedirectUrl,
      },
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Resend confirmation email error:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);

      // Provide more specific error messages
      if (error.message.includes('permission denied') || error.message.includes('policy')) {
        throw new Error('You do not have permission to update this profile');
      } else if (error.message.includes('violates')) {
        throw new Error('Invalid data provided');
      }

      throw new Error(error.message || 'Failed to update profile');
    }

    if (!data) {
      throw new Error('No data returned from update');
    }

    return data as User;
  } catch (error: any) {
    console.error('Update user profile error:', error);
    throw error;
  }
}

// Course functions
export async function getCourses() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Course[];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}

export async function getCourse(courseId: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) throw error;
    return data as Course;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
}

// Admin function to get all courses (published and unpublished)
export async function getAllCoursesForAdmin() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Course[];
  } catch (error) {
    console.error('Error fetching all courses for admin:', error);
    throw error;
  }
}

export async function deleteCourse(courseId: string) {
  try {
    // Delete related records first to avoid foreign key constraints
    // Try each individually so if one fails (e.g. table doesn't exist or cascade already handled it), it doesn't stop the main deletion
    await supabase.from('course_enrollments').delete().eq('course_id', courseId).catch(() => {});
    await supabase.from('lessons').delete().eq('course_id', courseId).catch(() => {});
    await supabase.from('user_progress').delete().eq('course_id', courseId).catch(() => {});
    await supabase.from('quizzes').delete().eq('course_id', courseId).catch(() => {});
    await supabase.from('course_reviews').delete().eq('course_id', courseId).catch(() => {});
    await supabase.from('certificates').delete().eq('course_id', courseId).catch(() => {});
    await supabase.from('course_invitations').delete().eq('course_id', courseId).catch(() => {});
    await supabase.from('announcements').delete().eq('course_id', courseId).catch(() => {});
    await supabase.from('discussions').delete().eq('course_id', courseId).catch(() => {});
    
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

export async function createCourse(courseData: {
  title: string;
  description?: string;
  instructor_id: string;
  instructor_name: string;
  cover_image?: string;
  is_published?: boolean;
  visibility?: string;
  access_rule?: string;
  price?: number | null;
  tags?: string[];
  duration?: string;
  level?: string;
  category?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...courseData,
        rating: 0,
        rating_count: 0,
        views: 0,
        is_published: courseData.is_published || false,
        visibility: courseData.visibility || 'public',
        access_rule: courseData.access_rule || 'open',
        tags: courseData.tags || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data as Course;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
}

export async function updateCourse(courseId: string, updates: Partial<Course>) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return data as Course;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
}

export async function getLessonsByCourse(courseId: string) {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('sequence_number', { ascending: true });

    if (error) throw error;
    return data as Lesson[];
  } catch (error) {
    console.error('Error fetching lessons for course:', error);
    throw error;
  }
}

export async function createLesson(lessonData: {
  course_id: string;
  title: string;
  type?: string;
  description?: string;
  content?: string;
  video_url?: string;
  video_duration?: number;
  sequence_number: number;
  is_published?: boolean;
}) {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .insert({ ...lessonData, is_published: lessonData.is_published ?? true })
      .select()
      .single();

    if (error) throw error;
    return data as Lesson;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
}

export async function updateLesson(lessonId: string, updates: Partial<Lesson>) {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', lessonId)
      .select()
      .single();

    if (error) throw error;
    return data as Lesson;
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
}

export async function deleteLessonFromDB(lessonId: string) {
  try {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
}

export async function getQuizzesByCourse(courseId: string) {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, quiz_questions(*)')
      .eq('course_id', courseId);

    if (error) throw error;
    return data.map((quiz: any) => ({
      id: quiz.id,
      title: quiz.title,
      courseId: quiz.course_id,
      questions: (quiz.quiz_questions || []).map((q: any) => ({
        id: q.id,
        text: q.question_text,
        options: q.options || [],
        correctAnswer: q.correct_option_index,
        basePoints: q.points,
      }))
    }));
  } catch (error) {
    console.error('Error fetching quizzes for course:', error);
    throw error;
  }
}



export async function createQuiz(quizData: {
  course_id: string;
  title: string;
  description?: string;
  is_published?: boolean;
}, questions: Array<{
  question_text: string;
  options: string[];
  correct_option_index: number;
  points: number;
  explanation?: string;
}>) {
  try {
    // 1. Create the quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({ ...quizData, is_published: quizData.is_published ?? true })
      .select()
      .single();

    if (quizError) throw quizError;

    // 2. Create the questions
    if (questions.length > 0) {
      const questionsWithQuizId = questions.map(q => ({
        ...q,
        quiz_id: quiz.id
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsWithQuizId);

      if (questionsError) {
        // Rollback quiz creation if questions fail
        await supabase.from('quizzes').delete().eq('id', quiz.id);
        throw questionsError;
      }
    }

    return quiz;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
}

export async function updateQuiz(quizId: string, quizData: {
  title?: string;
  description?: string;
  is_published?: boolean;
}, questions: Array<{
  question_text: string;
  options: string[];
  correct_option_index: number;
  points: number;
  explanation?: string;
}>) {
  try {
    // 1. Update the quiz
    const { error: quizError } = await supabase
      .from('quizzes')
      .update({ ...quizData, updated_at: new Date().toISOString() })
      .eq('id', quizId);

    if (quizError) throw quizError;

    // 2. Delete existing questions
    const { error: deleteError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId);

    if (deleteError) throw deleteError;

    // 3. Insert new questions
    if (questions.length > 0) {
      const questionsWithQuizId = questions.map(q => ({
        ...q,
        quiz_id: quizId
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsWithQuizId);

      if (questionsError) throw questionsError;
    }

    return true;
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw error;
  }
}

export async function deleteQuiz(quizId: string) {
  try {
    // The database should have ON DELETE CASCADE for questions,
    // but we can delete them explicitly just in case
    await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);
    
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw error;
  }
}

export async function getCourseReviews(courseId: string) {
  try {
    const { data, error } = await supabase
      .from('course_reviews')
      .select('*, users(name, avatar)')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map((review: any) => ({
      id: review.id,
      courseId: review.course_id,
      userId: review.user_id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      userName: review.users?.name || 'Unknown User',
      userAvatar: review.users?.avatar
    }));
  } catch (error) {
    console.error('Error fetching course reviews:', error);
    return [];
  }
}

export async function createCourseReview(reviewData: { course_id: string; user_id: string; rating: number; comment?: string }) {
  try {
    const { data, error } = await supabase
      .from('course_reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating course review:', error);
    throw error;
  }
}

// Enrollment functions
export async function enrollInCourse(userId: string, courseId: string) {
  try {
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress_percentage: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CourseEnrollment;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
}

export async function completeEnrollment(userId: string, courseId: string) {
  try {
    const { data, error } = await supabase
      .from('course_enrollments')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        progress_percentage: 100,
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .select()
      .single();

    if (error) throw error;
    return data as CourseEnrollment;
  } catch (error) {
    console.error('Error completing enrollment:', error);
    throw error;
  }
}

export async function getUserEnrollments(userId: string) {
  try {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        courses (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data as (CourseEnrollment & { courses: Course })[];
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    throw error;
  }
}

export async function isUserEnrolled(userId: string, courseId: string) {
  try {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
}

export async function getQuizzes() {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, quiz_questions(*)');

    if (error) throw error;
    
    // Map to the shape QuizzesPage expects
    return data.map((quiz: any) => ({
      id: quiz.id,
      title: quiz.title,
      courseId: quiz.course_id,
      questions: (quiz.quiz_questions || []).map((q: any) => ({
        id: q.id,
        text: q.question_text,
        options: q.options || [],
        correctAnswer: q.correct_option_index,
        basePoints: q.points,
        pointsPerAttempt: q.points
      }))
    }));
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
}

export async function getLessons() {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*');

    if (error) throw error;
    
    return data.map((lesson: any) => ({
      id: lesson.id,
      courseId: lesson.course_id,
      title: lesson.title,
      content: lesson.content || lesson.id // Some mock data used content as ID
    }));
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
}

export async function submitQuizAttempt(userId: string, quizId: string, score: number, pointsEarned: number) {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score: score,
        points_earned: pointsEarned,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Also update user points
    const { data: userProfile } = await supabase.from('users').select('points').eq('id', userId).single();
    if (userProfile) {
      await supabase.from('users').update({ points: userProfile.points + pointsEarned }).eq('id', userId);
    }
    
    return data;
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    throw error;
  }
}

export async function getUserProgress(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    
    // Map to types shape
    return data.map((p: any) => ({
      userId: p.user_id,
      courseId: p.course_id,
      completedLessons: p.completed_lessons || [],
      timeSpent: p.time_spent_minutes || 0,
      lastAccessed: p.last_accessed || p.created_at
    }));
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
}

export async function updateLessonProgress(userId: string, courseId: string, lessonId: string) {
  try {
    // First, check if progress exists
    const { data: existingProgress, error: fetchError } = await supabase
      .from('user_progress')
      .select('completed_lessons')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const currentCompleted = existingProgress?.completed_lessons || [];
    
    // If already completed, do nothing
    if (currentCompleted.includes(lessonId)) {
      return existingProgress;
    }

    const newCompleted = [...currentCompleted, lessonId];

    if (existingProgress) {
      // Update existing
      const { data, error } = await supabase
        .from('user_progress')
        .update({ 
          completed_lessons: newCompleted,
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          course_id: courseId,
          completed_lessons: newCompleted,
          last_accessed: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
}

export async function getUserCreatedCourses(userId: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', userId);

    if (error) throw error;
    return data as Course[];
  } catch (error) {
    console.error('Error fetching created courses:', error);
    throw error;
  }
}
