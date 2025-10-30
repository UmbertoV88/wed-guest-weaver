// =====================================================
// BUDGET TYPES - Database Aligned
// Per Wed Guest Weaver - Sezione Finanza
// =====================================================

export interface BudgetSettings {
  id: string;
  user_id: string;
  total_budget: number;
  wedding_date?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  amount: number;
  expense_date: string;
  due_date?: string;
  paid: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetVendor {
  id: string;
  user_id: string;
  category_id?: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  payment_due_date?: string;
  default_cost?: number | null;
  amount_paid: number;
  complete_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentReminder {
  id: string;
  user_id: string;
  vendor_id: string;
  reminder_type: 'auto_7_days' | 'auto_due_date' | 'custom';
  scheduled_date: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  notify_email: boolean;
  notify_in_app: boolean;
  sent_at?: string;
  read_at?: string;
  error_message?: string;
  custom_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderData {
  vendor_id: string;
  scheduled_date: string;
  custom_message?: string;
  notify_email?: boolean;
  notify_in_app?: boolean;
}

// =====================================================
// COMPUTED TYPES (per il frontend)
// =====================================================

export interface BudgetCategoryWithItems extends BudgetCategory {
  items: BudgetItem[];
  remaining: number;
  percentage_spent: number;
}

export interface BudgetOverview {
  total_budget: number;
  total_allocated: number;
  total_spent: number;
  remaining_budget: number;
  spent_percentage: number;
  categories_count: number;
  wedding_date?: string;
}

export interface BudgetStatistics {
  user_id: string;
  total_budget: number;
  total_allocated: number;
  total_spent: number;
  remaining_budget: number;
  spent_percentage: number;
  categories_count: number;
  wedding_date?: string;
}

// =====================================================
// FORM TYPES
// =====================================================

export interface CreateBudgetCategoryData {
  name: string;
  budgeted: number;
  color?: string;
  sort_order?: number;
}

export interface UpdateBudgetCategoryData {
  name?: string;
  budgeted?: number;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateBudgetItemData {
  category_id: string;
  name: string;
  amount: number;
  expense_date?: string;
  due_date?: string;
  paid?: boolean;
  notes?: string;
}

export interface UpdateBudgetItemData {
  name?: string;
  amount?: number;
  expense_date?: string;
  due_date?: string;
  paid?: boolean;
  notes?: string;
}

export interface UpdateBudgetSettingsData {
  total_budget?: number;
  wedding_date?: string;
  currency?: string;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface BudgetApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface BudgetCategoriesResponse {
  categories: BudgetCategory[];
  total_count: number;
}

export interface BudgetItemsResponse {
  items: BudgetItem[];
  total_count: number;
}

// =====================================================
// LEGACY COMPATIBILITY (mantieni vecchi types)
// =====================================================

// Mantieni compatibilità con il codice Finance.tsx esistente
export interface Guest {
  id: string;
  name: string;
  // ... altri campi esistenti
}

// Ri-esporta types esistenti per non rompere imports
export * from './guest';

// =====================================================
// CONSTANTS
// =====================================================

export const DEFAULT_BUDGET_CATEGORIES = [
  { name: 'Location', color: '#E11D48', sort_order: 1 },
  { name: 'Catering', color: '#059669', sort_order: 2 },
  { name: 'Fotografo', color: '#7C3AED', sort_order: 3 },
  { name: 'Fiori & Decorazioni', color: '#EA580C', sort_order: 4 },
  { name: 'Musica', color: '#0891B2', sort_order: 5 },
  { name: 'Abiti', color: '#DC2626', sort_order: 6 },
  { name: 'Anelli', color: '#9333EA', sort_order: 7 },
  { name: 'Invitazioni', color: '#16A34A', sort_order: 8 },
  { name: 'Transport', color: '#0369A1', sort_order: 9 },
  { name: 'Varie', color: '#CA8A04', sort_order: 10 },
];

export const DEFAULT_CURRENCY = 'EUR';
export const DEFAULT_TOTAL_BUDGET = 35000;