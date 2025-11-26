import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { stripeService } from '@/services/stripeService';
import { STRIPE_PRICES } from '@/types/subscription';
import { Check, Sparkles, Crown } from 'lucide-react';

const PricingPage: React.FC = () => {
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null);

    const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
        try {
            setLoadingPlan(planType);

            const priceConfig = STRIPE_PRICES[planType];
            if (!priceConfig) {
                throw new Error('Piano non disponibile');
            }

            // Create checkout session
            const { url } = await stripeService.createCheckoutSession(
                priceConfig.priceId,
                `${window.location.origin}/payment/success`,
                `${window.location.origin}/payment/canceled`
            );

            // Redirect to Stripe Checkout URL
            window.location.href = url;
        } catch (error) {
            console.error('Error creating checkout:', error);
            setLoadingPlan(null);
        }
    };

    const monthlyPrice = STRIPE_PRICES.monthly;
    const yearlyPrice = STRIPE_PRICES.yearly;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-white to-secondary/20">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-primary/10 text-primary-deep hover:bg-primary/20">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Prova Gratuita 48 Ore
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Scegli il tuo piano
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Organizza il tuo matrimonio perfetto con Wed Guest Weaver.
                        Inizia con 48 ore gratuite, poi scegli il piano più adatto a te.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Monthly Plan */}
                    <Card className="relative border-2 border-gray-200 hover:border-primary/30 transition-all">
                        <CardHeader>
                            <CardTitle className="text-2xl">Piano Mensile</CardTitle>
                            <CardDescription>Flessibilità massima, cancella quando vuoi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">€{monthlyPrice?.amount}</span>
                                    <span className="text-gray-500">/mese</span>
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
                                onClick={() => handleSubscribe('monthly')}
                                disabled={loadingPlan !== null}
                                className="w-full bg-primary hover:bg-primary-deep"
                                size="lg"
                            >
                                {loadingPlan === 'monthly' ? 'Caricamento...' : 'Inizia Prova Gratuita'}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Yearly Plan - Recommended */}
                    <Card className="relative border-2 border-primary hover:border-primary-deep transition-all shadow-lg">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-white px-4 py-1">
                                <Crown className="w-3 h-3 mr-1" />
                                Più Popolare
                            </Badge>
                        </div>

                        <CardHeader>
                            <CardTitle className="text-2xl">Piano Annuale</CardTitle>
                            <CardDescription>Risparmia il 25% con il piano annuale</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-primary">€{yearlyPrice && (yearlyPrice.amount / 12).toFixed(2)}</span>
                                    <span className="text-gray-500">/mese</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Fatturato annualmente (€{yearlyPrice?.amount}/anno)
                                </p>
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
                                {loadingPlan === 'yearly' ? 'Caricamento...' : 'Inizia Prova Gratuita'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Trial Info */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-600">
                        🎉 <strong>48 ore di prova gratuita</strong> - Nessuna carta richiesta per iniziare
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Cancella in qualsiasi momento. Nessun impegno.
                    </p>
                </div>

                {/* Back to Login */}
                <div className="mt-8 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/auth')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Torna al login
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
