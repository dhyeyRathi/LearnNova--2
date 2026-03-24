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
  description?: string;
  content?: string;
  video_url?: string;
  video_duration?: number;
  reading_time_minutes?: number;
  sequence_number: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
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
