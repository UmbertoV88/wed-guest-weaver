import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

// Types
interface ApiResult<T> {
  data: T | null;
  error: Error | null;
}

interface BudgetSettings {
  id: string;
  user_id: string;
  total_budget: number;
  wedding_date: string;
  created_at: string;
  updated_at: string;
}

interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  budgeted: number;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BudgetItem {
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

interface BudgetVendor {
  id: string;
  user_id: string;
  name: string;
  category_id?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  website?: string;
  notes?: string;
  default_cost?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Utility functions
async function getAuthenticatedUser(): Promise<User> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  return user;
}

function handleApiError<T>(error: unknown, context: string): ApiResult<T> {
  console.error(`${context}:`, error);
  return {
    data: null,
    error: error instanceof Error ? error : new Error('Unknown error occurred')
  };
}

function createSuccessResult<T>(data: T): ApiResult<T> {
  return { data, error: null };
}

// Type-safe wrapper for database operations
const createTypedQuery = (tableName: string) => ({
  select: (columns: string) => supabase.from(tableName).select(columns),
  insert: (data: any) => supabase.from(tableName).insert(data),
  update: (data: any) => supabase.from(tableName).update(data),
  delete: () => supabase.from(tableName).delete(),
  upsert: (data: any) => supabase.from(tableName).upsert(data)
});

export const budgetSettingsApi = {
  async get(): Promise<ApiResult<BudgetSettings>> {
    try {
      console.log('Fetching budget settings...');
      const user = await getAuthenticatedUser();
      
      const { data, error } = await createTypedQuery('budget_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      console.log('Budget settings data:', data);
      return createSuccessResult(data as BudgetSettings);
    } catch (error) {
      return handleApiError<BudgetSettings>(error, 'Budget settings fetch error');
    }
  },

  async upsert(settings: Partial<BudgetSettings>): Promise<ApiResult<BudgetSettings>> {
    try {
      if (!settings.total_budget && !settings.wedding_date) {
        throw new Error('At least one field (total_budget or wedding_date) is required');
      }

      const user = await getAuthenticatedUser();
      
      const upsertData = {
        user_id: user.id,
        ...(settings.total_budget && { total_budget: settings.total_budget }),
        ...(settings.wedding_date && { wedding_date: settings.wedding_date })
      };

      const { data: result, error } = await createTypedQuery('budget_settings')
        .upsert(upsertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResult(result as BudgetSettings);
    } catch (error) {
      return handleApiError<BudgetSettings>(error, 'Budget settings upsert error');
    }
  }
};

export const budgetCategoriesApi = {
  async getAll(): Promise<ApiResult<BudgetCategory[]>> {
    try {
      console.log('Fetching budget categories...');
      const user = await getAuthenticatedUser();
      
      const { data, error } = await createTypedQuery('budget_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      console.log('Budget categories data:', data);
      return createSuccessResult((data || []) as BudgetCategory[]);
    } catch (error) {
      return handleApiError<BudgetCategory[]>(error, 'Budget categories fetch error');
    }
  },

  async create(categoryData: Partial<BudgetCategory>): Promise<ApiResult<BudgetCategory>> {
    try {
      if (!categoryData.name || !categoryData.budgeted) {
        throw new Error('Name and budgeted amount are required');
      }

      const user = await getAuthenticatedUser();

      const insertData = {
        user_id: user.id,
        name: categoryData.name,
        budgeted: categoryData.budgeted,
        color: categoryData.color || budgetUtils.generateRandomColor(),
        sort_order: categoryData.sort_order || 999,
      };

      const { data: result, error } = await createTypedQuery('budget_categories')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResult(result as BudgetCategory);
    } catch (error) {
      return handleApiError<BudgetCategory>(error, 'Budget category create error');
    }
  },

  async update(id: string, categoryData: Partial<BudgetCategory>): Promise<ApiResult<BudgetCategory>> {
    try {
      if (!id) {
        throw new Error('Category ID is required');
      }

      const user = await getAuthenticatedUser();

      const { data: result, error } = await createTypedQuery('budget_categories')
        .update(categoryData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResult(result as BudgetCategory);
    } catch (error) {
      return handleApiError<BudgetCategory>(error, 'Budget category update error');
    }
  },

  async delete(id: string): Promise<ApiResult<boolean>> {
    try {
      if (!id) {
        throw new Error('Category ID is required');
      }

      const user = await getAuthenticatedUser();

      // Soft delete - mantieni integrità referenziale
      const { error } = await createTypedQuery('budget_categories')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return createSuccessResult(true);
    } catch (error) {
      return handleApiError<boolean>(error, 'Budget category delete error');
    }
  },

  async initializeDefaults(): Promise<ApiResult<boolean>> {
    try {
      const user = await getAuthenticatedUser();

      const { error } = await (supabase as any).rpc('create_default_budget_categories', {
        p_user_id: user.id
      });

      if (error) {
        throw error;
      }

      return createSuccessResult(true);
    } catch (error) {
      return handleApiError<boolean>(error, 'Default categories init error');
    }
  }
};

export const budgetItemsApi = {
  async getAll(): Promise<ApiResult<BudgetItem[]>> {
    try {
      console.log('Fetching budget items...');
      const user = await getAuthenticatedUser();
      
      const { data, error } = await createTypedQuery('budget_items')
        .select('*')
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Budget items data:', data);
      return createSuccessResult((data || []) as BudgetItem[]);
    } catch (error) {
      return handleApiError<BudgetItem[]>(error, 'Budget items fetch error');
    }
  },

  async create(itemData: Partial<BudgetItem>): Promise<ApiResult<BudgetItem>> {
    try {
      if (!itemData.category_id || !itemData.name || !itemData.amount) {
        throw new Error('Category ID, name, and amount are required');
      }

      const user = await getAuthenticatedUser();

      const insertData = {
        user_id: user.id,
        category_id: itemData.category_id,
        name: itemData.name,
        amount: itemData.amount,
        expense_date: itemData.expense_date || new Date().toISOString().split('T')[0],
        due_date: itemData.due_date,
        paid: itemData.paid || false,
        notes: itemData.notes,
      };

      const { data: result, error } = await createTypedQuery('budget_items')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResult(result as BudgetItem);
    } catch (error) {
      return handleApiError<BudgetItem>(error, 'Budget item create error');
    }
  },

  async update(id: string, itemData: Partial<BudgetItem>): Promise<ApiResult<BudgetItem>> {
    try {
      if (!id) {
        throw new Error('Item ID is required');
      }

      const user = await getAuthenticatedUser();

      const { data: result, error } = await createTypedQuery('budget_items')
        .update(itemData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResult(result as BudgetItem);
    } catch (error) {
      return handleApiError<BudgetItem>(error, 'Budget item update error');
    }
  },

  async togglePaid(id: string): Promise<ApiResult<BudgetItem>> {
    try {
      if (!id) {
        throw new Error('Item ID is required');
      }

      const user = await getAuthenticatedUser();

      const { data: current, error: fetchError } = await createTypedQuery('budget_items')
        .select('paid')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!current) {
        throw new Error('Item not found');
      }

      const { data: result, error } = await createTypedQuery('budget_items')
        .update({ paid: !(current as any).paid })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResult(result as BudgetItem);
    } catch (error) {
      return handleApiError<BudgetItem>(error, 'Budget item toggle paid error');
    }
  },

  async delete(id: string): Promise<ApiResult<boolean>> {
    try {
      if (!id) {
        throw new Error('Item ID is required');
      }

      const user = await getAuthenticatedUser();

      const { error } = await createTypedQuery('budget_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return createSuccessResult(true);
    } catch (error) {
      return handleApiError<boolean>(error, 'Budget item delete error');
    }
  }
};

export const budgetVendorsApi = {
  async getAll(): Promise<ApiResult<BudgetVendor[]>> {
    try {
      console.log('Fetching budget vendors...');
      const user = await getAuthenticatedUser();
      
      const { data, error } = await createTypedQuery('budget_vendors')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Budget vendors data:', data);
      return createSuccessResult((data || []) as BudgetVendor[]);
    } catch (error) {
      return handleApiError<BudgetVendor[]>(error, 'Budget vendors fetch error');
    }
  },

  async create(vendorData: Partial<BudgetVendor>): Promise<ApiResult<BudgetVendor>> {
    try {
      if (!vendorData.name) {
        throw new Error('Vendor name is required');
      }

      const user = await getAuthenticatedUser();

      const insertData = {
        user_id: user.id,
        name: vendorData.name,
        category_id: vendorData.category_id,
        contact_email: vendorData.contact_email,
        contact_phone: vendorData.contact_phone,
        address: vendorData.address,
        website: vendorData.website,
        notes: vendorData.notes,
        default_cost: vendorData.default_cost,
      };

      const { data: result, error } = await createTypedQuery('budget_vendors')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResult(result as BudgetVendor);
    } catch (error) {
      return handleApiError<BudgetVendor>(error, 'Budget vendor create error');
    }
  },

  async update(id: string, vendorData: Partial<BudgetVendor>): Promise<ApiResult<BudgetVendor>> {
    try {
      if (!id) {
        throw new Error('Vendor ID is required');
      }

      const user = await getAuthenticatedUser();

      const { data: result, error } = await createTypedQuery('budget_vendors')
        .update(vendorData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResult(result as BudgetVendor);
    } catch (error) {
      return handleApiError<BudgetVendor>(error, 'Budget vendor update error');
    }
  },

  async delete(id: string): Promise<ApiResult<boolean>> {
    try {
      if (!id) {
        throw new Error('Vendor ID is required');
      }

      const user = await getAuthenticatedUser();

      // Soft delete per mantenere integrità referenziale
      const { error } = await createTypedQuery('budget_vendors')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return createSuccessResult(true);
    } catch (error) {
      return handleApiError<boolean>(error, 'Budget vendor delete error');
    }
  },

  async addPayment(
    vendorId: string, 
    amount: number, 
    categoryId: string, 
    notes?: string
  ): Promise<ApiResult<BudgetItem>> {
    try {
      if (!vendorId || !amount || !categoryId) {
        throw new Error('Vendor ID, amount, and category ID are required');
      }

      const user = await getAuthenticatedUser();

      // Ottieni il nome del vendor per un nome più descrittivo
      const { data: vendor, error: vendorError } = await createTypedQuery('budget_vendors')
        .select('name')
        .eq('id', vendorId)
        .eq('user_id', user.id)
        .single();

      if (vendorError) {
        throw vendorError;
      }

      const vendorName = (vendor as any)?.name || 'Fornitore sconosciuto';

      const insertData = {
        user_id: user.id,
        category_id: categoryId,
        name: `Pagamento - ${vendorName}`,
        amount: amount,
        expense_date: new Date().toISOString().split('T')[0],
        paid: true,
        notes: notes || `Pagamento per fornitore: ${vendorName} (ID: ${vendorId})`,
      };

      const { data: result, error } = await createTypedQuery('budget_items')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResult(result as BudgetItem);
    } catch (error) {
      return handleApiError<BudgetItem>(error, 'Vendor payment error');
    }
  }
};

export const budgetUtils = {
  formatCurrency: (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '€0,00';
    }
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },

  calculatePercentage: (value: number, total: number): number => {
    if (typeof value !== 'number' || typeof total !== 'number' || total === 0) {
      return 0;
    }
    return Math.round((value / total) * 100);
  },

  generateRandomColor: (): string => {
    const colors = [
      '#E11D48', '#059669', '#7C3AED', '#EA580C', '#0891B2',
      '#DC2626', '#9333EA', '#16A34A', '#0369A1', '#CA8A04'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  validateEmail: (email: string): boolean => {
    if (!email) return true; // Email è opzionale
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone: (phone: string): boolean => {
    if (!phone) return true; // Telefono è opzionale
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  sanitizeString: (str: string): string => {
    return str.trim().replace(/\s+/g, ' ');
  }
};