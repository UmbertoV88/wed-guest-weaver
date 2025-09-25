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
  budgetStatsApi 
} from '@/services/budgetService';
import { BudgetCategory, BudgetItem, BudgetSettings } from '@/types/budget';

// =====================================================
// MAIN BUDGET HOOK
// =====================================================

export const useBudget = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [settings, setSettings] = useState<BudgetSettings | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [items, setItems] = useState<BudgetItem[]>([]);
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
      // Load in parallelo per performance
      const [settingsData, categoriesData, itemsData] = await Promise.all([
        budgetSettingsApi.get(),
        budgetCategoriesApi.getAll(),
        budgetItemsApi.getAll(),
      ]);

      setSettings(settingsData);
      setCategories(categoriesData);
      setItems(itemsData);

      // Se non ci sono categorie, inizializza defaults
      if (!categoriesData || categoriesData.length === 0) {
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

  const addCategory = async (name: string, budgeted: number, color?: string) => {
    try {
      const result = await budgetCategoriesApi.create({
        name,
        budgeted,
        color,
      });

      if (result) {
        setCategories(prev => [...prev, result]);
        toast({
          title: 'Categoria aggiunta',
          description: `${result.name} aggiunta al budget`,
        });
        return result;
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
      setCategories(prev => 
        prev.map(cat => cat.id === id ? {...cat, ...data} : cat)
      );

      // 2. UPDATE DATABASE IN BACKGROUND
      const result = await budgetCategoriesApi.update(id, data);

      if (result) {
        // 3. SYNC WITH REAL DATA (no visual impact)
        setCategories(prev => 
          prev.map(cat => cat.id === id ? result : cat)
        );
        return result;
      } else {
        // 4. REVERT IF FAILED
        await loadData(); // Only if error
      }
      return null;
    } catch (err) {
      console.error('Error updating category:', err);
      // REVERT OPTIMISTIC UPDATE
      await loadData();
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
    try {
      // 1. UPDATE UI IMMEDIATELY (Optimistic)
      const tempItem = {
        id: `temp-${Date.now()}`, // Temporary ID
        ...data,
        expense_date: data.expense_date || new Date().toISOString().split('T')[0],
        paid: data.paid || false
      };
      
      setItems(prev => [...prev, tempItem]);
      
      // UPDATE CATEGORY SPENT (Optimistic)
      setCategories(prev => 
        prev.map(cat => 
          cat.id === data.category_id 
            ? {...cat, spent: cat.spent + data.amount}
            : cat
        )
      );

      // 2. CREATE IN DATABASE
      const result = await budgetItemsApi.create(data);

      if (result) {
        // 3. REPLACE TEMP WITH REAL DATA
        setItems(prev => 
          prev.map(item => item.id === tempItem.id ? result : item)
        );
        return result;
      } else {
        // 4. REVERT IF FAILED
        setItems(prev => prev.filter(item => item.id !== tempItem.id));
        setCategories(prev => 
          prev.map(cat => 
            cat.id === data.category_id 
              ? {...cat, spent: cat.spent - data.amount}
              : cat
          )
        );
      }
      return null;
    } catch (err) {
      console.error('Error adding item:', err);
      // REVERT ON ERROR
      await loadData();
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
        setItems(prev => 
          prev.map(item => item.id === id ? result : item)
        );
        return result;
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
  // UTILITY FUNCTIONS
  // =====================================================

  const initializeDefaults = async () => {
    try {
      const success = await budgetCategoriesApi.initializeDefaults();
      if (success) {
        // Ricarica le categorie
        const categoriesData = await budgetCategoriesApi.getAll();
        setCategories(categoriesData);
        toast({
          title: 'Categorie inizializzate',
          description: 'Categorie predefinite create con successo',
        });
      }
    } catch (err) {
      console.error('Error initializing defaults:', err);
    }
  };

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const totalBudget = settings?.total_budget || 35000;
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingToAllocate = totalBudget - totalAllocated;
  const remainingAfterSpent = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const allocatedPercentage = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // =====================================================
  // RETURN HOOK DATA
  // =====================================================

  return {
    // State
    settings,
    categories,
    items,
    loading,
    error,

    // Actions
    updateTotalBudget,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    toggleItemPaid,
    loadData,

    // Computed values
    totalBudget,
    totalAllocated,
    totalSpent,
    remainingToAllocate,
    remainingAfterSpent,
    spentPercentage,
    allocatedPercentage,
  };
};