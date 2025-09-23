import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBudgetAnalytics = () => {
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["budget-analytics-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_categories")
        .select(`
          name,
          icon,
          budget_items(budgeted_amount, actual_amount, paid_amount)
        `);

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
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ["budget-analytics-monthly"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_items")
        .select("created_at, actual_amount, budgeted_amount");

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
  });

  return {
    categoryData: categoryData || [],
    monthlyData: monthlyData || [],
    isLoading: categoryLoading || monthlyLoading,
  };
};