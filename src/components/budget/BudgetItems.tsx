import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { useBudgetItems } from "@/hooks/useBudgetItems";
import { useBudgetCategories } from "@/hooks/useBudgetCategories";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const BudgetItems = () => {
  const { items, createItem, updateItem, deleteItem, isLoading } = useBudgetItems();
  const { categories } = useBudgetCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    vendor_name: "",
    description: "",
    category_id: "",
    budgeted_amount: 0,
    actual_amount: 0,
    paid_amount: 0,
    due_date: "",
    priority: "medium",
    status: "pending",
    notes: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
        toast({
          title: "Voce aggiornata",
          description: "La voce di spesa è stata modificata con successo.",
        });
      } else {
        await createItem(formData);
        toast({
          title: "Voce creata",
          description: "La nuova voce di spesa è stata aggiunta.",
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
    setFormData({
      vendor_name: "",
      description: "",
      category_id: "",
      budgeted_amount: 0,
      actual_amount: 0,
      paid_amount: 0,
      due_date: "",
      priority: "medium",
      status: "pending",
      notes: ""
    });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      vendor_name: item.vendor_name,
      description: item.description || "",
      category_id: item.category_id.toString(),
      budgeted_amount: item.budgeted_amount,
      actual_amount: item.actual_amount || 0,
      paid_amount: item.paid_amount || 0,
      due_date: item.due_date || "",
      priority: item.priority || "medium",
      status: item.status || "pending",
      notes: item.notes || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteItem(itemId);
      toast({
        title: "Voce eliminata",
        description: "La voce di spesa è stata rimossa.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare la voce.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", label: "In attesa" },
      paid: { variant: "default", label: "Pagato" },
      overdue: { variant: "destructive", label: "Scaduto" },
      partial: { variant: "outline", label: "Parziale" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "text-destructive",
      medium: "text-yellow-500",
      low: "text-green-500"
    };
    return colors[priority] || colors.medium;
  };

  if (isLoading) {
    return <div className="space-y-4">
      <Card className="animate-pulse">
        <CardContent className="h-64" />
      </Card>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Voci di Spesa</h2>
          <p className="text-muted-foreground">Gestisci tutte le spese per il tuo matrimonio</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuova Voce
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Modifica Voce di Spesa" : "Nuova Voce di Spesa"}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? "Modifica i dettagli della voce" : "Aggiungi una nuova voce al budget"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor_name">Fornitore *</Label>
                    <Input
                      id="vendor_name"
                      value={formData.vendor_name}
                      onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                      placeholder="Nome del fornitore"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Categoria *</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrizione</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrizione del servizio"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgeted_amount">Budget Previsto *</Label>
                    <Input
                      id="budgeted_amount"
                      type="number"
                      value={formData.budgeted_amount}
                      onChange={(e) => setFormData({ ...formData, budgeted_amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actual_amount">Costo Effettivo</Label>
                    <Input
                      id="actual_amount"
                      type="number"
                      value={formData.actual_amount}
                      onChange={(e) => setFormData({ ...formData, actual_amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paid_amount">Importo Pagato</Label>
                    <Input
                      id="paid_amount"
                      type="number"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Scadenza</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorità</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Bassa</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Stato</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">In attesa</SelectItem>
                        <SelectItem value="partial">Parziale</SelectItem>
                        <SelectItem value="paid">Pagato</SelectItem>
                        <SelectItem value="overdue">Scaduto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Note</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Note aggiuntive..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingItem ? "Aggiorna" : "Crea"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornitore</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Effettivo</TableHead>
                <TableHead>Pagato</TableHead>
                <TableHead>Scadenza</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Priorità</TableHead>
                <TableHead className="w-20">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item) => {
                const category = categories?.find(c => c.id === item.category_id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{item.vendor_name}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {category?.icon} {category?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>€{item.budgeted_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {item.actual_amount > 0 ? `€${item.actual_amount.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>
                      {item.paid_amount > 0 ? `€${item.paid_amount.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>
                      {item.due_date ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(item.due_date), "dd/MM/yyyy", { locale: it })}
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <AlertCircle className={`w-4 h-4 ${getPriorityColor(item.priority)}`} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {items?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nessuna voce di spesa
              </h3>
              <p className="text-muted-foreground mb-4">
                Inizia aggiungendo le prime voci di spesa per il matrimonio
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi prima voce
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetItems;