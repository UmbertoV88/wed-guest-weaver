import { useMemo } from 'react';
import { BudgetItem, BudgetCategory } from '@/types/budget';

interface BudgetAnalytics {
  totalBudgeted: number;
  totalActual: number;
  totalPaid: number;
  totalRemaining: number;
  budgetVariance: number;
  budgetVariancePercentage: number;
  paymentProgress: number;
  categoryAnalytics: CategoryAnalytic[];
  vendorAnalytics: VendorAnalytic[];
  upcomingPayments: BudgetItem[];
  overduePayments: BudgetItem[];
  topSpendingCategories: CategoryAnalytic[];
  mostExpensiveVendors: VendorAnalytic[];
  budgetEfficiency: number;
}

interface CategoryAnalytic {
  category: BudgetCategory;
  budgeted: number;
  actual: number;
  paid: number;
  variance: number;
  variancePercentage: number;
  itemCount: number;
  paymentProgress: number;
}

interface VendorAnalytic {
  vendorName: string;
  budgeted: number;
  actual: number;
  paid: number;
  variance: number;
  itemCount: number;
  categories: string[];
}

export const useBudgetAnalytics = (
  items: BudgetItem[],
  categories: BudgetCategory[]
): BudgetAnalytics => {
  return useMemo(() => {
    // Basic totals
    const totalBudgeted = items.reduce((sum, item) => sum + item.budgeted_amount, 0);
    const totalActual = items.reduce((sum, item) => sum + item.actual_amount, 0);
    const totalPaid = items.reduce((sum, item) => sum + item.paid_amount, 0);
    const totalRemaining = totalBudgeted - totalActual;
    const budgetVariance = totalActual - totalBudgeted;
    const budgetVariancePercentage = totalBudgeted > 0 ? (budgetVariance / totalBudgeted) * 100 : 0;
    const paymentProgress = totalActual > 0 ? (totalPaid / totalActual) * 100 : 0;

    // Category analytics
    const categoryAnalytics: CategoryAnalytic[] = categories.map(category => {
      const categoryItems = items.filter(item => item.category_id === category.id);
      const budgeted = categoryItems.reduce((sum, item) => sum + item.budgeted_amount, 0);
      const actual = categoryItems.reduce((sum, item) => sum + item.actual_amount, 0);
      const paid = categoryItems.reduce((sum, item) => sum + item.paid_amount, 0);
      const variance = actual - budgeted;
      const variancePercentage = budgeted > 0 ? (variance / budgeted) * 100 : 0;
      const categoryPaymentProgress = actual > 0 ? (paid / actual) * 100 : 0;

      return {
        category,
        budgeted,
        actual,
        paid,
        variance,
        variancePercentage,
        itemCount: categoryItems.length,
        paymentProgress: categoryPaymentProgress
      };
    }).filter(analytic => analytic.itemCount > 0);

    // Vendor analytics
    const vendorMap = new Map<string, BudgetItem[]>();
    items.forEach(item => {
      const vendorName = item.vendor_name;
      if (!vendorMap.has(vendorName)) {
        vendorMap.set(vendorName, []);
      }
      vendorMap.get(vendorName)!.push(item);
    });

    const vendorAnalytics: VendorAnalytic[] = Array.from(vendorMap.entries()).map(([vendorName, vendorItems]) => {
      const budgeted = vendorItems.reduce((sum, item) => sum + item.budgeted_amount, 0);
      const actual = vendorItems.reduce((sum, item) => sum + item.actual_amount, 0);
      const paid = vendorItems.reduce((sum, item) => sum + item.paid_amount, 0);
      const variance = actual - budgeted;
      
      const vendorCategories = [...new Set(vendorItems.map(item => {
        const category = categories.find(c => c.id === item.category_id);
        return category?.name || 'Sconosciuta';
      }))];

      return {
        vendorName,
        budgeted,
        actual,
        paid,
        variance,
        itemCount: vendorItems.length,
        categories: vendorCategories
      };
    });

    // Payment analysis
    const now = new Date();
    const upcomingPayments = items.filter(item => 
      item.due_date && 
      (item.status === 'pending' || item.status === 'partial') &&
      new Date(item.due_date) > now
    );

    const overduePayments = items.filter(item => 
      item.due_date && 
      (item.status === 'pending' || item.status === 'partial') &&
      new Date(item.due_date) < now
    );

    // Top categories by spending
    const topSpendingCategories = [...categoryAnalytics]
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 5);

    // Most expensive vendors
    const mostExpensiveVendors = [...vendorAnalytics]
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 5);

    // Budget efficiency (how well we're sticking to budget)
    const budgetEfficiency = totalBudgeted > 0 ? Math.max(0, 100 - Math.abs(budgetVariancePercentage)) : 0;

    return {
      totalBudgeted,
      totalActual,
      totalPaid,
      totalRemaining,
      budgetVariance,
      budgetVariancePercentage,
      paymentProgress,
      categoryAnalytics,
      vendorAnalytics,
      upcomingPayments,
      overduePayments,
      topSpendingCategories,
      mostExpensiveVendors,
      budgetEfficiency
    };
  }, [items, categories]);
};