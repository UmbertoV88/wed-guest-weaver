import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  Euro, 
  Edit3, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VendorManagerProps {
  categories: any[];
  vendors: any[]; // ← AGGIUNTO
  onAddVendor: (data: any) => Promise<any>; // ← AGGIUNTO
  onUpdateVendor: (id: string, data: any) => Promise<any>; // ← AGGIUNTO
  onDeleteVendor: (id: string) => Promise<boolean>; // ← AGGIUNTO
}

const VendorManager: React.FC<VendorManagerProps> = ({ 
  categories, 
  vendors, // ← RICEVI DALLE PROPS
  onAddVendor, // ← RICEVI DALLE PROPS
  onUpdateVendor, // ← RICEVI DALLE PROPS
  onDeleteVendor // ← RICEVI DALLE PROPS
}) => {
  // ❌ RIMOSSO: const { vendors, addVendor, updateVendor, deleteVendor, loading } = useBudget();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false); // ← AGGIUNTO stato locale per loading
  const [newVendor, setNewVendor] = useState({
    name: '',
    category_id: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: '',
    notes: '',
    default_cost: ''
  });
  
  const { toast } = useToast();

  // Calcola le spese per categoria per determinare i pagamenti ai fornitori
  const getVendorPayments = (vendorId: string, categoryId: string) => {
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

  // ✅ MODIFICATO: usa onAddVendor dalle props
  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.category_id) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const vendorData = {
      ...newVendor,
      default_cost: newVendor.default_cost ? parseFloat(newVendor.default_cost) : null
    };

    const result = await onAddVendor(vendorData); // ← CAMBIATO DA addVendor a onAddVendor
    
    if (result) {
      setNewVendor({
        name: '',
        category_id: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        website: '',
        notes: '',
        default_cost: ''
      });
      setShowAddForm(false);
    }
    setLoading(false);
  };

  // ✅ MODIFICATO: usa onDeleteVendor dalle props
  const handleDeleteVendor = async (vendorId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo fornitore? Questa azione non può essere annullata.')) {
      setLoading(true);
      await onDeleteVendor(vendorId); // ← CAMBIATO DA deleteVendor a onDeleteVendor
      setLoading(false);
    }
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
          disabled={loading}
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
        <Card className="border-2 border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700">Aggiungi Nuovo Fornitore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendor-name">Nome Fornitore *</Label>
                <Input
                  id="vendor-name"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="es. Studio Fotografico Luce"
                />
              </div>
              <div>
                <Label>Categoria *</Label>
                <Select 
                  value={newVendor.category_id} 
                  onValueChange={(value) => setNewVendor(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
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
              </div>
              <div>
                <Label htmlFor="vendor-cost">Costo</Label>
                <Input
                  id="vendor-cost"
                  type="number"
                  value={newVendor.default_cost}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, default_cost: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="vendor-email">Email</Label>
                <Input
                  id="vendor-email"
                  type="email"
                  value={newVendor.contact_email}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="email@example.com"
                />
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
                  onChange={(e) => setNewVendor(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
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
              <Button 
                onClick={handleAddVendor} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Aggiungendo...' : 'Aggiungi Fornitore'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="flex-1"
                disabled={loading}
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
                      {vendor.default_cost && (
                        <p className="text-sm font-medium text-primary">
                          {formatCurrency(vendor.default_cost)}
                        </p>
                      )}
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
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditingVendor(vendor)}
                      disabled={loading}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifica
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteVendor(vendor.id)}
                      disabled={loading}
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

      {filteredVendors.length === 0 && !loading && (
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
