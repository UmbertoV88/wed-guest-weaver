export interface BudgetCategory {
  id: number;
  user_id: string;
  name: string;
  icon?: string;
  default_percentage?: number;
  created_at: string;
}

export interface BudgetItem {
  id: number;
  user_id: string;
  category_id: number;
  vendor_name: string;
  description?: string;
  budgeted_amount: number;
  actual_amount: number;
  paid_amount: number;
  due_date?: string;
  status: BudgetStatus;
  priority: BudgetPriority;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type BudgetStatus = 'pending' | 'partial' | 'paid' | 'overdue';
export type BudgetPriority = 'low' | 'medium' | 'high';

export interface BudgetOverview {
  totalBudget: number;
  totalSpent: number;
  totalPaid: number;
  remaining: number;
  categoryTotals: Array<{
    category: BudgetCategory;
    budgeted: number;
    spent: number;
    paid: number;
  }>;
}

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  pending: "In sospeso",
  partial: "Parzialmente pagato", 
  paid: "Pagato",
  overdue: "In ritardo"
};

export const BUDGET_PRIORITY_LABELS: Record<BudgetPriority, string> = {
  low: "Bassa",
  medium: "Media",
  high: "Alta"
};