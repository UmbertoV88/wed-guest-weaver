import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { stripeService } from '@/services/stripeService';
import { STRIPE_PRICES } from '@/types/subscription';
import { Check, Sparkles, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PricingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { subscription, loading: subscriptionLoading } = useSubscription();
    const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null);
    const { t } = useTranslation();

    // Determine if user has already used trial (trial date is in the past)
    // Determine if user has already used trial (if trial_ends_at exists, trial was used)
    const hasUsedTrial = !!(
        user &&
        subscription?.trial_ends_at
    );
    const buttonText = hasUsedTrial ? t('pricing.subscribe') : t('pricing.startTrial');

    const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
        try {
            // If user is not authenticated, redirect to auth page first
            if (!user) {
                // Store the selected plan in sessionStorage to resume after login
                sessionStorage.setItem('selectedPlan', planType);
                navigate('/auth');
                return;
            }

            setLoadingPlan(planType);

            const priceConfig = STRIPE_PRICES[planType];
            if (!priceConfig) {
                throw new Error('Piano non disponibile');
            }

            // Create checkout session
            // If hasUsedTrial is false, skipTrial will be false -> Stripe adds 48h trial
            // If hasUsedTrial is true, skipTrial will be true -> Stripe charges immediately
            const { url } = await stripeService.createCheckoutSession(
                priceConfig.priceId,
                `${window.location.origin}/payment/success`,
                `${window.location.origin}/payment/canceled`,
                hasUsedTrial // skipTrial
            );

            // Redirect to Stripe Checkout URL
            window.location.href = url;
        } catch (error) {
            console.error('Error creating checkout:', error);
            setLoadingPlan(null);
        }
    };

    // Check if user just logged in after selecting a plan
    useEffect(() => {
        // Wait for subscription data to load to ensure hasUsedTrial is correct
        if (subscriptionLoading) return;

        const savedPlan = sessionStorage.getItem('selectedPlan');
        if (user && savedPlan) {
            // Clear the saved plan
            sessionStorage.removeItem('selectedPlan');
            // Automatically initiate checkout
            handleSubscribe(savedPlan as 'monthly' | 'yearly');
        }
    }, [user, subscriptionLoading]);

    const monthlyPrice = STRIPE_PRICES.monthly;
    const yearlyPrice = STRIPE_PRICES.yearly;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-white to-secondary/20">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    {!hasUsedTrial && (
                        <Badge className="mb-4 bg-primary/10 text-primary-deep hover:bg-primary/20">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {t('pricing.freeTrial')}
                        </Badge>
                    )}
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        {t('pricing.title')}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('pricing.subtitle')}
                        {hasUsedTrial
                            ? " " + t('pricing.trialUsed')
                            : " " + t('pricing.subtitle')
                        }
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Monthly Plan */}
                    <Card className="relative border-2 border-gray-200 hover:border-primary/30 transition-all flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl">{t('pricing.monthly')}</CardTitle>
                            <CardDescription>Flessibilità massima, cancella quando vuoi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 flex-1">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">€{monthlyPrice?.amount.toFixed(2)}</span>
                                    <span className="text-gray-500">/{t('pricing.perMonth')}</span>
                                </div>
                                {!hasUsedTrial && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Dopo 48 ore di prova gratuita
                                    </p>
                                )}
                            </div>

                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{t('pricing.features.unlimitedGuests')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{t('pricing.features.tableManagement')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{t('pricing.features.budgetTracking')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{t('pricing.features.export')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{t('pricing.features.support')}</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => handleSubscribe('monthly')}
                                disabled={loadingPlan !== null}
                                className="w-full bg-primary hover:bg-primary-deep"
                                size="lg"
                            >
                                {loadingPlan === 'monthly' ? t('common.status.loading') : buttonText}
                            </Button>
                            {!hasUsedTrial && (
                                <p className="text-xs text-center text-muted-foreground w-full mt-2">
                                    Poi €{monthlyPrice?.amount.toFixed(2)}/mese. Cancella quando vuoi.
                                </p>
                            )}
                        </CardFooter>
                    </Card>

                    {/* Yearly Plan - Recommended */}
                    <Card className="relative border-2 border-primary hover:border-primary-deep transition-all shadow-lg flex flex-col">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-white px-4 py-1">
                                <Crown className="w-3 h-3 mr-1" />
                                {t('landing.finalCta.annualPlan').replace('🔥 ', '')}
                            </Badge>
                        </div>

                        <CardHeader>
                            <CardTitle className="text-2xl">{t('pricing.annual')}</CardTitle>
                            <CardDescription>Risparmia il 25% con il piano annuale</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 flex-1">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-primary">€{yearlyPrice && (yearlyPrice.amount / 12).toFixed(2)}</span>
                                    <span className="text-gray-500">/{t('pricing.perMonth')}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Fatturato annualmente (€{yearlyPrice?.amount.toFixed(2)}/{t('pricing.perYear')})
                                </p>
                                {!hasUsedTrial && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Dopo 48 ore di prova gratuita
                                    </p>
                                )}
                                <div className="mt-2">
                                    <Badge variant="outline" className="text-green-700 border-green-700">
                                        Risparmi €60 all'anno
                                    </Badge>
                                </div>
                            </div>

                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Gestione illimitata invitati</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Disposizione tavoli interattiva</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Gestione budget e fornitori</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Export Excel e stampa</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Supporto prioritario</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => handleSubscribe('yearly')}
                                disabled={loadingPlan !== null}
                                className="w-full bg-primary hover:bg-primary-deep"
                                size="lg"
                            >
                                {loadingPlan === 'yearly' ? t('common.status.loading') : buttonText}
                            </Button>
                            {!hasUsedTrial && (
                                <p className="text-xs text-center text-muted-foreground w-full mt-2">
                                    Poi €{yearlyPrice?.amount.toFixed(2)}/anno. Cancella quando vuoi.
                                </p>
                            )}
                        </CardFooter>
                    </Card>
                </div>

                {/* Trial Info */}
                {!hasUsedTrial && (
                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-600">
                            🎉 <strong>48 ore di prova gratuita incluse</strong> - Nessun addebito immediato
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Ti invieremo un promemoria prima della scadenza del periodo di prova.
                        </p>
                    </div>
                )}

                {/* Back to Homepage */}
                <div className="mt-8 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Torna a Homepage
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
