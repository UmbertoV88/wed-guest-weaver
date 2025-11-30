import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import CommonHeader from "@/components/CommonHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import SeatingEditor from "@/components/SeatingEditor";
import { useTranslation } from 'react-i18next';
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

const SeatingLayout = () => {
  const { t } = useTranslation();
  const { user, signOut, signingOut } = useAuth();
  const { profile, isWeddingOrganizer } = useProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <DashboardSidebar
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
                {t('seating.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('seating.description')}
              </p>
            </div>
          </section>

          {/* Seating editor */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <SeatingEditor />
          </section>
        </main>
      </SidebarInset>
    </div>
  );
};

const Seating = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // Update document title for better SEO
    document.title = t('seating.meta.title');

    // Add meta description for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('seating.meta.description'));
    }
  }, [t]);

  return (
    <SidebarProvider>
      <SeatingLayout />
    </SidebarProvider>
  );
};

export default Seating;