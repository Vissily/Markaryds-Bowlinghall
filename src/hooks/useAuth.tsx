import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  cleanupAuthState, 
  auditLog, 
  trackFailedLogin, 
  isAccountLocked, 
  clearFailedAttempts,
  updateLastActivity,
  getLastActivity,
  isSessionExpired
} from '@/utils/authSecurity';
import { isValidEmail, validatePasswordStrength } from '@/utils/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = (userId: string) => {
      // Defer role fetching to prevent deadlocks and avoid calling Supabase inside the auth callback directly
      setTimeout(() => {
        supabase
          .rpc('get_user_role', { _user_id: userId })
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching user role:', error);
              setUserRole(null);
              return;
            }
            setUserRole(data);
          });
      }, 0);
    };

    // Set up auth state listener (callback MUST be sync)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    // Check for existing session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchRole(session.user.id);
        } else {
          setUserRole(null);
        }

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      // Validate inputs
      if (!isValidEmail(email)) {
        return { error: { message: 'Ogiltig e-postadress' } };
      }
      
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return { error: { message: passwordValidation.errors.join(', ') } };
      }
      
      // Clean up any existing auth state
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email
          }
        }
      });
      
      if (error) {
        auditLog({
          action: 'SIGNUP_FAILED',
          details: { email, error: error.message }
        });
        return { error };
      }
      
      auditLog({
        action: 'SIGNUP_SUCCESS',
        details: { email }
      });
      
      return { error: null };
    } catch (error) {
      auditLog({
        action: 'SIGNUP_ERROR',
        details: { email, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return { error };
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      // Validate inputs
      if (!isValidEmail(username)) {
        return { error: { message: 'Ogiltig e-postadress' } };
      }
      
      // Check if account is locked due to failed attempts
      if (isAccountLocked(username)) {
        auditLog({
          action: 'LOGIN_BLOCKED_LOCKED_ACCOUNT',
          details: { email: username }
        });
        return { error: { message: 'Kontot är tillfälligt låst på grund av för många misslyckade inloggningsförsök. Försök igen om 15 minuter.' } };
      }
      
      // Clean up existing state before signing in
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });
      
      if (error) {
        trackFailedLogin(username);
        auditLog({
          action: 'LOGIN_FAILED',
          details: { email: username, error: error.message }
        });
        return { error };
      }
      
      if (data.user) {
        clearFailedAttempts(username);
        updateLastActivity();
        
        auditLog({
          action: 'LOGIN_SUCCESS',
          userId: data.user.id,
          details: { email: username }
        });
        
        // Force page reload for clean state
        window.location.href = '/';
      }
      
      return { error: null };
    } catch (error) {
      trackFailedLogin(username);
      auditLog({
        action: 'LOGIN_ERROR',
        details: { email: username, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const currentUser = user;
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      auditLog({
        action: 'LOGOUT',
        userId: currentUser?.id,
        details: { email: currentUser?.email }
      });
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      auditLog({
        action: 'LOGOUT_ERROR',
        userId: user?.id,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};