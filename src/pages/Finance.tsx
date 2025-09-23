import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  useSidebar,
} from "@/components/ui/sidebar";

const Finance = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gestione Budget Matrimonio
        </h1>
        <p className="text-muted-foreground">
          Controlla le spese del tuo matrimonio e rimani nei limiti del budget
        </p>
      </div>

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
    </div>
  );
};

export default Finance;