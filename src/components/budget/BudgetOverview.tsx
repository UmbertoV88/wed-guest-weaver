import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calculator,
  PieChart,
  Euro,
  TrendingUp,
  Calendar,
  Users,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageSpent: number;
  daysToWedding?: number;
  vendorsPaid?: number;
  vendorsTotal?: number;
  onBudgetChange?: (newBudget: number) => void;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  totalBudget,
  totalSpent,
  remainingBudget,
  percentageSpent,
  daysToWedding = 120,
  vendorsPaid = 3,
  vendorsTotal = 12,
  onBudgetChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(totalBudget);

  const handleSaveBudget = () => {
    onBudgetChange && onBudgetChange(tempBudget);
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Budget Card */}
      <Card className="relative overflow-hidden border-l-4 border-l-pink-500 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="w-4 h-4 text-pink-500" />
            Budget Totale
          </CardTitle>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTempBudget(totalBudget);
                setIsEditing(true);
              }}
              className="text-pink-500 hover:text-pink-700"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleSaveBudget} className="text-green-600">
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-gray-500">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Input
              type="number"
              value={tempBudget}
              onChange={(e) => setTempBudget(Number(e.target.value))}
              className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0"
            />
          ) : (
            <div className="text-2xl font-bold text-pink-600">
              {formatCurrency(totalBudget)}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Clicca per modificare
          </p>
        </CardContent>
      </Card>

      {/* Amount Spent Card */}
      <Card className="relative overflow-hidden border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Euro className="w-4 h-4 text-orange-500" />
            Speso Finora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(totalSpent)}
          </div>
          <p className="text-xs text-muted-foreground">
            {percentageSpent.toFixed(1)}% del budget
          </p>
          <Progress value={percentageSpent} className="mt-2" />
        </CardContent>
      </Card>

      {/* Remaining Budget Card */}
      <Card className="relative overflow-hidden border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Budget Rimanente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(remainingBudget)}
          </div>
          <Badge 
            variant={remainingBudget > 0 ? "default" : "destructive"}
            className="mt-2"
          >
            {remainingBudget > 0 ? "Nei limiti" : "Budget superato"}
          </Badge>
        </CardContent>
      </Card>

      {/* Days to Wedding Card */}
      <Card className="relative overflow-hidden border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Giorni al Matrimonio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {daysToWedding}
          </div>
            {vendorsTotal > 0 && (
              <p className="text-xs text-muted-foreground">
                {vendorsPaid}/{vendorsTotal} fornitori pagati
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetOverview;
