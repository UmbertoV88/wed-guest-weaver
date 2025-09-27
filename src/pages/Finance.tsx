import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Calculator, PieChart, DollarSign, TrendingUp, Edit, AlertTriangle, Calendar, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Pie } from "recharts";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DashboardSidebar from "@/components/DashboardSidebar";
import CommonHeader from "@/components/CommonHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBudget } from "@/hooks/useBudget";
import BudgetChart from '@/components/budget/BudgetChart';
import BudgetOverview from '@/components/budget/BudgetOverview';
import CategoryManager from '@/components/budget/CategoryManager';
import VendorManager from '@/components/budget/VendorManager';
import PaymentTracker from '@/components/budget/PaymentTracker';

// Layout component similar to other pages
const FinanceLayout = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const BudgetCalculator = () => {
    // *** NUOVA LOGICA CON DATABASE HOOK ***
    const {
      // State from database
      categories,
      items,
      vendors,
      loading,
      totalBudget,
      totalAllocated,
      totalSpent,
      remainingToAllocate,
      remainingAfterSpent,
      spentPercentage,
      allocatedPercentage,
      weddingDate,        
      daysToWedding,
      
      // Actions
      updateTotalBudget,
      addCategory,
      updateCategory,
      deleteCategory,
      addItem,
      toggleItemPaid,
    } = useBudget();

    console.log('🏠 Finance component - Budget data:');
    console.log('📋 Categories:', categories);
    console.log('👥 Vendors:', vendors);
    console.log('🔢 Vendors length:', vendors?.length);
    console.log('📊 Loading state:', loading);

    useEffect(() => {
      console.log('🔄 Finance useEffect - Data changed:');
      console.log('👥 Vendors aggiornato:', vendors);
      console.log('📋 Categories aggiornato:', categories);
    }, [vendors, categories]);

    // Local UI state
    const [newCategory, setNewCategory] = useState({ name: "", budget: "" });
    const [newItem, setNewItem] = useState({ name: "", amount: "", categoryId: "", date: "" });
    const [isEditingTotal, setIsEditingTotal] = useState(false);
    const [tempTotalBudget, setTempTotalBudget] = useState(35000);
    const [activeTab, setActiveTab] = useState(() => {
      return localStorage.getItem('finance-active-tab') || "overview";
    });
    const { toast } = useToast();
    useEffect(() => {
      localStorage.setItem('finance-active-tab', activeTab);
    }, [activeTab]);
    // Sync tempTotalBudget with actual totalBudget
    useEffect(() => {
      setTempTotalBudget(totalBudget);
    }, [totalBudget]);

    // *** FUNZIONE PER MODIFICARE IL BUDGET TOTALE ***
    const handleUpdateTotalBudget = async () => {
      const success = await updateTotalBudget(tempTotalBudget);
      if (success) {
        setIsEditingTotal(false);
      }
    };

    const startEditingTotal = () => {
      setTempTotalBudget(totalBudget);
      setIsEditingTotal(true);
    };

    const cancelEditTotal = () => {
      setTempTotalBudget(totalBudget);
      setIsEditingTotal(false);
    };

    // *** FUNZIONE PER AGGIUNGERE CATEGORIA ***
    const handleAddCategory = async () => {
      if (!newCategory.name || !newCategory.budget) {
        toast({
          title: "Errore",
          description: "Inserisci nome e budget per la categoria",
          variant: "destructive"
        });
        return;
      }

      const budgetAmount = parseFloat(newCategory.budget);
      
      if (isNaN(budgetAmount) || budgetAmount <= 0) {
        toast({
          title: "Errore",
          description: "Inserisci un budget valido",
          variant: "destructive"
        });
        return;
      }

      const newAllocatedTotal = totalAllocated + budgetAmount;

      // Warning se supera il budget totale
      if (newAllocatedTotal > totalBudget) {
        const overBudget = newAllocatedTotal - totalBudget;
        const confirmed = window.confirm(
          `Attenzione! Questa categoria porterà il budget allocato a €${newAllocatedTotal.toLocaleString()}, ` +
          `superando il budget totale di €${overBudget.toLocaleString()}. Vuoi continuare?`
        );
        
        if (!confirmed) return;
      }

      const success = await addCategory(newCategory.name, budgetAmount);
      if (success) {
        setNewCategory({ name: "", budget: "" });
      }
    };

    // *** FUNZIONE PER MODIFICARE BUDGET DI UNA CATEGORIA ***
    const handleUpdateCategoryBudget = async (categoryId: string, newBudget: number) => {
      const oldCategory = categories.find(cat => cat.id === categoryId);
      if (!oldCategory) return;

      const budgetDifference = newBudget - oldCategory.budgeted;
      const newAllocatedTotal = totalAllocated + budgetDifference;

      // Warning se supera il budget totale
      if (newAllocatedTotal > totalBudget && budgetDifference > 0) {
        const overBudget = newAllocatedTotal - totalBudget;
        const confirmed = window.confirm(
          `Attenzione! Questa modifica porterà il budget allocato a €${newAllocatedTotal.toLocaleString()}, ` +
          `superando il budget totale di €${overBudget.toLocaleString()}. Vuoi continuare?`
        );
        
        if (!confirmed) return;
      }

      await updateCategory(categoryId, { budgeted: newBudget });
    };

    // *** FUNZIONE PER AGGIUNGERE SPESA ***
    const handleAddItem = async () => {
      if (!newItem.name || !newItem.amount || !newItem.categoryId) {
        toast({
          title: "Errore",
          description: "Compila tutti i campi obbligatori",
          variant: "destructive"
        });
        return;
      }

      const itemAmount = parseFloat(newItem.amount);
      
      if (isNaN(itemAmount) || itemAmount <= 0) {
        toast({
          title: "Errore",
          description: "Inserisci un importo valido",
          variant: "destructive"
        });
        return;
      }

      const newTotalSpent = totalSpent + itemAmount;

      // Warning se supera il budget totale
      if (newTotalSpent > totalBudget) {
        const overBudget = newTotalSpent - totalBudget;
        const confirmed = window.confirm(
          `Attenzione! Questa spesa porterà il totale speso a €${newTotalSpent.toLocaleString()}, ` +
          `superando il budget totale di €${overBudget.toLocaleString()}. Vuoi continuare?`
        );
        
        if (!confirmed) return;
      }

      const success = await addItem({
        category_id: newItem.categoryId,
        name: newItem.name,
        amount: itemAmount,
        expense_date: newItem.date || new Date().toISOString().split('T')[0],
        paid: false
      });

      if (success) {
        setNewItem({ name: "", amount: "", categoryId: "", date: "" });
      }
    };

    const handleDeleteCategory = async (id: string) => {
      await deleteCategory(id);
    };

    const handleToggleItemPaid = async (itemId: string) => {
      await toggleItemPaid(itemId);
    };

    // Chart data
    const enhancedChartData = categories.map(cat => ({
      name: cat.name,
      value: cat.budgeted,      // Mostra budget allocato
      budgeted: cat.budgeted,
      spent: cat.spent,
      percentage: totalBudget > 0 ? ((cat.budgeted / totalBudget) * 100).toFixed(1) : 0,
      color: cat.color
    }));

    const chartData = enhancedChartData;
    // Subito dopo la definizione di enhancedChartData
    console.log("🔍 Enhanced Chart Data:", enhancedChartData);
    console.log("📊 Total Budget:", totalBudget);
    console.log("📈 Total Allocated:", totalAllocated);

    // Loading state
    if (loading) {
      return (
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Caricamento budget...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              Budget Matrimonio
            </h1>
            <p className="text-muted-foreground">
              Gestisci il budget per il tuo giorno speciale - Database Integration
            </p>
          </div>
        </div>

        {/* *** ALERT PER SFORAMENTI *** */}
        {(remainingToAllocate < 0 || remainingAfterSpent < 0) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {remainingToAllocate < 0 && (
                <div>Budget allocato supera il totale di €{Math.abs(remainingToAllocate).toLocaleString()}</div>
              )}
              {remainingAfterSpent < 0 && (
                <div>Spese superano il budget totale di €{Math.abs(remainingAfterSpent).toLocaleString()}</div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* *** BUDGET OVERVIEW CARDS - SEMPRE VISIBILI *** */}
        <BudgetOverview
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          remainingBudget={remainingAfterSpent}
          percentageSpent={spentPercentage}
          daysToWedding={daysToWedding}
          vendorsPaid={3}
          vendorsTotal={categories.length}
          onBudgetChange={async (newBudget) => {
            await updateTotalBudget(newBudget);
          }}
        />

        {/* *** TABS - SOTTO LE CARDS *** */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="categories">Categorie</TabsTrigger>
            <TabsTrigger value="vendors">Fornitori</TabsTrigger>
            <TabsTrigger value="payments">Pagamenti</TabsTrigger>
            <TabsTrigger value="analytics">Analisi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Budget Chart */}
            <BudgetChart 
              categories={categories}
              totalBudget={totalBudget}
            />

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
                      <p className="text-2xl font-bold text-green-900">20 Mag</p>
                      <p className="text-sm text-green-600">Catering - €5.800</p>
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
            <CategoryManager
              categories={categories}
              vendors={vendors}
              totalBudget={totalBudget}
              remainingToAllocate={remainingToAllocate}
              onAddCategory={async (name: string, budget: number, color?: string, icon?: string) => {
                try {
                  const newCategory = await addCategory(name, budget);  // addCategory should return the created category
                  if (newCategory && color && icon) {
                    await updateCategory(newCategory.id, { color, icon });
                  }
                  return !!newCategory;
                } catch (err) {
                  console.error('Error in onAddCategory:', err);
                  return false;
                }
              }}

              onUpdateCategory={async (id: string, updates: { budgeted?: number; name?: string; color?: string; icon?: string }) => {
                await updateCategory(id, updates);
              }}
              onDeleteCategory={async (id: string) => {
                await deleteCategory(id);
              }}
            />
          </TabsContent>
          
          <TabsContent value="vendors" className="space-y-4">
            <VendorManager
              categories={categories}
            />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <PaymentTracker />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analisi del Budget</CardTitle>
                <CardDescription>Statistiche dettagliate - Budget Totale: €{totalBudget.toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{}}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categories}>
                      <CartesianGrid strokeDasharray="3 3" />
                      
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );

  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <DashboardSidebar 
        user={user}
        profile={profile}
        isWeddingOrganizer={true}
        onSignOut={signOut}
        signingOut={authLoading}
      />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <CommonHeader />
        
        <main className="flex-1 overflow-auto">
          <BudgetCalculator />
        </main>
      </div>
    </div>
  );
};

const Finance = () => {
  useEffect(() => {
    document.title = "Budget Matrimonio - Gestisci le finanze del tuo matrimonio";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Gestisci il budget del tuo matrimonio con database integration. Imposta un budget totale e alloca le risorse nelle diverse categorie.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Gestisci il budget del tuo matrimonio con database integration. Imposta un budget totale e alloca le risorse nelle diverse categorie.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  return (
    <SidebarProvider>
      <FinanceLayout />
    </SidebarProvider>
  );
};

export default Finance;