import { useState, useEffect } from "react";
import { Heart, Calendar, ChevronDown } from "lucide-react";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface WeddingHeaderProps {
  className?: string;
}

const WeddingHeader = ({ className }: WeddingHeaderProps) => {
  const [weddingDate, setWeddingDate] = useState<Date>();
  const [countdown, setCountdown] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    // Load saved date from localStorage
    const savedDate = localStorage.getItem('weddingDate');
    if (savedDate) {
      setWeddingDate(new Date(savedDate));
    }
  }, []);

  useEffect(() => {
    if (!weddingDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const days = differenceInDays(weddingDate, now);
      const hours = differenceInHours(weddingDate, now) % 24;
      const minutes = differenceInMinutes(weddingDate, now) % 60;

      if (days < 0) {
        setCountdown("Matrimonio celebrato! 💕");
      } else if (days === 0) {
        setCountdown("È oggi! 🎉");
      } else {
        setCountdown(`${days} giorni, ${hours}h, ${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [weddingDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setWeddingDate(date);
      localStorage.setItem('weddingDate', date.toISOString());
      setIsCalendarOpen(false);
    }
  };

  return (
    <header className={cn("bg-elegant border-b border-primary/10 shadow-romantic", className)}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-3 animate-fade-in-up justify-center lg:justify-start order-1 lg:order-1">
              <div className="relative">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-heartbeat" fill="currentColor" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gold rounded-full animate-sparkle"></div>
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-primary-deep to-gold bg-clip-text text-transparent">
                  Gestione Invitati Matrimonio
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 lg:mt-1 hidden sm:block">
                  Organizza il tuo giorno speciale con eleganza
                </p>
              </div>
            </div>

            {/* Wedding Date Section */}
            <div className="flex justify-center order-3 lg:order-2">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-full shadow-soft animate-slide-in-right border-primary/20 hover:border-primary/40 transition-all duration-300 text-xs sm:text-sm"
                  >
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    <span className="font-medium text-primary-deep">
                      {weddingDate 
                        ? format(weddingDate, "dd MMM yyyy", { locale: it })
                        : "Scegli data matrimonio"
                      }
                    </span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-primary/60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <CalendarComponent
                    mode="single"
                    selected={weddingDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Countdown Section */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-3">
              {weddingDate && countdown && (
                <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-gold/10 backdrop-blur-sm rounded-full shadow-soft border border-primary/20">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-semibold text-primary-deep">
                      {countdown}
                    </div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      al grande giorno
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WeddingHeader;