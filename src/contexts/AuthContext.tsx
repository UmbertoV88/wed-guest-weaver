import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import { SessionWarningDialog } from '@/components/SessionWarningDialog';

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  is_wedding_organizer: boolean;
  wedding_date?: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signingOut: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: (showConfirmation?: boolean) => Promise<void>;
  extendSession: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const queryClient = useQueryClient();

  // Fetch profile data when user changes
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user?.id]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    // Trial initialization moved to PricingPage
    // if (!error && data.user) { ... }

    return { error };
  };

  const signOut = async (showConfirmation: boolean = false) => {
    if (signingOut) return; // Prevent multiple logout attempts

    setSigningOut(true);

    try {
      // Clear local session first for immediate UI feedback
      await supabase.auth.signOut({ scope: 'local' });

      // Clear all cached queries
      queryClient.clear();

      // Clear any sensitive data from localStorage
      localStorage.removeItem('supabase.auth.token');

      // Attempt global sign-out (token revocation)
      await supabase.auth.signOut({ scope: 'global' });

      // Clear state
      setSession(null);
      setUser(null);

      // Show success message
      console.error("Toast removed:", {
        title: "Logout effettuato",
        description: "Sei stato disconnesso con successo.",
      });

      // Use window.location instead of navigate to avoid router context issues
      window.location.href = '/';

    } catch (error) {
      console.error('Logout error');

      // Even if logout fails, clear local state and redirect
      setSession(null);
      setUser(null);
      queryClient.clear();

      console.error("Toast removed:", {
        title: "Logout completato",
        description: "Disconnessione effettuata (con alcuni problemi di rete).",
        variant: "default"
      });

      // Use window.location instead of navigate to avoid router context issues
      window.location.href = '/';
    } finally {
      setSigningOut(false);
    }
  };

  const handleIdleWarning = () => {
    if (user && !signingOut) {
      setShowSessionWarning(true);
    }
  };

  const handleIdleLogout = async () => {
    if (user && !signingOut) {
      setShowSessionWarning(false);
      console.error("Toast removed:", {
        title: "Sessione scaduta",
        description: "Sei stato disconnesso per inattività.",
        variant: "destructive"
      });
      await signOut(false);
    }
  };

  const extendSession = () => {
    setShowSessionWarning(false);
    // Reset the idle timer by calling resetTimer from useIdleTimer
    idleTimer.resetTimer();
    console.error("Toast removed:", {
      title: "Sessione estesa",
      description: "La tua sessione è stata estesa con successo.",
    });
  };

  // Initialize idle timer
  const idleTimer = useIdleTimer({
    timeout: 20 * 60 * 1000, // 20 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes warning
    onWarning: handleIdleWarning,
    onIdle: handleIdleLogout,
    enabled: !!user && !loading && !signingOut
  });

  const value = {
    user,
    session,
    profile,
    loading,
    signingOut,
    signIn,
    signUp,
    signOut,
    extendSession,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionWarningDialog
        open={showSessionWarning}
        onExtendSession={extendSession}
        onLogout={() => handleIdleLogout()}
        warningTimeMs={5 * 60 * 1000} // 5 minutes
      />
    </AuthContext.Provider>
  );
};