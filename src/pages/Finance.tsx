import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Calendar, PieChart } from "lucide-react";
import BudgetOverview from "@/components/budget/BudgetOverview";
import BudgetCategories from "@/components/budget/BudgetCategories";
import BudgetItems from "@/components/budget/BudgetItems";
import BudgetAnalytics from "@/components/budget/BudgetAnalytics";
import CommonHeader from "@/components/CommonHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

const FinanceLayout = () => {
  const { user, signOut, signingOut } = useAuth();
  const { profile, isWeddingOrganizer } = useProfile();

  const handleSignOut = async () => {
    await signOut();
  };

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
                Gestione Budget Matrimonio
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Controlla le spese del tuo matrimonio e rimani nei limiti del budget previsto.
              </p>
            </div>
          </section>

          {/* Budget tabs */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Panoramica
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Categorie
                </TabsTrigger>
                <TabsTrigger value="items" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Voci di Spesa
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analisi
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <BudgetOverview />
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <BudgetCategories />
              </TabsContent>

              <TabsContent value="items" className="space-y-6">
                <BudgetItems />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <BudgetAnalytics />
              </TabsContent>
            </Tabs>
          </section>
        </main>
      </SidebarInset>
    </div>
  );
};

const Finance = () => {
  useEffect(() => {
    // Update document title for better SEO
    document.title = "Gestione Budget - Organizza il tuo matrimonio";
    
    // Add meta description for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Gestisci il budget del tuo matrimonio. Monitora le spese, crea categorie di budget e tieni traccia dei pagamenti.'
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
