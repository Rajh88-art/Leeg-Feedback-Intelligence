'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_AUTH_COOKIE = 'leeg_auth_session';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const isConfig = isSupabaseConfigured();
    setConfigured(isConfig);

    const initializeAuth = async () => {
      try {
        if (isConfig) {
          // Check live Supabase session
          const { data, error } = await supabase.auth.getSession();
          if (!error && data?.session?.user) {
            setSession(data.session);
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              role: data.session.user.role || 'authenticated',
              created_at: data.session.user.created_at,
            });
            setLoading(false);
            return;
          }
        }

        // Check fallback session cookie
        const savedSession = getCookie(DEMO_AUTH_COOKIE);
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (parsed && parsed.email) {
              setUser(parsed);
              setLoading(false);
              return;
            }
          } catch {
            removeCookie(DEMO_AUTH_COOKIE);
          }
        }
      } catch (err) {
        console.error('Error initializing auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    if (isConfig) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        if (currentSession?.user) {
          setSession(currentSession);
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            role: currentSession.user.role || 'authenticated',
            created_at: currentSession.user.created_at,
          });
        } else {
          // Check if fallback demo cookie is present
          const savedSession = getCookie(DEMO_AUTH_COOKIE);
          if (!savedSession) {
            setSession(null);
            setUser(null);
          }
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [supabase]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      if (configured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { error: error.message };
        }

        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || email,
            role: data.user.role || 'authenticated',
            created_at: data.user.created_at,
          });
          setSession(data.session);
          // Set cookie for middleware redundancy
          setCookie(
            DEMO_AUTH_COOKIE,
            JSON.stringify({
              id: data.user.id,
              email: data.user.email || email,
              role: 'authenticated',
            })
          );
          return { error: null };
        }
      }

      // Demo/Prototype fallback if Supabase keys are not connected yet
      if (!email || !password) {
        return { error: 'Please enter both email and password.' };
      }
      if (password.length < 6) {
        return { error: 'Password must be at least 6 characters long.' };
      }

      const mockUser: AuthUser = {
        id: `usr_${Date.now().toString(36)}`,
        email: email.trim().toLowerCase(),
        role: 'authenticated',
        created_at: new Date().toISOString(),
      };

      setCookie(DEMO_AUTH_COOKIE, JSON.stringify(mockUser));
      setUser(mockUser);
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'An unexpected error occurred during sign in.' };
    }
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<{ error: string | null; message?: string }> => {
    try {
      if (configured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          return { error: error.message };
        }

        if (data?.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || email,
            role: data.session.user.role || 'authenticated',
            created_at: data.session.user.created_at,
          });
          setSession(data.session);
          setCookie(
            DEMO_AUTH_COOKIE,
            JSON.stringify({
              id: data.session.user.id,
              email: data.session.user.email || email,
              role: 'authenticated',
            })
          );
          return { error: null, message: 'Account created and signed in successfully!' };
        } else if (data?.user && !data.session) {
          // Supabase email confirmation requirement
          return {
            error: null,
            message:
              'Account created! If confirmation is enabled, please check your inbox to confirm your email, or sign in now.',
          };
        }
      }

      // Demo/Prototype fallback
      if (!email || !password) {
        return { error: 'Please enter both email and password.' };
      }
      if (password.length < 6) {
        return { error: 'Password must be at least 6 characters.' };
      }

      const mockUser: AuthUser = {
        id: `usr_${Date.now().toString(36)}`,
        email: email.trim().toLowerCase(),
        role: 'authenticated',
        created_at: new Date().toISOString(),
      };

      setCookie(DEMO_AUTH_COOKIE, JSON.stringify(mockUser));
      setUser(mockUser);
      return {
        error: null,
        message: 'Account successfully registered and signed in!',
      };
    } catch (err: any) {
      return { error: err?.message || 'An unexpected error occurred during sign up.' };
    }
  };

  const signOut = async () => {
    try {
      if (configured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error during Supabase sign out:', err);
    } finally {
      removeCookie(DEMO_AUTH_COOKIE);
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
