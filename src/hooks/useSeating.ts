import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Table {
  id: number;
  nome_tavolo: string | null;
  capacita_max: number;
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

export const useSeating = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tables, setTables] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [rawGuests, setRawGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalCapacity, setGlobalCapacity] = useState(4);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch tables
      const tablesResponse: any = await supabase
        .from('tavoli')
        .select('id, nome_tavolo, capacita_max, lato, created_at')
        .eq('user_id', user.id)
        .order('id');

      if (tablesResponse.error) throw tablesResponse.error;

      // Fetch assignments
      const assignmentsResponse = await supabase
        .from('piani_salvati')
        .select('id, invitato_id, tavolo_id, created_at')
        .order('id');

      if (assignmentsResponse.error) throw assignmentsResponse.error;

      // Fetch guests
      const guestsResponse = await supabase
        .from('invitati')
        .select('id, nome_visualizzato, gruppo, note, confermato')
        .eq('user_id', user.id)
        .eq('is_principale', true)
        .order('nome_visualizzato');

      if (guestsResponse.error) throw guestsResponse.error;

      setTables(tablesResponse.data || []);
      setAssignments(assignmentsResponse.data || []);
      setRawGuests(guestsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Combine guests with their table assignments
  const guests = useMemo(() => {
    if (!rawGuests || !assignments) return [];
    
    return rawGuests.map((guest: any) => ({
      id: guest.id,
      nome_visualizzato: guest.nome_visualizzato,
      gruppo: guest.gruppo,
      note: guest.note,
      confermato: guest.confermato,
      tableId: assignments.find((a: any) => a.invitato_id === guest.id)?.tavolo_id,
    }));
  }, [rawGuests, assignments]);

  // Add table
  const addTable = useCallback(async (tableData: { nome_tavolo: string; capacita_max: number; lato?: string }) => {
    if (!user?.id) {
      toast({
        title: "Errore",
        description: "Utente non autenticato.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await supabase
        .from('tavoli')
        .insert({
          nome_tavolo: tableData.nome_tavolo,
          capacita_max: tableData.capacita_max,
          user_id: user.id,
          lato: tableData.lato,
        })
        .select('id, nome_tavolo, capacita_max, lato, created_at')
        .single();

      if (response.error) throw response.error;

      setTables((prev: any) => [...prev, response.data]);
      toast({
        title: "Tavolo creato",
        description: "Il nuovo tavolo è stato aggiunto con successo.",
      });
    } catch (error) {
      console.error('Error creating table:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il tavolo. Riprova.",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  // Delete table
  const deleteTable = useCallback(async (tableId: number) => {
    try {
      // First remove all assignments for this table
      await supabase
        .from('piani_salvati')
        .delete()
        .eq('tavolo_id', tableId);

      // Then delete the table
      const response = await supabase
        .from('tavoli')
        .delete()
        .eq('id', tableId);

      if (response.error) throw response.error;

      setTables((prev: any) => prev.filter((table: any) => table.id !== tableId));
      setAssignments((prev: any) => prev.filter((assignment: any) => assignment.tavolo_id !== tableId));
      
      toast({
        title: "Tavolo eliminato",
        description: "Il tavolo è stato rimosso con successo.",
      });
    } catch (error) {
      console.error('Error deleting table:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il tavolo. Riprova.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Move guest to table
  const moveGuest = useCallback(async (guestId: number, tableId?: number) => {
    try {
      // First remove existing assignment
      await supabase
        .from('piani_salvati')
        .delete()
        .eq('invitato_id', guestId);

      // Update local state
      setAssignments((prev: any) => prev.filter((assignment: any) => assignment.invitato_id !== guestId));

      // If tableId is provided, create new assignment
      if (tableId) {
        const response = await supabase
          .from('piani_salvati')
          .insert({
            invitato_id: guestId,
            tavolo_id: tableId,
          })
          .select('id, invitato_id, tavolo_id, created_at')
          .single();

        if (response.error) throw response.error;

        // Update local state
        setAssignments((prev: any) => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error moving guest:', error);
      toast({
        title: "Errore",
        description: "Impossibile spostare l'ospite. Riprova.",
        variant: "destructive",
      });
      // Refresh data on error
      fetchData();
    }
  }, [toast, fetchData]);

  // Update global capacity
  const updateGlobalCapacity = useCallback(async (newCapacity: number) => {
    if (!user?.id) {
      toast({
        title: "Errore",
        description: "Utente non autenticato.",
        variant: "destructive",
      });
      return;
    }

    setGlobalCapacity(newCapacity);

    try {
      const response = await supabase
        .from('tavoli')
        .update({ capacita_max: newCapacity })
        .eq('user_id', user.id);

      if (response.error) throw response.error;

      // Update local state
      setTables((prev: any) => prev.map((table: any) => ({ ...table, capacita_max: newCapacity })));

      toast({
        title: "Capienza aggiornata",
        description: "La capienza di tutti i tavoli è stata aggiornata.",
      });
    } catch (error) {
      console.error('Error updating capacity:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la capienza. Riprova.",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  // Export CSV
  const exportCSV = useCallback(() => {
    const rows = ['table_id,table_name,seat_position,guest_id,guest_name'];
    
    tables.forEach((table: any) => {
      const tableGuests = guests.filter((guest: any) => guest.tableId === table.id);
      
      if (tableGuests.length === 0) {
        rows.push(`${table.id},"${table.nome_tavolo || 'Tavolo ' + table.id}",0,,"Tavolo vuoto"`);
      } else {
        tableGuests.forEach((guest: any, index: number) => {
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