import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Plus, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon, 
  Euro, 
  Edit3, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
//import { useBudget } from '@/hooks/useBudget';
import { useBudgetQuery } from '@/hooks/useBudgetQuery';

interface VendorManagerProps {
  categories: any[];
}

const VendorManager: React.FC<VendorManagerProps> = ({ categories }) => {
  const { vendors, addVendor, updateVendor, deleteVendor, loading } = useBudgetQuery();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const formRef = useRef<HTMLDivElement>(null);
  const editFormRef = useRef<HTMLDivElement>(null);
  const [newVendor, setNewVendor] = useState({
    name: '',
    category_id: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: '',
    notes: '',
    default_cost: '',
    payment_due_date: undefined as Date | undefined
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState({
    name: '',
    category_id: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: '',
    notes: '',
    default_cost: '',
    payment_due_date: undefined as Date | undefined
  });
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  useEffect(() => {
    if (showAddForm && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [showAddForm]);

  useEffect(() => {
    if (editingVendor && editFormRef.current) {
      setTimeout(() => {
        editFormRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [editingVendor]);

  // Normalizza URL aggiungendo https:// se manca il protocollo
  const normalizeUrl = (url: string): string => {
    if (!url.trim()) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  // Calcola le spese per categoria per determinare i pagamenti ai fornitori
  const getVendorPayments = (vendorId: string, categoryId: string) => {
    // Questa logica può essere espansa per tracciare i pagamenti specifici
    // Per ora, mostriamo tutti i vendor come "in attesa" finché non aggiungiamo pagamenti
    return {
      paid: 0,
      remaining: 0,
      status: 'pending' as const
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Pagato</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Parziale</Badge>;
      case 'pending':
        return <Badge variant="destructive">In sospeso</Badge>;
      default:
        return <Badge variant="secondary">Sconosciuto</Badge>;
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sconosciuta';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleAddVendor = async () => {
    // ✅ RESET ERRORI PRECEDENTI
    setFormErrors({});
    
    // ✅ VALIDAZIONE CAMPO PER CAMPO
    const errors: Record<string, string> = {};
    
    if (!newVendor.name.trim()) {
      errors.name = "Nome fornitore è obbligatorio";
    } else if (newVendor.name.trim().length < 2) {
      errors.name = "Il nome deve avere almeno 2 caratteri";
    }
    
    if (!newVendor.category_id) {
      errors.category_id = "Seleziona una categoria";
    }
    
    if (!newVendor.default_cost.trim()) {
      errors.default_cost = "Costo è obbligatorio";
    } else {
      const cost = parseFloat(newVendor.default_cost);
      if (isNaN(cost) || cost <= 0) {
        errors.default_cost = "Inserisci un costo valido maggiore di 0";
      } else if (cost > 100000) {
        errors.default_cost = "Il costo sembra eccessivo (max €100.000)";
      }
    }
    
    // Validazione email opzionale
    if (newVendor.contact_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newVendor.contact_email)) {
      errors.contact_email = "Formato email non valido";
    }
    
    // ✅ SE CI SONO ERRORI, MOSTRALI SUI CAMPI (NON CHIUDERE LA FINESTRA)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return; // ESCE SENZA CHIUDERE IL FORM
    }
    
    // ✅ SE TUTTO OK, PROCEDI CON IL SALVATAGGIO
    const cost = parseFloat(newVendor.default_cost);
    const vendorData = {
      name: newVendor.name.trim(),
      category_id: newVendor.category_id,
      contact_email: newVendor.contact_email.trim() || undefined,
      contact_phone: newVendor.contact_phone.trim() || undefined,
      address: newVendor.address.trim() || undefined,
      website: normalizeUrl(newVendor.website) || undefined,
      notes: newVendor.notes.trim() || undefined,
      default_cost: cost,
      payment_due_date: newVendor.payment_due_date ? format(newVendor.payment_due_date, 'yyyy-MM-dd') : undefined
    };

    await addVendor(vendorData);
    
    // Reset form dopo l'aggiunta (gli errori sono gestiti dal toast nella mutation)
    setNewVendor({
      name: '',
      category_id: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      website: '',
      notes: '',
      default_cost: '',
      payment_due_date: undefined
    });
    setFormErrors({});
    setShowAddForm(false);
  };



  const handleDeleteVendor = async (vendorId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo fornitore? Questa azione non può essere annullata.')) {
      await deleteVendor(vendorId);
    }
  };

  const handleEditVendor = (vendor: any) => {
    setEditingVendor(vendor);
    setEditForm({
      name: vendor.name || '',
      category_id: vendor.category_id || '',
      contact_email: vendor.contact_email || '',
      contact_phone: vendor.contact_phone || '',
      address: vendor.address || '',
      website: vendor.website?.replace('https://', '') || '',
      notes: vendor.notes || '',
      default_cost: vendor.default_cost?.toString() || '',
      payment_due_date: vendor.payment_due_date ? new Date(vendor.payment_due_date) : undefined
    });
    setEditFormErrors({});
  };
  
  const handleUpdateVendor = async () => {
    // Reset errori precedenti
    setEditFormErrors({});
    
    // Validazione campo per campo
    const errors: Record<string, string> = {};
    
    if (!editForm.name.trim()) {
      errors.name = "Nome fornitore è obbligatorio";
    } else if (editForm.name.trim().length < 2) {
      errors.name = "Il nome deve avere almeno 2 caratteri";
    }
    
    if (!editForm.category_id) {
      errors.category_id = "Seleziona una categoria";
    }
    
    if (!editForm.default_cost.trim()) {
      errors.default_cost = "Costo è obbligatorio";
    } else {
      const cost = parseFloat(editForm.default_cost);
      if (isNaN(cost) || cost <= 0) {
        errors.default_cost = "Inserisci un costo valido maggiore di 0";
      } else if (cost > 100000) {
        errors.default_cost = "Il costo sembra eccessivo (max €100.000)";
      }
    }
    
    // Validazione email opzionale
    if (editForm.contact_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.contact_email)) {
      errors.contact_email = "Formato email non valido";
    }
    
    // Se ci sono errori, mostrali sui campi
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }
    
    // Se tutto OK, procedi con l'aggiornamento
    const cost = parseFloat(editForm.default_cost);
    const vendorData = {
      name: editForm.name.trim(),
      category_id: editForm.category_id,
      contact_email: editForm.contact_email.trim() || undefined,
      contact_phone: editForm.contact_phone.trim() || undefined,
      address: editForm.address.trim() || undefined,
      website: normalizeUrl(editForm.website) || undefined,
      notes: editForm.notes.trim() || undefined,
      default_cost: cost,
      payment_due_date: editForm.payment_due_date ? format(editForm.payment_due_date, 'yyyy-MM-dd') : undefined
    };
    
    await updateVendor(editingVendor.id, vendorData);
    
    // Reset dopo l'aggiornamento
    setEditingVendor(null);
    setEditForm({
      name: '',
      category_id: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      website: '',
      notes: '',
      default_cost: '',
      payment_due_date: undefined
    });
    setEditFormErrors({});
  };
  
  const handleCancelEdit = () => {
    setEditingVendor(null);
    setEditForm({
      name: '',
      category_id: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      website: '',
      notes: '',
      default_cost: '',
      payment_due_date: undefined
    });
    setEditFormErrors({});
  };


  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryName(vendor.category_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Fornitori</h2>
          <p className="text-gray-600">Gestisci i tuoi fornitori e traccia i pagamenti</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi Fornitore
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Cerca fornitori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Vendor Form */}
      {showAddForm && (
        <Card ref={formRef} className="border-2 border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700">Aggiungi Nuovo Fornitore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome Fornitore */}
              <div>
                <Label htmlFor="vendor-name">Nome Fornitore *</Label>
                <Input
                  id="vendor-name"
                  value={newVendor.name}
                  onChange={(e) => {
                    setNewVendor(prev => ({ ...prev, name: e.target.value }));
                    // Pulisci errore quando l'utente inizia a digitare
                    if (formErrors.name) {
                      setFormErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  placeholder="es. Studio Fotografico Luce"
                  className={formErrors.name ? 'border-red-500 focus:border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Categoria */}
              <div>
                <Label>Categoria *</Label>
                <Select 
                  value={newVendor.category_id} 
                  onValueChange={(value) => {
                    setNewVendor(prev => ({ ...prev, category_id: value }));
                    // Pulisci errore quando l'utente seleziona
                    if (formErrors.category_id) {
                      setFormErrors(prev => ({ ...prev, category_id: '' }));
                    }
                  }}
                >
                  <SelectTrigger className={formErrors.category_id ? 'border-red-500 focus:border-red-500' : ''}>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category_id && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.category_id}</p>
                )}
              </div>

              {/* Costo */}
              <div>
                <Label htmlFor="vendor-cost">Costo *</Label>
                <Input
                  id="vendor-cost"
                  type="number"
                  value={newVendor.default_cost}
                  onChange={(e) => {
                    setNewVendor(prev => ({ ...prev, default_cost: e.target.value }));
                    // Pulisci errore quando l'utente inizia a digitare
                    if (formErrors.default_cost) {
                      setFormErrors(prev => ({ ...prev, default_cost: '' }));
                    }
                  }}
                  placeholder="1000.00"
                  step="0.01"
                  min="0.01"
                  className={formErrors.default_cost ? 'border-red-500 focus:border-red-500' : ''}
                />
                {formErrors.default_cost && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.default_cost}</p>
                )}
              </div>

              {/* Data Scadenza */}
              <div>
                <Label htmlFor="vendor-due-date">Data Scadenza</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="vendor-due-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newVendor.payment_due_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newVendor.payment_due_date ? (
                        format(newVendor.payment_due_date, "PPP", { locale: it })
                      ) : (
                        <span>Seleziona data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newVendor.payment_due_date}
                      onSelect={(date) => setNewVendor(prev => ({ ...prev, payment_due_date: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="vendor-email">Email</Label>
                <Input
                  id="vendor-email"
                  type="email"
                  value={newVendor.contact_email}
                  onChange={(e) => {
                    setNewVendor(prev => ({ ...prev, contact_email: e.target.value }));
                    if (formErrors.contact_email) {
                      setFormErrors(prev => ({ ...prev, contact_email: '' }));
                    }
                  }}
                  placeholder="email@example.com"
                  className={formErrors.contact_email ? 'border-red-500 focus:border-red-500' : ''}
                />
                {formErrors.contact_email && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.contact_email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="vendor-phone">Telefono</Label>
                <Input
                  id="vendor-phone"
                  value={newVendor.contact_phone}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="+39 333 123 4567"
                />
              </div>
              <div>
                <Label htmlFor="vendor-website">Sito Web</Label>
                <Input
                  id="vendor-website"
                  value={newVendor.website}
                  onChange={(e) => {
                    setNewVendor(prev => ({ ...prev, website: e.target.value }));
                    if (formErrors.website) {
                      setFormErrors(prev => ({ ...prev, website: '' }));
                    }
                  }}
                  placeholder="example.com"
                  className={formErrors.website ? 'border-red-500 focus:border-red-500' : ''}
                />
                {formErrors.website && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.website}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">https:// verrà aggiunto automaticamente</p>
              </div>
            </div>
            <div>
              <Label htmlFor="vendor-address">Indirizzo</Label>
              <Input
                id="vendor-address"
                value={newVendor.address}
                onChange={(e) => setNewVendor(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Via Roma 123, Milano"
              />
            </div>
            <div>
              <Label htmlFor="vendor-notes">Note</Label>
              <Textarea
                id="vendor-notes"
                value={newVendor.notes}
                onChange={(e) => setNewVendor(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddVendor} className="flex-1 bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Fornitore
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Vendor Form */}
      {editingVendor && (
        <Card ref={editFormRef} className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">
              Modifica Fornitore: {editingVendor.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome Fornitore */}
              <div>
                <Label htmlFor="edit-vendor-name">Nome Fornitore *</Label>
                <Input
                  id="edit-vendor-name"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, name: e.target.value }));
                    if (editFormErrors.name) {
                      setEditFormErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  placeholder="es. Studio Fotografico Luce"
                  className={editFormErrors.name ? 'border-red-500 focus:border-red-500' : ''}
                />
                {editFormErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{editFormErrors.name}</p>
                )}
              </div>
      
              {/* Categoria */}
              <div>
                <Label>Categoria *</Label>
                <Select 
                  value={editForm.category_id} 
                  onValueChange={(value) => {
                    setEditForm(prev => ({ ...prev, category_id: value }));
                    if (editFormErrors.category_id) {
                      setEditFormErrors(prev => ({ ...prev, category_id: '' }));
                    }
                  }}
                >
                  <SelectTrigger className={editFormErrors.category_id ? 'border-red-500 focus:border-red-500' : ''}>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editFormErrors.category_id && (
                  <p className="text-sm text-red-500 mt-1">{editFormErrors.category_id}</p>
                )}
              </div>
      
              {/* Costo */}
              <div>
                <Label htmlFor="edit-vendor-cost">Costo *</Label>
                <Input
                  id="edit-vendor-cost"
                  type="number"
                  value={editForm.default_cost}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, default_cost: e.target.value }));
                    if (editFormErrors.default_cost) {
                      setEditFormErrors(prev => ({ ...prev, default_cost: '' }));
                    }
                  }}
                  placeholder="1000.00"
                  step="0.01"
                  min="0.01"
                  className={editFormErrors.default_cost ? 'border-red-500 focus:border-red-500' : ''}
                />
                {editFormErrors.default_cost && (
                  <p className="text-sm text-red-500 mt-1">{editFormErrors.default_cost}</p>
                )}
              </div>
      
              {/* Data Scadenza */}
              <div>
                <Label>Data Scadenza</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editForm.payment_due_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editForm.payment_due_date ? (
                        format(editForm.payment_due_date, "PPP", { locale: it })
                      ) : (
                        <span>Seleziona data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={editForm.payment_due_date}
                      onSelect={(date) => setEditForm(prev => ({ ...prev, payment_due_date: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
      
              {/* Email */}
              <div>
                <Label htmlFor="edit-vendor-email">Email</Label>
                <Input
                  id="edit-vendor-email"
                  type="email"
                  value={editForm.contact_email}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, contact_email: e.target.value }));
                    if (editFormErrors.contact_email) {
                      setEditFormErrors(prev => ({ ...prev, contact_email: '' }));
                    }
                  }}
                  placeholder="email@example.com"
                  className={editFormErrors.contact_email ? 'border-red-500 focus:border-red-500' : ''}
                />
                {editFormErrors.contact_email && (
                  <p className="text-sm text-red-500 mt-1">{editFormErrors.contact_email}</p>
                )}
              </div>
      
              {/* Telefono */}
              <div>
                <Label htmlFor="edit-vendor-phone">Telefono</Label>
                <Input
                  id="edit-vendor-phone"
                  value={editForm.contact_phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="+39 333 123 4567"
                />
              </div>
      
              {/* Sito Web */}
              <div>
                <Label htmlFor="edit-vendor-website">Sito Web</Label>
                <Input
                  id="edit-vendor-website"
                  value={editForm.website}
                  onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">https:// verrà aggiunto automaticamente</p>
              </div>
            </div>
      
            {/* Indirizzo */}
            <div className="mt-4">
              <Label htmlFor="edit-vendor-address">Indirizzo</Label>
              <Input
                id="edit-vendor-address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Via Roma 123, Milano"
              />
            </div>
      
            {/* Note */}
            <div className="mt-4">
              <Label htmlFor="edit-vendor-notes">Note</Label>
              <Textarea
                id="edit-vendor-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Note aggiuntive..."
                rows={2}
              />
            </div>
      
            {/* Buttons */}
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={handleUpdateVendor}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Salva Modifiche
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCancelEdit}
                className="flex-1"
              >
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendors List */}
      {loading ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">Caricamento fornitori...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVendors.map((vendor) => {
            const payments = getVendorPayments(vendor.id, vendor.category_id);
            return (
              <Card key={vendor.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(payments.status)}
                        {vendor.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{getCategoryName(vendor.category_id)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {vendor.default_cost && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <Euro className="w-3 h-3 mr-1" />
                            {formatCurrency(vendor.default_cost)}
                          </Badge>
                        )}
                        {vendor.payment_due_date && (
                          <Badge variant="outline" className="text-orange-700 border-orange-300">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            Scadenza: {formatDate(vendor.payment_due_date)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(payments.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    {vendor.contact_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{vendor.contact_email}</span>
                      </div>
                    )}
                    {vendor.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{vendor.contact_phone}</span>
                      </div>
                    )}
                    {vendor.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                        <span>🌐</span>
                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                          {vendor.website}
                        </a>
                      </div>
                    )}
                    {vendor.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📍</span>
                        <span>{vendor.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {vendor.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {vendor.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      onClick={() => handleEditVendor(vendor)}
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifica
                    </Button>

                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteVendor(vendor.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Elimina
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredVendors.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nessun fornitore trovato</p>
            <p className="text-gray-400">Aggiungi il tuo primo fornitore per iniziare</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorManager;
