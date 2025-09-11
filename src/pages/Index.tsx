import { useEffect } from "react";
import WeddingHeader from "@/components/WeddingHeader";
import AddGuestForm from "@/components/AddGuestForm";
import GuestTabs from "@/components/GuestTabs";
import { useAuth } from "@/contexts/AuthContext";
import { useGuests } from "@/hooks/useGuests";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const { signOut, user } = useAuth();
  const { addGuest, getGuestsByStatus, getStats, confirmGuest, restoreGuest, deleteGuest, permanentlyDeleteGuest, updateGuestStatus } = useGuests();

  const handleSignOut = async () => {
    await signOut();
  };

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
    <div className="min-h-screen bg-background">
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <WeddingHeader />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Ciao, {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Esci
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero section with add guest form */}
        <section className="text-center space-y-6">
          <div className="space-y-3 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Crea la lista perfetta degli invitati
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gestisci facilmente tutti gli invitati al tuo matrimonio. Aggiungi nomi, 
              categorie, accompagnatori e note speciali per un evento indimenticabile.
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
            confirmGuest={confirmGuest}
            restoreGuest={restoreGuest}
            deleteGuest={deleteGuest}
            permanentlyDeleteGuest={permanentlyDeleteGuest}
            updateGuestStatus={updateGuestStatus}
          />
        </section>

        {/* Footer section with helpful tips */}
        <footer className="text-center py-12 border-t border-primary/10 bg-elegant rounded-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="max-w-3xl mx-auto space-y-4">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Suggerimenti per organizzare il tuo matrimonio
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
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
            
            <p className="text-xs text-muted-foreground mt-8">
              💝 Tutti i tuoi dati sono salvati in modo sicuro nel tuo database personale
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;