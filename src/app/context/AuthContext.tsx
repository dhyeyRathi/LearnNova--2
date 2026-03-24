import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, User as SupabaseUser, signIn, signUp, signOut, getCurrentUser, updateUserProfile } from '../../utils/supabase/client';
import { User } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<{ success: boolean }>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for authenticated user on mount
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        // Only attempt to get user profile if we have a valid session
        if (error || !session?.user || !session.user.email_confirmed_at) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role as 'learner' | 'tutor' | 'admin',
            points: currentUser.points,
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Clear user on logout or invalid session
      if (!session?.user || !session.user.email_confirmed_at) {
        setUser(null);
      }
      // Don't automatically fetch user on login - let login() handle that
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const profile = await signIn(email, password);
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as 'learner' | 'tutor' | 'admin',
        points: profile.points,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Parse specific error messages from Supabase
      let errorMessage = 'Invalid email or password';
      const errorMsg = error?.message || '';
      
      // Check for email not confirmed error (exact match)
      if (errorMsg === 'email-not-confirmed' || errorMsg.includes('Email not confirmed') || errorMsg.toLowerCase().includes('email not confirmed')) {
        errorMessage = 'Please confirm your email before signing in';
      } else if (errorMsg.includes('invalid login credentials') || errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('password')) {
        errorMessage = 'Invalid email or password';
      } else if (errorMsg.includes('user was not found') || errorMsg.toLowerCase().includes('user not found')) {
        errorMessage = 'No account found with this email';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const profile = await signUp(email, password, name, 'learner');
      console.log('✅ Signup successful in AuthContext:', profile);
      // Don't set user state here - wait for email confirmation and login
      // User will log in after confirming email
      return { success: true };
    } catch (error: any) {
      console.error('❌ Signup error in AuthContext:', error);

      let errorMessage = 'An error occurred during signup';
      const errorCode = error?.message || '';

      // Check for specific Supabase auth errors
      if (errorCode.includes('User already registered') || errorCode.includes('already registered')) {
        errorMessage = 'An account with this email already exists';
      } else if (errorCode.includes('Password should be at least') || errorCode.includes('Password')) {
        errorMessage = 'Password must be at least 6 characters';
      } else if (errorCode.includes('Invalid email') || errorCode.includes('Email')) {
        errorMessage = 'Please enter a valid email address';
      } else if (errorCode.includes('signup disabled') || errorCode.includes('Signups not allowed')) {
        errorMessage = 'Account creation is currently disabled';
      } else {
        // Only show generic error for actual auth failures
        // Don't show error for successful signups with secondary issues
        console.warn('Unexpected signup error:', errorCode);
      }

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      try {
        // Update in database
        const updatedUser = await updateUserProfile(user.id, updates);
        // Update local state with the database response
        setUser(updatedUser);
        return { success: true };
      } catch (error) {
        console.error('Failed to update user:', error);
        throw error;
      }
    }
    throw new Error('No user logged in');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a default context instead of throwing
    console.warn('useAuth called outside AuthProvider, returning default');
    return {
      user: null,
      login: async () => ({ success: false, error: 'Auth not initialized' }),
      signup: async () => ({ success: false, error: 'Auth not initialized' }),
      logout: async () => {},
      updateUser: async () => ({ success: false }),
      isAuthenticated: false,
      isLoading: false,
    };
  }
  return context;
};