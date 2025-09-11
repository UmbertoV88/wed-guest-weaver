import { Heart, Calendar } from "lucide-react";

const WeddingHeader = () => {
  return (
    <header className="bg-elegant border-b border-primary/10 shadow-romantic">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 animate-fade-in-up">
            <div className="relative">
              <Heart className="w-8 h-8 text-primary animate-heartbeat" fill="currentColor" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full animate-sparkle"></div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-deep to-gold bg-clip-text text-transparent">
                Gestione Invitati Matrimonio
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Organizza il tuo giorno speciale con eleganza
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-soft animate-slide-in-right">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary-deep">
              Il tuo matrimonio perfetto
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WeddingHeader;