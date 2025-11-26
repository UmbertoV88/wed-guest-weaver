import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';


const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-2 border-green-200">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-900">Pagamento Riuscito!</CardTitle>
                    <CardDescription className="text-base">
                        Benvenuto in Wed Guest Weaver Premium
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            Il tuo abbonamento è stato attivato con successo. Ora hai accesso completo a tutte le funzionalità della piattaforma.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">Cosa puoi fare ora:</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Gestire la lista invitati senza limiti</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Organizzare i tavoli con drag & drop</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Gestire budget e fornitori</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Esportare e stampare i dati</span>
                            </li>
                        </ul>
                    </div>

                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                    >
                        Vai alla Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                        Riceverai una email di conferma con i dettagli del tuo abbonamento
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentSuccess;
