import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signingOut: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: (showConfirmation?: boolean) => Promise<void>;
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
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });
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
      console.error('Logout error:', error);
      
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

  const value = {
    user,
    session,
    loading,
    signingOut,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};