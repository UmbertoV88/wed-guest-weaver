import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  is_wedding_organizer: boolean;
  wedding_date?: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else {
          setProfile({
            ...(data as any),
            wedding_date: (data as any).wedding_date || null
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateWeddingDate = async (date: Date | null): Promise<void> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const dateString = date ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}` : null;

    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        wedding_date: dateString,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()  // <-- AGGIUNGI .select() per ottenere i dati aggiornati
      .single();
    
    if (error) throw error;
    
    // AGGIUNGI: Aggiorna lo stato locale immediatamente
    if (data) {
      setProfile({
        ...(data as any),
        wedding_date: (data as any).wedding_date || null
      });
    }
  };

  
  const promoteToWeddingOrganizer = async (targetUserId: string) => {
    try {
      const { error } = await supabase.rpc('promote_to_wedding_organizer', {
        target_user_id: targetUserId
      });

      if (error) throw error;
      
      // Refresh profile if it's the current user
      if (targetUserId === user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) setProfile({
          ...(data as any),
          wedding_date: (data as any).wedding_date || null
        });
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      throw error;
    }
  };

  return {
    profile,
    loading,
    isWeddingOrganizer: profile?.is_wedding_organizer || false,
    promoteToWeddingOrganizer,
    updateWeddingDate
  };
};