import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // AGGIUNGI

export const useBudgetCategories = () => {
  const { user } = useAuth(); // AGGIUNGI
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["budget-categories", user?.id], // AGGIUNGI user?.id
    queryFn: async () => {
      if (!user?.id) { // AGGIUNGI
        throw new Error('Utente non autenticato');
      }

      const { data, error } = await supabase
        .from("budget_categories")
        .select(`
          *,
          budget_items(budgeted_amount, actual_amount)
        `)
        .eq('user_id', user.id) // AGGIUNGI FILTRO
        .order("name");

      if (error) throw error;

      return data.map(category => ({
        ...category,
        total_spent: category.budget_items?.reduce(
          (sum, item) => sum + (item.actual_amount || item.budgeted_amount || 0), 
          0
        ) || 0,
      }));
    },
    enabled: !!user?.id, // AGGIUNGI
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      if (!user?.id) throw new Error("User not authenticated"); // SEMPLIFICA

      const { data, error } = await supabase
        .from("budget_categories")
        .insert({
          ...categoryData,
          user_id: user.id, // USA DIRETTAMENTE user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
    },
  });

  // Gli altri mutation rimangono identici
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: any) => {
      const { data, error } = await supabase
        .from("budget_categories")
        .update(categoryData)
        .eq("id", id)
        .eq("user_id", user.id) // AGGIUNGI FILTRO SICUREZZA
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("budget_categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // AGGIUNGI FILTRO SICUREZZA

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
    },
  });

  return {
    categories,
    isLoading,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: (id: number, data: any) => updateCategoryMutation.mutateAsync({ id, ...data }),
    deleteCategory: deleteCategoryMutation.mutateAsync,
  };
};
