import { useState, useEffect } from "react";
import { Heart, Calendar, ChevronDown, LogOut, Crown, Menu, Camera, DollarSign, Users, MapPin } from "lucide-react";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { it as itLocale, enUS } from "date-fns/locale";

interface WeddingHeaderProps {
  className?: string;
  user?: { email?: string } | null;
  profile?: { full_name?: string } | null;
  isWeddingOrganizer?: boolean;
  onSignOut?: () => void;
  signingOut?: boolean;
}

const WeddingHeader = ({
  className,
  user,
  profile,
  isWeddingOrganizer,
  onSignOut,
  signingOut = false
}: WeddingHeaderProps) => {
  const [weddingDate, setWeddingDate] = useState<Date>();
  const [countdown, setCountdown] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'it' ? itLocale : enUS;

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
        setCountdown(t('dashboard.sidebar.countdown.married'));
      } else if (days === 0) {
        setCountdown(t('dashboard.sidebar.countdown.today'));
      } else {
        setCountdown(`${days} ${t('dashboard.sidebar.countdown.days', { count: days })}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [weddingDate, t]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setWeddingDate(date);
      localStorage.setItem('weddingDate', date.toISOString());
      setIsCalendarOpen(false);
    }
  };

  const menuSections = [
    { icon: DollarSign, label: t('dashboard.sidebar.menu.budget'), href: "/finanza" },
    { icon: Users, label: t('dashboard.sidebar.menu.guests'), href: "/" },
  ];

  return (
    <header className={cn("bg-white/80 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10", className)}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">

          {/* Unified Header - Mobile and Desktop */}
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-3 animate-fade-in-up">
              <div className="relative">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-heartbeat" fill="currentColor" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gold rounded-full animate-sparkle"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-deep to-gold bg-clip-text text-transparent">
                  {t('dashboard.header.title')}
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 hidden sm:block">
                  {t('dashboard.header.subtitle')}
                </p>
              </div>
            </div>

            {/* Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <SheetHeader>
                  <SheetTitle className="text-left">{t('dashboard.header.menu')}</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Calendar and Countdown Section */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-muted-foreground">{t('dashboard.sidebar.weddingDate')}</div>

                    {/* Wedding Date Picker */}
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 text-left"
                        >
                          <Calendar className="w-4 h-4 text-primary" />
                          {weddingDate
                            ? format(weddingDate, "dd MMM yyyy", { locale: dateLocale })
                            : t('dashboard.sidebar.chooseDate')
                          }
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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

                    {/* Countdown */}
                    {weddingDate && countdown && (
                      <div className="p-4 bg-gradient-to-r from-primary/10 to-gold/10 rounded-lg border border-primary/20">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-primary-deep">
                            {countdown}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t('dashboard.sidebar.countdown.toTheBigDay')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Menu Sections */}
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-muted-foreground">{t('dashboard.sidebar.sections')}</div>
                    {menuSections.map((section) => {
                      const IconComponent = section.icon;
                      return (
                        <Button
                          key={section.href}
                          variant="ghost"
                          className="w-full justify-start gap-3 h-12"
                          onClick={() => {
                            // Navigate to section (placeholder for now)
                            console.log(`Navigate to ${section.href}`);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <IconComponent className="w-5 h-5 text-primary" />
                          {section.label}
                        </Button>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* User Info and Logout */}
                  <div className="space-y-4">
                    {/* User Badge */}
                    {isWeddingOrganizer && (
                      <Badge variant="secondary" className="w-full justify-center py-2 bg-gradient-to-r from-gold/20 to-primary/20 text-primary-deep border-primary/30">
                        <Crown className="w-4 h-4 mr-2" />
                        Wedding Organizer
                      </Badge>
                    )}

                    {/* User Greeting */}
                    {(profile?.full_name || user?.email) && (
                      <div className="text-center text-sm text-muted-foreground">
                        {t('dashboard.header.greeting', { name: profile?.full_name || user?.email })}
                      </div>
                    )}

                    {/* Logout Button */}
                    {onSignOut && (
                      <LogoutConfirmDialog
                        onSignOut={async () => {
                          onSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        signingOut={signingOut}
                        className="w-full"
                        showConfirmation={true}
                      >
                        {signingOut ? t('common.status.loading') : t('header.logout')}
                      </LogoutConfirmDialog>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WeddingHeader;