import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';
import { dbService } from '../services/dbService';

interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    university?: string;
    degree?: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_USER_KEY = 'pathpilot_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth session
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              user_metadata: session.user.user_metadata,
            };
            setUser(authUser);
            const prof = await dbService.getProfile(session.user.id);
            if (prof && isMounted) {
              setProfile(prof);
            } else if (isMounted) {
              const newProf = await dbService.upsertProfile({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || '',
              });
              setProfile(newProf);
            }
          }

          // Listen for auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return;
            if (session?.user) {
              const authUser: AuthUser = {
                id: session.user.id,
                email: session.user.email || '',
                user_metadata: session.user.user_metadata,
              };
              setUser(authUser);
              const prof = await dbService.getProfile(session.user.id);
              setProfile(prof);
            } else {
              setUser(null);
              setProfile(null);
            }
            setLoading(false);
          });

          return () => {
            subscription.unsubscribe();
          };
        } else {
          // Local fallback session
          const savedUser = localStorage.getItem(LOCAL_AUTH_USER_KEY);
          if (savedUser && isMounted) {
            const parsed = JSON.parse(savedUser) as AuthUser;
            setUser(parsed);
            const prof = await dbService.getProfile(parsed.id);
            setProfile(prof);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const prof = await dbService.getProfile(user.id);
      if (prof) setProfile(prof);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          return { error: error.message };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            user_metadata: { full_name: fullName },
          };
          setUser(authUser);
          const prof = await dbService.upsertProfile({
            id: data.user.id,
            email: data.user.email || email,
            full_name: fullName,
          });
          setProfile(prof);
        }
        return {};
      } else {
        // Local simulation fallback
        const mockId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const localUser: AuthUser = {
          id: mockId,
          email,
          user_metadata: { full_name: fullName },
        };
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(localUser));
        setUser(localUser);
        const prof = await dbService.upsertProfile({
          id: mockId,
          email,
          full_name: fullName,
        });
        setProfile(prof);
        return {};
      }
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during signup' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { error: error.message };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            user_metadata: data.user.user_metadata,
          };
          setUser(authUser);
          const prof = await dbService.getProfile(data.user.id);
          if (prof) {
            setProfile(prof);
          } else {
            const newProf = await dbService.upsertProfile({
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name || '',
            });
            setProfile(newProf);
          }
        }
        return {};
      } else {
        // Local fallback: retrieve or create profile
        const localUser: AuthUser = {
          id: `usr_${btoa(email).substring(0, 12)}`,
          email,
          user_metadata: { full_name: email.split('@')[0] },
        };
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(localUser));
        setUser(localUser);
        let prof = await dbService.getProfile(localUser.id);
        if (!prof) {
          prof = await dbService.upsertProfile({
            id: localUser.id,
            email,
            full_name: email.split('@')[0],
          });
        }
        setProfile(prof);
        return {};
      }
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during sign in' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(LOCAL_AUTH_USER_KEY);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: string; message?: string }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) return { error: error.message };
        return { message: 'Password reset link has been sent to your email.' };
      } else {
        return { message: 'In local mode: password reset instructions sent (simulated).' };
      }
    } catch (err: any) {
      return { error: err.message || 'Failed to send password reset' };
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<{ error?: string }> => {
    if (!user) return { error: 'No authenticated user found' };
    try {
      const updated = await dbService.upsertProfile({
        ...profile,
        ...data,
        id: user.id,
        email: user.email,
      });
      setProfile(updated);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
