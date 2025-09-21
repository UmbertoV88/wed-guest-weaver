import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BudgetCategory, BudgetItem, BudgetOverview } from '@/types/budget';

export const useBudget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le categorie",
        variant: "destructive"
      });
    }
  };

  const fetchItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setItems((data || []) as BudgetItem[]);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Errore", 
        description: "Impossibile caricare le voci di budget",
        variant: "destructive"
      });
    }
  };

  const createCategory = async (category: { name: string; icon?: string; default_percentage?: number }) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .insert({ 
          name: category.name,
          icon: category.icon,
          default_percentage: category.default_percentage,
          user_id: user.id 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      toast({
        title: "Categoria creata",
        description: "La categoria è stata aggiunta con successo"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare la categoria",
        variant: "destructive"
      });
    }
  };

  const createItem = async (item: { 
    vendor_name: string; 
    category_id: number; 
    description?: string;
    budgeted_amount?: number;
    actual_amount?: number;
    paid_amount?: number;
    due_date?: string;
    status?: string;
    priority?: string;
    notes?: string;
  }) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .insert({ 
          vendor_name: item.vendor_name,
          category_id: item.category_id,
          description: item.description,
          budgeted_amount: item.budgeted_amount || 0,
          actual_amount: item.actual_amount || 0,
          paid_amount: item.paid_amount || 0,
          due_date: item.due_date,
          status: item.status || 'pending',
          priority: item.priority || 'medium',
          notes: item.notes,
          user_id: user.id 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setItems(prev => [data as BudgetItem, ...prev]);
      toast({
        title: "Voce aggiunta",
        description: "La voce di budget è stata aggiunta con successo"
      });
      
      return data as BudgetItem;
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la voce",
        variant: "destructive"
      });
    }
  };

  const updateItem = async (id: number, updates: Partial<BudgetItem>) => {
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setItems(prev => prev.map(item => item.id === id ? data as BudgetItem : item));
      toast({
        title: "Voce aggiornata",
        description: "La voce è stata aggiornata con successo"
      });
      
      return data as BudgetItem;
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la voce", 
        variant: "destructive"
      });
    }
  };

  const deleteItem = async (id: number) => {
    try {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Voce eliminata",
        description: "La voce è stata eliminata con successo"
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la voce",
        variant: "destructive"
      });
    }
  };

  const getBudgetOverview = (): BudgetOverview => {
    const totalBudget = items.reduce((sum, item) => sum + item.budgeted_amount, 0);
    const totalSpent = items.reduce((sum, item) => sum + item.actual_amount, 0);
    const totalPaid = items.reduce((sum, item) => sum + item.paid_amount, 0);
    const remaining = totalBudget - totalSpent;

    const categoryTotals = categories.map(category => {
      const categoryItems = items.filter(item => item.category_id === category.id);
      return {
        category,
        budgeted: categoryItems.reduce((sum, item) => sum + item.budgeted_amount, 0),
        spent: categoryItems.reduce((sum, item) => sum + item.actual_amount, 0),
        paid: categoryItems.reduce((sum, item) => sum + item.paid_amount, 0)
      };
    });

    return {
      totalBudget,
      totalSpent,
      totalPaid,
      remaining,
      categoryTotals
    };
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchCategories(), fetchItems()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  return {
    categories,
    items,
    loading,
    createCategory,
    createItem,
    updateItem,
    deleteItem,
    getBudgetOverview,
    refetch: () => Promise.all([fetchCategories(), fetchItems()])
  };
};