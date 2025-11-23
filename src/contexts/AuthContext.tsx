import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import { SessionWarningDialog } from '@/components/SessionWarningDialog';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signingOut: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: (showConfirmation?: boolean) => Promise<void>;
  extendSession: () => void;
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
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

    // Initialize trial period for new user
    if (!error && data.user) {
      try {
        const { stripeService } = await import('@/services/stripeService');
        await stripeService.initializeTrialPeriod(data.user.id);
      } catch (trialError) {
        console.error('Error initializing trial:', trialError);
        // Don't fail signup if trial initialization fails
      }
    }

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
      toast({
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

      toast({
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
      toast({
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
    toast({
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
    loading,
    signingOut,
    signIn,
    signUp,
    signOut,
    extendSession,
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