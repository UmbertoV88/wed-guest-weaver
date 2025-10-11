import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Package,
  MapPin,
  UtensilsCrossed,
  Camera,
  Shirt,
  Music,
  Flower,
  Car,
  Gift,
  Heart,
  Star,
  Crown,
  Plus,
  Edit3,
  X,
  Check,
  Trash2,
  Euro,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddVendorDialog from './AddVendorDialog';

// Icon mapping
const ICON_OPTIONS = {
  Package,
  MapPin,
  UtensilsCrossed,
  Camera,
  Shirt,
  Music,
  Flower,
  Car,
  Gift,
  Heart,
  Star,
  Crown
};

// Color options
const COLOR_OPTIONS = [
  '#E91E63', '#FF9800', '#9C27B0', '#2196F3', '#4CAF50',
  '#FF5722', '#607D8B', '#795548', '#F44336', '#00BCD4'
];

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
  icon?: string;
}

interface CategoryManagerProps {
  categories: BudgetCategory[];
  availableCategories: BudgetCategory[];
  items?: any[];
  vendors?: any[];
  totalBudget: number;
  remainingToAllocate: number;
  onAddCategory: (categoryId: string, budget: number) => Promise<boolean>;
  onUpdateCategory: (id: string, updates: { budgeted?: number; name?: string; color?: string; icon?: string; }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  getItemsByCategory?: (categoryId: string) => any[];
  getVendorsByCategory?: (categoryId: string) => any[];
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  availableCategories,
  items = [],
  vendors = [],
  totalBudget,
  remainingToAllocate,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  getItemsByCategory = () => [],
  getVendorsByCategory = () => []
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const addFormRef = useRef<HTMLDivElement>(null);
  const [newCategory, setNewCategory] = useState({
    categoryId: '',
    estimatedCost: '',
    color: '#E91E63',
    icon: 'Package'
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (showAddForm && addFormRef.current) {
      setTimeout(() => {
        addFormRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [showAddForm]);

  const handleAddExpenseClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setShowVendorDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusBadge = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    
    if (percentage === 0) {
      return <Badge variant="secondary">Non iniziato</Badge>;
    }
    if (percentage < 50) {
      return <Badge className="bg-blue-500 hover:bg-blue-600">In corso</Badge>;
    }
    if (percentage < 100) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Quasi completato</Badge>;
    }
    if (percentage === 100) {
      return <Badge className="bg-green-500 hover:bg-green-600">Completato</Badge>;
    }
    return <Badge variant="destructive">Budget superato</Badge>;
  };

  // ✅ FUNZIONE CORRETTA - DENTRO IL COMPONENTE CON GESTIONE ERRORI
  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
      toast({
        title: "Errore",
        description: "Categoria non trovata",
        variant: "destructive"
      });
      return;
    }

    try {
      // Controllo se ci sono spese associate
      if (category.spent > 0) {
        const confirmed = window.confirm(
          `Attenzione! La categoria "${category.name}" ha spese registrate di €${category.spent.toLocaleString()}. 
Eliminandola perderai tutti i dati associati. Vuoi continuare?`
        );
        if (!confirmed) return;
      }

      // Conferma finale
      const finalConfirm = window.confirm(
        `Sei sicuro di voler eliminare la categoria "${category.name}"? 
Questa operazione non può essere annullata.`
      );
      
      if (!finalConfirm) return;

      // Imposta loading state
      setDeletingCategory(categoryId);

      // ✅ CHIAMATA CORRETTA - onDeleteCategory ritorna Promise<void>
      await onDeleteCategory(categoryId);
      
      // Se arriviamo qui, l'operazione è riuscita
      toast({
        title: "Categoria eliminata",
        description: `La categoria "${category.name}" è stata eliminata con successo`,
      });

    } catch (error) {
      // ✅ GESTIONE ERRORI APPROPRIATA
      console.error('Errore durante l\'eliminazione della categoria:', error);
      toast({
        title: "Errore durante l'eliminazione",
        description: "Si è verificato un errore durante l'eliminazione della categoria. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      // Rimuovi loading state
      setDeletingCategory(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Categorie</h2>
          <p className="text-gray-600">Modifica i budget e traccia le spese per ogni categoria</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi Categoria
        </Button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <Card ref={addFormRef} className="border-2 border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700">Aggiungi Nuova Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-category-select">Nome Categoria *</Label>
                <Select
                  value={newCategory.categoryId}
                  onValueChange={(value) => setNewCategory(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger id="new-category-select" className="bg-white">
                    <SelectValue placeholder="Seleziona una categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-category-cost">Budget Stimato *</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="new-category-cost"
                    type="number"
                    value={newCategory.estimatedCost}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    placeholder={remainingToAllocate > 0 ? remainingToAllocate.toString() : "1000"}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={async () => {
                  if (!newCategory.categoryId || !newCategory.estimatedCost) {
                    toast({
                      title: "Errore",
                      description: "Compila tutti i campi obbligatori",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  const success = await onAddCategory(
                    newCategory.categoryId,
                    parseFloat(newCategory.estimatedCost)
                  );
                  
                  if (success) {
                    setNewCategory({
                      categoryId: '',
                      estimatedCost: '',
                      color: '#E91E63',
                      icon: 'Package'
                    });
                    setShowAddForm(false);
                  }
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Categoria
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-muted-foreground mb-4">
        Budget totale disponibile: €{totalBudget.toLocaleString()} | Da allocare: €{remainingToAllocate.toLocaleString()}
      </div>

      {/* Enhanced Category Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category) => {
          const IconComponent = ICON_OPTIONS[category.icon as keyof typeof ICON_OPTIONS] || Package;
          const isEditing = editingCategory === category.id;
          const isDeleting = deletingCategory === category.id;
          const progressPercentage = category.budgeted > 0 ? (category.spent / category.budgeted) * 100 : 0;
          const categoryPercentage = totalBudget > 0 ? ((category.budgeted / totalBudget) * 100).toFixed(1) : 0;

          return (
            <Card key={category.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <IconComponent 
                        className="w-5 h-5" 
                        style={{ color: category.color }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-gray-600">{categoryPercentage}% del budget totale</p>
                    </div>
                  </div>
                  {getStatusBadge(category.spent, category.budgeted)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`name-${category.id}`}>Nome Categoria</Label>
                      <Input
                        id={`name-${category.id}`}
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`budget-${category.id}`}>Budget Stimato</Label>
                      <Input
                        id={`budget-${category.id}`}
                        type="number"
                        value={editForm.budgeted}
                        onChange={(e) => setEditForm(prev => ({ ...prev, budgeted: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={async () => {
                          await onUpdateCategory(category.id, {
                            name: editForm.name,
                            budgeted: editForm.budgeted
                          });
                          setEditingCategory(null);
                          setEditForm({});
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      > 
                        <Check className="w-4 h-4 mr-2" />
                        Salva
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditingCategory(null);
                          setEditForm({});
                        }}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Annulla
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Budget Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progresso spesa</span>
                        <span className="font-medium">
                          {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(progressPercentage, 100)} 
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.round(progressPercentage)}% utilizzato</span>
                        <span>
                          {category.spent < category.budgeted 
                            ? `Rimanente: ${formatCurrency(category.budgeted - category.spent)}`
                            : `Superato: ${formatCurrency(category.spent - category.budgeted)}`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Dettaglio spese - SOLO FORNITORI */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Dettaglio spese</h4>
                      <div className="space-y-1 text-sm">
                        {(() => {
                          const categoryVendors = getVendorsByCategory(category.id);
                          
                          if (categoryVendors.length === 0) {
                            return <p className="text-gray-500">Nessun fornitore associato</p>;
                          }

                          return (
                            <div className="space-y-2">
                              {categoryVendors.map((vendor: any) => {
                                const paid = vendor.amount_paid || 0;
                                const total = vendor.default_cost || 0;
                                const percentage = total > 0 ? (paid / total) * 100 : 0;

                                return (
                                  <div key={vendor.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div className="flex-1">
                                      <span className="font-medium">{vendor.name}</span>
                                      <Progress value={percentage} className="h-1 mt-1" />
                                    </div>
                                    <div className="text-right ml-4">
                                      <p className="text-xs text-gray-600">
                                        {formatCurrency(paid)} / {formatCurrency(total)}
                                      </p>
                                      <p className="text-xs text-green-600 font-medium">
                                        {Math.round(percentage)}% pagato
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setEditingCategory(category.id);
                          setEditForm({
                            name: category.name,
                            budgeted: category.budgeted
                          });
                        }}
                        className="flex-1"
                        disabled={isDeleting}
                      >
                        <Edit3 className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Modifica</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        disabled={isDeleting}
                        onClick={() => handleAddExpenseClick(category.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Aggiungi Spesa
                      </Button>
                      {/* ✅ PULSANTE ELIMINAZIONE CORRETTO CON LOADING STATE */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 md:mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 md:mr-1" />
                        )}
                        <span className="hidden md:inline">
                          {isDeleting ? 'Eliminando...' : 'Elimina'}
                        </span>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Vendor Dialog */}
      <AddVendorDialog
        open={showVendorDialog}
        onOpenChange={setShowVendorDialog}
        categories={categories}
        preselectedCategoryId={selectedCategoryId || undefined}
      />
    </div>
  );
};

export default CategoryManager;
