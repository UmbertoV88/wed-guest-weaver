import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Euro, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReminderDialog } from "./ReminderDialog";

// Mock payments data dal Budget-calculator
const mockUpcomingPayments = [
  {
    id: 1,
    vendor: "Catering Il Convivio",
    amount: 5800,
    dueDate: "2024-05-20",
    category: "Catering",
  },
  {
    id: 2,
    vendor: "Villa San Martino (saldo)",
    amount: 5000,
    dueDate: "2024-06-15",
    category: "Location",
  },
  {
    id: 3,
    vendor: "Studio Fotografico Luce",
    amount: 2400,
    dueDate: "2024-07-01",
    category: "Fotografia",
  },
];

interface PaymentTrackerProps {
  payments?: any[];
  vendors?: any[];
  onMarkAsPaid?: (vendorId: string, amount: number, categoryId: string, notes?: string) => void;
}

const PaymentTracker: React.FC<PaymentTrackerProps> = ({ vendors = [], onMarkAsPaid }) => {
  const [paymentFilter, setPaymentFilter] = useState<"tutti" | "pagati" | "da_pagare" | "scaduti" | "urgenti">("tutti");
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedVendorForReminder, setSelectedVendorForReminder] = useState<any>(null);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
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
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Nessuna Scadenza
        </Badge>
      );
    }

    if (daysUntilDue < 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Scaduto
        </Badge>
      );
    } else if (daysUntilDue <= 7) {
      return (
        <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Urgente
        </Badge>
      );
    } else if (daysUntilDue <= 30) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Prossimo
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Pianificato
        </Badge>
      );
    }
  };

  const handleMarkAsPaid = (payment: any) => {
    if (!onMarkAsPaid) {
      toast({
        title: "Errore",
        description: "Funzione di pagamento non disponibile",
        variant: "destructive",
      });
      return;
    }

    const vendor = vendors.find((v) => v.id === payment.id);
    if (!vendor) {
      toast({
        title: "Errore",
        description: "Fornitore non trovato",
        variant: "destructive",
      });
      return;
    }

    const totalCost = vendor.default_cost || 0;
    const alreadyPaid = vendor.amount_paid || 0;
    const remainingAmount = totalCost - alreadyPaid;

    if (remainingAmount <= 0) {
      return;
    }

    onMarkAsPaid(vendor.id, remainingAmount, vendor.category_id, `Pagamento completo - ${vendor.name}`);
  };

  const handleSetReminder = (payment: any) => {
    const vendor = vendors.find((v) => v.id === payment.id);
    if (vendor) {
      setSelectedVendorForReminder(vendor);
      setReminderDialogOpen(true);
    }
  };

  // Calcoli basati sui fornitori reali
  const vendorPayments = vendors.map((vendor) => {
    const totalCost = vendor.default_cost || 0;
    const paid = vendor.amount_paid || 0;
    const remaining = totalCost - paid;

    return {
      vendor,
      totalCost,
      paid,
      remaining,
      isPending: remaining > 0,
    };
  });

  // Totale da pagare = somma di tutti i "rimanenti"
  const totalRemainingFromVendors = vendorPayments.filter((v) => v.isPending).reduce((sum, v) => sum + v.remaining, 0);

  // Conteggio fornitori con pagamenti in sospeso
  const pendingVendorsCount = vendorPayments.filter((v) => v.isPending).length;

  // Fornitori con pagamenti scaduti
  const overdueVendors = vendorPayments.filter((v) => {
    if (!v.isPending || !v.vendor.payment_due_date) return false;
    const daysUntilDue = getDaysUntilDue(v.vendor.payment_due_date);
    return daysUntilDue < 0;
  });

  const overdueAmount = overdueVendors.reduce((sum, v) => sum + v.remaining, 0);
  const overdueCount = overdueVendors.length;

  // Fornitori con pagamenti urgenti (prossimi 7 giorni)
  const urgentVendors = vendorPayments.filter((v) => {
    if (!v.isPending || !v.vendor.payment_due_date) return false;
    const daysUntilDue = getDaysUntilDue(v.vendor.payment_due_date);
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  });

  const urgentAmount = urgentVendors.reduce((sum, v) => sum + v.remaining, 0);
  const urgentCount = urgentVendors.length;

  // Prepara i pagamenti dai fornitori reali - INCLUDE TUTTI I FORNITORI
  const vendorBasedPayments = vendorPayments
    .filter((v) => v.vendor.default_cost && v.vendor.default_cost > 0)
    .map((v) => {
      // Calcola se completamente pagato usando complete_payment_date
      const isPaid = !!v.vendor.complete_payment_date || v.remaining <= 0;

      const daysUntilDue = v.vendor.payment_due_date ? getDaysUntilDue(v.vendor.payment_due_date) : null;

      return {
        id: v.vendor.id,
        vendor: v.vendor.name,
        amount: isPaid ? v.totalCost : v.remaining,
        amountPaid: v.vendor.amount_paid,
        paymentDate: v.vendor.complete_payment_date,
        dueDate: v.vendor.payment_due_date,
        category: v.vendor.category_id,
        daysUntilDue,
        isOverdue: !isPaid && daysUntilDue !== null && daysUntilDue < 0,
        isUrgent: !isPaid && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7,
        isPaid,
      };
    });

  // Applica il filtro selezionato
  const filteredPayments = vendorBasedPayments.filter((payment) => {
    if (paymentFilter === "tutti") return true;
    if (paymentFilter === "pagati") return payment.isPaid;
    if (paymentFilter === "da_pagare") return !payment.isPaid;
    if (paymentFilter === "scaduti") return payment.isOverdue;
    if (paymentFilter === "urgenti") return payment.isUrgent;
    return true;
  });

  // Ordina per data di scadenza
  const sortedFilteredPayments = filteredPayments.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <>
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
            <div className="text-3xl font-bold text-blue-900">{formatCurrency(totalRemainingFromVendors)}</div>
            <p className="text-sm text-blue-600 mt-1">
              {pendingVendorsCount} {pendingVendorsCount === 1 ? "pagamento rimanente" : "pagamenti rimanenti"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-700">Pagamenti Scaduti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{overdueCount}</div>
            <p className="text-sm text-red-600 mt-1">
              {overdueCount > 0 ? `${formatCurrency(overdueAmount)} totali` : "Nessun pagamento scaduto"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-orange-700">Urgenti (7 giorni)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{urgentCount}</div>
            <p className="text-sm text-orange-600 mt-1">
              {urgentCount > 0 ? `${formatCurrency(urgentAmount)} totali` : "Nessun pagamento urgente"}
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
                <SelectItem value="da_pagare">Da pagare</SelectItem>
                <SelectItem value="pagati">Pagati</SelectItem>
                <SelectItem value="scaduti">Scaduti</SelectItem>
                <SelectItem value="urgenti">Urgenti</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[1080px] pr-4">
            <div className="space-y-4">
              {sortedFilteredPayments.map((payment) => {
                const daysUntilDue = payment.daysUntilDue;
                const isOverdue = payment.isOverdue;
                const isUrgent = payment.isUrgent;

                return (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      payment.isPaid
                        ? "bg-green-50 border-green-200"
                        : isOverdue
                          ? "bg-red-50 border-red-200"
                          : isUrgent
                            ? "bg-orange-50 border-orange-200"
                            : "bg-white border-gray-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* COLONNA SINISTRA */}
                      <div className="flex-1 space-y-3">
                        {/* Nome e Badge */}
                        <div className="flex items-center gap-3">
                          <h4
                            className={`font-semibold text-lg ${payment.isPaid ? "text-green-700" : "text-gray-900"}`}
                          >
                            {payment.vendor}
                          </h4>

                          {payment.isPaid && (
                            <Badge className="bg-green-100 text-green-800 border border-green-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Pagato
                            </Badge>
                          )}

                          {!payment.isPaid && getUrgencyBadge(daysUntilDue)}
                        </div>

                        {/* Sezione Date e Info Pagamento */}
                        <div className="flex items-center gap-4 text-sm">
                          {payment.isPaid && payment.paymentDate && (
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Pagato il {formatDate(payment.paymentDate)}</span>
                            </div>
                          )}

                          {!payment.isPaid && payment.dueDate && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Scadenza: {formatDate(payment.dueDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Importo Totale Pagato per Fornitori Completati */}
                        {payment.isPaid && (
                          <div className="bg-green-100 border border-green-200 rounded-md p-2">
                            <p className="text-sm text-green-700 font-medium">
                              💰 Importo totale pagato: {formatCurrency(payment.amountPaid || payment.amount)}
                            </p>
                          </div>
                        )}

                        {/* Messaggi di scadenza solo per fornitori NON pagati */}
                        {!payment.isPaid && daysUntilDue !== null && daysUntilDue >= 0 && (
                          <p className="text-xs text-gray-500">
                            {daysUntilDue === 0
                              ? "Scade oggi"
                              : daysUntilDue === 1
                                ? "Scade domani"
                                : `Scade tra ${daysUntilDue} giorni`}
                          </p>
                        )}

                        {!payment.isPaid && daysUntilDue !== null && isOverdue && (
                          <p className="text-xs text-red-500 font-medium">Scaduto da {Math.abs(daysUntilDue)} giorni</p>
                        )}

                        {!payment.isPaid && daysUntilDue === null && (
                          <p className="text-xs text-gray-500">Nessuna data di scadenza impostata</p>
                        )}

                        {/* Messaggio "Completamente Pagato" */}
                        {payment.isPaid && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">Fornitore completamente pagato ✓</span>
                          </div>
                        )}
                      </div>

                      {/* COLONNA DESTRA */}
                      <div className="flex flex-col items-end gap-2 min-w-[200px]">
                        {/* Importo */}
                        <p className={`text-xl font-bold ${payment.isPaid ? "text-green-600" : "text-gray-900"}`}>
                          {formatCurrency(payment.amount)}
                        </p>

                        {/* Bottoni Azione */}
                        {!payment.isPaid && (
                          <div className="flex flex-col lg:flex-row gap-2 w-full">
                            <Button variant="outline" onClick={() => handleSetReminder(payment)} className="flex-1">
                              <Clock className="w-4 h-4 mr-1" />
                              Promemoria
                            </Button>
                            <Button
                              onClick={() => handleMarkAsPaid(payment)}
                              className="bg-green-600 hover:bg-green-700 text-white flex-1"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Segna Come Pagato
                            </Button>
                          </div>
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

    <ReminderDialog
      open={reminderDialogOpen}
      onOpenChange={setReminderDialogOpen}
      vendor={selectedVendorForReminder}
      onReminderCreated={() => {
        toast({
          title: "✅ Promemoria Impostato",
          description: "Riceverai una notifica alla data selezionata"
        });
      }}
    />
    </>
  );
};

export default PaymentTracker;
