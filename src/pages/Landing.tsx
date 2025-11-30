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
import { useTranslation } from "react-i18next";
import CommonHeader from "@/components/CommonHeader";

const Landing = () => {
  const [email, setEmail] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('landing.meta.title');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        t('landing.meta.description'),
      );
    }
  }, [t]);

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
              {t('landing.hero.title')}
              <br />
              <span className="text-gold">{t('landing.hero.titleHighlight')}</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-white/90">
              {t('landing.hero.subtitle')}
            </p>

            <p className="text-lg mb-8 text-white/80">{t('landing.hero.description')}</p>

            <Link to="/auth">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold/90 text-primary-deep text-xl px-12 py-7 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse"
              >
                <span className="flex items-center gap-3">
                  {t('landing.hero.cta')}
                  <Sparkles className="w-5 h-5" />
                </span>
              </Button>
            </Link>

            <p className="mt-6 text-white/70 text-sm">{t('landing.hero.pricing')}</p>
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
              {t('landing.howItWorks.title')}
              <br />
              <span className="text-primary">{t('landing.howItWorks.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.howItWorks.subtitle')}
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
                <h3 className="text-xl font-bold text-center mb-4">{t('landing.howItWorks.step1.title')}</h3>
                <p className="text-muted-foreground text-center">
                  {t('landing.howItWorks.step1.description')}
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
                <h3 className="text-xl font-bold text-center mb-4">{t('landing.howItWorks.step2.title')}</h3>
                <p className="text-muted-foreground text-center">
                  {t('landing.howItWorks.step2.description')}
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
                <h3 className="text-xl font-bold text-center mb-4">{t('landing.howItWorks.step3.title')}</h3>
                <p className="text-muted-foreground text-center">
                  {t('landing.howItWorks.step3.description')}
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
              {t('landing.features.title')}
              <br />
              <span className="text-primary">{t('landing.features.titleHighlight')}</span>
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
                <h3 className="text-lg font-bold mb-2">{t('landing.features.guestManagement.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.features.guestManagement.description')}</p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t('landing.features.statistics.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.features.statistics.description')}</p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t('landing.features.allergies.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.features.allergies.description')}</p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t('landing.features.categories.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.features.categories.description')}</p>
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
              <div className="text-white/80">{t('landing.stats.weddings')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-gold">15K+</div>
              <div className="text-white/80">{t('landing.stats.guests')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-gold">98%</div>
              <div className="text-white/80">{t('landing.stats.satisfaction')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-gold">7 {t('landing.stats.setup')}</div>
              <div className="text-white/80">{t('landing.stats.setup')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Design Card Moderno */}
      <section className="py-24 bg-gradient-to-b from-primary/5 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-deep">
              {t('landing.testimonials.title')}
              <br />
              <span className="text-primary">{t('landing.testimonials.titleHighlight')}</span>
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
                {t('landing.testimonials.testimonial1.text')}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{t('landing.testimonials.testimonial1.author')}</div>
                  <div className="text-xs text-muted-foreground">{t('landing.testimonials.testimonial1.date')}</div>
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
                {t('landing.testimonials.testimonial2.text')}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{t('landing.testimonials.testimonial2.author')}</div>
                  <div className="text-xs text-muted-foreground">{t('landing.testimonials.testimonial2.date')}</div>
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
                {t('landing.testimonials.testimonial3.text')}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{t('landing.testimonials.testimonial3.author')}</div>
                  <div className="text-xs text-muted-foreground">{t('landing.testimonials.testimonial3.role')}</div>
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
            {t('landing.finalCta.title')}
            <br />
            <span className="text-gold">{t('landing.finalCta.titleHighlight')}</span>
          </h2>

          <p className="text-xl mb-12 text-white/90">
            {t('landing.finalCta.subtitle')}
          </p>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl mb-8">
            <div className="text-2xl font-bold mb-4 text-gold">
              {t('landing.finalCta.trialTitle')}
            </div>
            <div className="text-white/80 mb-8">{t('landing.finalCta.trialSubtitle')}</div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 p-6 rounded-xl">
                <div className="text-sm text-white/60 mb-2">{t('landing.finalCta.monthlyPlan')}</div>
                <div className="text-4xl font-bold text-gold mb-2">{t('landing.finalCta.monthlyPrice')}</div>
                <div className="text-white/70 text-sm">{t('landing.finalCta.monthlyPeriod')}</div>
              </div>
              <div className="bg-white/5 p-6 rounded-xl border-2 border-gold/30">
                <div className="text-sm text-gold mb-2">{t('landing.finalCta.annualPlan')}</div>
                <div className="text-4xl font-bold text-gold mb-2">{t('landing.finalCta.annualPrice')}</div>
                <div className="text-white/70 text-sm">{t('landing.finalCta.annualPeriod')}</div>
              </div>
            </div>

            <Link to="/auth">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold/90 text-primary-deep text-2xl px-16 py-8 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 w-full md:w-auto"
              >
                {t('landing.finalCta.cta')}
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/70 mb-12">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t('landing.finalCta.securePayment')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t('landing.finalCta.freeTrial')}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('landing.finalCta.cancelAnytime')}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-primary-deep text-white/60 text-center text-sm">
        <div className="container mx-auto px-4">
          <p className="mb-4">{t('landing.footer.copyright')}</p>
          {/* Footer links hidden as per user request */}
          <p className="mt-4 text-xs">
            {t('landing.footer.disclaimer')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
