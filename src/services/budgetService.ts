// =====================================================
// BUDGET SERVICE - Supabase API Functions
// Per Wed Guest Weaver - Sezione Finanza
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { BudgetCategory, BudgetItem, BudgetSettings } from '@/types/budget';

// =====================================================
// BUDGET SETTINGS API
// =====================================================

export const budgetSettingsApi = {
  // Ottieni impostazioni budget per utente
  async get(): Promise<BudgetSettings | null> {
    try {
      const { data, error } = await supabase
        .from('budget_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching budget settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Budget settings fetch error:', error);
      return null;
    }
  },

  // Crea o aggiorna impostazioni budget
  async upsert(data: { total_budget: number; wedding_date?: string }): Promise<BudgetSettings | null> {
    try {
      const { data: result, error } = await supabase
        .from('budget_settings')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...data,
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting budget settings:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Budget settings upsert error:', error);
      return null;
    }
  },
};

// =====================================================
// BUDGET CATEGORIES API
// =====================================================

export const budgetCategoriesApi = {
  // Ottieni tutte le categorie per utente
  async getAll(): Promise<BudgetCategory[]> {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching budget categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Budget categories fetch error:', error);
      return [];
    }
  },

  // Crea nuova categoria
  async create(data: {
    name: string;
    budgeted: number;
    color?: string;
    sort_order?: number;
  }): Promise<BudgetCategory | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('budget_categories')
        .insert({
          user_id: user.id,
          name: data.name,
          budgeted: data.budgeted,
          color: data.color || '#3B82F6',
          sort_order: data.sort_order || 999,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating budget category:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Budget category create error:', error);
      return null;
    }
  },

  // Aggiorna categoria esistente
  async update(id: string, data: {
    name?: string;
    budgeted?: number;
    color?: string;
    sort_order?: number;
  }): Promise<BudgetCategory | null> {
    try {
      const { data: result, error } = await supabase
        .from('budget_categories')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating budget category:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Budget category update error:', error);
      return null;
    }
  },

  // Elimina categoria (soft delete)
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('budget_categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting budget category:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Budget category delete error:', error);
      return false;
    }
  },

  // Inizializza categorie predefinite per nuovo utente
  async initializeDefaults(): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Chiama la funzione SQL per creare categorie predefinite
      const { error } = await supabase.rpc('create_default_budget_categories', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error initializing default categories:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Default categories init error:', error);
      return false;
    }
  },
};

// =====================================================
// BUDGET ITEMS API
// =====================================================

export const budgetItemsApi = {
  // Ottieni tutti gli items per utente
  async getAll(): Promise<BudgetItem[]> {
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select(`
          *,
          budget_categories (
            name,
            color
          )
        `)
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error fetching budget items:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Budget items fetch error:', error);
      return [];
    }
  },

  // Ottieni items per categoria specifica
  async getByCategory(categoryId: string): Promise<BudgetItem[]> {
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .eq('category_id', categoryId)
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error fetching budget items by category:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Budget items by category fetch error:', error);
      return [];
    }
  },

  // Crea nuovo item
  async create(data: {
    category_id: string;
    name: string;
    amount: number;
    expense_date?: string;
    due_date?: string;
    paid?: boolean;
    notes?: string;
  }): Promise<BudgetItem | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('budget_items')
        .insert({
          user_id: user.id,
          category_id: data.category_id,
          name: data.name,
          amount: data.amount,
          expense_date: data.expense_date || new Date().toISOString().split('T')[0],
          due_date: data.due_date,
          paid: data.paid || false,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating budget item:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Budget item create error:', error);
      return null;
    }
  },

  // Aggiorna item esistente
  async update(id: string, data: {
    name?: string;
    amount?: number;
    expense_date?: string;
    due_date?: string;
    paid?: boolean;
    notes?: string;
  }): Promise<BudgetItem | null> {
    try {
      const { data: result, error } = await supabase
        .from('budget_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating budget item:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Budget item update error:', error);
      return null;
    }
  },

  // Elimina item
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting budget item:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Budget item delete error:', error);
      return false;
    }
  },

  // Toggle stato pagamento
  async togglePaid(id: string): Promise<BudgetItem | null> {
    try {
      // Prima ottieni il valore attuale
      const { data: current, error: fetchError } = await supabase
        .from('budget_items')
        .select('paid')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Poi aggiorna con il valore opposto
      const { data: result, error } = await supabase
        .from('budget_items')
        .update({ paid: !current.paid })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling budget item paid status:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Budget item toggle paid error:', error);
      return null;
    }
  },
};

// =====================================================
// BUDGET STATISTICS API
// =====================================================

export const budgetStatsApi = {
  // Ottieni statistiche complete
  async get(): Promise<{
    total_budget: number;
    total_allocated: number;
    total_spent: number;
    remaining_budget: number;
    spent_percentage: number;
    categories_count: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('budget_statistics')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching budget statistics:', error);
        throw error;
      }

      return data || {
        total_budget: 0,
        total_allocated: 0,
        total_spent: 0,
        remaining_budget: 0,
        spent_percentage: 0,
        categories_count: 0,
      };
    } catch (error) {
      console.error('Budget statistics fetch error:', error);
      return null;
    }
  },
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export const budgetUtils = {
  // Formatta valuta
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },

  // Calcola percentuale
  calculatePercentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  },

  // Genera colore random per categoria
  generateRandomColor: (): string => {
    const colors = [
      '#E11D48', '#059669', '#7C3AED', '#EA580C', '#0891B2',
      '#DC2626', '#9333EA', '#16A34A', '#0369A1', '#CA8A04'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },
};