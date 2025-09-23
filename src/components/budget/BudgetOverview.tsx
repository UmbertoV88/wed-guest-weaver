import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useBudget } from "@/hooks/useBudget";

// Assumendo che hai accesso ai dati del budget tramite useBudget()
const { budgetSummary, isLoading } = useBudget();

// Calcola la percentuale utilizzata
const percentageUsed = budgetSummary.totalBudget > 0 
  ? Math.min((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100, 100)
  : 0;

const BudgetOverview = () => {
  const { budgetSummary, isLoading } = useBudget();

  if (isLoading) {
    return <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="h-20" />
        </Card>
      ))}
    </div>;
  }

  const spentPercentage = (budgetSummary.totalSpent / budgetSummary.totalBudget) * 100;
  const remainingBudget = budgetSummary.totalBudget - budgetSummary.totalSpent;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Budget Totale
          </CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            €{budgetSummary.totalBudget.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Speso
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            €{budgetSummary.totalSpent.toLocaleString()}
          </div>
          <div className="mt-2">
            <Progress 
              value={percentageUsed} 
              className="w-full h-2 [&>div]:bg-red-500" 
            />

            <p className="text-xs text-muted-foreground mt-1">
              {spentPercentage.toFixed(1)}% del budget
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Rimanente
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            €{remainingBudget.toLocaleString()}
          </div>
          <Badge 
            variant={remainingBudget < 0 ? "destructive" : "secondary"}
            className="mt-2"
          >
            {remainingBudget < 0 ? "Sforamento" : "Disponibile"}
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pagamenti in Sospeso
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {budgetSummary.pendingPayments}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            voci da pagare
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetOverview;