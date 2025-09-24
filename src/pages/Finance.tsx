import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Calculator, PieChart, DollarSign, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import CommonHeader from "@/components/CommonHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

// Types for budget management
interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
}

interface BudgetItem {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  date: string;
  paid: boolean;
}

const INITIAL_CATEGORIES: BudgetCategory[] = [
  { id: "1", name: "Location", budgeted: 8000, spent: 7500, color: "#E11D48" },
  { id: "2", name: "Catering", budgeted: 12000, spent: 10500, color: "#059669" },
  { id: "3", name: "Fotografo", budgeted: 3000, spent: 2800, color: "#7C3AED" },
  { id: "4", name: "Fiori & Decorazioni", budgeted: 2500, spent: 1800, color: "#EA580C" },
  { id: "5", name: "Musica", budgeted: 1500, spent: 1200, color: "#0891B2" },
  { id: "6", name: "Abiti", budgeted: 4000, spent: 3200, color: "#DC2626" },
  { id: "7", name: "Anelli", budgeted: 2000, spent: 1800, color: "#9333EA" },
  { id: "8", name: "Invitazioni", budgeted: 800, spent: 650, color: "#16A34A" },
  { id: "9", name: "Transport", budgeted: 1000, spent: 800, color: "#0369A1" },
  { id: "10", name: "Varie", budgeted: 1200, spent: 400, color: "#CA8A04" },
];

// Layout component similar to other pages
const FinanceLayout = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const BudgetCalculator = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>(INITIAL_CATEGORIES);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", budget: "" });
  const [newItem, setNewItem] = useState({ name: "", amount: "", categoryId: "", date: "" });
  const { toast } = useToast();

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercentage = (totalSpent / totalBudget) * 100;

  const addCategory = () => {
    if (!newCategory.name || !newCategory.budget) {
      toast({
        title: "Errore",
        description: "Inserisci nome e budget per la categoria",
        variant: "destructive"
      });
      return;
    }

    const category: BudgetCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      budgeted: parseFloat(newCategory.budget),
      spent: 0,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };

    setCategories([...categories, category]);
    setNewCategory({ name: "", budget: "" });
    toast({
      title: "Categoria aggiunta",
      description: `${category.name} aggiunta al budget`
    });
  };

  const addItem = () => {
    if (!newItem.name || !newItem.amount || !newItem.categoryId) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    const item: BudgetItem = {
      id: Date.now().toString(),
      categoryId: newItem.categoryId,
      name: newItem.name,
      amount: parseFloat(newItem.amount),
      date: newItem.date || new Date().toISOString().split('T')[0],
      paid: false
    };

    setItems([...items, item]);
    
    // Update category spent amount
    setCategories(cats => 
      cats.map(cat => 
        cat.id === newItem.categoryId 
          ? { ...cat, spent: cat.spent + item.amount }
          : cat
      )
    );

    setNewItem({ name: "", amount: "", categoryId: "", date: "" });
    toast({
      title: "Spesa aggiunta",
      description: `${item.name} aggiunta per €${item.amount}`
    });
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    setItems(items.filter(item => item.categoryId !== id));
    toast({
      title: "Categoria eliminata",
      description: "Categoria e relative spese rimosse"
    });
  };

  const toggleItemPaid = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, paid: !item.paid } : item
    ));
  };

  const chartData = categories.map(cat => ({
    name: cat.name,
    value: cat.spent,
    color: cat.color
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
            Budget Matrimonio
          </h1>
          <p className="text-muted-foreground">
            Gestisci il budget per il tuo giorno speciale
          </p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Speso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">€{totalSpent.toLocaleString()}</div>
            <Progress value={spentPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rimanente</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              €{remaining.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spentPercentage.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">del budget utilizzato</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="categories">Categorie</TabsTrigger>
          <TabsTrigger value="expenses">Spese</TabsTrigger>
          <TabsTrigger value="analytics">Analisi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuzione Budget</CardTitle>
                <CardDescription>Panoramica delle categorie di spesa</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{}}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <RechartsPieChart data={chartData} cx="50%" cy="50%" outerRadius={80}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorie per Budget</CardTitle>
                <CardDescription>Confronto budget vs spese</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.slice(0, 5).map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.name}</span>
                      <Badge variant={category.spent > category.budgeted ? "destructive" : "secondary"}>
                        €{category.spent.toLocaleString()} / €{category.budgeted.toLocaleString()}
                      </Badge>
                    </div>
                    <Progress 
                      value={(category.spent / category.budgeted) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Categorie</CardTitle>
              <CardDescription>Aggiungi e gestisci le categorie del budget</CardDescription>
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
                    placeholder="3000"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addCategory} className="w-full">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm">{category.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCategory(category.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget:</span>
                        <span className="font-medium">€{category.budgeted.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Speso:</span>
                        <span className={`font-medium ${category.spent > category.budgeted ? 'text-destructive' : ''}`}>
                          €{category.spent.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(category.spent / category.budgeted) * 100} 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aggiungi Spesa</CardTitle>
              <CardDescription>Registra una nuova spesa</CardDescription>
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
                  <Button onClick={addItem} className="w-full">
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
                    const category = categories.find(cat => cat.id === item.categoryId);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: category?.color }} />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {category?.name} • {item.date}
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
                            onClick={() => toggleItemPaid(item.id)}
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
              <CardDescription>Statistiche dettagliate sulle spese</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{}}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="budgeted" fill="#8884d8" name="Budget" />
                    <Bar dataKey="spent" fill="#82ca9d" name="Speso" />
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
      metaDescription.setAttribute('content', 'Gestisci il budget del tuo matrimonio con il nostro calcolatore completo. Monitora spese, categorie e rimani nel budget.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Gestisci il budget del tuo matrimonio con il nostro calcolatore completo. Monitora spese, categorie e rimani nel budget.';
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