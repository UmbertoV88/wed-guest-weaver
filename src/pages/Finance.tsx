import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useBudget } from '@/hooks/useBudget';
import { BudgetOverview } from '@/components/BudgetOverview';
import { BudgetCategoryCard } from '@/components/BudgetCategoryCard';
import { BudgetItemForm } from '@/components/BudgetItemForm';
import CommonHeader from '@/components/CommonHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Edit, Trash2, Plus } from 'lucide-react';
import { BudgetItem, BUDGET_STATUS_LABELS, BUDGET_PRIORITY_LABELS } from '@/types/budget';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const FinanceLayout = () => {
  const { user, signOut, signingOut } = useAuth();
  const { profile, isWeddingOrganizer } = useProfile();
  const { 
    categories, 
    items, 
    loading, 
    createItem, 
    updateItem, 
    deleteItem, 
    getBudgetOverview 
  } = useBudget();
  
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  const overview = getBudgetOverview();
  const filteredItems = selectedCategory 
    ? items.filter(item => item.category_id === selectedCategory)
    : items;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'partial': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full">
        <DashboardSidebar 
          user={user}
          profile={profile}
          isWeddingOrganizer={isWeddingOrganizer}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />
        <SidebarInset className="flex-1 flex flex-col">
          <CommonHeader showSidebarTrigger={true} />
          <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="text-center">Caricamento...</div>
          </main>
        </SidebarInset>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar 
        user={user}
        profile={profile}
        isWeddingOrganizer={isWeddingOrganizer}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />
      
      <SidebarInset className="flex-1 flex flex-col">
        <CommonHeader showSidebarTrigger={true} />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Budget Matrimonio</h1>
              <p className="text-muted-foreground">
                Gestisci il budget del tuo matrimonio in modo intelligente
              </p>
            </div>
            <BudgetItemForm 
              categories={categories}
              onSubmit={createItem}
            />
          </div>

          {/* Overview Cards */}
          <BudgetOverview overview={overview} />

          {/* Categories Grid */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Categorie Budget</h2>
              <Button
                variant={selectedCategory ? "outline" : "ghost"}
                onClick={() => setSelectedCategory(null)}
              >
                Tutte le categorie
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {overview.categoryTotals.map(({ category, budgeted, spent, paid }) => {
                const categoryItems = items.filter(item => item.category_id === category.id);
                return (
                  <div 
                    key={category.id}
                    className={`cursor-pointer ${selectedCategory === category.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                  >
                    <BudgetCategoryCard
                      category={category}
                      items={categoryItems}
                      budgeted={budgeted}
                      spent={spent}
                      paid={paid}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>
                  Dettaglio Spese 
                  {selectedCategory && (
                    <span className="text-base font-normal text-muted-foreground ml-2">
                      - {categories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  )}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {filteredItems.length} {filteredItems.length === 1 ? 'voce' : 'voci'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornitore</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Effettivo</TableHead>
                    <TableHead>Pagato</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Priorità</TableHead>
                    <TableHead>Scadenza</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const category = categories.find(c => c.id === item.category_id);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.vendor_name}</TableCell>
                        <TableCell>
                          {category?.icon} {category?.name}
                        </TableCell>
                        <TableCell>{formatCurrency(item.budgeted_amount)}</TableCell>
                        <TableCell>{formatCurrency(item.actual_amount)}</TableCell>
                        <TableCell>{formatCurrency(item.paid_amount)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(item.status)}>
                            {BUDGET_STATUS_LABELS[item.status as keyof typeof BUDGET_STATUS_LABELS]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadgeVariant(item.priority)}>
                            {BUDGET_PRIORITY_LABELS[item.priority as keyof typeof BUDGET_PRIORITY_LABELS]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.due_date ? (
                            format(new Date(item.due_date), 'dd/MM/yyyy', { locale: it })
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <BudgetItemForm
                              categories={categories}
                              onSubmit={(data) => updateItem(item.id, data)}
                              item={item}
                              trigger={
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nessuna voce di budget trovata</p>
                  <BudgetItemForm 
                    categories={categories}
                    onSubmit={createItem}
                    trigger={
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Aggiungi Prima Voce
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </div>
  );
};

const Finance = () => {
  useEffect(() => {
    document.title = "Budget Matrimonio - Gestione Finanze";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Gestisci il budget del tuo matrimonio con facilità. Traccia spese, pagamenti e mantieni tutto sotto controllo per il tuo giorno speciale.'
      );
    }
  }, []);

  return (
    <SidebarProvider>
      <FinanceLayout />
    </SidebarProvider>
  );
};

export default Finance;