import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Users,
  Calendar,
  CheckCircle,
  Star,
  Clock,
  Shield,
  Sparkles,
  ChevronDown,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import CommonHeader from "@/components/CommonHeader";

const Landing = () => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.title = "Sistema Gestione Invitati Matrimonio - Organizza il Tuo Giorno Perfetto";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Sistema completo per gestire invitati matrimonio in 7 giorni. Trasforma il caos in eleganza con il nostro sistema intelligente.",
      );
    }
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Email handling logic would go here
  };

  return (
    <div className="min-h-screen bg-background">
      <CommonHeader showAuthButtons={true} />

      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          {/* Fallback gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-deep via-primary to-gold"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-70"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          >
            <source src="/videos/wedding-hero.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          <div className="animate-fade-in-up">
            <Heart className="w-16 h-16 mx-auto mb-6 text-gold animate-heartbeat" fill="currentColor" />

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              TRASFORMA IL CAOS
              <br />
              <span className="text-gold">IN ELEGANZA</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Organizza il matrimonio perfetto e gestisci tutti gli invitati in soli 7 giorni
            </p>

            <p className="text-lg mb-8 text-white/80">(anche se finora hai usato solo liste Excel caotiche)</p>

            <Link to="/auth">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold/90 text-primary-deep text-xl px-12 py-7 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse"
              >
                <span className="flex items-center gap-3">
                  INIZIA SUBITO - Solo €97
                  <Sparkles className="w-5 h-5" />
                </span>
              </Button>
            </Link>

            <p className="mt-6 text-white/70 text-sm">🔥 OFFERTA LIMITATA - Prezzo normale €297</p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <ChevronDown className="w-8 h-8 text-white/60" />
        </div>
      </section>

      {/* Come Funziona - 3 Step Timeline */}
      <section className="py-24 bg-gradient-to-b from-white to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-deep">
              Il Tuo Matrimonio Perfetto
              <br />
              <span className="text-primary">In 3 Semplici Step</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Dimentica Excel e liste caotiche. Il nostro sistema ti guida passo dopo passo.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-gold/20 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative bg-card p-8 rounded-2xl shadow-elegant">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-deep rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                  1
                </div>
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-center mb-4">Aggiungi Invitati</h3>
                <p className="text-muted-foreground text-center">
                  Inserisci rapidamente tutti i tuoi invitati con il wizard guidato
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-gold/20 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative bg-card p-8 rounded-2xl shadow-elegant">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-deep rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                  2
                </div>
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-center mb-4">Traccia Conferme</h3>
                <p className="text-muted-foreground text-center">
                  Monitora in tempo reale chi ha confermato, chi è in attesa
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-gold/20 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative bg-card p-8 rounded-2xl shadow-elegant">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-deep rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                  3
                </div>
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-center mb-4">Giorno Perfetto</h3>
                <p className="text-muted-foreground text-center">
                  Goditi il tuo matrimonio senza preoccupazioni organizzative
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Cards Interattive */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-deep">
              Tutto Quello Che Ti Serve
              <br />
              <span className="text-primary">In Un Solo Sistema</span>
            </h2>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Gestione Invitati</h3>
                <p className="text-sm text-muted-foreground">Organizza invitati e accompagnatori senza sforzo</p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Statistiche Real-Time</h3>
                <p className="text-sm text-muted-foreground">Monitora conferme e presenze in tempo reale</p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Allergie & Intolleranze</h3>
                <p className="text-sm text-muted-foreground">Traccia tutte le esigenze alimentari speciali</p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Categorie Custom</h3>
                <p className="text-sm text-muted-foreground">Organizza per famiglia, amici, colleghi e altro</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section - Numeri Impattanti */}
      <section className="py-24 bg-gradient-to-br from-primary to-primary-deep text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2 text-gold">500+</div>
              <div className="text-white/80">Matrimoni Organizzati</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-gold">15K+</div>
              <div className="text-white/80">Invitati Gestiti</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-gold">98%</div>
              <div className="text-white/80">Soddisfazione Clienti</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-gold">7 Giorni</div>
              <div className="text-white/80">Setup Completo</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Design Card Moderno */}
      <section className="py-24 bg-gradient-to-b from-primary/5 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-deep">
              Cosa Dicono
              <br />
              <span className="text-primary">Le Coppie Felici</span>
            </h2>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="relative p-8 shadow-elegant hover:shadow-2xl transition-shadow duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-current" />
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground italic mb-6">
                "Incredibile! In una settimana abbiamo organizzato tutto. Non più notti insonni preoccupandoci di chi ha
                confermato. Il sistema è semplicemente perfetto!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Sofia & Marco</div>
                  <div className="text-xs text-muted-foreground">Sposati a Giugno 2024</div>
                </div>
              </div>
            </Card>

            {/* Testimonial 2 */}
            <Card className="relative p-8 shadow-elegant hover:shadow-2xl transition-shadow duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-current" />
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground italic mb-6">
                "Dopo mesi di caos con Excel, questo sistema ci ha salvato. Tutte le allergie tracciate, statistiche in
                tempo reale. Consigliato a tutti!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Laura & Andrea</div>
                  <div className="text-xs text-muted-foreground">Sposati a Settembre 2024</div>
                </div>
              </div>
            </Card>

            {/* Testimonial 3 */}
            <Card className="relative p-8 shadow-elegant hover:shadow-2xl transition-shadow duration-300">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white fill-current" />
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground italic mb-6">
                "Come wedding planner, lo consiglio a tutte le mie coppie. Risparmia ore di lavoro e stress. Il miglior
                investimento per un matrimonio sereno."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Francesca R.</div>
                  <div className="text-xs text-muted-foreground">Wedding Planner Professionale</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA - Design Impattante */}
      <section className="py-24 bg-gradient-to-br from-primary-deep via-primary to-primary-deep text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Sparkles className="absolute top-10 left-10 w-20 h-20 animate-sparkle" />
          <Heart className="absolute bottom-10 right-10 w-24 h-24 animate-heartbeat" fill="currentColor" />
          <Zap className="absolute top-1/2 right-1/4 w-16 h-16 animate-pulse" />
        </div>

        <div className="relative container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Pronto Per Il Tuo
            <br />
            <span className="text-gold">Matrimonio Perfetto?</span>
          </h2>

          <p className="text-xl mb-12 text-white/90">
            Unisciti a centinaia di coppie che hanno trasformato lo stress in serenità
          </p>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl mb-8">
            <div className="text-3xl font-bold mb-2">
              <span className="line-through text-white/60">€297</span>
            </div>
            <div className="text-6xl font-bold text-gold mb-6">€97</div>
            <div className="text-white/80 mb-8">🔥 Offerta limitata - Solo per le prime 100 coppie</div>

            <Link to="/auth">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold/90 text-primary-deep text-2xl px-16 py-8 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 w-full md:w-auto"
              >
                INIZIA ORA
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/70 mb-12">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Pagamento Sicuro
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Accesso Immediato
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Garanzia 30 Giorni
            </div>
          </div>

          {/* Email capture form */}
          <div className="max-w-md mx-auto">
            <p className="text-white/80 mb-4">Oppure ricevi più informazioni via email:</p>
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
              <Button type="submit" variant="secondary" className="bg-gold hover:bg-gold/90 text-primary-deep">
                Invia
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-primary-deep text-white/60 text-center text-sm">
        <div className="container mx-auto px-4">
          <p className="mb-4">© 2024 Sistema Matrimonio Perfetto. Tutti i diritti riservati.</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Termini di Servizio
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contatti
            </a>
          </div>
          <p className="mt-4 text-xs">
            I risultati possono variare. Il sistema è uno strumento di supporto all'organizzazione del matrimonio.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
