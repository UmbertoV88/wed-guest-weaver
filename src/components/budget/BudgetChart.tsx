import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, BarChart3, TrendingUp } from 'lucide-react';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
}

interface BudgetChartProps {
  categories: BudgetCategory[];
  totalBudget: number;
}

const BudgetChart: React.FC<BudgetChartProps> = ({ categories, totalBudget }) => {
  const total = categories.reduce((sum, cat) => sum + cat.budgeted, 0);

  // Calculate angles for pie chart
  const calculateSegments = () => {
    let currentAngle = 0;
    return categories.map(category => {
      const percentage = (category.budgeted / total) * 100;
      const angle = (percentage / 100) * 360;
      const segment = {
        ...category,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        percentage: Math.round(percentage * 10) / 10
      };
      currentAngle += angle;
      return segment;
    });
  };

  const segments = calculateSegments();

  // Create SVG path for pie slice
  const createPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Distribuzione Budget per Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="280" height="280" className="transform -rotate-90">
                {segments.map((segment, index) => (
                  <path
                    key={segment.id}
                    d={createPath(140, 140, 120, segment.startAngle, segment.endAngle)}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  />
                ))}
                {/* Center circle */}
                <circle
                  cx="140"
                  cy="140"
                  r="75"
                  fill="white"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(totalBudget)}
                  </div>
                  <div className="text-sm text-gray-600">Budget Totale</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-6">
            {segments.map((segment) => (
              <div key={segment.id} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-gray-700 truncate">
                  {segment.name} ({segment.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Preventivo vs Speso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{category.name}</span>
                  <span className="text-gray-600">
                    {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    {/* Estimated budget bar */}
                    <div
                      className="h-3 rounded-full opacity-50"
                      style={{
                        backgroundColor: category.color,
                        width: '100%'
                      }}
                    />
                    {/* Actual spent bar */}
                    <div
                      className="h-3 rounded-full absolute top-0 left-0"
                      style={{
                        backgroundColor: category.color,
                        width: `${Math.min((category.spent / category.budgeted) * 100, 100)}%`
                      }}
                    />
                  </div>
                  {category.spent > category.budgeted && (
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">
                        Superato di {formatCurrency(category.spent - category.budgeted)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetChart;
