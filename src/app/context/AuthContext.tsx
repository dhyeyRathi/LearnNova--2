import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, User as SupabaseUser, signIn, signUp, signOut, getCurrentUser } from '../../utils/supabase/client';
import { User } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
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
      // Just clear user on logout, don't fetch on login
      // (login() will set the user after fetching profile)
      if (!session?.user) {
        setUser(null);
      }
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
      // Don't set user state here - wait for email confirmation and login
      // User will log in after confirming email
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'An error occurred during signup';
      const errorCode = error?.message || '';
      
      if (errorCode.includes('already registered')) {
        errorMessage = 'An account with this email already exists';
      } else if (errorCode.includes('Password')) {
        errorMessage = 'Password must be at least 6 characters';
      } else if (errorCode.includes('Email')) {
        errorMessage = 'Please enter a valid email address';
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

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};