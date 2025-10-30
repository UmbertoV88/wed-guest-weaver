import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle, Calendar, PieChart, Settings, Users, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import CommonHeader from "@/components/CommonHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBudgetQuery } from '@/hooks/useBudgetQuery';
import BudgetChart from '@/components/budget/BudgetChart';
import BudgetOverview from '@/components/budget/BudgetOverview';
import CategoryManager from '@/components/budget/CategoryManager';
import VendorManager from '@/components/budget/VendorManager';
import PaymentTracker from '@/components/budget/PaymentTracker';
import { ReminderNotifications } from '@/components/budget/ReminderNotifications';
const FinanceLayout = () => {
  const {
    user,
    signOut,
    loading: authLoading
  } = useAuth();
  const {
    profile
  } = useProfile();
  const BudgetCalculator = () => {
    // *** REACT QUERY HOOK ***
    const {
      // State from database
      categories,
      availableCategories,
      items,
      vendors,
      loading,
      totalBudget,
      totalAllocated,
      totalSpent,
      remainingToAllocate,
      remainingAfterSpent,
      spentPercentage,
      daysToWedding,
      // Actions
      updateTotalBudget,
      addCategory,
      updateCategory,
      deleteCategory,
      addItem,
      toggleItemPaid,
      addVendorPayment,
      // Helper functions
      getItemsByCategory,
      getVendorsByCategory
    } = useBudgetQuery();

    // Local UI state
    const [activeTab, setActiveTab] = useState(() => {
      return localStorage.getItem('finance-active-tab') || "overview";
    });
    const {
      toast
    } = useToast();
    useEffect(() => {
      localStorage.setItem('finance-active-tab', activeTab);
    }, [activeTab]);

    // Chart data
    const enhancedChartData = categories.map(cat => ({
      name: cat.name,
      value: cat.budgeted,
      budgeted: cat.budgeted,
      spent: cat.spent,
      percentage: totalBudget > 0 ? (cat.budgeted / totalBudget * 100).toFixed(1) : 0,
      color: cat.color
    }));

    // Helper per formattare la data in formato "DD MMM"
    const formatPaymentDate = (dateString: string | null) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    };

    // Calcolare il prossimo pagamento
    const getNextPayment = () => {
      // Filtra solo i vendor con pagamenti non completati e con data di scadenza
      const unpaidVendors = vendors.filter(v => 
        !v.complete_payment_date && 
        v.payment_due_date && 
        v.default_cost > 0
      );

      if (unpaidVendors.length === 0) return null;

      // Ordina per data di scadenza più vicina
      const sortedByDate = [...unpaidVendors].sort((a, b) => {
        const dateA = new Date(a.payment_due_date!);
        const dateB = new Date(b.payment_due_date!);
        return dateA.getTime() - dateB.getTime();
      });

      const nextVendor = sortedByDate[0];
      const remainingAmount = (nextVendor.default_cost || 0) - (nextVendor.amount_paid || 0);

      // Trova la categoria per il nome
      const category = categories.find(c => c.id === nextVendor.category_id);

      return {
        date: formatPaymentDate(nextVendor.payment_due_date),
        vendor: nextVendor.name,
        category: category?.name || 'Non categorizzato',
        amount: remainingAmount
      };
    };

    const nextPayment = getNextPayment();

    // Loading state
    if (loading) {
      return <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Caricamento budget...</p>
            </div>
          </div>
        </div>;
    }

    // Calcola statistiche fornitori reali
    const totalVendors = vendors.filter(v => v.is_active).length;
    const paidVendors = vendors.filter(v => 
      v.is_active && v.complete_payment_date !== null
    ).length;

    return <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              Budget Matrimonio
            </h1>
            <p className="text-muted-foreground">Gestisci il budget per il tuo giorno speciale</p>
          </div>
        </div>

        {/* *** ALERT PER SFORAMENTI *** */}
        {(remainingToAllocate < 0 || remainingAfterSpent < 0) && <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {remainingToAllocate < 0 && <div>Budget allocato supera il totale di €{Math.abs(remainingToAllocate).toLocaleString()}</div>}
              {remainingAfterSpent < 0 && <div>Spese superano il budget totale di €{Math.abs(remainingAfterSpent).toLocaleString()}</div>}
            </AlertDescription>
          </Alert>}

        {/* *** BUDGET OVERVIEW CARDS *** */}
        <BudgetOverview totalBudget={totalBudget} totalSpent={totalSpent} remainingBudget={remainingAfterSpent} percentageSpent={spentPercentage} daysToWedding={daysToWedding} vendorsPaid={paidVendors} vendorsTotal={totalVendors} onBudgetChange={newBudget => {
        updateTotalBudget(newBudget);
      }} />

        {/* *** TABS *** */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <PieChart className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Panoramica</span>
              </TabsTrigger>
              <TabsTrigger value="categories">
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Categorie</span>
              </TabsTrigger>
              <TabsTrigger value="vendors">
                <Users className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Fornitori</span>
              </TabsTrigger>
              <TabsTrigger value="payments">
                <CreditCard className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Pagamenti</span>
              </TabsTrigger>
            </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <BudgetChart categories={categories} totalBudget={totalBudget} />

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Categoria più costosa</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {categories.length > 0 ? categories.reduce((max, cat) => cat.budgeted > max.budgeted ? cat : max).name : 'N/A'}
                      </p>
                      <p className="text-sm text-blue-600">
                        €{categories.length > 0 ? categories.reduce((max, cat) => cat.budgeted > max.budgeted ? cat : max).budgeted.toLocaleString() : '0'} stimati
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Prossimo pagamento</p>
                      {nextPayment ? (
                        <>
                          <p className="text-2xl font-bold text-green-900">{nextPayment.date}</p>
                          <p className="text-sm text-green-600">
                            {nextPayment.vendor} - €{nextPayment.amount.toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-green-900">--</p>
                          <p className="text-sm text-green-600">Nessun pagamento in sospeso</p>
                        </>
                      )}
                    </div>
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Risparmio potenziale</p>
                      <p className="text-2xl font-bold text-purple-900">
                        €{remainingAfterSpent.toLocaleString()}
                      </p>
                      <p className="text-sm text-purple-600">Budget rimanente</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <CategoryManager categories={categories} availableCategories={availableCategories} items={items} vendors={vendors} totalBudget={totalBudget} remainingToAllocate={remainingToAllocate} getItemsByCategory={getItemsByCategory} getVendorsByCategory={getVendorsByCategory} onAddCategory={(categoryId: string, budget: number) => {
            addCategory({
              categoryId,
              budgeted: budget
            });
            return Promise.resolve(true);
          }} onUpdateCategory={(id: string, updates: {
            budgeted?: number;
            name?: string;
            color?: string;
            icon?: string;
          }) => {
            updateCategory(id, updates);
            return Promise.resolve();
          }} onDeleteCategory={(id: string) => {
            deleteCategory(id);
            return Promise.resolve();
          }} />
          </TabsContent>
          
          <TabsContent value="vendors" className="space-y-4">
            <VendorManager categories={categories} />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <PaymentTracker vendors={vendors} onMarkAsPaid={addVendorPayment} />
          </TabsContent>

        </Tabs>
      </div>;
  };
  return <div className="flex min-h-screen w-full">
      <DashboardSidebar user={user} profile={profile} isWeddingOrganizer={true} onSignOut={signOut} signingOut={authLoading} />
      <ReminderNotifications />
      
      <SidebarInset className="flex-1 flex flex-col">
        <CommonHeader showSidebarTrigger={true} />
        
        <main className="flex-1 overflow-auto">
          <BudgetCalculator />
        </main>
      </SidebarInset>
    </div>;
};
const Finance = () => {
  useEffect(() => {
    document.title = "Budget Matrimonio - Gestisci le finanze del tuo matrimonio";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Gestisci il budget del tuo matrimonio con React Query. Imposta un budget totale e alloca le risorse nelle diverse categorie.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Gestisci il budget del tuo matrimonio con React Query. Imposta un budget totale e alloca le risorse nelle diverse categorie.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);
  return <SidebarProvider>
      <FinanceLayout />
    </SidebarProvider>;
};
export default Finance;