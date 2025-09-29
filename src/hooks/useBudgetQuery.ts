// =====================================================
// BUDGET HOOK - React Query Implementation
// Per Wed Guest Weaver - Sezione Finanza
// =====================================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
// QUERY KEYS
// =====================================================

export const budgetQueryKeys = {
  all: ['budget'] as const,
  settings: () => [...budgetQueryKeys.all, 'settings'] as const,
  categories: () => [...budgetQueryKeys.all, 'categories'] as const,
  items: () => [...budgetQueryKeys.all, 'items'] as const,
  vendors: () => [...budgetQueryKeys.all, 'vendors'] as const,
};

// =====================================================
// MAIN BUDGET HOOK WITH REACT QUERY
// =====================================================

export const useBudgetQuery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // =====================================================
  // QUERIES
  // =====================================================

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: budgetQueryKeys.settings(),
    queryFn: () => budgetSettingsApi.get(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: budgetQueryKeys.categories(),
    queryFn: async () => {
      const result = await budgetCategoriesApi.getAll();
      if (!result || result.length === 0) {
        await budgetCategoriesApi.initializeDefaults();
        return await budgetCategoriesApi.getAll();
      }
      return result;
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: budgetQueryKeys.items(),
    queryFn: () => budgetItemsApi.getAll(),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: budgetQueryKeys.vendors(),
    queryFn: () => budgetVendorsApi.getAll(),
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const isLoading = settingsLoading || categoriesLoading || itemsLoading || vendorsLoading;

  // =====================================================
  // SETTINGS MUTATIONS
  // =====================================================

  const updateTotalBudgetMutation = useMutation({
    mutationFn: (totalBudget: number) => 
      budgetSettingsApi.upsert({ total_budget: totalBudget }),
    onSuccess: (result, totalBudget) => {
      queryClient.setQueryData(budgetQueryKeys.settings(), result);
      toast({
        title: 'Budget aggiornato',
        description: `Budget totale impostato a €${totalBudget.toLocaleString()}`,
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare il budget totale',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  // =====================================================
  // CATEGORY MUTATIONS
  // =====================================================

  const addCategoryMutation = useMutation({
    mutationFn: (data: { name: string; budgeted: number; color?: string }) =>
      budgetCategoriesApi.create(data),
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.categories() });
      const previousCategories = queryClient.getQueryData(budgetQueryKeys.categories());
      
      const tempCategory = {
        id: `temp-${Date.now()}`,
        ...newCategory,
        spent: 0,
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData(budgetQueryKeys.categories(), (old: any) => 
        old ? [...old, tempCategory] : [tempCategory]
      );

      return { previousCategories, tempCategory };
    },
    onSuccess: (result, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.categories(), (old: any) =>
        old ? old.map((cat: any) => 
          cat.id === context?.tempCategory.id ? result : cat
        ) : [result]
      );
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.categories(), context?.previousCategories);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere la categoria',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      budgetCategoriesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.categories() });
      const previousCategories = queryClient.getQueryData(budgetQueryKeys.categories());

      queryClient.setQueryData(budgetQueryKeys.categories(), (old: any) =>
        old ? old.map((cat: any) => cat.id === id ? { ...cat, ...data } : cat) : []
      );

      return { previousCategories };
    },
    onSuccess: (result, { id }) => {
      queryClient.setQueryData(budgetQueryKeys.categories(), (old: any) =>
        old ? old.map((cat: any) => cat.id === id ? result : cat) : [result]
      );
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.categories(), context?.previousCategories);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare la categoria',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => budgetCategoriesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.categories() });
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.items() });
      
      const previousCategories = queryClient.getQueryData(budgetQueryKeys.categories());
      const previousItems = queryClient.getQueryData(budgetQueryKeys.items());

      queryClient.setQueryData(budgetQueryKeys.categories(), (old: any) =>
        old ? old.filter((cat: any) => cat.id !== id) : []
      );
      queryClient.setQueryData(budgetQueryKeys.items(), (old: any) =>
        old ? old.filter((item: any) => item.category_id !== id) : []
      );

      return { previousCategories, previousItems };
    },
    onSuccess: () => {
      toast({
        title: 'Categoria eliminata',
        description: 'Categoria e relative spese rimosse',
        duration: 3000,
      });
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.categories(), context?.previousCategories);
      queryClient.setQueryData(budgetQueryKeys.items(), context?.previousItems);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare la categoria',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  // =====================================================
  // ITEM MUTATIONS
  // =====================================================

  const addItemMutation = useMutation({
    mutationFn: (data: {
      category_id: string;
      name: string;
      amount: number;
      expense_date?: string;
      paid?: boolean;
      notes?: string;
    }) => budgetItemsApi.create(data),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.items() });
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.categories() });
      
      const previousItems = queryClient.getQueryData(budgetQueryKeys.items());
      const previousCategories = queryClient.getQueryData(budgetQueryKeys.categories());

      const tempItem = {
        id: `temp-${Date.now()}`,
        user_id: user?.id || '',
        expense_date: new Date().toISOString().split('T')[0],
        paid: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newItem,
      };

      queryClient.setQueryData(budgetQueryKeys.items(), (old: any) =>
        old ? [...old, tempItem] : [tempItem]
      );

      queryClient.setQueryData(budgetQueryKeys.categories(), (old: any) =>
        old ? old.map((cat: any) =>
          cat.id === newItem.category_id
            ? { ...cat, spent: cat.spent + newItem.amount }
            : cat
        ) : []
      );

      return { previousItems, previousCategories, tempItem };
    },
    onSuccess: (result, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.items(), (old: any) =>
        old ? old.map((item: any) =>
          item.id === context?.tempItem.id ? result : item
        ) : [result]
      );
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.items(), context?.previousItems);
      queryClient.setQueryData(budgetQueryKeys.categories(), context?.previousCategories);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere la spesa',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  const toggleItemPaidMutation = useMutation({
    mutationFn: (id: string) => budgetItemsApi.togglePaid(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.items() });
      const previousItems = queryClient.getQueryData(budgetQueryKeys.items());

      queryClient.setQueryData(budgetQueryKeys.items(), (old: any) =>
        old ? old.map((item: any) =>
          item.id === id ? { ...item, paid: !item.paid } : item
        ) : []
      );

      return { previousItems };
    },
    onSuccess: (result, id) => {
      queryClient.setQueryData(budgetQueryKeys.items(), (old: any) =>
        old ? old.map((item: any) => item.id === id ? result : item) : [result]
      );
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.items(), context?.previousItems);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare lo stato del pagamento',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  // =====================================================
  // VENDOR MUTATIONS
  // =====================================================

  const addVendorMutation = useMutation({
    mutationFn: (data: {
      name: string;
      category_id: string;
      contact_email?: string;
      contact_phone?: string;
      address?: string;
      website?: string;
      notes?: string;
      default_cost?: number | null;
    }) => budgetVendorsApi.create(data),
    onMutate: async (newVendor) => {
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.vendors() });
      const previousVendors = queryClient.getQueryData(budgetQueryKeys.vendors());

      const tempVendor = {
        id: `temp-${Date.now()}`,
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newVendor,
      };

      queryClient.setQueryData(budgetQueryKeys.vendors(), (old: any) =>
        old ? [...old, tempVendor] : [tempVendor]
      );

      // Handle default cost
      if (newVendor.default_cost && newVendor.default_cost > 0) {
        await queryClient.cancelQueries({ queryKey: budgetQueryKeys.items() });
        await queryClient.cancelQueries({ queryKey: budgetQueryKeys.categories() });

        const tempItem = {
          id: `temp-item-${Date.now()}`,
          user_id: user?.id || '',
          category_id: newVendor.category_id,
          name: newVendor.name,
          amount: newVendor.default_cost,
          expense_date: new Date().toISOString().split('T')[0],
          paid: false,
          notes: `Costo fornitore - ${newVendor.name}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData(budgetQueryKeys.items(), (old: any) =>
          old ? [...old, tempItem] : [tempItem]
        );

        queryClient.setQueryData(budgetQueryKeys.categories(), (old: any) =>
          old ? old.map((cat: any) =>
            cat.id === newVendor.category_id
              ? { ...cat, spent: cat.spent + newVendor.default_cost }
              : cat
          ) : []
        );
      }

      return { previousVendors, tempVendor };
    },
    onSuccess: (result, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.vendors(), (old: any) =>
        old ? old.map((vendor: any) =>
          vendor.id === context?.tempVendor.id ? result : vendor
        ) : [result]
      );

      if (variables.default_cost && variables.default_cost > 0) {
        // Create real item in background
        budgetItemsApi.create({
          category_id: variables.category_id,
          name: variables.name,
          amount: variables.default_cost,
          expense_date: new Date().toISOString().split('T')[0],
          notes: `Costo fornitore - ${variables.name}`
        }).then((realItem) => {
          if (realItem) {
            queryClient.setQueryData(budgetQueryKeys.items(), (old: any) =>
              old ? old.map((item: any) =>
                item.notes?.includes(`Costo fornitore - ${variables.name}`) ? realItem : item
              ) : [realItem]
            );
          }
        });
      }

      toast({
        title: 'Fornitore aggiunto',
        description: `${variables.name} aggiunto con successo${variables.default_cost ? ` (costo: €${variables.default_cost.toLocaleString()})` : ''}`,
        duration: 3000,
      });
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.vendors(), context?.previousVendors);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere il fornitore',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      budgetVendorsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.vendors() });
      const previousVendors = queryClient.getQueryData(budgetQueryKeys.vendors());

      queryClient.setQueryData(budgetQueryKeys.vendors(), (old: any) =>
        old ? old.map((vendor: any) =>
          vendor.id === id ? { ...vendor, ...data } : vendor
        ) : []
      );

      return { previousVendors };
    },
    onSuccess: (result, { id }) => {
      queryClient.setQueryData(budgetQueryKeys.vendors(), (old: any) =>
        old ? old.map((vendor: any) => vendor.id === id ? result : vendor) : [result]
      );
      toast({
        title: 'Fornitore aggiornato',
        description: 'Informazioni aggiornate con successo',
        duration: 3000,
      });
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.vendors(), context?.previousVendors);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare il fornitore',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: (id: string) => budgetVendorsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.vendors() });
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.items() });
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.categories() });

      const previousVendors = queryClient.getQueryData(budgetQueryKeys.vendors());
      const previousItems = queryClient.getQueryData(budgetQueryKeys.items());
      const previousCategories = queryClient.getQueryData(budgetQueryKeys.categories());

      const vendor = (previousVendors as any)?.find((v: any) => v.id === id);
      if (!vendor) throw new Error('Fornitore non trovato');

      const vendorItems = (previousItems as any)?.filter((item: any) =>
        item.notes?.includes(`Costo fornitore - ${vendor.name}`)
      ) || [];

      queryClient.setQueryData(budgetQueryKeys.vendors(), (old: any) =>
        old ? old.filter((v: any) => v.id !== id) : []
      );

      const deletedItemIds = vendorItems.map((item: any) => item.id);
      queryClient.setQueryData(budgetQueryKeys.items(), (old: any) =>
        old ? old.filter((item: any) => !deletedItemIds.includes(item.id)) : []
      );

      const itemsByCategory = vendorItems.reduce((acc: any, item: any) => {
        acc[item.category_id] = (acc[item.category_id] || 0) + item.amount;
        return acc;
      }, {});

      queryClient.setQueryData(budgetQueryKeys.categories(), (old: any) =>
        old ? old.map((cat: any) => ({
          ...cat,
          spent: cat.spent - (itemsByCategory[cat.id] || 0)
        })) : []
      );

      return { previousVendors, previousItems, previousCategories, vendor, vendorItems };
    },
    onSuccess: (result, id, context) => {
      // Delete items in background
      context?.vendorItems.forEach((item: any) => {
        budgetItemsApi.delete(item.id).catch(console.error);
      });

      toast({
        title: 'Fornitore eliminato',
        description: `${context?.vendor.name} e le spese associate sono state rimosse`,
        duration: 3000,
      });
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.vendors(), context?.previousVendors);
      queryClient.setQueryData(budgetQueryKeys.items(), context?.previousItems);
      queryClient.setQueryData(budgetQueryKeys.categories(), context?.previousCategories);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare il fornitore',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  const addVendorPaymentMutation = useMutation({
    mutationFn: ({ vendorId, amount, categoryId, notes }: {
      vendorId: string;
      amount: number;
      categoryId: string;
      notes?: string;
    }) => budgetVendorsApi.addPayment(vendorId, amount, categoryId, notes),
    onMutate: async ({ amount, categoryId }) => {
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.items() });
      await queryClient.cancelQueries({ queryKey: budgetQueryKeys.categories() });

      const previousItems = queryClient.getQueryData(budgetQueryKeys.items());
      const previousCategories = queryClient.getQueryData(budgetQueryKeys.categories());

      queryClient.setQueryData(budgetQueryKeys.categories(), (old: any) =>
        old ? old.map((cat: any) =>
          cat.id === categoryId
            ? { ...cat, spent: cat.spent + amount }
            : cat
        ) : []
      );

      return { previousItems, previousCategories };
    },
    onSuccess: (result, { amount }) => {
      queryClient.setQueryData(budgetQueryKeys.items(), (old: any) =>
        old ? [...old, result] : [result]
      );
      toast({
        title: 'Pagamento registrato',
        description: `Pagamento di €${amount.toLocaleString()} registrato`,
        duration: 3000,
      });
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(budgetQueryKeys.items(), context?.previousItems);
      queryClient.setQueryData(budgetQueryKeys.categories(), context?.previousCategories);
      toast({
        title: 'Errore',
        description: 'Impossibile registrare il pagamento',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const calculateDaysToWedding = (weddingDate: string | undefined) => {
    if (!weddingDate) return 120;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const wedding = new Date(weddingDate);
    wedding.setHours(0, 0, 0, 0);
    const diffTime = wedding.getTime() - today.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const weddingDate = settings?.wedding_date;
  const daysToWedding = calculateDaysToWedding(weddingDate);

  const totalBudget = (settings as any)?.total_budget || 35000;
  const totalAllocated = categories.reduce((sum: number, cat: any) => sum + (cat?.budgeted || 0), 0);
  const totalSpent = categories.reduce((sum: number, cat: any) => sum + (cat?.spent || 0), 0);
  const remainingToAllocate = totalBudget - totalAllocated;
  const remainingAfterSpent = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const allocatedPercentage = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  const getItemsByCategory = (categoryId: string) => {
    return items.filter((item: any) => item.category_id === categoryId);
  };

  const getVendorsByCategory = (categoryId: string) => {
    return vendors.filter((vendor: any) => vendor.category_id === categoryId);
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
    loading: isLoading,
    error: null,

    // Actions
    updateTotalBudget: updateTotalBudgetMutation.mutate,
    addCategory: addCategoryMutation.mutate,
    updateCategory: (id: string, data: any) => updateCategoryMutation.mutate({ id, data }),
    deleteCategory: deleteCategoryMutation.mutate,
    addItem: addItemMutation.mutate,
    toggleItemPaid: toggleItemPaidMutation.mutate,
    addVendor: addVendorMutation.mutate,
    updateVendor: (id: string, data: any) => updateVendorMutation.mutate({ id, data }),
    deleteVendor: deleteVendorMutation.mutate,
    addVendorPayment: (vendorId: string, amount: number, categoryId: string, notes?: string) =>
      addVendorPaymentMutation.mutate({ vendorId, amount, categoryId, notes }),

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

    // Mutation states (for loading indicators)
    isUpdatingTotalBudget: updateTotalBudgetMutation.isPending,
    isAddingCategory: addCategoryMutation.isPending,
    isUpdatingCategory: updateCategoryMutation.isPending,
    isDeletingCategory: deleteCategoryMutation.isPending,
    isAddingItem: addItemMutation.isPending,
    isTogglingItemPaid: toggleItemPaidMutation.isPending,
    isAddingVendor: addVendorMutation.isPending,
    isUpdatingVendor: updateVendorMutation.isPending,
    isDeletingVendor: deleteVendorMutation.isPending,
    isAddingVendorPayment: addVendorPaymentMutation.isPending,
  };
};
