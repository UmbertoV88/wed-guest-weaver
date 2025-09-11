import { useState, useEffect } from 'react';
import { Guest, GuestFormData, GuestStats, GuestStatus, GuestCategory } from '@/types/guest';
import { supabase } from '@/integrations/supabase/client';

// Utilities to map DB rows (invitati/unita_invito) to app Guest model
const mapDbCategoryToGuestCategory = (value?: string | null): GuestCategory => {
  const allowed: GuestCategory[] = ['family-his', 'family-hers', 'friends', 'colleagues'];
  if (value && allowed.includes(value as GuestCategory)) return value as GuestCategory;
  return 'friends';
};

const parseNote = (note?: string | null): { allergies?: string | null; deleted_at?: string | null } => {
  if (!note) return {};
  try {
    const obj = JSON.parse(note);
    if (obj && typeof obj === 'object') return obj;
  } catch {}
  // legacy simple format e.g. "deleted_at:2025-01-01T00:00:00Z"
  if (note.includes('deleted_at:')) {
    const ts = note.split('deleted_at:')[1]?.trim();
    return { deleted_at: ts || undefined };
  }
  return { allergies: note };
};

const buildNote = (data: { allergies?: string | null; deleted_at?: string | null }) =>
  JSON.stringify({ allergies: data.allergies ?? null, deleted_at: data.deleted_at ?? null });

export const useGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load guests from Supabase (invitati grouped by unita_invito) and set up realtime subscription
  useEffect(() => {
    const loadGuests = async () => {
      try {
        // Fetch all invitati and group by unita_invito_id
        const { data, error } = await supabase
          .from('invitati')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading invitati:', error);
          return;
        }

        const byUnit = new Map<number, any[]>();
        (data || []).forEach((row: any) => {
          if (!row.unita_invito_id) return;
          const arr = byUnit.get(row.unita_invito_id) || [];
          arr.push(row);
          byUnit.set(row.unita_invito_id, arr);
        });

        const transformed: Guest[] = Array.from(byUnit.entries()).map(([unitId, rows]) => {
          const primary = (rows as any[]).find(r => r.is_principale) || (rows as any[])[0];
          const primaryNote = parseNote(primary?.note);

          const status: GuestStatus = primaryNote.deleted_at
            ? 'deleted'
            : primary?.confermato
              ? 'confirmed'
              : 'pending';

          const companions = (rows as any[])
            .filter(r => r.id !== primary.id)
            .map(r => {
              const n = parseNote(r.note);
              return {
                id: String(r.id),
                name: r.nome_visualizzato || [r.nome, r.cognome].filter(Boolean).join(' '),
                allergies: n.allergies || undefined,
              };
            });

          const name = primary?.nome_visualizzato || [primary?.nome, primary?.cognome].filter(Boolean).join(' ') || 'Ospite';

          return {
            id: String(unitId), // use the unit id as Guest id in the app
            name,
            category: mapDbCategoryToGuestCategory(primary?.gruppo),
            allergies: primaryNote.allergies || undefined,
            status,
            companions,
            createdAt: new Date(primary?.created_at || Date.now()),
            updatedAt: new Date(primary?.created_at || Date.now()),
            deletedAt: primaryNote.deleted_at ? new Date(primaryNote.deleted_at) : undefined,
          } as Guest;
        });

        setGuests(transformed);
      } catch (err) {
        console.error('Error loading guests (mapped from invitati):', err);
      } finally {
        setLoading(false);
      }
    };

    loadGuests();

    // Realtime: listen to invitati changes and reload
    const channel = supabase
      .channel('invitati_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitati' },
        () => loadGuests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addGuest = async (formData: GuestFormData): Promise<Guest> => {
    try {
      // 1) Create a new invitation unit
      const { data: unit, error: unitError } = await supabase
        .from('unita_invito')
        .insert({})
        .select()
        .single();

      if (unitError) throw unitError;

      // 2) Insert primary invitato + companions
      const rows: any[] = [
        {
          unita_invito_id: unit.id,
          is_principale: true,
          nome_visualizzato: formData.name,
          gruppo: formData.category,
          confermato: false,
          note: buildNote({ allergies: formData.allergies ?? null, deleted_at: null }),
        },
        ...formData.companions.map((c) => ({
          unita_invito_id: unit.id,
          is_principale: false,
          nome_visualizzato: c.name,
          gruppo: formData.category,
          confermato: false,
          note: buildNote({ allergies: c.allergies ?? null, deleted_at: null }),
        })),
      ];

      const { data: inserted, error: insertError } = await supabase
        .from('invitati')
        .insert(rows)
        .select();

      if (insertError) throw insertError;

      const primary = (inserted || []).find((r: any) => r.is_principale) || (inserted || [])[0];
      const companions = (inserted || [])
        .filter((r: any) => !r.is_principale)
        .map((r: any) => {
          const n = parseNote(r.note);
          return {
            id: String(r.id),
            name: r.nome_visualizzato,
            allergies: n.allergies || undefined,
          };
        });

      const note = parseNote(primary?.note);

      const newGuest: Guest = {
        id: String(unit.id),
        name: primary?.nome_visualizzato || formData.name,
        category: mapDbCategoryToGuestCategory(primary?.gruppo || formData.category),
        allergies: note.allergies || undefined,
        status: 'pending',
        companions,
        createdAt: new Date(primary?.created_at || Date.now()),
        updatedAt: new Date(primary?.created_at || Date.now()),
      };

      // optimistic local update
      setGuests((prev) => [newGuest, ...prev]);
      return newGuest;
    } catch (error) {
      console.error('Error adding guest (invitati):', error);
      throw error;
    }
  };

  const updateGuestStatus = async (guestId: string, status: GuestStatus) => {
    const unitId = parseInt(guestId, 10);
    if (Number.isNaN(unitId)) throw new Error('Invalid guest id');

    // Optimistic update - update UI immediately
    const previousState = guests.find(g => g.id === guestId);
    
    if (status === 'confirmed' || status === 'pending') {
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guestId
            ? { ...g, status, updatedAt: new Date(), deletedAt: undefined }
            : g
        )
      );
    } else if (status === 'deleted') {
      const deletedAt = new Date();
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guestId
            ? { ...g, status: 'deleted', updatedAt: new Date(), deletedAt }
            : g
        )
      );
    }

    try {
      if (status === 'confirmed' || status === 'pending') {
        const { error } = await supabase
          .from('invitati')
          .update({ confermato: status === 'confirmed' })
          .eq('unita_invito_id', unitId);
        if (error) throw error;
      } else if (status === 'deleted') {
        const deletedAt = new Date().toISOString();
        const { error } = await supabase
          .from('invitati')
          .update({ note: buildNote({ allergies: null, deleted_at: deletedAt }) })
          .eq('unita_invito_id', unitId);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating guest status (invitati):', error);
      // Revert optimistic update on error
      if (previousState) {
        setGuests((prev) =>
          prev.map((g) => g.id === guestId ? previousState : g)
        );
      }
      throw error;
    }
  };

  const deleteGuest = (guestId: string) => updateGuestStatus(guestId, 'deleted');
  const restoreGuest = async (guestId: string) => {
    const unitId = parseInt(guestId, 10);
    const previousState = guests.find(g => g.id === guestId);
    
    // Optimistic update - update UI immediately
    setGuests((prev) => 
      prev.map((g) => 
        g.id === guestId 
          ? { ...g, status: 'pending' as GuestStatus, deletedAt: undefined, updatedAt: new Date() } 
          : g
      )
    );

    try {
      const { error } = await supabase
        .from('invitati')
        .update({ note: buildNote({ allergies: null, deleted_at: null }) })
        .eq('unita_invito_id', unitId);
      if (error) throw error;
    } catch (error) {
      console.error('Error restoring guest (invitati):', error);
      // Revert optimistic update on error
      if (previousState) {
        setGuests((prev) => prev.map((g) => g.id === guestId ? previousState : g));
      }
      throw error;
    }
  };
  const confirmGuest = (guestId: string) => updateGuestStatus(guestId, 'confirmed');

  const permanentlyDeleteGuest = async (guestId: string) => {
    const unitId = parseInt(guestId, 10);
    const previousState = guests.find(g => g.id === guestId);
    
    // Optimistic update - remove from UI immediately
    setGuests((prev) => prev.filter((g) => g.id !== guestId));

    try {
      // Delete all invitati in the unit
      const { error: invErr } = await supabase
        .from('invitati')
        .delete()
        .eq('unita_invito_id', unitId);
      if (invErr) throw invErr;
      // Optionally remove the unit itself
      await supabase.from('unita_invito').delete().eq('id', unitId);
    } catch (error) {
      console.error('Error permanently deleting guest (invitati):', error);
      // Revert optimistic update on error
      if (previousState) {
        setGuests((prev) => [...prev, previousState]);
      }
      throw error;
    }
  };

  const getGuestsByStatus = (status: GuestStatus) => guests.filter((g) => g.status === status);

  const getStats = (): GuestStats => {
    const total = guests.length;
    const confirmed = guests.filter((g) => g.status === 'confirmed').length;
    const pending = guests.filter((g) => g.status === 'pending').length;
    const deleted = guests.filter((g) => g.status === 'deleted').length;

    const byCategory = guests.reduce((acc, g) => {
      if (g.status !== 'deleted') {
        // Count main guest + companions
        const totalInCategory = 1 + g.companions.length;
        acc[g.category] = (acc[g.category] || 0) + totalInCategory;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalWithCompanions = guests
      .filter((g) => g.status !== 'deleted')
      .reduce((sum, g) => sum + 1 + g.companions.length, 0);

    return {
      total,
      confirmed,
      pending,
      deleted,
      byCategory: byCategory as any,
      totalWithCompanions,
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