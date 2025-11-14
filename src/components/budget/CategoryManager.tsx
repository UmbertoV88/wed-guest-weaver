import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddVendorDialog from "./AddVendorDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { budgetCategoriesApi, bombonieraApi } from "@/services/budgetService";

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
  Crown,
};

// Color options
const COLOR_OPTIONS = [
  "#E91E63",
  "#FF9800",
  "#9C27B0",
  "#2196F3",
  "#4CAF50",
  "#FF5722",
  "#607D8B",
  "#795548",
  "#F44336",
  "#00BCD4",
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
  onUpdateCategory: (
    id: string,
    updates: { budgeted?: number; name?: string; color?: string; icon?: string },
  ) => Promise<void>;
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
  getVendorsByCategory = () => [],
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
    spent: number;
    vendorsCount: number;
    itemsCount: number;
  } | null>(null);
  const addFormRef = useRef<HTMLDivElement>(null);
  const [newCategory, setNewCategory] = useState({
    categoryId: "",
    estimatedCost: "",
    color: "#E91E63",
    icon: "Package",
  });
  const [bombonieraCount, setBombonieraCount] = useState(0);

  const { toast } = useToast();

  useEffect(() => {
    if (showAddForm && addFormRef.current) {
      setTimeout(() => {
        addFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [showAddForm]);

  // Effect per caricare il conteggio bomboniere
  useEffect(() => {
    const loadBombonieraCount = async () => {
      try {
        const count = await bombonieraApi.getAssignedCount();
        setBombonieraCount(count);
      } catch (error) {
        console.error('Errore caricamento conteggio bomboniere:', error);
      }
    };
    
    // Carica subito
    loadBombonieraCount();
    
    // Aggiorna ogni 10 secondi
    const interval = setInterval(loadBombonieraCount, 10000);
    return () => clearInterval(interval);
  }, [categories]);

  const handleAddExpenseClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setShowVendorDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
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

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) {
      toast({
        title: "Errore",
        description: "Categoria non trovata",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fetch info su cosa verrà eliminato
      const deleteInfo = await budgetCategoriesApi.getDeleteInfo(categoryId);

      // Mostra dialog con i dettagli
      setCategoryToDelete({
        id: categoryId,
        name: category.name,
        spent: category.spent,
        vendorsCount: deleteInfo.vendorsCount,
        itemsCount: deleteInfo.itemsCount,
      });
      setDeleteDialogOpen(true);
    } catch (error) {
      console.error("Errore durante il recupero delle informazioni:", error);
      toast({
        title: "Errore",
        description: "Impossibile recuperare le informazioni sulla categoria",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setDeletingCategory(categoryToDelete.id);

      // Esegui eliminazione
      await onDeleteCategory(categoryToDelete.id);

      // Toast viene gestito da useBudgetQuery.ts con i dettagli corretti
    } catch (error) {
      console.error("Errore durante l'eliminazione della categoria:", error);
      toast({
        title: "Errore durante l'eliminazione",
        description: "Si è verificato un errore. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setDeletingCategory(null);
      setCategoryToDelete(null);
      setDeleteDialogOpen(false);
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
                  onValueChange={(value) => setNewCategory((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger id="new-category-select" className="bg-white">
                    <SelectValue placeholder="Seleziona una categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
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
                    onChange={(e) => setNewCategory((prev) => ({ ...prev, estimatedCost: e.target.value }))}
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
                      variant: "destructive",
                    });
                    return;
                  }

                  const success = await onAddCategory(newCategory.categoryId, parseFloat(newCategory.estimatedCost));

                  if (success) {
                    setNewCategory({
                      categoryId: "",
                      estimatedCost: "",
                      color: "#E91E63",
                      icon: "Package",
                    });
                    setShowAddForm(false);
                  }
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Categoria
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-muted-foreground mb-4">
        Budget totale disponibile: €{totalBudget.toLocaleString()} | Da allocare: €
        {remainingToAllocate.toLocaleString()}
      </div>

      {/* Enhanced Category Accordion */}
      <Accordion
        type="single"
        collapsible
        /*defaultValue={categories[0]?.id}*/
        className="space-y-2"
      >
          {categories.map((category) => {
            const IconComponent = ICON_OPTIONS[category.icon as keyof typeof ICON_OPTIONS] || Package;
            const isEditing = editingCategory === category.id;
            const isDeleting = deletingCategory === category.id;
            
            // Calculate actual spent from vendors' total costs
            const categoryVendors = getVendorsByCategory(category.id);
            const actualSpent = categoryVendors.reduce((sum, vendor) => {
              return sum + (vendor.default_cost || 0);
            }, 0);
            
            const progressPercentage = category.budgeted > 0 ? (actualSpent / category.budgeted) * 100 : 0;
            const categoryPercentage = totalBudget > 0 ? ((category.budgeted / totalBudget) * 100).toFixed(1) : 0;

          return (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="hover:no-underline px-6 py-4 hover:bg-muted/50">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full" style={{ backgroundColor: `${category.color}20` }}>
                      <IconComponent className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">{category.name}</h3>
                        
                        {/* Badge Bomboniere - SOLO se categoria è "Bomboniere" */}
                        {category.name.toLowerCase().includes('bomboniere') && bombonieraCount > 0 && (
                          <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-300">
                            🎁 {bombonieraCount} Bomboniere
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{categoryPercentage}% del budget</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {getStatusBadge(category.spent, category.budgeted)}

                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-sm">
                        {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
                      </p>
                      <p className="text-xs text-muted-foreground">{Math.round(progressPercentage)}% utilizzato</p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4 pt-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`name-${category.id}`}>Nome Categoria</Label>
                        <Input
                          id={`name-${category.id}`}
                          value={editForm.name}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`budget-${category.id}`}>Budget Stimato</Label>
                        <Input
                          id={`budget-${category.id}`}
                          type="number"
                          value={editForm.budgeted}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, budgeted: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            await onUpdateCategory(category.id, {
                              name: editForm.name,
                              budgeted: editForm.budgeted,
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
                            {formatCurrency(actualSpent)} / {formatCurrency(category.budgeted)}
                          </span>
                        </div>
                        <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{Math.round(progressPercentage)}% utilizzato</span>
                          <span>
                            {actualSpent < category.budgeted
                              ? `Rimanente: ${formatCurrency(category.budgeted - actualSpent)}`
                              : `Superato: ${formatCurrency(actualSpent - category.budgeted)}`}
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
                                    <div
                                      key={vendor.id}
                                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                    >
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
                              budgeted: category.budgeted,
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
                          <span className="hidden md:inline">{isDeleting ? "Eliminando..." : "Elimina"}</span>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="⚠️ Conferma Eliminazione Categoria"
        description={
          categoryToDelete ? (
            <div className="space-y-3">
              <p className="font-semibold text-gray-900">Stai per eliminare la categoria "{categoryToDelete.name}"</p>

              {categoryToDelete.spent > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    💰 Totale speso: €{categoryToDelete.spent.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              {(categoryToDelete.vendorsCount > 0 || categoryToDelete.itemsCount > 0) && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-1">
                  <p className="text-sm text-orange-800 font-medium">Verranno eliminati definitivamente:</p>
                  {categoryToDelete.vendorsCount > 0 && (
                    <p className="text-sm text-orange-700">• {categoryToDelete.vendorsCount} fornitore/i</p>
                  )}
                  {categoryToDelete.itemsCount > 0 && (
                    <p className="text-sm text-orange-700">• {categoryToDelete.itemsCount} spesa/e</p>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-600 font-medium">⚠️ Questa operazione è irreversibile!</p>
            </div>
          ) : (
            "Confermi l'eliminazione?"
          )
        }
        confirmText="Sì, elimina definitivamente"
        cancelText="Annulla"
        onConfirm={confirmDeleteCategory}
        variant="destructive"
      />

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
