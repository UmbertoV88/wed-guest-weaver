import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, DollarSign } from "lucide-react";
import { useBudgetCategories } from "@/hooks/useBudgetCategories";
import { useToast } from "@/hooks/use-toast";

const BudgetCategories = () => {
  const { categories, createCategory, updateCategory, deleteCategory, isLoading } = useBudgetCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    default_percentage: 0,
    icon: "💍"
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast({
          title: "Categoria aggiornata",
          description: "La categoria è stata modificata con successo.",
        });
      } else {
        await createCategory(formData);
        toast({
          title: "Categoria creata",
          description: "La nuova categoria è stata aggiunta.",
        });
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'operazione.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", default_percentage: 0, icon: "💍" });
    setEditingCategory(null);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      default_percentage: category.default_percentage || 0,
      icon: category.icon || "💍"
    });
    setDialogOpen(true);
  };

  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      toast({
        title: "Categoria eliminata",
        description: "La categoria è stata rimossa.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare la categoria.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="h-32" />
        </Card>
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categorie Budget</h2>
          <p className="text-muted-foreground">Gestisci le categorie di spesa per il tuo matrimonio</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Modifica Categoria" : "Nuova Categoria"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? "Modifica i dettagli della categoria" : "Crea una nuova categoria di spesa"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    placeholder="es. Location, Catering..."
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="icon" className="text-right">
                    Icona
                  </Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="col-span-3"
                    placeholder="💍"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="percentage" className="text-right">
                    % Budget
                  </Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={formData.default_percentage}
                    onChange={(e) => setFormData({ ...formData, default_percentage: parseFloat(e.target.value) || 0 })}
                    className="col-span-3"
                    placeholder="20"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingCategory ? "Aggiorna" : "Crea"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{category.icon || "💍"}</span>
                <CardTitle className="text-sm font-medium">
                  {category.name}
                </CardTitle>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {category.default_percentage && (
                <Badge variant="secondary" className="mb-2">
                  {category.default_percentage}% del budget
                </Badge>
              )}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <DollarSign className="w-3 h-3" />
                <span>€{category.total_spent?.toLocaleString() || "0"} spesi</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nessuna categoria creata
            </h3>
            <p className="text-muted-foreground mb-4">
              Inizia creando le categorie di spesa per il tuo matrimonio
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crea prima categoria
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetCategories;