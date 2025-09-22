import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Phone, Mail, MapPin, Star, TrendingUp, TrendingDown } from "lucide-react";
import { BudgetItem, BudgetCategory } from "@/types/budget";
import { IconRenderer } from "@/components/ui/icon-renderer";

interface VendorManagerProps {
  items: BudgetItem[];
  categories: BudgetCategory[];
  onEditItem?: (item: BudgetItem) => void;
}

interface VendorSummary {
  name: string;
  totalBudgeted: number;
  totalActual: number;
  totalPaid: number;
  itemCount: number;
  categories: string[];
  averageRating?: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  items: BudgetItem[];
}

export const VendorManager = ({ items, categories, onEditItem }: VendorManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'total' | 'status'>('name');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Group items by vendor and calculate summaries
  const vendorSummaries = useMemo(() => {
    const vendorMap = new Map<string, BudgetItem[]>();
    
    items.forEach(item => {
      const vendorName = item.vendor_name.toLowerCase();
      if (!vendorMap.has(vendorName)) {
        vendorMap.set(vendorName, []);
      }
      vendorMap.get(vendorName)!.push(item);
    });

    const summaries: VendorSummary[] = Array.from(vendorMap.entries()).map(([vendorName, vendorItems]) => {
      const totalBudgeted = vendorItems.reduce((sum, item) => sum + item.budgeted_amount, 0);
      const totalActual = vendorItems.reduce((sum, item) => sum + item.actual_amount, 0);
      const totalPaid = vendorItems.reduce((sum, item) => sum + item.paid_amount, 0);
      
      const variance = totalActual - totalBudgeted;
      const paymentRate = totalActual > 0 ? (totalPaid / totalActual) * 100 : 0;
      
      let status: VendorSummary['status'] = 'good';
      if (variance > totalBudgeted * 0.2) status = 'poor';
      else if (variance > totalBudgeted * 0.1) status = 'warning';
      else if (variance < 0) status = 'excellent';

      const vendorCategories = [...new Set(vendorItems.map(item => {
        const category = categories.find(c => c.id === item.category_id);
        return category?.name || 'Sconosciuta';
      }))];

      return {
        name: vendorItems[0].vendor_name, // Use original case
        totalBudgeted,
        totalActual,
        totalPaid,
        itemCount: vendorItems.length,
        categories: vendorCategories,
        status,
        items: vendorItems
      };
    });

    return summaries;
  }, [items, categories]);

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let filtered = vendorSummaries.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || vendor.categories.some(cat => 
        categories.find(c => c.name === cat && c.id.toString() === filterCategory)
      );
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'total':
          return b.totalActual - a.totalActual;
        case 'status':
          const statusOrder = { excellent: 0, good: 1, warning: 2, poor: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    return filtered;
  }, [vendorSummaries, searchTerm, sortBy, filterCategory, categories]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusBadge = (status: VendorSummary['status']) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">Eccellente</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">Buono</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Attenzione</Badge>;
      case 'poor':
        return <Badge className="bg-red-100 text-red-800">Critico</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVarianceIcon = (budgeted: number, actual: number) => {
    if (actual > budgeted) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (actual < budgeted) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Gestione Fornitori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca fornitori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtra per categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      <IconRenderer iconName={category.icon} className="h-4 w-4" />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: 'name' | 'total' | 'status') => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="total">Importo totale</SelectItem>
                <SelectItem value="status">Stato</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredVendors.length} di {vendorSummaries.length} fornitori
          </div>
        </CardContent>
      </Card>

      {/* Vendor Cards */}
      <div className="grid gap-4">
        {filteredVendors.map((vendor, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{vendor.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {vendor.categories.map((category, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(vendor.status)}
                  {getVarianceIcon(vendor.totalBudgeted, vendor.totalActual)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">{formatCurrency(vendor.totalBudgeted)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Effettivo</p>
                  <p className="font-semibold">{formatCurrency(vendor.totalActual)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagato</p>
                  <p className="font-semibold">{formatCurrency(vendor.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voci</p>
                  <p className="font-semibold">{vendor.itemCount}</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso pagamenti</span>
                  <span>{vendor.totalActual > 0 ? Math.round((vendor.totalPaid / vendor.totalActual) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${vendor.totalActual > 0 ? (vendor.totalPaid / vendor.totalActual) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Contatta
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-1" />
                  Valuta
                </Button>
                {onEditItem && vendor.items.length === 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEditItem(vendor.items[0])}
                  >
                    Modifica
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredVendors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Nessun fornitore trovato con i criteri di ricerca attuali.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};