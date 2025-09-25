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

// Mock vendors data (adapta dal Budget-calculator)
const mockVendors = [
  {
    id: 1,
    categoryId: "1", // Adjust to string IDs
    name: "Villa San Martino",
    cost: 8000,
    paid: 3000,
    remaining: 5000,
    dueDate: "2024-06-15",
    status: "partial",
    notes: "Pagato acconto del 30%",
    contact: "+39 333 123 4567"
  },
  {
    id: 2,
    categoryId: "2",
    name: "Catering Il Convivio",
    cost: 5800,
    paid: 0,
    remaining: 5800,
    dueDate: "2024-05-20",
    status: "pending",
    notes: "Confermare menu definitivo",
    contact: "+39 334 987 6543"
  },
  {
    id: 3,
    categoryId: "3",
    name: "Studio Fotografico Luce",
    cost: 3200,
    paid: 800,
    remaining: 2400,
    dueDate: "2024-07-01",
    status: "partial",
    notes: "Pagato 25% di acconto",
    contact: "+39 335 456 7890"
  }
];

interface VendorManagerProps {
  categories: any[];
}

const VendorManager: React.FC<VendorManagerProps> = ({ categories }) => {
  const [vendors, setVendors] = useState(mockVendors);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newVendor, setNewVendor] = useState({
    name: '',
    categoryId: '',
    cost: '',
    paid: 0,
    dueDate: '',
    notes: '',
    contact: ''
  });
  
  const { toast } = useToast();

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

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.categoryId || !newVendor.cost) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    const vendor = {
      ...newVendor,
      id: Date.now(),
      cost: parseFloat(newVendor.cost),
      remaining: parseFloat(newVendor.cost) - newVendor.paid,
      status: newVendor.paid === 0 ? 'pending' : 
               newVendor.paid >= parseFloat(newVendor.cost) ? 'paid' : 'partial'
    };

    setVendors([...vendors, vendor]);
    setNewVendor({
      name: '',
      categoryId: '',
      cost: '',
      paid: 0,
      dueDate: '',
      notes: '',
      contact: ''
    });
    setShowAddForm(false);
    toast({
      title: "Successo",
      description: "Fornitore aggiunto con successo!"
    });
  };

  const handlePayment = (vendorId: number, paymentAmount: number) => {
    setVendors(prev => 
      prev.map(vendor => {
        if (vendor.id === vendorId) {
          const newPaid = vendor.paid + paymentAmount;
          const newRemaining = vendor.cost - newPaid;
          const newStatus = newRemaining <= 0 ? 'paid' : 
                           newPaid > 0 ? 'partial' : 'pending';
          
          return {
            ...vendor,
            paid: newPaid,
            remaining: Math.max(0, newRemaining),
            status: newStatus
          };
        }
        return vendor;
      })
    );
    toast({
      title: "Successo",
      description: "Pagamento registrato con successo!"
    });
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryName(vendor.categoryId).toLowerCase().includes(searchTerm.toLowerCase())
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
                  value={newVendor.categoryId} 
                  onValueChange={(value) => setNewVendor(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vendor-cost">Costo Totale *</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="vendor-cost"
                    type="number"
                    value={newVendor.cost}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, cost: e.target.value }))}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="vendor-contact">Contatto</Label>
                <Input
                  id="vendor-contact"
                  value={newVendor.contact}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="Telefono o email"
                />
              </div>
              <div>
                <Label htmlFor="vendor-duedate">Data Scadenza</Label>
                <Input
                  id="vendor-duedate"
                  type="date"
                  value={newVendor.dueDate}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
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

      {/* Vendors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(vendor.status)}
                    {vendor.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{getCategoryName(vendor.categoryId)}</p>
                </div>
                {getStatusBadge(vendor.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cost Information */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Costo Totale</p>
                  <p className="font-semibold">{formatCurrency(vendor.cost)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pagato</p>
                  <p className="font-semibold text-green-600">{formatCurrency(vendor.paid)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rimanente</p>
                  <p className="font-semibold text-red-600">{formatCurrency(vendor.remaining)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(vendor.paid / vendor.cost) * 100}%` }}
                />
              </div>

              {/* Due Date */}
              {vendor.dueDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Scadenza: {formatDate(vendor.dueDate)}</span>
                </div>
              )}

              {/* Contact */}
              {vendor.contact && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{vendor.contact}</span>
                </div>
              )}

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
                  onClick={() => {
                    const amount = prompt("Inserisci importo pagamento:");
                    if (amount && !isNaN(parseFloat(amount))) {
                      handlePayment(vendor.id, parseFloat(amount));
                    }
                  }}
                  disabled={vendor.status === 'paid'}
                >
                  <Euro className="w-4 h-4 mr-2" />
                  Registra Pagamento
                </Button>
                <Button size="sm" variant="outline">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifica
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
