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
    
    if (error || !user) {
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
    // Use env var if available, otherwise use window.location.origin
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    
    // Create auth user with email confirmation
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
        emailRedirectTo: `${appUrl}/confirm-email`,
      },
    });

    if (authError) {
      throw authError;
    }
    if (!user) throw new Error('Sign up failed');

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email,
        name,
        role,
        points: 0,
        badge_level: 0,
        is_verified: false,  // Require email verification
        is_active: true,
      })
      .select()
      .single();

    if (profileError) throw profileError;
    return profile as User;
  } catch (error) {
    console.error('SignUp error:', error);
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

    // Update user as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', data.user.id);

    if (updateError) throw updateError;

    return data.user;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
}

export async function resendConfirmationEmail(email: string) {
  try {
    // Use env var if available, otherwise use window.location.origin
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${appUrl}/confirm-email`,
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
