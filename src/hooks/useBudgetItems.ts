import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // AGGIUNGI

export const useBudgetItems = () => {
  const { user } = useAuth(); // AGGIUNGI
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["budget-items", user?.id], // AGGIUNGI user?.id
    queryFn: async () => {
      if (!user?.id) { // AGGIUNGI
        throw new Error('Utente non autenticato');
      }

      const { data, error } = await supabase
        .from("budget_items")
        .select(`
          *,
          budget_categories(name, icon)
        `)
        .eq('user_id', user.id) // AGGIUNGI FILTRO
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id, // AGGIUNGI
  });

  const createItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      if (!user?.id) throw new Error("User not authenticated"); // SEMPLIFICA

      const { data, error } = await supabase
        .from("budget_items")
        .insert({
          ...itemData,
          user_id: user.id, // USA DIRETTAMENTE user.id
          category_id: parseInt(itemData.category_id),
          budgeted_amount: parseFloat(itemData.budgeted_amount),
          actual_amount: parseFloat(itemData.actual_amount || 0),
          paid_amount: parseFloat(itemData.paid_amount || 0),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-items"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] });
      queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...itemData }: any) => {
      const { data, error } = await supabase
        .from("budget_items")
        .update({
          ...itemData,
          category_id: parseInt(itemData.category_id),
          budgeted_amount: parseFloat(itemData.budgeted_amount),
          actual_amount: parseFloat(itemData.actual_amount || 0),
          paid_amount: parseFloat(itemData.paid_amount || 0),
        })
        .eq("id", id)
        .eq("user_id", user.id) // AGGIUNGI FILTRO SICUREZZA
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-items"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] });
      queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("budget_items")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // AGGIUNGI FILTRO SICUREZZA

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-items"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] });
      queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
    },
  });

  return {
    items,
    isLoading,
    createItem: createItemMutation.mutateAsync,
    updateItem: (id: number, data: any) => updateItemMutation.mutateAsync({ id, ...data }),
    deleteItem: deleteItemMutation.mutateAsync,
  };
};
