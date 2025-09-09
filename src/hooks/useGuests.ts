import { useState, useEffect } from 'react';
import { Guest, GuestFormData, GuestStats, GuestStatus } from '@/types/guest';

const STORAGE_KEY = 'wedding-guests';

export const useGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load guests from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const guestsWithDates = parsed.map((guest: any) => ({
          ...guest,
          createdAt: new Date(guest.createdAt),
          updatedAt: new Date(guest.updatedAt),
          deletedAt: guest.deletedAt ? new Date(guest.deletedAt) : undefined,
        }));
        setGuests(guestsWithDates);
      }
    } catch (error) {
      console.error('Error loading guests from storage:', error);
    }
    setLoading(false);
  }, []);

  // Save guests to localStorage whenever guests change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
      } catch (error) {
        console.error('Error saving guests to storage:', error);
      }
    }
  }, [guests, loading]);

  const addGuest = (formData: GuestFormData): Guest => {
    const newGuest: Guest = {
      id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      category: formData.category,
      companions: formData.companions.map((comp, index) => ({
        id: `companion-${Date.now()}-${index}`,
        name: comp.name,
        allergies: comp.allergies || undefined,
      })),
      allergies: formData.allergies || undefined,
      status: 'pending' as GuestStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setGuests(prev => [...prev, newGuest]);
    return newGuest;
  };

  const updateGuestStatus = (guestId: string, status: GuestStatus) => {
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
  };

  const deleteGuest = (guestId: string) => {
    updateGuestStatus(guestId, 'deleted');
  };

  const restoreGuest = (guestId: string) => {
    updateGuestStatus(guestId, 'pending');
  };

  const confirmGuest = (guestId: string) => {
    updateGuestStatus(guestId, 'confirmed');
  };

  const permanentlyDeleteGuest = (guestId: string) => {
    setGuests(prev => prev.filter(guest => guest.id !== guestId));
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