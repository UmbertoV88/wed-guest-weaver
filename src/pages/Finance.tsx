import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import CommonHeader from "@/components/CommonHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  Receipt, 
  Calculator,
  AlertCircle,
  CheckCircle,
  Clock,
  Euro
} from "lucide-react";

const FinanceLayout = () => {
  const { user, signOut, signingOut } = useAuth();
  const { profile, isWeddingOrganizer } = useProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  // Mock data per la demo
  const budgetData = {
    totalBudget: 25000,
    spent: 18500,
    remaining: 6500,
    categories: [
      { name: "Location", budgeted: 8000, spent: 8000, status: "completed" },
      { name: "Catering", budgeted: 7000, spent: 6500, status: "in-progress" },
      { name: "Fotografo", budgeted: 2500, spent: 2000, status: "in-progress" },
      { name: "Fiori", budgeted: 1500, spent: 1200, status: "in-progress" },
      { name: "Musica", budgeted: 2000, spent: 800, status: "pending" },
      { name: "Abiti", budgeted: 3000, spent: 0, status: "pending" },
      { name: "Altro", budgeted: 1000, spent: 0, status: "pending" }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completato";
      case "in-progress":
        return "In corso";
      default:
        return "Da iniziare";
    }
  };

  const budgetPercentage = (budgetData.spent / budgetData.totalBudget) * 100;

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <DashboardSidebar 
        user={user}
        profile={profile}
        isWeddingOrganizer={isWeddingOrganizer}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />
      
      {/* Main content */}
      <SidebarInset className="flex-1 flex flex-col">
        <CommonHeader showSidebarTrigger={true} />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-full overflow-hidden">
          {/* Header section */}
          <section className="text-center space-y-6">
            <div className="space-y-3 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Gestione Finanze Matrimonio
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tieni sotto controllo il budget del tuo matrimonio. Monitora le spese, pianifica i pagamenti e assicurati di rimanere nei limiti del budget.
              </p>
            </div>
          </section>

          {/* Budget Overview */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-soft border-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-primary" />
                    Budget Totale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    €{budgetData.totalBudget.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Budget pianificato
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-warning" />
                    Speso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning">
                    €{budgetData.spent.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {budgetPercentage.toFixed(1)}% del budget
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-warning h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    Rimanente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${budgetData.remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                    €{budgetData.remaining.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {budgetData.remaining >= 0 ? 'Disponibile' : 'Sforamento budget'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Budget Categories */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Card className="shadow-elegant border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-primary" />
                  Dettaglio Budget per Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetData.categories.map((category, index) => {
                    const percentage = (category.spent / category.budgeted) * 100;
                    const isOverBudget = category.spent > category.budgeted;
                    
                    return (
                      <div 
                        key={category.name} 
                        className="p-4 border rounded-lg hover:shadow-soft transition-romantic animate-fade-in-up"
                        style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">{category.name}</h3>
                            {getStatusIcon(category.status)}
                            <Badge variant="outline" className="text-xs">
                              {getStatusLabel(category.status)}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              €{category.spent.toLocaleString()} / €{category.budgeted.toLocaleString()}
                            </div>
                            <div className={`text-sm ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {isOverBudget ? 'Sforamento' : `${percentage.toFixed(1)}% utilizzato`}
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isOverBudget ? 'bg-destructive' : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        
                        {isOverBudget && (
                          <div className="mt-2 text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Sforamento di €{(category.spent - category.budgeted).toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Quick Actions */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Card className="shadow-soft border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-primary" />
                  Azioni Rapide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Euro className="w-6 h-6 text-primary" />
                    <span className="text-sm">Aggiungi Spesa</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Calculator className="w-6 h-6 text-primary" />
                    <span className="text-sm">Modifica Budget</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Receipt className="w-6 h-6 text-primary" />
                    <span className="text-sm">Visualizza Report</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <span className="text-sm">Analisi Spese</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Coming Soon Notice */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <Card className="shadow-soft border-gold/20 bg-gradient-to-br from-gold/5 to-primary/5">
              <CardContent className="pt-6 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto">
                    <DollarSign className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary-deep">
                    Funzionalità Complete in Arrivo
                  </h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    La sezione finanze è in fase di sviluppo. Presto potrai gestire completamente 
                    il budget del matrimonio, tracciare le spese, impostare promemoria per i pagamenti 
                    e generare report dettagliati.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    <Badge variant="secondary">Gestione Budget</Badge>
                    <Badge variant="secondary">Tracciamento Spese</Badge>
                    <Badge variant="secondary">Report Finanziari</Badge>
                    <Badge variant="secondary">Promemoria Pagamenti</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </SidebarInset>
    </div>
  );
};

const Finance = () => {
  useEffect(() => {
    // Update document title for better SEO
    document.title = "Gestione Finanze Matrimonio - Controlla il tuo budget";
    
    // Add meta description for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Gestisci il budget del tuo matrimonio. Traccia le spese, monitora i costi e mantieni tutto sotto controllo per il tuo giorno speciale.'
      );
    }
  }, []);

  return (
    <SidebarProvider>
      <FinanceLayout />
    </SidebarProvider>
  );
};

export default Finance;