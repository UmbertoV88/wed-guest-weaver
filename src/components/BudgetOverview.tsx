import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BudgetOverview as BudgetOverviewType } from "@/types/budget";

interface BudgetOverviewProps {
  overview: BudgetOverviewType;
}

export const BudgetOverview = ({ overview }: BudgetOverviewProps) => {
  const { totalBudget, totalSpent, totalPaid, remaining } = overview;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const paidPercentage = totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Totale</CardTitle>
          <span className="text-2xl">💰</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
          <p className="text-xs text-muted-foreground">
            Importo preventivato totale
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Speso</CardTitle>
          <span className="text-2xl">📊</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          <Progress value={spentPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {spentPercentage.toFixed(1)}% del budget
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagato</CardTitle>
          <span className="text-2xl">✅</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
          <Progress value={paidPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {paidPercentage.toFixed(1)}% pagato
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rimanente</CardTitle>
          <span className="text-2xl">{remaining >= 0 ? '💸' : '⚠️'}</span>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-foreground'}`}>
            {formatCurrency(remaining)}
          </div>
          <p className="text-xs text-muted-foreground">
            {remaining >= 0 ? 'Disponibile' : 'Sforato'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};