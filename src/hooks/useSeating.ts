import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
const supabaseClient: any = supabase;
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
  is_principale: boolean | null;
  fascia_eta: string | null;
  allergies?: string | null;
  tableId?: number;
}

export const useSeating = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [assignments, setAssignments] = useState<TableAssignment[]>([]);
  const [rawGuests, setRawGuests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalCapacity, setGlobalCapacity] = useState(8);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch tables manually
      const tablesQuery = await supabaseClient
        .from('tavoli')
        .select('id, nome_tavolo, capacita_max, lato, created_at')
        .eq('user_id', user.id)
        .order('id');
      
      if (tablesQuery.error) throw tablesQuery.error;

      // Fetch assignments manually
      const assignmentsQuery = await supabaseClient
        .from('piani_salvati')
        .select('id, invitato_id, tavolo_id, created_at')
        .order('id');
      
      if (assignmentsQuery.error) throw assignmentsQuery.error;

      // Fetch guests manually
      const guestsQuery = await supabaseClient
      .from('invitati')
      .select('id, nome_visualizzato, gruppo, note, confermato, is_principale, fascia_eta')
      .eq('user_id', user.id)
      .eq('confermato', true)  // AGGIUNTO: filtra solo gli ospiti confermati
      .order('nome_visualizzato');
    
    if (guestsQuery.error) throw guestsQuery.error;

      setTables(tablesQuery.data || []);
      setAssignments(assignmentsQuery.data || []);
      setRawGuests(guestsQuery.data || []);
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
  const guests: SeatingGuest[] = useMemo(() => {
    if (!rawGuests || !assignments) return [];
    
    return rawGuests.map((guest: any) => {
      // Parse note field to extract allergies if it's JSON
      let allergies = null;
      try {
        if (guest.note) {
          const parsedNote = JSON.parse(guest.note);
          allergies = parsedNote.allergies || null;
        }
      } catch (error) {
        // If parsing fails, treat the entire note as text (no allergies)
        allergies = null;
      }

      return {
        id: guest.id,
        nome_visualizzato: guest.nome_visualizzato,
        gruppo: guest.gruppo,
        note: guest.note,
        confermato: guest.confermato,
        is_principale: guest.is_principale,
        fascia_eta: guest.fascia_eta,
        allergies: allergies,
        tableId: assignments.find((a) => a.invitato_id === guest.id)?.tavolo_id,
      };
    });
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
      const insertQuery = supabaseClient
        .from('tavoli')
        .insert({
          nome_tavolo: tableData.nome_tavolo,
          capacita_max: tableData.capacita_max,
          user_id: user.id,
          lato: tableData.lato,
        })
        .select('id, nome_tavolo, capacita_max, lato, created_at')
        .single();

      const response = await insertQuery;
      if (response.error) throw response.error;

      setTables((prev) => [...prev, response.data]);
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
      const deleteAssignmentsQuery = supabaseClient
        .from('piani_salvati')
        .delete()
        .eq('tavolo_id', tableId);
      
      await deleteAssignmentsQuery;

      // Then delete the table
      const deleteTableQuery = supabaseClient
        .from('tavoli')
        .delete()
        .eq('id', tableId);
      
      const response = await deleteTableQuery;
      if (response.error) throw response.error;

      setTables((prev) => prev.filter((table) => table.id !== tableId));
      setAssignments((prev) => prev.filter((assignment) => assignment.tavolo_id !== tableId));
      
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
    if (!user?.id) {  // AGGIUNGI QUESTO CONTROLLO
      toast({
        title: "Errore",
        description: "Utente non autenticato.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      // First remove existing assignment
      const deleteQuery = supabaseClient
        .from('piani_salvati')
        .delete()
        .eq('invitato_id', guestId);
      
      await deleteQuery;
      
      // Update local state
      setAssignments((prev) => prev.filter((assignment) => assignment.invitato_id !== guestId));
      
      // If tableId is provided, create new assignment
      if (tableId) {
        const insertQuery = supabaseClient
          .from('piani_salvati')
          .insert({
            invitato_id: guestId,
            tavolo_id: tableId,
            user_id: user.id,  // <-- AGGIUNGI QUESTA RIGA
          })
          .select('id, invitato_id, tavolo_id, created_at')
          .single();
        
        const response = await insertQuery;
        if (response.error) throw response.error;
        
        // Update local state
        setAssignments((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error moving guest:', error);
      toast({
        title: "Errore",
        description: "Impossibile spostare l'ospite. Riprova.",
        variant: "destructive",
      });
      fetchData();
    }
  }, [user?.id, toast, fetchData]);
  
  // Function to assign multiple guests to a table - VERSIONE CORRETTA
  const assignMultipleGuests = useCallback(async (guestIds: number[], tableId: number): Promise<void> => {
    if (!user?.id) {
      toast({
        title: "Errore",
        description: "Utente non autenticato.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      // Check table capacity
      const table = tables.find((t) => t.id === tableId);
      if (!table) throw new Error('Tavolo non trovato');
      
      const currentAssignments = assignments.filter((a) => a.tavolo_id === tableId);
      const availableSpots = table.capacita_max - currentAssignments.length;
      
      if (guestIds.length > availableSpots) {
        throw new Error(`Il tavolo ha solo ${availableSpots} posti disponibili`);
      }
  
      // Create assignments for all selected guests
      const newAssignments = guestIds.map(guestId => ({
        invitato_id: guestId,
        tavolo_id: tableId,
        user_id: user.id,  // AGGIUNTO: questo era il campo mancante!
      }));
  
      const insertQuery = supabaseClient
        .from('piani_salvati')
        .insert(newAssignments)
        .select('id, invitato_id, tavolo_id, created_at');
  
      const { data, error } = await insertQuery;
      if (error) throw error;
  
      // Update local state
      setAssignments((prev) => [...prev, ...(data || [])]);
      
      toast({
        title: "Successo",
        description: `${guestIds.length} ospiti assegnati al ${table.nome_tavolo}`,
      });
    } catch (error) {
      console.error('Error assigning multiple guests:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nell'assegnazione degli ospiti",
        variant: "destructive",
      });
    }
  }, [user?.id, tables, assignments, toast]);

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
      const updateQuery = supabaseClient
        .from('tavoli')
        .update({ capacita_max: newCapacity })
        .eq('user_id', user.id);

      const response = await updateQuery;
      if (response.error) throw response.error;

      // Update local state
      setTables((prev) => prev.map((table) => ({ ...table, capacita_max: newCapacity })));

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
    const rows = ['Numero tavolo,Nome ospite'];
    
    tables.forEach((table) => {
      const tableGuests = guests.filter((guest) => guest.tableId === table.id);
      
      if (tableGuests.length === 0) {
        rows.push(`"${table.nome_tavolo || 'Tavolo ' + table.id}","Tavolo vuoto"`);
      } else {
        tableGuests.forEach((guest, index) => {
          rows.push(`"${table.nome_tavolo || 'Tavolo ' + table.id}","${guest.nome_visualizzato}"`);
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
    assignMultipleGuests,
    exportCSV,
  };
};