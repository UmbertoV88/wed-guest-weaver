import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useGuests } from "@/hooks/useGuests";
import { useToast } from "@/hooks/use-toast";
import AddGuestForm from "@/components/AddGuestForm";
import GuestTabs from "@/components/GuestTabs";
import CommonHeader from "@/components/CommonHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";

const DashboardLayout = () => {
  const { user, signOut, signingOut } = useAuth();
  const { profile, isWeddingOrganizer } = useProfile();
  const { toast } = useToast();
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
    permanentlyDeleteCompanion 
  } = useGuests();

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
      
      {/* Contenuto principale */}
      <SidebarInset className="flex-1 flex flex-col">
        <CommonHeader showSidebarTrigger={true} />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-full overflow-hidden">
          {/* Hero section with add guest form */}
          <section className="text-center space-y-6">
            <div className="space-y-3 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {isWeddingOrganizer ? 'Gestisci tutti i matrimoni' : 'Crea la lista perfetta degli invitati'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isWeddingOrganizer 
                  ? 'Come wedding organizer, puoi gestire gli invitati di tutte le coppie che organizzi.'
                  : 'Gestisci facilmente tutti gli invitati al tuo matrimonio. Aggiungi nomi, categorie, accompagnatori e note speciali per un evento indimenticabile.'
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
              />
          </section>

          {/* Footer section with helpful tips */}
          <footer className="text-center py-12 border-t border-primary/10 bg-elegant rounded-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="max-w-3xl mx-auto space-y-4">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Suggerimenti per organizzare il tuo matrimonio
              </h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-sm text-muted-foreground">
                <div className="p-4 bg-white/60 rounded-lg shadow-soft">
                  <h4 className="font-semibold text-primary mb-2">📝 Pianifica in anticipo</h4>
                  <p>Inizia a creare la lista degli invitati almeno 3-4 mesi prima del matrimonio</p>
                </div>
                
                <div className="p-4 bg-white/60 rounded-lg shadow-soft">
                  <h4 className="font-semibold text-primary mb-2">🍽️ Considera le allergie</h4>
                  <p>Raccogli informazioni su allergie e intolleranze per offrire un menù perfetto</p>
                </div>
                
                <div className="p-4 bg-white/60 rounded-lg shadow-soft">
                  <h4 className="font-semibold text-primary mb-2">💌 Conferme tempestive</h4>
                  <p>Richiedi conferme di partecipazione almeno 2 settimane prima dell'evento</p>
                </div>
              </div>
              
              <p className="text-xs text-muted-foregor-mt-8">
                💝 Tutti i tuoi dati sono salvati in modo sicuro nel tuo database personale
              </p>
            </div>
          </footer>
        </main>
      </SidebarInset>
    </div>
  );
};

const Index = () => {
  useEffect(() => {
    // Update document title for better SEO
    document.title = "Gestione Invitati Matrimonio - Organizza il tuo giorno speciale";
    
    // Add meta description for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'App completa per la gestione degli invitati al matrimonio. Organizza, conferma e gestisci tutti gli invitati per il tuo giorno speciale con eleganza e facilità.'
      );
    }
  }, []);

  return (
    <SidebarProvider>
      <DashboardLayout />
    </SidebarProvider>
  );
};

export default Index;