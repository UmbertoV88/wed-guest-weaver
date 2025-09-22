import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BudgetCategory, BudgetItem } from "@/types/budget";
import { useState } from "react";

interface BudgetChartProps {
  categories: BudgetCategory[];
  items: BudgetItem[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00'];

export const BudgetChart = ({ categories, items }: BudgetChartProps) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');

  // Prepare data for charts
  const categoryData = categories.map((category, index) => {
    const categoryItems = items.filter(item => item.category_id === category.id);
    const budgeted = categoryItems.reduce((sum, item) => sum + item.budgeted_amount, 0);
    const actual = categoryItems.reduce((sum, item) => sum + item.actual_amount, 0);
    const paid = categoryItems.reduce((sum, item) => sum + item.paid_amount, 0);

    return {
      name: category.name,
      budgeted,
      actual,
      paid,
      fill: COLORS[index % COLORS.length]
    };
  });

  const totalBudgeted = categoryData.reduce((sum, item) => sum + item.budgeted, 0);

  const pieData = categoryData.map(item => ({
    name: item.name,
    value: item.budgeted,
    percentage: totalBudgeted > 0 ? ((item.budgeted / totalBudgeted) * 100).toFixed(1) : '0'
  }));

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value),
                  ''
                ]}
              />
              <Bar dataKey="budgeted" fill="#8884d8" name="Preventivato" />
              <Bar dataKey="actual" fill="#82ca9d" name="Effettivo" />
              <Bar dataKey="paid" fill="#ffc658" name="Pagato" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value),
                  'Budget'
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value),
                  ''
                ]}
              />
              <Line type="monotone" dataKey="budgeted" stroke="#8884d8" name="Preventivato" />
              <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Effettivo" />
              <Line type="monotone" dataKey="paid" stroke="#ffc658" name="Pagato" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Analisi Budget per Categoria</CardTitle>
        <Select value={chartType} onValueChange={(value: 'bar' | 'pie' | 'line') => setChartType(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Grafico a Barre</SelectItem>
            <SelectItem value="pie">Grafico a Torta</SelectItem>
            <SelectItem value="line">Grafico a Linee</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};