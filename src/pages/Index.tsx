import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useGuests } from "@/hooks/useGuests";

import AddGuestForm from "@/components/AddGuestForm";
import GuestTabs from "@/components/GuestTabs";
import CommonHeader from "@/components/CommonHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { useTranslation } from "react-i18next";

const DashboardLayout = () => {
  const { user, signOut, signingOut } = useAuth();
  const { profile, isWeddingOrganizer } = useProfile();
  const { t } = useTranslation();
  const {
    addGuest,
    getGuestsByStatus,
    getStats,
    companionLoading,
    confirmGuest,
    confirmGuestOnly,
    revertGuestOnly,
    confirmGuestAndAllCompanions,
    restoreGuest,
    deleteGuest,
    permanentlyDeleteGuest,
    updateGuest,
    updateGuestStatus,
    updateCompanionStatus,
    confirmCompanion,
    deleteCompanion,
    restoreCompanion,
    permanentlyDeleteCompanion,
    toggleBomboniera
  } = useGuests();

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

      {/* Contenuto principale */}
      <SidebarInset className="flex-1 flex flex-col">
        <CommonHeader showSidebarTrigger={true} />

        <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-full overflow-hidden">
          {/* Hero section with add guest form */}
          <section className="text-center space-y-6">
            <div className="space-y-3 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {isWeddingOrganizer ? t('dashboard.title.organizer') : t('dashboard.title.couple')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isWeddingOrganizer
                  ? t('dashboard.subtitle.organizer')
                  : t('dashboard.subtitle.couple')
                }
              </p>
            </div>

            <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <AddGuestForm addGuest={addGuest} />
            </div>
          </section>

          {/* Guest management section */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <GuestTabs
              getGuestsByStatus={getGuestsByStatus}
              getStats={getStats}
              companionLoading={companionLoading}
              confirmGuest={confirmGuest}
              confirmGuestOnly={confirmGuestOnly}
              revertGuestOnly={revertGuestOnly}
              confirmGuestAndAllCompanions={confirmGuestAndAllCompanions}
              restoreGuest={restoreGuest}
              deleteGuest={deleteGuest}
              permanentlyDeleteGuest={permanentlyDeleteGuest}
              updateGuest={updateGuest}
              updateGuestStatus={updateGuestStatus}
              updateCompanionStatus={updateCompanionStatus}
              confirmCompanion={confirmCompanion}
              deleteCompanion={deleteCompanion}
              restoreCompanion={restoreCompanion}
              permanentlyDeleteCompanion={permanentlyDeleteCompanion}
              toggleBomboniera={toggleBomboniera}
            />
          </section>

          {/* Footer section with helpful tips */}
          <footer className="text-center py-12 border-t border-primary/10 bg-elegant rounded-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="max-w-3xl mx-auto space-y-4">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {t('dashboard.tips.title')}
              </h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-sm text-muted-foreground">
                <div className="p-4 bg-white/60 rounded-lg shadow-soft">
                  <h4 className="font-semibold text-primary mb-2">📝 {t('dashboard.tips.tip1.title')}</h4>
                  <SimpleTooltip content={t('dashboard.tips.tip1.tooltip')}>
                    <p>{t('dashboard.tips.tip1.description')}</p>
                  </SimpleTooltip>
                </div>

                <div className="p-4 bg-white/60 rounded-lg shadow-soft">
                  <h4 className="font-semibold text-primary mb-2">🍽️ {t('dashboard.tips.tip2.title')}</h4>
                  <p>{t('dashboard.tips.tip2.description')}</p>
                </div>

                <div className="p-4 bg-white/60 rounded-lg shadow-soft">
                  <h4 className="font-semibold text-primary mb-2">💌 {t('dashboard.tips.tip3.title')}</h4>
                  <p>{t('dashboard.tips.tip3.description')}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foregor-mt-8">
                {t('dashboard.tips.dataSecure')}
              </p>
            </div>
          </footer>
        </main>
      </SidebarInset>
    </div>
  );
};

const Index = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('dashboard.meta.title');

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('dashboard.meta.description'));
    }
  }, [t]);

  return (
    <SidebarProvider>
      <DashboardLayout />
    </SidebarProvider>
  );
};

export default Index;