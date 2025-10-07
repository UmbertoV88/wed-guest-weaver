import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type BudgetSettings = Database['public']['Tables']['budget_settings']['Row'];
type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];
type BudgetItem = Database['public']['Tables']['budget_items']['Row'];
type BudgetVendor = Database['public']['Tables']['budget_vendors']['Row'];

export const budgetSettingsApi = {
  async get(): Promise<BudgetSettings | null> {
    try {
      const { data, error } = await supabase
        .from('budget_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching budget settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Budget settings fetch error:', error);
      return null;
    }
  },

  async upsert(data: any): Promise<BudgetSettings | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { data: existing, error: fetchError } = await supabase
        .from('budget_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing budget settings:', fetchError);
        throw fetchError;
      }

      let result;
      
      if (existing) {
        const { data: updateResult, error: updateError } = await supabase
          .from('budget_settings')
          .update({
            total_budget: data.total_budget,
            wedding_date: data.wedding_date
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating budget settings:', updateError);
          throw updateError;
        }
        result = updateResult;
      } else {
        const { data: insertResult, error: insertError } = await supabase
          .from('budget_settings')
          .insert({
            user_id: user.id,
            total_budget: data.total_budget,
            wedding_date: data.wedding_date
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting budget settings:', insertError);
          throw insertError;
        }
        result = insertResult;
      }

      return result;
    } catch (error) {
      console.error('Budget settings upsert error:', error);
      return null;
    }
  }
};

export const budgetCategoriesApi = {
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

  async create(data: any) {
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

  async update(id: string, data: any) {
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

  async delete(id: string) {
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

  async initializeDefaults() {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { error } = await (supabase as any).rpc('create_default_budget_categories', {
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
  }
};

export const budgetItemsApi = {
  async getAll(): Promise<BudgetItem[]> {
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
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

  async create(data: any) {
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

  async delete(id: string) {
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

  async update(id: string, data: any) {
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

  async togglePaid(id: string) {
    try {
      const { data: current, error: fetchError } = await supabase
        .from('budget_items')
        .select('paid')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!current) throw new Error('Item not found');

      const { data: result, error } = await supabase
        .from('budget_items')
        .update({ paid: !(current as any).paid })
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
  }
};

export const budgetVendorsApi = {
  async getAll(): Promise<BudgetVendor[]> {
    try {
      const { data, error } = await supabase
        .from('budget_vendors')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching budget vendors:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Budget vendors fetch error:', error);
      return [];
    }
  },

  async create(data: any) {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('budget_vendors')
        .insert({
          user_id: user.id,
          name: data.name,
          category_id: data.category_id,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          address: data.address,
          website: data.website,
          notes: data.notes,
          default_cost: data.default_cost,
          payment_due_date: data.payment_due_date,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating budget vendor:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Budget vendor create error:', error);
      return null;
    }
  },

  async update(id: string, data: any) {
    try {
      const { data: result, error } = await supabase
        .from('budget_vendors')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating budget vendor:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Budget vendor update error:', error);
      return null;
    }
  },

  async delete(id: string) {
    try {
      // HARD DELETE - rimuove completamente dal database
      const { error } = await supabase
        .from('budget_vendors')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting budget vendor:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Budget vendor delete error:', error);
      return false;
    }
  },

  async addPayment(vendorId: string, amount: number, categoryId: string, notes?: string) {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // 1. Crea un budget_item per tracciare il pagamento
      const { data: result, error: itemError } = await supabase
        .from('budget_items')
        .insert({
          user_id: user.id,
          category_id: categoryId,
          name: `Pagamento fornitore`,
          amount: amount,
          expense_date: new Date().toISOString().split('T')[0],
          paid: true,
          notes: notes || `Pagamento per fornitore ID: ${vendorId}`,
        })
        .select()
        .single();

      if (itemError) {
        console.error('Error creating vendor payment:', itemError);
        throw itemError;
      }

      // 2. Aggiorna amount_paid del vendor
      const { data: vendor, error: vendorFetchError } = await supabase
        .from('budget_vendors')
        .select('amount_paid')
        .eq('id', vendorId)
        .single();

      if (!vendorFetchError && vendor) {
        const { error: vendorUpdateError } = await supabase
          .from('budget_vendors')
          .update({ 
            amount_paid: (vendor.amount_paid || 0) + amount 
          })
          .eq('id', vendorId);

        if (vendorUpdateError) {
          console.error('Error updating vendor amount_paid:', vendorUpdateError);
        }
      }

      return result;
    } catch (error) {
      console.error('Vendor payment error:', error);
      return null;
    }
  }
};

export const budgetUtils = {
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },

  calculatePercentage: (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  },

  generateRandomColor: () => {
    const colors = [
      '#E11D48', '#059669', '#7C3AED', '#EA580C', '#0891B2',
      '#DC2626', '#9333EA', '#16A34A', '#0369A1', '#CA8A04'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
};