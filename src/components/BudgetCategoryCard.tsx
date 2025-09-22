import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BudgetCategory, BudgetItem } from "@/types/budget";
import { IconRenderer } from "@/components/ui/icon-renderer";

interface BudgetCategoryCardProps {
  category: BudgetCategory;
  items: BudgetItem[];
  budgeted: number;
  spent: number;
  paid: number;
}

export const BudgetCategoryCard = ({ 
  category, 
  items, 
  budgeted, 
  spent, 
  paid 
}: BudgetCategoryCardProps) => {
  const spentPercentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const paidPercentage = budgeted > 0 ? (paid / budgeted) * 100 : 0;
  const remaining = budgeted - spent;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{category.name}</CardTitle>
        <IconRenderer iconName={category.icon} className="h-5 w-5" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Budget</p>
            <p className="font-semibold">{formatCurrency(budgeted)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Speso</p>
            <p className="font-semibold">{formatCurrency(spent)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso spese</span>
            <span>{spentPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={spentPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Pagamenti</span>
            <span>{paidPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={paidPercentage} className="h-2" />
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'voce' : 'voci'}
          </span>
          <span className={`text-sm font-medium ${remaining < 0 ? 'text-destructive' : 'text-foreground'}`}>
            {remaining >= 0 ? 'Rimanente: ' : 'Sforato: '}
            {formatCurrency(Math.abs(remaining))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};