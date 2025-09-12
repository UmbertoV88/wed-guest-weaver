import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Users, Calendar, CheckCircle, Star, Clock, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Sistema Gestione Invitati Matrimonio - Organizza il Tuo Giorno Perfetto";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Sistema completo per gestire invitati matrimonio in 7 giorni. Addio liste Excel caotiche, benvenuto matrimonio perfetto!');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-elegant">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-gold/10 to-primary-deep/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up">
            <Heart className="w-12 h-12 text-primary animate-heartbeat" fill="currentColor" />
            <Sparkles className="w-8 h-8 text-gold animate-sparkle" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-deep to-gold bg-clip-text text-transparent">
            TRASFORMA IL CAOS IN ELEGANZA
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-primary-deep">
            Come Organizzare Un Matrimonio Perfetto E Gestire Tutti Gli Invitati In Soli 7 Giorni
          </h2>
          
          <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
            (anche se finora hai usato solo liste Excel caotiche e telefonate infinite)
          </p>
          
          <Button size="lg" className="bg-gold hover:bg-gold/90 text-primary-deep text-xl px-12 py-6 rounded-full shadow-elegant animate-pulse">
            ACCEDI ORA - Solo €97
          </Button>
          
          <p className="mt-4 text-sm text-muted-foreground">
            🔥 OFFERTA LIMITATA (Prezzo normale €297)
          </p>
        </div>
      </header>

      {/* Problem Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-primary-deep">
              Il Sistema Che Sta Trasformando Lo Stress Matrimoniale In Serenità Organizzativa In Soli 7 Giorni
            </h2>
            
            <blockquote className="text-2xl italic mb-12 text-primary font-medium">
              "Non riesco più a tenere traccia di chi viene, chi conferma, chi ha allergie... È un incubo!"
            </blockquote>
            
            <div className="text-left max-w-3xl mx-auto mb-12">
              <p className="text-lg mb-6">
                Ricordo ancora quando mia sorella stava organizzando il suo matrimonio. Aveva liste Excel sparse ovunque, 
                post-it attaccati al frigo, e passava le serate al telefono cercando di capire chi avesse confermato la presenza.
              </p>
              
              <p className="text-lg mb-8">
                Due settimane prima del matrimonio, si rese conto che aveva perso traccia di 15 invitati e non sapeva 
                quante persone sarebbero effettivamente venute. Il catering doveva sapere i numeri esatti...
              </p>
              
              <h3 className="text-xl font-semibold mb-6 text-primary-deep">
                La sua lotta quotidiana con la gestione invitati includeva:
              </h3>
              
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold">✗</span>
                  Liste Excel confuse con versioni multiple e contraddittorie
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold">✗</span>
                  Telefonate infinite per confermare le presenze, spesso senza risposta
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold">✗</span>
                  Allergie e intolleranze dimenticate o perse tra le note
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold">✗</span>
                  Impossibilità di sapere in tempo reale quanti invitati avrebbero partecipato
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold">✗</span>
                  Stress continuo per la paura di dimenticare qualcuno o qualche dettaglio importante
                </li>
              </ul>
            </div>
            
            <div className="bg-card/50 p-8 rounded-lg shadow-soft mb-12">
              <p className="text-lg mb-6">
                Provò tutto quello che wedding planner e forum suggerivano:
              </p>
              
              <ul className="space-y-4 text-left max-w-2xl mx-auto">
                <li><strong>App generiche per eventi</strong> (troppo complicate e non specifiche per matrimoni)</li>
                <li><strong>Fogli Google condivisi</strong> (caos totale con troppe persone che modificavano)</li>
                <li><strong>Software professionali costosi</strong> (€500+ al mese, troppo complessi)</li>
                <li><strong>Notebook cartacei</strong> (impossibili da condividere o aggiornare in tempo reale)</li>
                <li><strong>WhatsApp e messaggi</strong> (informazioni perse tra centinaia di chat)</li>
              </ul>
            </div>
            
            <p className="text-xl font-semibold text-primary-deep mb-8">
              Tre giorni prima del matrimonio, era sull'orlo di una crisi nervosa...
            </p>
          </div>
        </div>
      </section>

      {/* Discovery Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-gold/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary-deep">
              Poi Scoprii Qualcosa Che Cambiò Tutto...
            </h2>
            
            <div className="bg-white p-8 rounded-lg shadow-elegant mb-12">
              <p className="text-lg mb-6">
                Durante le mie ricerche per aiutarla, mi imbattei in uno studio dell'Associazione Wedding Planner Italiani 
                che rivelava dati scioccanti:
              </p>
              
              <div className="bg-primary/10 p-6 rounded-lg mb-6">
                <p className="text-lg font-semibold">
                  Secondo l'AWPI, l'89% delle coppie italiane vive stress estremo nella gestione degli invitati, 
                  e il 67% commette errori critici che rovinano l'esperienza del matrimonio.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-primary-deep">Quello che scoprii mi lasciò senza parole:</h3>
              
              <ul className="space-y-3 text-lg mb-8">
                <li>• Il 73% delle coppie perde traccia di almeno 10 invitati durante l'organizzazione</li>
                <li>• Il 84% non riesce a gestire correttamente allergie e intolleranze alimentari</li>
                <li>• Il 91% non sa in tempo reale quante persone parteciperanno effettivamente</li>
                <li>• Il 56% scopre problemi critici solo negli ultimi giorni prima del matrimonio</li>
              </ul>
              
              <div className="bg-destructive/10 p-6 rounded-lg">
                <p className="text-lg font-semibold text-destructive-foreground">
                  Ma la cosa più allarmante di tutte: La maggior parte delle coppie sta inconsapevolmente 
                  sabotando la propria serenità matrimoniale usando metodi obsoleti e disorganizzati.
                </p>
              </div>
            </div>
            
            <p className="text-lg text-center mb-8">
              Lo sapevo perché stavo commettendo gli stessi errori aiutando mia sorella...
            </p>
            
            <div className="text-center">
              <p className="text-lg mb-6">
                Attraverso ricerche approfondite e consultazioni con:
              </p>
              <ul className="text-lg space-y-2 mb-8">
                <li><strong>Wedding Planner Professionisti</strong></li>
                <li><strong>Esperti di Project Management</strong></li>
                <li><strong>Sviluppatori di Software Gestionali</strong></li>
              </ul>
              
              <p className="text-xl font-semibold text-primary-deep mb-8">
                Scoprii PERCHÉ gli approcci tradizionali falliscono - e soprattutto, cosa funziona davvero.
              </p>
              
              <div className="bg-gold/20 p-8 rounded-lg shadow-soft">
                <h3 className="text-2xl font-bold mb-4 text-primary-deep">
                  Lo chiamo il "Sistema Matrimonio Perfetto"
                </h3>
                
                <p className="text-lg mb-6">
                  Attraverso la gestione digitale intelligente degli invitati, riuscii ad aiutare mia sorella a:
                </p>
                
                <ul className="space-y-3 text-lg text-left max-w-2xl mx-auto">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    Organizzare tutti gli invitati in categorie chiare e gestibili
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    Tracciare automaticamente conferme e stati di ogni singolo invitato
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    Gestire allergie e intolleranze senza dimenticare nessun dettaglio
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    Avere statistiche in tempo reale su partecipanti confermati
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    Dormire sonni tranquilli sapendo che tutto era sotto controllo
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features vs Traditional */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary-deep">
              Le 4 Caratteristiche Essenziali Che Separano Un Matrimonio Perfetto Dal Caos Organizzativo
            </h2>
            
            <p className="text-xl text-center mb-12 text-muted-foreground">
              Le 4 Funzionalità Fondamentali Che Ogni Coppia Deve Avere (Che Excel e WhatsApp Non Possono Fornire)
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 shadow-elegant">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold text-primary-deep">Gestione Invitati Intelligente</h3>
                </div>
                <p className="text-lg mb-4">
                  Sistema completo per organizzare invitati principali e accompagnatori - 
                  mantieni tutto organizzato senza perdere mai traccia di nessuno.
                </p>
                <p className="text-destructive font-medium">
                  (senza questo, rischi di dimenticare invitati importanti e creare imbarazzo)
                </p>
              </Card>
              
              <Card className="p-6 shadow-elegant">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold text-primary-deep">Tracciamento Stati Real-Time</h3>
                </div>
                <p className="text-lg mb-4">
                  Monitora automaticamente chi ha confermato, chi è in attesa, chi ha rifiutato - 
                  statistiche sempre aggiornate a portata di mano.
                </p>
                <p className="text-destructive font-medium">
                  (senza questo, arrivi al matrimonio senza sapere quante persone verranno davvero)
                </p>
              </Card>
              
              <Card className="p-6 shadow-elegant">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold text-primary-deep">Gestione Allergie e Intolleranze</h3>
                </div>
                <p className="text-lg mb-4">
                  Registra e traccia automaticamente tutte le esigenze alimentari speciali - 
                  nessun invitato verrà dimenticato dal catering.
                </p>
                <p className="text-destructive font-medium">
                  (senza questo, rischi emergenze alimentari che possono rovinare il matrimonio)
                </p>
              </Card>
              
              <Card className="p-6 shadow-elegant">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold text-primary-deep">Categorie Personalizzabili</h3>
                </div>
                <p className="text-lg mb-4">
                  Organizza gli invitati per famiglia, amici, colleghi, o qualsiasi categoria - 
                  mantieni tutto ordinato e facilmente accessibile.
                </p>
                <p className="text-destructive font-medium">
                  (senza questo, perdi tempo prezioso cercando informazioni tra liste caotiche)
                </p>
              </Card>
            </div>
            
            <div className="text-center mt-12">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-xl px-12 py-6 rounded-full shadow-elegant">
                ACCEDI AL SISTEMA - Solo €97
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                🔥 OFFERTA LIMITATA (Prezzo normale €297)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Transformation */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-gold/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary-deep">
              La Trasformazione Che Puoi Aspettarti
            </h2>
            
            <p className="text-xl text-center mb-12 text-muted-foreground">
              Non lasciare che il caos organizzativo continui a dominare il tuo matrimonio. 
              La tua serenità può essere più bella che mai - hai solo bisogno del sistema giusto per realizzarla.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 bg-destructive/5 border-destructive/20">
                <h3 className="text-2xl font-bold mb-6 text-destructive text-center">
                  PRIMA del Sistema Matrimonio Perfetto:
                </h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    Notti insonni preoccupandoti di aver dimenticato qualcuno
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    Liste Excel confuse e contraddittorie ovunque
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    Telefonate infinite senza riuscire a parlare con tutti
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    Ansia costante per allergie e intolleranze dimenticate
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    Impossibilità di sapere quante persone verranno realmente
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    Stress che rovina la gioia dell'organizzazione matrimoniale
                  </li>
                </ul>
              </Card>
              
              <Card className="p-8 bg-primary/5 border-primary/20">
                <h3 className="text-2xl font-bold mb-6 text-primary text-center">
                  DOPO il Sistema Matrimonio Perfetto:
                </h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    Serenità totale sapendo che ogni dettaglio è tracciato
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    Tutti gli invitati organizzati in un sistema chiaro e preciso
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    Conferme automatiche e stati sempre aggiornati
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    Zero allergie dimenticate, catering sempre informato
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    Statistiche in tempo reale su partecipanti confermati
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    Gioia pura nel pianificare il tuo giorno più bello
                  </li>
                </ul>
              </Card>
            </div>
            
            <div className="text-center mt-12">
              <Button size="lg" className="bg-gold hover:bg-gold/90 text-primary-deep text-xl px-12 py-6 rounded-full shadow-elegant">
                INIZIA LA TUA TRASFORMAZIONE - Solo €97
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                🔥 OFFERTA LIMITATA (Prezzo normale €297)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Components */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary-deep">
              Il Tuo Percorso Verso Il Matrimonio Perfetto Inizia Qui
            </h2>
            
            <p className="text-xl text-center mb-12 text-muted-foreground">
              I 5 Moduli Che Trasformano Il Tuo Stress Matrimoniale
            </p>
            
            <div className="space-y-8">
              <Card className="p-8 shadow-elegant">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-deep">Wizard di Inserimento Intelligente (Giorno 1)</h3>
                    <p className="text-muted-foreground">Setup iniziale guidato passo dopo passo</p>
                  </div>
                </div>
                <p className="text-lg mb-4">
                  Serenità immediata - questo wizard ti guida attraverso l'inserimento di ogni invitato 
                  in modo sistematico e organizzato, senza dimenticare nulla.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Form guidato in 5 passaggi per dati completi</li>
                  <li>Gestione automatica di invitato principale e accompagnatori</li>
                  <li>Categorizzazione immediata per organizzazione perfetta</li>
                </ul>
              </Card>
              
              <Card className="p-8 shadow-elegant">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-deep">Sistema Stati Avanzato (Giorni 2-3)</h3>
                    <p className="text-muted-foreground">Tracciamento automatico delle conferme</p>
                  </div>
                </div>
                <p className="text-lg mb-4">
                  Controllo totale - il nostro sistema ti permette di tracciare ogni invitato 
                  attraverso stati chiari mentre gestisci conferme e rifiuti.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>5 stati chiari: Da Confermare, Confermato, Rifiutato, Forse, Eliminato</li>
                  <li>Transizioni intelligenti tra stati con un click</li>
                  <li>Statistiche real-time per decisioni immediate</li>
                </ul>
              </Card>
              
              <Card className="p-8 shadow-elegant">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">3</div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-deep">Gestione Allergie Intelligente (Giorno 4)</h3>
                    <p className="text-muted-foreground">Sicurezza alimentare garantita</p>
                  </div>
                </div>
                <p className="text-lg mb-4">
                  Tranquillità assoluta - il nostro modulo ti aiuta a registrare e tracciare 
                  ogni allergia e intolleranza senza dimenticare nessun dettaglio critico.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Database completo di allergie e intolleranze comuni</li>
                  <li>Note personalizzate per esigenze specifiche</li>
                  <li>Report automatici per il catering</li>
                </ul>
              </Card>
              
              <Card className="p-8 shadow-elegant">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">4</div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-deep">Dashboard Statistiche Live (Giorno 5)</h3>
                    <p className="text-muted-foreground">Controllo completo in tempo reale</p>
                  </div>
                </div>
                <p className="text-lg mb-4">
                  Visibilità completa - la nostra dashboard ti fornisce una panoramica istantanea 
                  di tutti i tuoi invitati mentre prendi decisioni informate.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Statistiche live su confermati, in attesa, rifiutati</li>
                  <li>Breakdown per categorie e accompagnatori</li>
                  <li>Grafici visivi per comprensione immediata</li>
                </ul>
              </Card>
              
              <Card className="p-8 shadow-elegant">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">5</div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-deep">Interfaccia Elegante e Sicura (Giorni 6-7)</h3>
                    <p className="text-muted-foreground">Design su misura per matrimoni</p>
                  </div>
                </div>
                <p className="text-lg mb-4">
                  Esperienza premium - la nostra interfaccia elegante ti accompagna 
                  con stile mentre organizzi il tuo giorno più importante.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Design romantico ed elegante specifico per matrimoni</li>
                  <li>Autenticazione sicura per proteggere i tuoi dati</li>
                  <li>Interfaccia responsive per gestione da qualsiasi dispositivo</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-gold/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary-deep">
              Ma non fidarti solo delle mie parole. Ascolta questi sposi felici:
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 shadow-elegant">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gold fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-lg italic mb-6">
                  "Dopo aver provato Excel per mesi senza successo, questo sistema ha risolto tutto in una settimana. 
                  Ora so esattamente chi viene, chi ha allergie, e posso dormire tranquilla. Il mio matrimonio è stato perfetto!"
                </blockquote>
                <footer className="text-muted-foreground">
                  — Sofia M., Sposata a Giugno 2024
                </footer>
              </Card>
              
              <Card className="p-8 shadow-elegant">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gold fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-lg italic mb-6">
                  "Gestivamo 200 invitati e pensavamo fosse impossibile. Con questo sistema abbiamo organizzato tutto 
                  in modo impeccabile. Le statistiche in tempo reale sono state fondamentali per il catering!"
                </blockquote>
                <footer className="text-muted-foreground">
                  — Marco & Giulia R., Sposati a Settembre 2024
                </footer>
              </Card>
              
              <Card className="p-8 shadow-elegant">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gold fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-lg italic mb-6">
                  "La gestione delle allergie è stata un salvavita! Avevamo 8 invitati con esigenze diverse 
                  e il sistema ci ha permesso di non dimenticare nessuno. Zero emergenze, massima serenità."
                </blockquote>
                <footer className="text-muted-foreground">
                  — Elena T., Wedding Planner Professionale
                </footer>
              </Card>
              
              <Card className="p-8 shadow-elegant">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gold fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-lg italic mb-6">
                  "Come sviluppatore, apprezzo la semplicità e l'efficacia. Ma come sposo, questo sistema 
                  mi ha dato la tranquillità di godermi davvero l'organizzazione del matrimonio!"
                </blockquote>
                <footer className="text-muted-foreground">
                  — Alessandro P., Sposato ad Agosto 2024
                </footer>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-primary-deep">
              Ottieni Il Sistema Matrimonio Perfetto Ora
            </h2>
            
            <p className="text-xl mb-12 text-muted-foreground">
              Mentre altre coppie lottano con liste Excel caotiche, tu potrai goderti la serenità 
              di un matrimonio perfettamente organizzato usando il nostro sistema collaudato.
            </p>
            
            <Card className="p-8 shadow-elegant mb-12 bg-gradient-to-br from-gold/10 to-primary/10">
              <h3 className="text-2xl font-bold mb-6 text-primary-deep">
                Ecco tutto quello che ricevi con il Sistema Matrimonio Perfetto oggi:
              </h3>
              
              <div className="text-left max-w-2xl mx-auto space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <strong>Il Sistema Completo Matrimonio Perfetto:</strong> 5 moduli provati che risolvono 
                    il caos degli invitati e garantiscono serenità totale
                  </div>
                </div>
                
                <div className="bg-gold/20 p-6 rounded-lg">
                  <h4 className="text-lg font-bold mb-4 text-primary-deep">🎁 Plus questi 5 Bonus Esclusivi 🎁</h4>
                  <ul className="space-y-3">
                    <li><strong>"Template Categorie Matrimonio"</strong> - 15 categorie pre-impostate per organizzazione immediata</li>
                    <li><strong>"Checklist Allergie Complete"</strong> - Database completo di 50+ allergie e intolleranze</li> 
                    <li><strong>"Guida Setup Rapido"</strong> - Video tutorial per iniziare in 10 minuti</li>
                    <li><strong>"Supporto Email Prioritario"</strong> - Assistenza dedicata per 30 giorni</li>
                    <li><strong>"Template Comunicazione Invitati"</strong> - Modelli professionali per conferme</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-2xl mb-4">
                  <span className="line-through text-muted-foreground">Normalmente: €297</span>
                </p>
                <p className="text-4xl font-bold text-primary mb-8">
                  Oggi Solo: €97
                </p>
                
                <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
                  <div className="flex gap-4">
                    <Input
                      type="email"
                      placeholder="La tua email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button type="submit" size="lg" className="bg-gold hover:bg-gold/90 text-primary-deep font-bold">
                      ACCEDI ORA
                    </Button>
                  </div>
                </form>
                
                {isSubmitted && (
                  <div className="bg-primary/10 p-6 rounded-lg mb-8">
                    <h4 className="text-lg font-bold text-primary mb-2">🎉 Grazie per il tuo interesse!</h4>
                    <p className="text-muted-foreground mb-4">
                      Per vedere il sistema in azione, puoi accedere alla demo completa:
                    </p>
                    <Link to="/auth">
                      <Button className="bg-primary hover:bg-primary/90 text-white">
                        Prova il Sistema Ora
                      </Button>
                    </Link>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mb-4">
                  🔥 OFFERTA LIMITATA - Solo per le prime 100 coppie
                </p>
                
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Pagamento Sicuro
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Accesso Immediato
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-deep text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-gold animate-heartbeat" fill="currentColor" />
            <h3 className="text-2xl font-bold">Sistema Matrimonio Perfetto</h3>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm mb-8">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Termini & Condizioni</a>
            <a href="#" className="hover:text-gold transition-colors">Supporto</a>
          </div>
          
          <p className="text-xs text-muted-foreground mb-4">
            COPYRIGHT 2025 | SISTEMA MATRIMONIO PERFETTO
          </p>
          
          <div className="max-w-4xl mx-auto text-xs text-muted-foreground space-y-4">
            <p>
              <strong>DISCLAIMER:</strong> I risultati possono variare. Il tuo successo dipenderà da molti fattori 
              inclusi ma non limitati al tuo impegno, esperienza e livello di organizzazione. Tutti i matrimoni 
              comportano stress e richiedono sforzo e azione costanti.
            </p>
            
            <p>
              <strong>NON FACEBOOK/META:</strong> Questo sito web non fa parte di Meta o Meta Platforms, Inc. 
              Inoltre, questo sito NON è approvato da Meta in alcun modo. META è un marchio registrato di Meta Platforms, Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;