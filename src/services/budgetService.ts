import { supabase } from '@/integrations/supabase/client';

// Type-safe wrapper for budget operations
const createTypedQuery = (tableName: string) => ({
  select: (columns: string) => supabase.from(tableName as any).select(columns),
  insert: (data: any) => supabase.from(tableName as any).insert(data),
  update: (data: any) => supabase.from(tableName as any).update(data),
  delete: () => supabase.from(tableName as any).delete(),
  upsert: (data: any) => supabase.from(tableName as any).upsert(data)
});

// In src/services/budgetService.ts

export const budgetSettingsApi = {
  // ✅ GET - CON FALLBACK DA PROFILES
  async get() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    try {
      // Prima prova a prendere da budget_settings
      let { data: settings, error: settingsError } = await supabase
        .from('budget_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      // Se non esiste o wedding_date è null, prendi da profiles
      if (!settings?.wedding_date) {
        console.log('Wedding date not found in budget_settings, checking profiles...');
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('wedding_date')
          .eq('id', user.user.id)
          .single();

        if (!profileError && profile) {
          if (settings) {
            // Aggiorna settings esistente con data del profilo
            console.log('Updating existing settings with profile wedding date:', profile.wedding_date);
            settings.wedding_date = profile.wedding_date;
          } else {
            // Crea nuovo settings con data del profilo
            console.log('Creating new settings with profile wedding date:', profile.wedding_date);
            settings = {
              id: crypto.randomUUID(),
              user_id: user.user.id,
              total_budget: 35000,
              currency: 'EUR',
              wedding_date: profile.wedding_date,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            // Salva nel database per future chiamate
            try {
              const { error: insertError } = await supabase
                .from('budget_settings')
                .insert(settings);
              
              if (!insertError) {
                console.log('New budget_settings created with profile wedding date');
              }
            } catch (insertErr) {
              console.log('Could not create budget_settings, continuing with temp data');
            }
          }
        }
      }

      // Se ancora non hai settings, crea default
      if (!settings) {
        settings = {
          id: crypto.randomUUID(),
          user_id: user.user.id,
          total_budget: 35000,
          currency: 'EUR',
          wedding_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      return settings;
    } catch (error) {
      console.error('Error in budgetSettingsApi.get:', error);
      // Fallback settings
      return {
        id: crypto.randomUUID(),
        user_id: user.user.id,
        total_budget: 35000,
        currency: 'EUR',
        wedding_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },

  // ✅ UPSERT - CON GESTIONE WEDDING_DATE DA PROFILES
  async upsert(data: { total_budget?: number; wedding_date?: string; currency?: string }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    try {
      // Prima controlla se esiste già
      const { data: existing } = await supabase
        .from('budget_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (existing) {
        // UPDATE esistente
        const { data: updated, error } = await supabase
          .from('budget_settings')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.user.id)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } else {
        // INSERT nuovo - prendi wedding_date da profiles se non fornita
        let weddingDate = data.wedding_date;
        
        if (!weddingDate) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('wedding_date')
            .eq('id', user.user.id)
            .single();
          weddingDate = profile?.wedding_date;
        }

        const newSettings = {
          id: crypto.randomUUID(),
          user_id: user.user.id,
          total_budget: data.total_budget || 35000,
          currency: data.currency || 'EUR',
          wedding_date: weddingDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: created, error } = await supabase
          .from('budget_settings')
          .insert(newSettings)
          .select()
          .single();

        if (error) throw error;
        return created;
      }
    } catch (error) {
      console.error('Error in budgetSettingsApi.upsert:', error);
      throw error;
    }
  },

  // ✅ UPDATE - FUNZIONE SEPARATA PER AGGIORNAMENTI
  async update(id: string, data: { total_budget?: number; wedding_date?: string; currency?: string }) {
    try {
      const { data: updated, error } = await supabase
        .from('budget_settings')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    } catch (error) {
      console.error('Error in budgetSettingsApi.update:', error);
      throw error;
    }
  },

  // ✅ DELETE - SE NECESSARIO
  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('budget_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error in budgetSettingsApi.delete:', error);
      return false;
    }
  }
};


export const budgetCategoriesApi = {
  async getAll() {
    try {
      const { data, error } = await createTypedQuery('budget_categories')
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

      const { data: result, error } = await createTypedQuery('budget_categories')
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
      const { data: result, error } = await createTypedQuery('budget_categories')
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
      const { error } = await createTypedQuery('budget_categories')
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
  async getAll() {
    try {
      const { data, error } = await createTypedQuery('budget_items')
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

      const { data: result, error } = await createTypedQuery('budget_items')
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
      const { error } = await createTypedQuery('budget_items')
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

  async togglePaid(id: string) {
    try {
      const { data: current, error: fetchError } = await createTypedQuery('budget_items')
        .select('paid')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!current) throw new Error('Item not found');

      const { data: result, error } = await createTypedQuery('budget_items')
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
  async getAll() {
    try {
      const { data, error } = await createTypedQuery('budget_vendors')
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

      const { data: result, error } = await createTypedQuery('budget_vendors')
        .insert({
          user_id: user.id,
          name: data.name,
          category_id: data.category_id,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          address: data.address,
          website: data.website,
          notes: data.notes,
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
      const { data: result, error } = await createTypedQuery('budget_vendors')
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
      const { error } = await createTypedQuery('budget_vendors')
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

      // Crea un budget_item per tracciare il pagamento
      const { data: result, error } = await createTypedQuery('budget_items')
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

      if (error) {
        console.error('Error creating vendor payment:', error);
        throw error;
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