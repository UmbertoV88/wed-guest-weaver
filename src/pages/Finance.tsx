import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Calculator, PieChart, DollarSign, TrendingUp, Edit, AlertTriangle, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Pie } from "recharts";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import CommonHeader from "@/components/CommonHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBudget } from "@/hooks/useBudget";
import BudgetChart from '@/components/budget/BudgetChart';
import BudgetOverview from '@/components/budget/BudgetOverview';


// *** COMPONENTE PER CATEGORIA EDITABILE (AGGIORNATO PER DATABASE) ***
const EditableCategoryCard = ({ 
  category, 
  onUpdateBudget, 
  onDelete 
}: { 
  category: any; // Temporarily any, we'll fix this
  onUpdateBudget: (id: string, budget: number) => void;
  onDelete: (id: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(category.budgeted);
  const { toast } = useToast();

  const handleSave = () => {
    if (isNaN(tempBudget) || tempBudget <= 0) {
      toast({
        title: "Errore",
        description: "Inserisci un budget valido",
        variant: "destructive"
      });
      return;
    }
    
    onUpdateBudget(category.id, tempBudget);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempBudget(category.budgeted);
    setIsEditing(false);
  };

  const remaining = category.budgeted - category.spent;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm">{category.name}</CardTitle>
          <div className="flex gap-1">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTempBudget(category.budgeted);
                  setIsEditing(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Budget:</span>
          {isEditing ? (
            <div className="flex gap-1">
              <Input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(Number(e.target.value))}
                className="w-20 h-6 text-xs"
              />
              <Button size="sm" variant="outline" onClick={handleSave} className="h-6 px-2 text-xs">
                ✓
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 px-2 text-xs">
                ✕
              </Button>
            </div>
          ) : (
            <span className="font-medium">€{category.budgeted.toLocaleString()}</span>
          )}
        </div>
        <div className="flex justify-between text-sm">
          <span>Speso:</span>
          <span className={`font-medium ${category.spent > category.budgeted ? 'text-destructive' : ''}`}>
            €{category.spent.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Rimanente:</span>
          <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{remaining.toLocaleString()}
          </span>
        </div>
        <Progress 
          value={(category.spent / category.budgeted) * 100} 
          className="h-2"
        />
      </CardContent>
    </Card>
  );
};

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
      loading,
      totalBudget,
      totalAllocated,
      totalSpent,
      remainingToAllocate,
      remainingAfterSpent,
      spentPercentage,
      allocatedPercentage,
      
      // Actions
      updateTotalBudget,
      addCategory,
      updateCategory,
      deleteCategory,
      addItem,
      toggleItemPaid,
    } = useBudget();

    // Local UI state
    const [newCategory, setNewCategory] = useState({ name: "", budget: "" });
    const [newItem, setNewItem] = useState({ name: "", amount: "", categoryId: "", date: "" });
    const [isEditingTotal, setIsEditingTotal] = useState(false);
    const [tempTotalBudget, setTempTotalBudget] = useState(35000);
    const { toast } = useToast();

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
                {/* *** OVERVIEW CON DATABASE DATA *** */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Budget Totale MODIFICABILE */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Totale</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={startEditingTotal}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isEditingTotal ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={tempTotalBudget}
                    onChange={(e) => setTempTotalBudget(Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateTotalBudget();
                      }
                      if (e.key === 'Escape') {
                        cancelEditTotal();
                      }
                    }}
                    className="text-lg font-bold"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleUpdateTotalBudget}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Salva
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelEditTotal}>
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-800"
                  onClick={startEditingTotal}
                >
                  €{totalBudget.toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {isEditingTotal ? "Premi Enter per salvare, Esc per annullare" : "Clicca per modificare"}
              </p>
            </CardContent>
          </Card>

          {/* Budget Allocato */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Allocato</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                €{totalAllocated.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {allocatedPercentage.toFixed(1)}% del budget totale
              </p>
              <Progress value={allocatedPercentage} className="mt-2" />
            </CardContent>
          </Card>

          {/* Da Allocare */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Da Allocare</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remainingToAllocate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{remainingToAllocate.toLocaleString()}
              </div>
              {remainingToAllocate < 0 && (
                <p className="text-xs text-red-500">
                  Superato di €{Math.abs(remainingToAllocate).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Speso */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Speso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                €{totalSpent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Rimanente: €{remainingAfterSpent.toLocaleString()}
              </p>
              <Progress value={spentPercentage} className="mt-2" />
            </CardContent>
          </Card>
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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="categories">Categorie</TabsTrigger>
            <TabsTrigger value="expenses">Spese</TabsTrigger>
            <TabsTrigger value="analytics">Analisi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Import the new components */}
            <BudgetOverview
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              remainingBudget={remainingAfterSpent}
              percentageSpent={spentPercentage}
              daysToWedding={120}
              vendorsPaid={3}
              vendorsTotal={categories.length}
              onBudgetChange={async (newBudget) => {
                await updateTotalBudget(newBudget);
              }}
            />

            <BudgetChart 
              categories={categories}
              totalBudget={totalBudget}
            />

            {/* Quick Stats Cards - manteniamo queste dal design originale */}
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
            <Card>
              <CardHeader>
                <CardTitle>Gestione Categorie</CardTitle>
                <CardDescription>
                  Aggiungi e gestisci le categorie del budget. 
                  Budget totale disponibile: €{totalBudget.toLocaleString()} 
                  | Da allocare: €{remainingToAllocate.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category-name">Nome Categoria</Label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      placeholder="es. Fotografo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-budget">Budget (€)</Label>
                    <Input
                      id="category-budget"
                      type="number"
                      value={newCategory.budget}
                      onChange={(e) => setNewCategory({...newCategory, budget: e.target.value})}
                      placeholder={remainingToAllocate > 0 ? remainingToAllocate.toString() : "3000"}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddCategory} className="w-full">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Aggiungi
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <EditableCategoryCard 
                      key={category.id} 
                      category={category} 
                      onUpdateBudget={handleUpdateCategoryBudget}
                      onDelete={handleDeleteCategory}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aggiungi Spesa</CardTitle>
                <CardDescription>
                  Registra una nuova spesa. 
                  Budget totale: €{totalBudget.toLocaleString()} 
                  | Speso: €{totalSpent.toLocaleString()} 
                  | Rimanente: €{remainingAfterSpent.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="item-name">Descrizione</Label>
                    <Input
                      id="item-name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="es. Acconto fotografo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="item-amount">Importo (€)</Label>
                    <Input
                      id="item-amount"
                      type="number"
                      value={newItem.amount}
                      onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                      placeholder="1500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="item-category">Categoria</Label>
                    <select
                      id="item-category"
                      value={newItem.categoryId}
                      onChange={(e) => setNewItem({...newItem, categoryId: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="">Seleziona categoria</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="item-date">Data</Label>
                    <Input
                      id="item-date"
                      type="date"
                      value={newItem.date}
                      onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddItem} className="w-full">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Aggiungi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista Spese</CardTitle>
                <CardDescription>Tutte le spese registrate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nessuna spesa registrata ancora
                    </p>
                  ) : (
                    items.map((item) => {
                      const category = categories.find(cat => cat.id === item.category_id);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: category?.color }} />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {category?.name} • {item.expense_date}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={item.paid ? "default" : "secondary"}>
                              €{item.amount.toLocaleString()}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleItemPaid(item.id)}
                            >
                              {item.paid ? "Pagato" : "Da pagare"}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
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