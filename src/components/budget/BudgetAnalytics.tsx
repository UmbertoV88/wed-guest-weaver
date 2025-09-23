import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useBudgetAnalytics } from "@/hooks/useBudgetAnalytics";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

const BudgetAnalytics = () => {
  const { categoryData, monthlyData, isLoading } = useBudgetAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-80" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Analisi Budget</h2>
        <p className="text-muted-foreground">
          Visualizza i dati del tuo budget con grafici e statistiche
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Distribuzione Budget per Categoria
            </CardTitle>
            <CardDescription>
              Percentuale del budget allocato per ogni categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="budgeted"
                >
                  {categoryData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`€${value.toLocaleString()}`, 'Budget']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Spese Effettive vs Budget
            </CardTitle>
            <CardDescription>
              Confronto tra budget previsto e spese effettive per categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`€${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="budgeted" fill="#8884d8" name="Budget Previsto" />
                <Bar dataKey="spent" fill="#82ca9d" name="Speso" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Tendenza Spese nel Tempo
            </CardTitle>
            <CardDescription>
              Evoluzione delle spese mese per mese
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`€${value.toLocaleString()}`, 'Spese']}
                />
                <Bar dataKey="amount" fill="#ffc658" name="Spese Mensili" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Riepilogo Statistiche
            </CardTitle>
            <CardDescription>
              Metriche chiave del tuo budget
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {categoryData?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Categorie Attive</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {categoryData?.reduce((acc, cat) => acc + (cat.budgeted || 0), 0).toLocaleString()}€
                </div>
                <div className="text-sm text-muted-foreground">Budget Totale</div>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {categoryData?.reduce((acc, cat) => acc + (cat.spent || 0), 0).toLocaleString()}€
                </div>
                <div className="text-sm text-muted-foreground">Speso Finora</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {categoryData ? (
                    ((categoryData.reduce((acc, cat) => acc + (cat.spent || 0), 0) / 
                      categoryData.reduce((acc, cat) => acc + (cat.budgeted || 1), 0)) * 100).toFixed(1)
                  ) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">% Budget Utilizzato</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetAnalytics;