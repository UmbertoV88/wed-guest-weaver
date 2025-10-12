import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Euro, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock payments data dal Budget-calculator
const mockUpcomingPayments = [
  {
    id: 1,
    vendor: "Catering Il Convivio",
    amount: 5800,
    dueDate: "2024-05-20",
    category: "Catering"
  },
  {
    id: 2,
    vendor: "Villa San Martino (saldo)",
    amount: 5000,
    dueDate: "2024-06-15", 
    category: "Location"
  },
  {
    id: 3,
    vendor: "Studio Fotografico Luce",
    amount: 2400,
    dueDate: "2024-07-01",
    category: "Fotografia"
  }
];

interface PaymentTrackerProps {
  payments?: any[];
  vendors?: any[];
}

const PaymentTracker: React.FC<PaymentTrackerProps> = ({ vendors = [] }) => {
  const [completedPayments, setCompletedPayments] = useState(new Set());
  const [paymentFilter, setPaymentFilter] = useState<'tutti' | 'pagati' | 'scaduti' | 'urgenti'>('tutti');
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dateString: string | null) => {
    if (!dateString) return null;
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyBadge = (daysUntilDue: number | null) => {
    if (daysUntilDue === null) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        Nessuna Scadenza
      </Badge>;
    }
    
    if (daysUntilDue < 0) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Scaduto
      </Badge>;
    } else if (daysUntilDue <= 7) {
      return <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Urgente
      </Badge>;
    } else if (daysUntilDue <= 30) {
      return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Prossimo
      </Badge>;
    } else {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        Pianificato
      </Badge>;
    }
  };

  const handleMarkAsPaid = (paymentId: number) => {
    setCompletedPayments(prev => new Set([...prev, paymentId]));
    toast({
      title: "Successo",
      description: "Pagamento contrassegnato come completato!"
    });
  };

  const handleSetReminder = (payment: any) => {
    toast({
      title: "Promemoria impostato",
      description: `Ti ricorderemo 3 giorni prima della scadenza per ${payment.vendor}`
    });
  };

  // Calcoli basati sui fornitori reali
  const vendorPayments = vendors.map(vendor => {
    const totalCost = vendor.default_cost || 0;
    const paid = vendor.amount_paid || 0;
    const remaining = totalCost - paid;
    
    return {
      vendor,
      totalCost,
      paid,
      remaining,
      isPending: remaining > 0
    };
  });

  // Totale da pagare = somma di tutti i "rimanenti"
  const totalRemainingFromVendors = vendorPayments
    .filter(v => v.isPending)
    .reduce((sum, v) => sum + v.remaining, 0);

  // Conteggio fornitori con pagamenti in sospeso
  const pendingVendorsCount = vendorPayments.filter(v => v.isPending).length;

  // Fornitori con pagamenti scaduti
  const overdueVendors = vendorPayments.filter(v => {
    if (!v.isPending || !v.vendor.payment_due_date) return false;
    const daysUntilDue = getDaysUntilDue(v.vendor.payment_due_date);
    return daysUntilDue < 0;
  });

  const overdueAmount = overdueVendors.reduce((sum, v) => sum + v.remaining, 0);
  const overdueCount = overdueVendors.length;

  // Fornitori con pagamenti urgenti (prossimi 7 giorni)
  const urgentVendors = vendorPayments.filter(v => {
    if (!v.isPending || !v.vendor.payment_due_date) return false;
    const daysUntilDue = getDaysUntilDue(v.vendor.payment_due_date);
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  });

  const urgentAmount = urgentVendors.reduce((sum, v) => sum + v.remaining, 0);
  const urgentCount = urgentVendors.length;

  // Prepara i pagamenti dai fornitori reali
  const vendorBasedPayments = vendorPayments
    .filter(v => v.isPending)
    .map(v => {
      const daysUntilDue = v.vendor.payment_due_date 
        ? getDaysUntilDue(v.vendor.payment_due_date) 
        : null;
      
      return {
        id: v.vendor.id,
        vendor: v.vendor.name,
        amount: v.remaining,
        dueDate: v.vendor.payment_due_date,
        category: v.vendor.category_id,
        daysUntilDue,
        isOverdue: daysUntilDue !== null && daysUntilDue < 0,
        isUrgent: daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7,
        isPaid: false
      };
    });

  // Applica il filtro selezionato
  const filteredPayments = vendorBasedPayments.filter(payment => {
    if (paymentFilter === 'tutti') return true;
    if (paymentFilter === 'pagati') return payment.isPaid;
    if (paymentFilter === 'scaduti') return payment.isOverdue;
    if (paymentFilter === 'urgenti') return payment.isUrgent;
    return true;
  });

  // Ordina per data di scadenza
  const sortedFilteredPayments = filteredPayments.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pagamenti in Scadenza</h2>
        <p className="text-gray-600">Monitora e gestisci i tuoi pagamenti programmati</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-700">Totale da Pagare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {formatCurrency(totalRemainingFromVendors)}
            </div>
            <p className="text-sm text-blue-600 mt-1">
              {pendingVendorsCount} {pendingVendorsCount === 1 ? 'pagamento rimanente' : 'pagamenti rimanenti'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-700">Pagamenti Scaduti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">
              {overdueCount}
            </div>
            <p className="text-sm text-red-600 mt-1">
              {overdueCount > 0 
                ? `${formatCurrency(overdueAmount)} totali`
                : "Nessun pagamento scaduto"
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-orange-700">Urgenti (7 giorni)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {urgentCount}
            </div>
            <p className="text-sm text-orange-600 mt-1">
              {urgentCount > 0
                ? `${formatCurrency(urgentAmount)} totali`
                : "Nessun pagamento urgente"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Cronologia Pagamenti
            </CardTitle>
            
            <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtra pagamenti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti</SelectItem>
                <SelectItem value="pagati">Pagati</SelectItem>
                <SelectItem value="scaduti">Scaduti</SelectItem>
                <SelectItem value="urgenti">Urgenti</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {sortedFilteredPayments.map((payment) => {
              const daysUntilDue = payment.daysUntilDue;
              const isCompleted = completedPayments.has(payment.id);
              const isOverdue = payment.isOverdue;
              const isUrgent = payment.isUrgent;

              return (
                <div 
                  key={payment.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200 opacity-75' 
                      : isOverdue 
                        ? 'bg-red-50 border-red-200' 
                        : isUrgent 
                          ? 'bg-orange-50 border-orange-200' 
                          : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {payment.vendor}
                        </h4>
                        {getUrgencyBadge(daysUntilDue)}
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Pagato
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          {formatCurrency(payment.amount)}
                        </span>
                        {payment.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(payment.dueDate)}
                          </span>
                        )}
                      </div>

                      {daysUntilDue !== null && daysUntilDue >= 0 && !isCompleted && (
                        <p className="text-xs text-gray-500 mt-1">
                          {daysUntilDue === 0 
                            ? "Scade oggi" 
                            : daysUntilDue === 1 
                              ? "Scade domani"
                              : `Scade tra ${daysUntilDue} giorni`
                          }
                        </p>
                      )}
                      
                      {daysUntilDue !== null && isOverdue && !isCompleted && (
                        <p className="text-xs text-red-500 mt-1 font-medium">
                          Scaduto da {Math.abs(daysUntilDue)} giorni
                        </p>
                      )}

                      {daysUntilDue === null && !isCompleted && (
                        <p className="text-xs text-gray-500 mt-1">
                          Nessuna data di scadenza impostata
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!isCompleted && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSetReminder(payment)}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Promemoria
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleMarkAsPaid(payment.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Segna Come Pagato
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </ScrollArea>

          {sortedFilteredPayments.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nessun pagamento programmato</p>
              <p className="text-gray-400">I tuoi pagamenti futuri appariranno qui</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracker;
