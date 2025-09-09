import { useState, useEffect } from 'react';
import { Guest, GuestFormData, GuestStats, GuestStatus } from '@/types/guest';
import { supabase } from '@/integrations/supabase/client';

export const useGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load guests from Supabase and set up realtime subscription
  useEffect(() => {
    const loadGuests = async () => {
      try {
        const { data: guestsData, error: guestsError } = await supabase
          .from('guests')
          .select(`
            *,
            companions:companions(*)
          `)
          .order('created_at', { ascending: false });

        if (guestsError) {
          console.error('Error loading guests:', guestsError);
          return;
        }

        const transformedGuests: Guest[] = (guestsData || []).map((guest: any) => ({
          id: guest.id,
          name: guest.name,
          category: guest.category,
          allergies: guest.allergies || undefined,
          status: guest.status,
          createdAt: new Date(guest.created_at),
          updatedAt: new Date(guest.updated_at),
          deletedAt: guest.deleted_at ? new Date(guest.deleted_at) : undefined,
          companions: (guest.companions || []).map((comp: any) => ({
            id: comp.id,
            name: comp.name,
            allergies: comp.allergies || undefined,
          })),
        }));

        setGuests(transformedGuests);
      } catch (error) {
        console.error('Error loading guests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGuests();

    // Set up realtime subscription
    const channel = supabase
      .channel('guests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guests'
        },
        () => {
          // Reload guests when any change happens
          loadGuests();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companions'
        },
        () => {
          // Reload guests when companions change
          loadGuests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addGuest = async (formData: GuestFormData): Promise<Guest> => {
    try {
      // Insert guest
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .insert({
          name: formData.name,
          category: formData.category,
          allergies: formData.allergies || null,
        })
        .select()
        .single();

      if (guestError) throw guestError;

      // Insert companions if any
      if (formData.companions.length > 0) {
        const { error: companionsError } = await supabase
          .from('companions')
          .insert(
            formData.companions.map(comp => ({
              guest_id: guestData.id,
              name: comp.name,
              allergies: comp.allergies || null,
            }))
          );

        if (companionsError) throw companionsError;
      }

      const newGuest: Guest = {
        id: guestData.id,
        name: guestData.name,
        category: guestData.category,
        allergies: guestData.allergies || undefined,
        status: guestData.status,
        createdAt: new Date(guestData.created_at),
        updatedAt: new Date(guestData.updated_at),
        deletedAt: guestData.deleted_at ? new Date(guestData.deleted_at) : undefined,
        companions: formData.companions.map(comp => ({
          id: `temp-${Date.now()}`, // Will be updated by realtime
          name: comp.name,
          allergies: comp.allergies || undefined,
        })),
      };

      // Update local state immediately
      setGuests(prev => [newGuest, ...prev]);
      return newGuest;
    } catch (error) {
      console.error('Error adding guest:', error);
      throw error;
    }
  };

  const updateGuestStatus = async (guestId: string, status: GuestStatus) => {
    try {
      const { error } = await supabase
        .from('guests')
        .update({ 
          status,
          deleted_at: status === 'deleted' ? new Date().toISOString() : null
        })
        .eq('id', guestId);

      if (error) throw error;

      // Update local state immediately
      setGuests(prev => prev.map(guest => 
        guest.id === guestId 
          ? { 
              ...guest, 
              status, 
              updatedAt: new Date(),
              deletedAt: status === 'deleted' ? new Date() : undefined
            }
          : guest
      ));
    } catch (error) {
      console.error('Error updating guest status:', error);
      throw error;
    }
  };

  const deleteGuest = (guestId: string) => {
    return updateGuestStatus(guestId, 'deleted');
  };

  const restoreGuest = (guestId: string) => {
    return updateGuestStatus(guestId, 'pending');
  };

  const confirmGuest = (guestId: string) => {
    return updateGuestStatus(guestId, 'confirmed');
  };

  const permanentlyDeleteGuest = async (guestId: string) => {
    try {
      // Delete companions first
      await supabase
        .from('companions')
        .delete()
        .eq('guest_id', guestId);

      // Delete guest
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guestId);

      if (error) throw error;

      // Update local state immediately
      setGuests(prev => prev.filter(guest => guest.id !== guestId));
    } catch (error) {
      console.error('Error permanently deleting guest:', error);
      throw error;
    }
  };

  const getGuestsByStatus = (status: GuestStatus) => {
    return guests.filter(guest => guest.status === status);
  };

  const getStats = (): GuestStats => {
    const total = guests.length;
    const confirmed = guests.filter(g => g.status === 'confirmed').length;
    const pending = guests.filter(g => g.status === 'pending').length;
    const deleted = guests.filter(g => g.status === 'deleted').length;

    const byCategory = guests.reduce((acc, guest) => {
      if (guest.status !== 'deleted') {
        acc[guest.category] = (acc[guest.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalWithCompanions = guests
      .filter(g => g.status !== 'deleted')
      .reduce((sum, guest) => sum + 1 + guest.companions.length, 0);

    return {
      total,
      confirmed,
      pending, 
      deleted,
      byCategory: byCategory as any,
      totalWithCompanions
    };
  };

  return {
    guests,
    loading,
    addGuest,
    updateGuestStatus,
    deleteGuest,
    restoreGuest,
    confirmGuest,
    permanentlyDeleteGuest,
    getGuestsByStatus,
    getStats,
  };
};