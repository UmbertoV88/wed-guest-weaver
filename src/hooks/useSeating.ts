import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Table {
  id: number;
  nome_tavolo: string | null;
  capacita_max: number;
  user_id: string;
  lato: string | null;
  created_at: string | null;
}

export interface TableAssignment {
  id: number;
  invitato_id: number;
  tavolo_id: number;
  created_at: string | null;
}

export interface SeatingGuest {
  id: number;
  nome_visualizzato: string;
  gruppo: string | null;
  note: string | null;
  confermato: boolean | null;
  tableId?: number;
}

export const useSeating = (): {
  tables: Table[];
  guests: SeatingGuest[];
  assignments: TableAssignment[];
  globalCapacity: number;
  isLoading: boolean;
  addTable: (tableData: { nome_tavolo: string; capacita_max: number; lato?: string }) => void;
  deleteTable: (tableId: number) => void;
  moveGuest: (guestId: number, tableId?: number) => void;
  updateGlobalCapacity: (newCapacity: number) => void;
  exportCSV: () => void;
} => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [globalCapacity, setGlobalCapacity] = useState(4);

  // Fetch tables
  const { data: tables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['tables', user?.id],
    queryFn: async (): Promise<Table[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tavoli')
        .select('*')
        .eq('user_id', user.id)
        .order('id');

      if (error) throw error;
      return (data || []) as Table[];
    },
    enabled: !!user?.id,
  });

  // Fetch table assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['table-assignments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('piani_salvati')
        .select('*')
        .order('id');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch guests for seating
  const { data: rawGuests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ['seating-guests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('invitati')
        .select('id, nome_visualizzato, gruppo, note, confermato')
        .eq('user_id', user.id)
        .eq('is_principale', true)
        .order('nome_visualizzato');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Combine guests with their table assignments
  const guests: SeatingGuest[] = useMemo(() => {
    if (!rawGuests || !assignments) return [];
    
    return rawGuests.map((guest: any) => ({
      id: guest.id,
      nome_visualizzato: guest.nome_visualizzato,
      gruppo: guest.gruppo,
      note: guest.note,
      confermato: guest.confermato,
      tableId: assignments.find(a => a.invitato_id === guest.id)?.tavolo_id,
    }));
  }, [rawGuests, assignments]);

  // Create table mutation
  const createTableMutation = useMutation({
    mutationFn: async (tableData: { nome_tavolo: string; capacita_max: number; lato?: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('tavoli')
        .insert({
          nome_tavolo: tableData.nome_tavolo,
          capacita_max: tableData.capacita_max,
          user_id: user.id,
          lato: tableData.lato,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast({
        title: "Tavolo creato",
        description: "Il nuovo tavolo è stato aggiunto con successo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile creare il tavolo. Riprova.",
        variant: "destructive",
      });
      console.error('Error creating table:', error);
    },
  });

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: number) => {
      // First remove all assignments for this table
      await supabase
        .from('piani_salvati')
        .delete()
        .eq('tavolo_id', tableId);

      // Then delete the table
      const { error } = await supabase
        .from('tavoli')
        .delete()
        .eq('id', tableId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['table-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['seating-guests'] });
      toast({
        title: "Tavolo eliminato",
        description: "Il tavolo è stato rimosso con successo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il tavolo. Riprova.",
        variant: "destructive",
      });
      console.error('Error deleting table:', error);
    },
  });

  // Move guest to table mutation
  const moveGuestMutation = useMutation({
    mutationFn: async ({ guestId, tableId }: { guestId: number; tableId?: number }) => {
      // First remove existing assignment
      await supabase
        .from('piani_salvati')
        .delete()
        .eq('invitato_id', guestId);

      // If tableId is provided, create new assignment
      if (tableId) {
        const { error } = await supabase
          .from('piani_salvati')
          .insert({
            invitato_id: guestId,
            tavolo_id: tableId,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['seating-guests'] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile spostare l'ospite. Riprova.",
        variant: "destructive",
      });
      console.error('Error moving guest:', error);
    },
  });

  // Update table capacity for all tables
  const updateGlobalCapacityMutation = useMutation({
    mutationFn: async (newCapacity: number) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('tavoli')
        .update({ capacita_max: newCapacity })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast({
        title: "Capienza aggiornata",
        description: "La capienza di tutti i tavoli è stata aggiornata.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la capienza. Riprova.",
        variant: "destructive",
      });
      console.error('Error updating capacity:', error);
    },
  });

  const addTable = useCallback((tableData: { nome_tavolo: string; capacita_max: number; lato?: string }) => {
    createTableMutation.mutate(tableData);
  }, [createTableMutation]);

  const deleteTable = useCallback((tableId: number) => {
    deleteTableMutation.mutate(tableId);
  }, [deleteTableMutation]);

  const moveGuest = useCallback((guestId: number, tableId?: number) => {
    moveGuestMutation.mutate({ guestId, tableId });
  }, [moveGuestMutation]);

  const updateGlobalCapacity = useCallback((newCapacity: number) => {
    setGlobalCapacity(newCapacity);
    updateGlobalCapacityMutation.mutate(newCapacity);
  }, [updateGlobalCapacityMutation]);

  // Export CSV
  const exportCSV = useCallback(() => {
    const rows = ['table_id,table_name,seat_position,guest_id,guest_name'];
    
    tables.forEach(table => {
      const tableGuests = guests.filter(guest => guest.tableId === table.id);
      
      if (tableGuests.length === 0) {
        rows.push(`${table.id},"${table.nome_tavolo || 'Tavolo ' + table.id}",0,,"Tavolo vuoto"`);
      } else {
        tableGuests.forEach((guest, index) => {
          rows.push(`${table.id},"${table.nome_tavolo || 'Tavolo ' + table.id}",${index + 1},${guest.id},"${guest.nome_visualizzato}"`);
        });
      }
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'disposizione_tavoli.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);

    toast({
      title: "CSV esportato",
      description: "Il file della disposizione tavoli è stato scaricato.",
    });
  }, [tables, guests, toast]);

  const isLoading = tablesLoading || assignmentsLoading || guestsLoading;

  return {
    tables,
    guests,
    assignments,
    globalCapacity,
    isLoading,
    addTable,
    deleteTable,
    moveGuest,
    updateGlobalCapacity,
    exportCSV,
  };
};