import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer role fetching to prevent deadlocks
          setTimeout(async () => {
            try {
              const { data: roleData } = await supabase
                .rpc('get_user_role', { _user_id: session.user.id });
              setUserRole(roleData);
            } catch (error) {
              console.error('Error fetching user role:', error);
            }
          }, 0);
        } else {
          // Only clear state if it's not the hardcoded admin user
          if (user?.id !== 'admin-user-id') {
            setUserRole(null);
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
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
        console.error('Sign up error:', error.message);
        return { error };
      }
      
      console.log('Sign up successful - check email for confirmation');
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      // Check for hardcoded admin credentials
      if (username === 'admin' && password === 'admin') {
        // Create a mock user for the admin
        const adminUser = {
          id: 'admin-user-id',
          email: 'admin@markarydsbowling.se',
          user_metadata: { display_name: 'Admin' }
        } as any;
        
        setUser(adminUser);
        setUserRole('admin');
        setLoading(false);
        
        console.log('Admin login successful');
        window.location.href = '/admin';
        return { error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error.message);
        return { error };
      }
      
      if (data.user) {
        window.location.href = '/';
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Check if it's the hardcoded admin user
      if (user?.id === 'admin-user-id') {
        setUser(null);
        setUserRole(null);
        setSession(null);
        console.log('Admin logout successful');
        window.location.href = '/';
        return;
      }

      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
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