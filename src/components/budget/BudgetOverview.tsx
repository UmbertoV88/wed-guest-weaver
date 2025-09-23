import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { useBudget } from "@/hooks/useBudget";

const BudgetOverview = () => {
  const { budgetSummary, isLoading } = useBudget();

  // Guard per il caricamento
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calcola la percentuale utilizzata
  const percentageUsed = budgetSummary.totalBudget > 0 
    ? Math.min((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100, 100)
    : 0;

  const remaining = budgetSummary.totalBudget - budgetSummary.totalSpent;

  return (
    <div className="space-y-6">
      {/* Cards di riepilogo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{budgetSummary.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Budget pianificato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Speso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{budgetSummary.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {percentageUsed.toFixed(1)}% del budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rimanente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{remaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Disponibile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamenti Pendenti</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetSummary.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Da completare
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar del budget */}
      <Card>
        <CardHeader>
          <CardTitle>Utilizzo Budget</CardTitle>
          <CardDescription>
            Visualizza quanto del tuo budget è stato utilizzato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso</span>
              <span>{percentageUsed.toFixed(1)}%</span>
            </div>
            <Progress 
              value={percentageUsed} 
              className="w-full h-2"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>€0</span>
            <span>€{budgetSummary.totalBudget.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetOverview;
