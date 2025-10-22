import { useState, useEffect, useCallback } from 'react';
import { Guest, GuestFormData, GuestStats, GuestStatus, GuestCategory, AgeGroup } from '@/types/guest';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Utilities to map DB rows (invitati/unita_invito) to app Guest model
const mapDbCategoryToGuestCategory = (value?: string | null): GuestCategory => {
  const allowed: GuestCategory[] = ['family-his', 'family-hers', 'friends', 'colleagues'];
  if (value && allowed.includes(value as GuestCategory)) return value as GuestCategory;
  return 'friends';
};

const mapDbAgeGroupToAgeGroup = (value?: string | null): AgeGroup | undefined => {
  const allowed: AgeGroup[] = ['Adulto', 'Ragazzo', 'Bambino'];
  if (value && allowed.includes(value as AgeGroup)) return value as AgeGroup;
  return undefined;
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
  const [companionLoading, setCompanionLoading] = useState<string | null>(null);
  const { user } = useAuth();

  // Load guests from Supabase (invitati grouped by unita_invito) - stable callback for manual refreshes
  const loadGuests = useCallback(async () => {
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

      const transformed: Guest[] = [];
      
      Array.from(byUnit.entries()).forEach(([unitId, rows]) => {
        const primary = (rows as any[]).find(r => r.is_principale) || (rows as any[])[0];
        const primaryNote = parseNote(primary?.note);

        const primaryStatus: GuestStatus = primaryNote.deleted_at
          ? 'deleted'
          : primary?.confermato
            ? 'confirmed'
            : 'pending';

        const companions = (rows as any[])
          .filter(r => r.id !== primary.id)
          .map(r => {
            const n = parseNote(r.note);
            const companionStatus: GuestStatus = n.deleted_at
              ? 'deleted'
              : r.confermato
                ? 'confirmed'
                : 'pending';
            return {
              id: String(r.id),
              name: r.nome_visualizzato || [r.nome, r.cognome].filter(Boolean).join(' '),
              allergies: n.allergies || undefined,
              status: companionStatus,
              ageGroup: mapDbAgeGroupToAgeGroup(r.fascia_eta),
              dbRow: r, // Keep reference to original data
            };
          });

        const primaryName = primary?.nome_visualizzato || [primary?.nome, primary?.cognome].filter(Boolean).join(' ') || 'Ospite';
        const category = mapDbCategoryToGuestCategory(primary?.gruppo);

        // Group companions by status
        const companionsByStatus = companions.reduce((acc, comp) => {
          if (!acc[comp.status]) acc[comp.status] = [];
          acc[comp.status].push(comp);
          return acc;
        }, {} as Record<GuestStatus, any[]>);

        // Create entries based on status combinations
        const statusesPresent = new Set([primaryStatus, ...companions.map(c => c.status)]);
        
        statusesPresent.forEach(status => {
          const isForPrimary = primaryStatus === status;
          const companionsWithSameStatus = companionsByStatus[status] || [];
          
          const baseGuest = {
            id: `${unitId}_${status}`, // Unique ID per unit per status
            category,
            status,
            createdAt: new Date(primary?.created_at || Date.now()),
            updatedAt: new Date(primary?.created_at || Date.now()),
            deletedAt: status === 'deleted' ? new Date() : undefined,
            unitId: String(unitId), // Keep reference to original unit
          };
          
          // Always create entry if there are people with this status
          if (isForPrimary && companionsWithSameStatus.length > 0) {
            // Primary + companions with same status - grouped together
            transformed.push({
              ...baseGuest,
              name: primaryName,
              allergies: primaryNote.allergies || undefined,
              containsPrimary: true,
              ageGroup: mapDbAgeGroupToAgeGroup(primary?.fascia_eta),
              companions: companionsWithSameStatus.map(comp => ({
                id: comp.id,
                name: comp.name,
                allergies: comp.allergies,
                status: comp.status,
                ageGroup: comp.ageGroup,
              })),
            } as Guest);
          } else if (isForPrimary && companionsWithSameStatus.length === 0) {
            // Primary alone
            transformed.push({
              ...baseGuest,
              name: primaryName,
              allergies: primaryNote.allergies || undefined,
              containsPrimary: true,
              ageGroup: mapDbAgeGroupToAgeGroup(primary?.fascia_eta),
              companions: [],
            } as Guest);
          } else if (!isForPrimary && companionsWithSameStatus.length > 0) {
            // Companions alone (primary has different status) - show as "Accompagnatori di {primary}"
            transformed.push({
              ...baseGuest,
              name: `Accompagnatori di ${primaryName}`,
              allergies: undefined,
              containsPrimary: false,
              companions: companionsWithSameStatus.map(comp => ({
                id: comp.id,
                name: comp.name,
                allergies: comp.allergies,
                status: comp.status,
                ageGroup: comp.ageGroup,
              })),
            } as Guest);
          }
        });
      });

      setGuests(transformed);
    } catch (err) {
      console.error('Error loading guests (mapped from invitati):', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up initial load and realtime subscription
  useEffect(() => {
    loadGuests();

    // Realtime: listen to invitati changes and reload
    const channel = supabase
      .channel('invitati_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitati' },
        (payload) => {
          if (import.meta.env.DEV) {
            console.log('Realtime event:', payload.eventType, payload.table);
          }
          loadGuests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadGuests]);

const addGuest = async (formData: GuestFormData): Promise<Guest> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // 1) Create a new invitation unit
      const { data: unit, error: unitError } = await supabase
        .from('unita_invito')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (unitError) throw unitError;

      // 2) Insert primary invitato + companions
      const rows: any[] = [
        {
          unita_invito_id: unit.id,
          user_id: user.id,
          is_principale: true,
          nome_visualizzato: formData.name,
          gruppo: formData.category,
          fascia_eta: formData.ageGroup || null,
          confermato: false,
          note: buildNote({ allergies: formData.allergies ?? null, deleted_at: null }),
        },
        ...formData.companions.map((c) => ({
          unita_invito_id: unit.id,
          user_id: user.id,
          is_principale: false,
          nome_visualizzato: c.name,
          gruppo: formData.category,
          fascia_eta: c.ageGroup || null,
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
              status: 'pending' as GuestStatus,
              ageGroup: mapDbAgeGroupToAgeGroup(r.fascia_eta),
            };
          });

      const note = parseNote(primary?.note);

      const newGuest: Guest = {
        id: String(unit.id),
        name: primary?.nome_visualizzato || formData.name,
        category: mapDbCategoryToGuestCategory(primary?.gruppo || formData.category),
        allergies: note.allergies || undefined,
        ageGroup: mapDbAgeGroupToAgeGroup(primary?.fascia_eta) || formData.ageGroup,
        status: 'pending',
        companions,
        createdAt: new Date(primary?.created_at || Date.now()),
        updatedAt: new Date(primary?.created_at || Date.now()),
        containsPrimary: true,
        unitId: String(unit.id),
      };

      // optimistic local update
      setGuests((prev) => [newGuest, ...prev]);
      
      // Reload to ensure UI is properly synced with all required flags
      await loadGuests();
      
      return newGuest;
    } catch (error) {
      console.error('Error adding guest (invitati):', error);
      throw error;
    }
  };

  const updateGuest = async (guestId: string, formData: GuestFormData): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Extract unitId from composite ID (format: "unitId_status")
      const unitId = parseInt(guestId.split('_')[0], 10);
      if (Number.isNaN(unitId)) throw new Error('Invalid guest id');

      // 1) Update primary guest
      const { error: updatePrimaryError } = await supabase
        .from('invitati')
        .update({
          nome_visualizzato: formData.name,
          gruppo: formData.category,
          fascia_eta: formData.ageGroup || null,
          note: buildNote({ allergies: formData.allergies ?? null, deleted_at: null }),
        })
        .eq('unita_invito_id', unitId)
        .eq('is_principale', true);

      if (updatePrimaryError) throw updatePrimaryError;

      // 2) Get existing companions to determine what to add/update/delete
      const { data: existingCompanions, error: fetchError } = await supabase
        .from('invitati')
        .select('*')
        .eq('unita_invito_id', unitId)
        .eq('is_principale', false);

      if (fetchError) throw fetchError;

      const existingIds = (existingCompanions || []).map(c => c.id);

      // 3) Handle new companions (add them)
      const newCompanions = formData.companions.slice(existingCompanions?.length || 0);
      if (newCompanions.length > 0) {
        const newRows = newCompanions.map((c) => ({
          unita_invito_id: unitId,
          user_id: user.id,
          is_principale: false,
          nome_visualizzato: c.name,
          gruppo: formData.category,
          fascia_eta: c.ageGroup || null,
          confermato: false,
          note: buildNote({ allergies: c.allergies ?? null, deleted_at: null }),
        }));

        const { error: insertError } = await supabase
          .from('invitati')
          .insert(newRows);

        if (insertError) throw insertError;
      }

      // 4) Update existing companions
      const existingCompanionsToUpdate = formData.companions.slice(0, existingCompanions?.length || 0);
      for (let i = 0; i < existingCompanionsToUpdate.length; i++) {
        const companion = existingCompanionsToUpdate[i];
        const existingCompanion = existingCompanions?.[i];
        
        if (existingCompanion) {
          // Restore if it was deleted, then update
          const { error: updateError } = await supabase
            .from('invitati')
            .update({
              nome_visualizzato: companion.name,
              gruppo: formData.category,
              fascia_eta: companion.ageGroup || null,
              note: buildNote({ allergies: companion.allergies ?? null, deleted_at: null }),
            })
            .eq('id', existingCompanion.id);

          if (updateError) throw updateError;
        }
      }

      // 5) Soft delete companions that were removed (mark as deleted if user reduced companion count)
      if (existingCompanions && existingCompanions.length > formData.companions.length) {
        const companionsToDelete = existingCompanions.slice(formData.companions.length);
        const deletedAt = new Date().toISOString();
        
        for (const companionToDelete of companionsToDelete) {
          const { error: deleteError } = await supabase
            .from('invitati')
            .update({ note: buildNote({ allergies: null, deleted_at: deletedAt }) })
            .eq('id', companionToDelete.id);

          if (deleteError) throw deleteError;
        }
      }

      // Reload guests to reflect changes
      await loadGuests();
    } catch (error) {
      console.error('Error updating guest:', error);
      throw error;
    }
  };

  const updateGuestStatus = async (guestId: string, status: GuestStatus) => {
    // Extract unitId from composite ID (format: "unitId_status")
    const unitId = parseInt(guestId.split('_')[0], 10);
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
      
      // Refresh immediately after group status update to realign UI
      await loadGuests();
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
    const unitId = parseInt(guestId.split('_')[0], 10);
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
      
      // Reload to get the latest state and fix companion status display
      await loadGuests();
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

  const confirmGuestOnly = async (guestId: string) => {
    const unitId = parseInt(guestId.split('_')[0], 10);
    if (Number.isNaN(unitId)) throw new Error('Invalid guest id');

    const guest = guests.find(g => g.id === guestId);
    if (!guest) throw new Error('Guest not found');

    // Optimistic update - update only the main guest in UI
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId
          ? { ...g, status: 'confirmed' as GuestStatus, updatedAt: new Date(), deletedAt: undefined }
          : g
      )
    );

    try {
      // Update only the main guest (is_principale = true)
      const { error } = await supabase
        .from('invitati')
        .update({ confermato: true })
        .eq('unita_invito_id', unitId)
        .eq('is_principale', true);
      if (error) throw error;
      
      // Reload to get the latest state
      loadGuests();
    } catch (error) {
      console.error('Error confirming main guest only:', error);
      // Revert optimistic update on error
      const previousState = guests.find(g => g.id === guestId);
      if (previousState) {
        setGuests((prev) => prev.map((g) => g.id === guestId ? previousState : g));
      }
      throw error;
    }
  };

  const revertGuestOnly = async (guestId: string) => {
    const unitId = parseInt(guestId.split('_')[0], 10);
    if (Number.isNaN(unitId)) throw new Error('Invalid guest id');

    const guest = guests.find(g => g.id === guestId);
    if (!guest) throw new Error('Guest not found');

    // Optimistic update - update only the main guest in UI
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId
          ? { ...g, status: 'pending' as GuestStatus, updatedAt: new Date(), deletedAt: undefined }
          : g
      )
    );

    try {
      // Update only the main guest (is_principale = true) to pending
      const { error } = await supabase
        .from('invitati')
        .update({ confermato: false })
        .eq('unita_invito_id', unitId)
        .eq('is_principale', true);
      if (error) throw error;
      
      // Reload to get the latest state
      loadGuests();
    } catch (error) {
      console.error('Error reverting main guest only:', error);
      // Revert optimistic update on error
      const previousState = guests.find(g => g.id === guestId);
      if (previousState) {
        setGuests((prev) => prev.map((g) => g.id === guestId ? previousState : g));
      }
      throw error;
    }
  };

  const confirmGuestAndAllCompanions = async (guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) throw new Error('Guest not found');

    try {
      // Confirm the main guest using the original method (confirms all)
      await updateGuestStatus(guestId, 'confirmed');
      
      // Confirm all companions that are pending
      const pendingCompanions = guest.companions.filter(comp => comp.status === 'pending');
      for (const companion of pendingCompanions) {
        await confirmCompanion(guestId, companion.id);
      }
    } catch (error) {
      console.error('Error confirming guest and all companions:', error);
      throw error;
    }
  };

  const permanentlyDeleteGuest = async (guestId: string) => {
    const unitId = parseInt(guestId.split('_')[0], 10);
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

  // Individual companion management functions
  const updateCompanionStatus = async (guestId: string, companionId: string, status: GuestStatus) => {
    const companionDbId = parseInt(companionId, 10);
    if (Number.isNaN(companionDbId)) throw new Error('Invalid companion id');

    setCompanionLoading(companionId);
    
    try {
      if (status === 'confirmed' || status === 'pending') {
        const { error } = await supabase
          .from('invitati')
          .update({ confermato: status === 'confirmed' })
          .eq('id', companionDbId);
        if (error) throw error;
      } else if (status === 'deleted') {
        const deletedAt = new Date().toISOString();
        const { error } = await supabase
          .from('invitati')
          .update({ note: buildNote({ allergies: null, deleted_at: deletedAt }) })
          .eq('id', companionDbId);
        if (error) throw error;
      }
      
      // Force immediate refresh instead of relying on realtime
      await loadGuests();
    } catch (error) {
      console.error('Error updating companion status:', error);
      throw error;
    } finally {
      setCompanionLoading(null);
    }
  };

  const confirmCompanion = (guestId: string, companionId: string) => 
    updateCompanionStatus(guestId, companionId, 'confirmed');

  const deleteCompanion = (guestId: string, companionId: string) => 
    updateCompanionStatus(guestId, companionId, 'deleted');

  const restoreCompanion = async (guestId: string, companionId: string) => {
    const companionDbId = parseInt(companionId, 10);
    
    setCompanionLoading(companionId);
    
    try {
      const { error } = await supabase
        .from('invitati')
        .update({ note: buildNote({ allergies: null, deleted_at: null }) })
        .eq('id', companionDbId);
      if (error) throw error;
      
      // Force immediate refresh instead of relying on realtime
      await loadGuests();
    } catch (error) {
      console.error('Error restoring companion:', error);
      throw error;
    } finally {
      setCompanionLoading(null);
    }
  };

  const permanentlyDeleteCompanion = async (guestId: string, companionId: string) => {
    const companionDbId = parseInt(companionId, 10);
    
    setCompanionLoading(companionId);
    
    try {
      const { error } = await supabase
        .from('invitati')
        .delete()
        .eq('id', companionDbId);
      if (error) throw error;
      
      // Force immediate refresh instead of relying on realtime
      await loadGuests();
    } catch (error) {
      console.error('Error permanently deleting companion:', error);
      throw error;
    } finally {
      setCompanionLoading(null);
    }
  };

  const getGuestsByStatus = (status: GuestStatus) => guests.filter((g) => g.status === status);

  const getStats = (): GuestStats => {
    // Count people accurately without double-counting across split cards
    const peopleByStatus: Record<Exclude<GuestStatus, never>, number> = { confirmed: 0, pending: 0, deleted: 0 } as any;
    const peopleByCategory: Record<string, number> = {};
    const uniqueUnits = new Set<string>();
    
    guests.forEach(guest => {
      const unitKey = guest.unitId || guest.id.split('_')[0];
      uniqueUnits.add(unitKey);

      // Count main person only if this card contains the primary (default true when undefined)
      if (guest.containsPrimary !== false) {
        if (guest.status !== 'deleted') {
          peopleByStatus[guest.status]++;
          peopleByCategory[guest.category] = (peopleByCategory[guest.category] || 0) + 1;
        } else {
          peopleByStatus.deleted++;
        }
      }
      
      // Count companions listed in this card
      guest.companions.forEach(comp => {
        if (comp.status !== 'deleted') {
          peopleByStatus[comp.status]++;
          peopleByCategory[guest.category] = (peopleByCategory[guest.category] || 0) + 1;
        } else {
          peopleByStatus.deleted++;
        }
      });
    });

    const total = uniqueUnits.size; // number of invitation units (main invites)
    const totalWithCompanions = peopleByStatus.confirmed + peopleByStatus.pending;

    return {
      total,
      confirmed: peopleByStatus.confirmed,
      pending: peopleByStatus.pending,
      deleted: peopleByStatus.deleted,
      byCategory: peopleByCategory as any,
      totalWithCompanions,
    };
  };

  return {
    guests,
    loading,
    companionLoading,
    addGuest,
    updateGuestStatus,
    deleteGuest,
    restoreGuest,
    confirmGuest,
    confirmGuestOnly,
    revertGuestOnly,
    confirmGuestAndAllCompanions,
    permanentlyDeleteGuest,
    updateCompanionStatus,
    confirmCompanion,
    deleteCompanion,
    restoreCompanion,
    permanentlyDeleteCompanion,
    getGuestsByStatus,
    getStats,
    updateGuest,
  };
};