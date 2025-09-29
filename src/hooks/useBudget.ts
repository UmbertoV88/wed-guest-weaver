// =====================================================
// BUDGET HOOK - React Hook per Budget Management
// Per Wed Guest Weaver - Sezione Finanza
// =====================================================

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  budgetSettingsApi, 
  budgetCategoriesApi, 
  budgetItemsApi,
  budgetVendorsApi
} from '@/services/budgetService';
import type { BudgetCategory, BudgetItem, BudgetSettings } from '@/types/budget';

// =====================================================
// MAIN BUDGET HOOK
// =====================================================

export const useBudget = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State with explicit types
  const [settings, setSettings] = useState<BudgetSettings | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const settingsResult = await budgetSettingsApi.get();
      const categoriesResult = await budgetCategoriesApi.getAll();
      const itemsResult = await budgetItemsApi.getAll();
      const vendorsResult = await budgetVendorsApi.getAll();
      
      // Set data directly - let's see what we actually get  
      setSettings(settingsResult as any || null);
      setCategories(Array.isArray(categoriesResult) ? categoriesResult as any : []);
      setItems(Array.isArray(itemsResult) ? itemsResult as any : []);
      setVendors(Array.isArray(vendorsResult) ? vendorsResult as any : []);

      // Initialize defaults if no categories
      if (!categoriesResult || categoriesResult.length === 0) {
        await initializeDefaults();
      }

    } catch (err) {
      console.error('Error loading budget data:', err);
      setError('Errore nel caricamento dei dati budget');
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i dati del budget',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // BUDGET SETTINGS
  // =====================================================

  const updateTotalBudget = async (totalBudget: number) => {
    try {
      const result = await budgetSettingsApi.upsert({
        total_budget: totalBudget,
      });

      if (result) {
        setSettings(result);
        toast({
          title: 'Budget aggiornato',
          description: `Budget totale impostato a €${totalBudget.toLocaleString()}`,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating total budget:', err);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare il budget totale',
        variant: 'destructive',
      });
      return false;
    }
  };

  // =====================================================
  // CATEGORIES MANAGEMENT
  // =====================================================
  const calculateDaysToWedding = (weddingDate: string | undefined) => {
    if (!weddingDate) return 120; // fallback default
    
    // Parse solo la DATA, ignora l'orario per calcolo preciso
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Midnight di oggi
    
    const wedding = new Date(weddingDate);
    wedding.setHours(0, 0, 0, 0); // Midnight del matrimonio
    
    // Calcolo preciso in millisecondi
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const weddingDate = settings?.wedding_date;
  const daysToWedding = calculateDaysToWedding(weddingDate);

  const addCategory = async (name: string, budgeted: number, color?: string) => {
    try {
      const result = await budgetCategoriesApi.create({
        name,
        budgeted,
        color,
      });

      if (result) {
        setCategories(prev => [...prev, result as any]);
        return result as any;
      }
      return null;
    } catch (err) {
      console.error('Error adding category:', err);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere la categoria',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateCategory = async (id: string, data: { budgeted?: number; name?: string; color?: string; icon?: string; spent?: number }) => {
    try {
      // 1. UPDATE UI IMMEDIATELY (Optimistic)
      setCategories((prev: any) => 
        prev.map((cat: any) => cat.id === id ? {...cat, ...data} : cat)
      );

      // 2. UPDATE DATABASE IN BACKGROUND
      const result = await budgetCategoriesApi.update(id, data);

      if (result) {
        // 3. SYNC WITH REAL DATA (no visual impact)
        setCategories((prev: any) => 
          prev.map((cat: any) => cat.id === id ? result as any : cat)
        );
        return result as any;
      } else {
        // 4. REVERT IF FAILED
        const originalCategory = categories.find(cat => cat.id === id);
        if (originalCategory) {
          setCategories((prev: any) => 
            prev.map((cat: any) => cat.id === id ? originalCategory : cat)
          );
        }
      }
      return null;
    } catch (err) {
      console.error('Error updating category:', err);
      const originalCategory = categories.find(cat => cat.id === id);
      if (originalCategory) {
        setCategories((prev: any) => 
          prev.map((cat: any) => cat.id === id ? originalCategory : cat)
        );
      }
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare la categoria',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const success = await budgetCategoriesApi.delete(id);

      if (success) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
        // Rimuovi anche gli items associati
        setItems(prev => prev.filter(item => item.category_id !== id));
        toast({
          title: 'Categoria eliminata',
          description: 'Categoria e relative spese rimosse',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting category:', err);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare la categoria',
        variant: 'destructive',
      });
      return false;
    }
  };

  // =====================================================
  // ITEMS MANAGEMENT
  // =====================================================

  const addItem = async (data: {
    category_id: string;
    name: string;
    amount: number;
    expense_date?: string;
    paid?: boolean;
    notes?: string;
  }) => {
    // ⭐ SPOSTA tempItem DECLARATION FUORI dal try block
    const tempItem: BudgetItem = {
      id: `temp-${Date.now()}`, // Temporary ID
      user_id: user?.id || '',
      category_id: data.category_id,
      name: data.name,
      amount: data.amount,
      expense_date: data.expense_date || new Date().toISOString().split('T')[0],
      paid: data.paid || false,
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      // 1. UPDATE UI IMMEDIATELY (Optimistic)
      setItems((prev: any) => [...prev, tempItem]);
      
      // UPDATE CATEGORY SPENT (Optimistic)
      setCategories((prev: any) => 
        prev.map((cat: any) => 
          cat.id === data.category_id 
            ? {...cat, spent: cat.spent + data.amount}
            : cat
        )
      );

      // 2. CREATE IN DATABASE
      const result = await budgetItemsApi.create(data);

      if (result) {
        // 3. REPLACE TEMP WITH REAL DATA
        setItems((prev: any) => 
          prev.map((item: any) => item.id === tempItem.id ? result as any : item)
        );
        return result as any;
      } else {
        // 4. REVERT IF FAILED
        setItems((prev: any) => prev.filter((item: any) => item.id !== tempItem.id));
        setCategories((prev: any) => 
          prev.map((cat: any) => 
            cat.id === data.category_id 
              ? {...cat, spent: cat.spent - data.amount}
              : cat
          )
        );
      }
      return null;
    } catch (err) {
      console.error('Error adding item:', err);
      // ✅ ORA tempItem è accessibile nel catch!
      setItems((prev: any) => prev.filter((item: any) => item.id !== tempItem.id));
      setCategories((prev: any) => 
        prev.map((cat: any) => 
          cat.id === data.category_id 
            ? {...cat, spent: cat.spent - data.amount}
            : cat
        )
      );
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere la spesa',
        variant: 'destructive',
      });
      return null;
    }
  };

  const toggleItemPaid = async (id: string) => {
    try {
      const result = await budgetItemsApi.togglePaid(id);

      if (result) {
        setItems((prev: any) => 
          prev.map((item: any) => item.id === id ? result as any : item)
        );
        return result as any;
      }
      return null;
    } catch (err) {
      console.error('Error toggling item paid status:', err);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare lo stato del pagamento',
        variant: 'destructive',
      });
      return null;
    }
  };

  // =====================================================
  // VENDORS MANAGEMENT
  // =====================================================

  const addVendor = async (data: {
    name: string;
    category_id: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    website?: string;
    notes?: string;
    default_cost?: number | null;
  }) => {
    try {
      const result = await budgetVendorsApi.create(data);

      if (result) {
        setVendors(prev => [...prev, result as any]);
        
        // If vendor has a cost, create a budget item automatically
        if (data.default_cost && data.default_cost > 0) {
        // ✅ MODIFICA: Crea item senza chiamare loadData()
        const tempItem: BudgetItem = {
          id: `temp-${Date.now()}`,
          user_id: user?.id || '',
          category_id: data.category_id,
          name: data.name,
          amount: data.default_cost,
          expense_date: new Date().toISOString().split('T')[0],
          paid: false,
          notes: `Costo fornitore - ${data.name}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Update UI immediately
        setItems(prev => [...prev, tempItem]);
        setCategories(prev => 
          prev.map(cat => 
            cat.id === data.category_id 
              ? {...cat, spent: cat.spent + data.default_cost}
              : cat
          )
        );

        // Create in background
        budgetItemsApi.create({
          category_id: data.category_id,
          name: data.name,
          amount: data.default_cost,
          expense_date: new Date().toISOString().split('T')[0],
          notes: `Costo fornitore - ${data.name}`
        }).then(realItem => {
          if (realItem) {
            setItems(prev => 
              prev.map(item => item.id === tempItem.id ? realItem as any : item)
            );
          }
        });
      }
      
      toast({
        title: 'Fornitore aggiunto',
        description: `${data.name} aggiunto con successo${data.default_cost ? ` (costo: €${data.default_cost.toLocaleString()})` : ''}`,
      });
      return result as any;
    }
      return null;
    } catch (err) {
      console.error('Error adding vendor:', err);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere il fornitore',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateVendor = async (id: string, data: any) => {
    const previousVendor = vendors.find(v => v.id === id);
    try {
      // Optimistic update
      setVendors(prev => 
        prev.map(vendor => vendor.id === id ? {...vendor, ...data} : vendor)
      );

      const result = await budgetVendorsApi.update(id, data);

      if (result) {
        setVendors(prev => 
          prev.map(vendor => vendor.id === id ? result as any : vendor)
        );
        toast({
          title: 'Fornitore aggiornato',
          description: 'Informazioni aggiornate con successo',
        });
        return result as any;
      } else {
        if (previousVendor) {
          setVendors(prev => 
            prev.map(vendor => vendor.id === id ? previousVendor : vendor)
          );
        }
      }
      return null;
    } catch (err) {
      console.error('Error updating vendor:', err);
      if (previousVendor) {
        setVendors(prev => 
          prev.map(vendor => vendor.id === id ? previousVendor : vendor)
        );
      }
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare il fornitore',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteVendor = async (id: string) => {
    const vendor = vendors.find(v => v.id === id);
    if (!vendor) {
      toast({
        title: 'Errore',
        description: 'Fornitore non trovato',
        variant: 'destructive',
      });
      return false;
    }

    // Backup per rollback
    const vendorItems = items.filter(item => 
      item.notes?.includes(`Costo fornitore - ${vendor.name}`)
    );

    try {
      // ✅ OPTIMISTIC DELETE - Update UI immediately
      setVendors(prev => prev.filter(v => v.id !== id));
      
      const deletedItemIds = vendorItems.map(item => item.id);
      setItems(prev => prev.filter(item => !deletedItemIds.includes(item.id)));

      const itemsByCategory = vendorItems.reduce((acc, item) => {
        acc[item.category_id] = (acc[item.category_id] || 0) + item.amount;
        return acc;
      }, {} as Record<string, number>);

      setCategories(prev => 
        prev.map(cat => ({
          ...cat,
          spent: cat.spent - (itemsByCategory[cat.id] || 0)
        }))
      );

      // Delete in background
      for (const item of vendorItems) {
        budgetItemsApi.delete(item.id).catch(console.error);
      }

      const success = await budgetVendorsApi.delete(id);

      if (success) {
        toast({
          title: 'Fornitore eliminato',
          description: `${vendor.name} e le spese associate sono state rimosse`,
        });
        return true;
      } else {
        // ✅ ROLLBACK su errore
        setVendors(prev => [...prev, vendor]);
        setItems(prev => [...prev, ...vendorItems]);
        setCategories(prev => 
          prev.map(cat => ({
            ...cat,
            spent: cat.spent + (itemsByCategory[cat.id] || 0)
          }))
        );
        return false;
      }
    } catch (err) {
      console.error('Error deleting vendor:', err);
      // ✅ ROLLBACK su errore
      setVendors(prev => [...prev, vendor]);
      setItems(prev => [...prev, ...vendorItems]);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare il fornitore',
        variant: 'destructive',
      });
      return false;
    }
  };


  const addVendorPayment = async (vendorId: string, amount: number, categoryId: string, notes?: string) => {
    try {
      const result = await budgetVendorsApi.addPayment(vendorId, amount, categoryId, notes);

      if (result) {
        // ✅ MODIFICA: Update UI senza loadData()
        setItems(prev => [...prev, result as any]);
        setCategories(prev => 
          prev.map(cat => 
            cat.id === categoryId 
              ? {...cat, spent: cat.spent + amount}
              : cat
          )
        );
        
        toast({
          title: 'Pagamento registrato',
          description: `Pagamento di €${amount.toLocaleString()} registrato`,
        });
        return result as any;
      }
      return null;
    } catch (err) {
      console.error('Error adding vendor payment:', err);
      toast({
        title: 'Errore',
        description: 'Impossibile registrare il pagamento',
        variant: 'destructive',
      });
      return null;
    }
  };

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const initializeDefaults = async () => {
    try {
      const success = await budgetCategoriesApi.initializeDefaults();
      if (success) {
        // FIX: Use optimistic update instead of full reload
        const categoriesData = await budgetCategoriesApi.getAll();
        setCategories(Array.isArray(categoriesData) ? categoriesData as any : []);
      }
    } catch (err) {
      console.error('Error initializing defaults:', err);
    }
  };

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const totalBudget = (settings as any)?.total_budget || 35000;
  const totalAllocated = categories.reduce((sum, cat) => sum + (cat as any)?.budgeted || 0, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + (cat as any)?.spent || 0, 0);
  const remainingToAllocate = totalBudget - totalAllocated;
  const remainingAfterSpent = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const allocatedPercentage = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  const getItemsByCategory = (categoryId: string) => {
    return items.filter(item => item.category_id === categoryId);
  };

  const getVendorsByCategory = (categoryId: string) => {
    return vendors.filter(vendor => vendor.category_id === categoryId);
  };

  // =====================================================
  // RETURN HOOK DATA
  // =====================================================

  return {
    // State
    settings,
    categories,
    items,
    vendors,
    loading,
    error,

    // Actions
    updateTotalBudget,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    toggleItemPaid,
    addVendor,
    updateVendor,
    deleteVendor,
    addVendorPayment,
    loadData,

    // Helper functions
    getItemsByCategory,
    getVendorsByCategory,

    // Computed values
    totalBudget,
    totalAllocated,
    totalSpent,
    remainingToAllocate,
    remainingAfterSpent,
    spentPercentage,
    allocatedPercentage,

    weddingDate,        
    daysToWedding,
  };
};