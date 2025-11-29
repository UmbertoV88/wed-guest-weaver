import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from './useUserRoles';

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
  const { isWeddingOrganizer: roleBasedOrganizer, loading: rolesLoading } = useUserRoles();

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Try to load from cache first
      const cacheKey = user ? `wedding_user_profile_${user.id}` : null;
      if (cacheKey) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
            setLoading(false); // Show cached data immediately
          } catch (e) {
            console.error('Error parsing cached profile:', e);
            localStorage.removeItem(cacheKey);
          }
        }
      }

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // 2. Fetch from DB (background update)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          if (!cacheKey || !localStorage.getItem(cacheKey)) {
             setProfile(null);
          }
        } else {
          const newProfile = {
            ...(data as any),
            wedding_date: (data as any).wedding_date || null
          };
          
          // Update state and cache
          setProfile(newProfile);
          if (cacheKey) {
            localStorage.setItem(cacheKey, JSON.stringify(newProfile));
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (!cacheKey || !localStorage.getItem(cacheKey)) {
           setProfile(null);
        }
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
      .select()
      .single();
    
    if (error) throw error;
    
    if (data) {
      const newProfile = {
        ...(data as any),
        wedding_date: (data as any).wedding_date || null
      };
      setProfile(newProfile);
      localStorage.setItem(`wedding_user_profile_${user.id}`, JSON.stringify(newProfile));
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
        
        if (data) {
          const newProfile = {
            ...(data as any),
            wedding_date: (data as any).wedding_date || null
          };
          setProfile(newProfile);
          localStorage.setItem(`wedding_user_profile_${user.id}`, JSON.stringify(newProfile));
        }
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      throw error;
    }
  };

  return {
    profile,
    loading: loading || rolesLoading,
    // Use role-based check (secure) with fallback to profile field (backward compatibility)
    isWeddingOrganizer: roleBasedOrganizer || profile?.is_wedding_organizer || false,
    promoteToWeddingOrganizer,
    updateWeddingDate
  };
};