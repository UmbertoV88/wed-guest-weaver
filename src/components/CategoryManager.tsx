import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { BudgetCategory } from "@/types/budget";
import { IconRenderer } from "@/components/ui/icon-renderer";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagerProps {
  categories: BudgetCategory[];
  onCreateCategory: (category: { name: string; icon?: string; default_percentage?: number }) => Promise<void>;
  onUpdateCategory?: (id: number, updates: Partial<BudgetCategory>) => Promise<void>;
  onDeleteCategory?: (id: number) => Promise<void>;
}

const AVAILABLE_ICONS = [
  'Church', 'Home', 'Music', 'Mail', 'Gift', 'Flower2', 'Camera', 'Car', 
  'Heart', 'Shirt', 'UserCheck', 'Sparkles', 'Plane', 'MoreHorizontal',
  'Utensils', 'Building', 'MapPin', 'Calendar', 'Users', 'Star'
];

export const CategoryManager = ({ 
  categories, 
  onCreateCategory, 
  onUpdateCategory, 
  onDeleteCategory 
}: CategoryManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    default_percentage: 0
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({ name: '', icon: '', default_percentage: 0 });
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory && onUpdateCategory) {
        await onUpdateCategory(editingCategory.id, formData);
        toast({
          title: "Categoria aggiornata",
          description: "La categoria è stata aggiornata con successo."
        });
      } else {
        await onCreateCategory(formData);
        toast({
          title: "Categoria creata",
          description: "La nuova categoria è stata creata con successo."
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error managing category:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'operazione.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (category: BudgetCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || '',
      default_percentage: category.default_percentage || 0
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (!onDeleteCategory) return;
    
    if (window.confirm('Sei sicuro di voler eliminare questa categoria?')) {
      try {
        await onDeleteCategory(categoryId);
        toast({
          title: "Categoria eliminata",
          description: "La categoria è stata eliminata con successo."
        });
      } catch (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestione Categorie</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nuova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Modifica Categoria' : 'Nuova Categoria'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Categoria</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Es. Decorazioni Extra"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="icon">Icona</Label>
                <Select 
                  value={formData.icon} 
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un'icona" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ICONS.map(icon => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <IconRenderer iconName={icon} className="h-4 w-4" />
                          {icon}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="percentage">Percentuale Budget Suggerita (%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.default_percentage}
                  onChange={(e) => setFormData({ ...formData, default_percentage: parseFloat(e.target.value) || 0 })}
                  placeholder="10.0"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Aggiorna' : 'Crea'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-3">
          {categories.map(category => (
            <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <IconRenderer iconName={category.icon} className="h-5 w-5" />
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  {category.default_percentage && (
                    <Badge variant="secondary" className="text-xs">
                      {category.default_percentage}%
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {onUpdateCategory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {onDeleteCategory && category.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};