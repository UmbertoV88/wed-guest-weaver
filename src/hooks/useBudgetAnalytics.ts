import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext"; // AGGIUNGI

export const useBudgetAnalytics = () => {
  const { user } = useAuth(); // AGGIUNGI

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["budget-analytics-categories", user?.id], // AGGIUNGI user?.id
    queryFn: async () => {
      if (!user?.id) { // AGGIUNGI
        throw new Error('Utente non autenticato');
      }

      const { data, error } = await supabase
        .from("budget_categories")
        .select(`
          name,
          icon,
          budget_items(budgeted_amount, actual_amount, paid_amount)
        `)
        .eq('user_id', user.id); // AGGIUNGI FILTRO

      if (error) throw error;

      return data.map(category => ({
        name: category.name,
        icon: category.icon,
        budgeted: category.budget_items?.reduce(
          (sum, item) => sum + (item.budgeted_amount || 0), 
          0
        ) || 0,
        spent: category.budget_items?.reduce(
          (sum, item) => sum + (item.actual_amount || item.budgeted_amount || 0), 
          0
        ) || 0,
        paid: category.budget_items?.reduce(
          (sum, item) => sum + (item.paid_amount || 0), 
          0
        ) || 0,
      })).filter(cat => cat.budgeted > 0);
    },
    enabled: !!user?.id, // AGGIUNGI
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ["budget-analytics-monthly", user?.id], // AGGIUNGI user?.id
    queryFn: async () => {
      if (!user?.id) { // AGGIUNGI
        throw new Error('Utente non autenticato');
      }

      const { data, error } = await supabase
        .from("budget_items")
        .select("created_at, actual_amount, budgeted_amount")
        .eq('user_id', user.id); // AGGIUNGI FILTRO

      if (error) throw error;

      const monthlySpending = {};
      data.forEach(item => {
        const month = new Date(item.created_at).toLocaleDateString('it-IT', { 
          year: 'numeric', 
          month: 'short' 
        });
        const amount = item.actual_amount || item.budgeted_amount || 0;
        
        if (!monthlySpending[month]) {
          monthlySpending[month] = 0;
        }
        monthlySpending[month] += amount;
      });

      return Object.entries(monthlySpending)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    },
    enabled: !!user?.id, // AGGIUNGI
  });

  return {
    categoryData: categoryData || [],
    monthlyData: monthlyData || [],
    isLoading: categoryLoading || monthlyLoading,
  };
};
