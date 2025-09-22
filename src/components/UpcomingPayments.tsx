import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Euro, AlertCircle, CheckCircle } from "lucide-react";
import { BudgetItem, BudgetCategory } from "@/types/budget";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { IconRenderer } from "@/components/ui/icon-renderer";

interface UpcomingPaymentsProps {
  items: BudgetItem[];
  categories: BudgetCategory[];
  onMarkAsPaid?: (itemId: number) => Promise<void>;
}

export const UpcomingPayments = ({ items, categories, onMarkAsPaid }: UpcomingPaymentsProps) => {
  const now = new Date();
  const nextWeek = addDays(now, 7);
  const nextMonth = addDays(now, 30);

  // Filter items with due dates and pending/partial payments
  const upcomingItems = items
    .filter(item => 
      item.due_date && 
      (item.status === 'pending' || item.status === 'partial') &&
      isBefore(new Date(item.due_date), nextMonth)
    )
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  const overdueItems = upcomingItems.filter(item => 
    isBefore(new Date(item.due_date!), now)
  );

  const dueThisWeek = upcomingItems.filter(item => 
    isAfter(new Date(item.due_date!), now) && 
    isBefore(new Date(item.due_date!), nextWeek)
  );

  const dueThisMonth = upcomingItems.filter(item => 
    isAfter(new Date(item.due_date!), nextWeek) && 
    isBefore(new Date(item.due_date!), nextMonth)
  );

  const getCategoryIcon = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon;
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria sconosciuta';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">In ritardo</Badge>;
      case 'pending':
        return <Badge variant="secondary">In sospeso</Badge>;
      case 'partial':
        return <Badge variant="outline">Parziale</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const PaymentItem = ({ item, isOverdue }: { item: BudgetItem; isOverdue?: boolean }) => {
    const remainingAmount = item.actual_amount - item.paid_amount;
    
    return (
      <div className={`p-4 border rounded-lg ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <IconRenderer iconName={getCategoryIcon(item.category_id)} className="h-4 w-4" />
            <div>
              <h4 className="font-medium">{item.vendor_name}</h4>
              <p className="text-sm text-muted-foreground">{getCategoryName(item.category_id)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOverdue && <AlertCircle className="h-4 w-4 text-red-500" />}
            {getStatusBadge(isOverdue ? 'overdue' : item.status)}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(new Date(item.due_date!), 'PPP', { locale: it })}
            </span>
          </div>
          <div className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
            Priorità: {item.priority}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatCurrency(remainingAmount)}</span>
            <span className="text-sm text-muted-foreground">da pagare</span>
          </div>
          
          {onMarkAsPaid && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkAsPaid(item.id)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Segna come pagato
            </Button>
          )}
        </div>
        
        {item.description && (
          <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overdue Payments */}
      {overdueItems.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Pagamenti in Ritardo ({overdueItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueItems.map(item => (
              <PaymentItem key={item.id} item={item} isOverdue />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Due This Week */}
      {dueThisWeek.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              In Scadenza Questa Settimana ({dueThisWeek.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dueThisWeek.map(item => (
              <PaymentItem key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Due This Month */}
      {dueThisMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              In Scadenza Questo Mese ({dueThisMonth.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dueThisMonth.map(item => (
              <PaymentItem key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      )}

      {upcomingItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nessun pagamento in scadenza</h3>
            <p className="text-muted-foreground">
              Tutti i pagamenti sono aggiornati per i prossimi 30 giorni.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};