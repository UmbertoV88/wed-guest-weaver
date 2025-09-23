import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBudget = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgetSummary, isLoading } = useQuery({
    queryKey: ["budget-summary"],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from("budget_items")
        .select("budgeted_amount, actual_amount, paid_amount, status");

      if (error) throw error;

      const totalBudget = items.reduce((sum, item) => sum + (item.budgeted_amount || 0), 0);
      const totalSpent = items.reduce((sum, item) => sum + (item.actual_amount || item.budgeted_amount || 0), 0);
      const totalPaid = items.reduce((sum, item) => sum + (item.paid_amount || 0), 0);
      const pendingPayments = items.filter(item => item.status === "pending").length;

      return {
        totalBudget,
        totalSpent,
        totalPaid,
        pendingPayments,
      };
    },
  });

  return {
    budgetSummary: budgetSummary || {
      totalBudget: 0,
      totalSpent: 0,
      totalPaid: 0,
      pendingPayments: 0,
    },
    isLoading,
  };
};