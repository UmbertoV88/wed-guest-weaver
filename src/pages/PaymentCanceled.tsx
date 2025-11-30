import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PaymentCanceled: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-2 border-gray-200">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-gray-600" />
                    </div>
                    <CardTitle className="text-2xl text-gray-900">{t('payment.canceled.title')}</CardTitle>
                    <CardDescription className="text-base">
                        {t('payment.canceled.message')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                            {t('payment.canceled.message')}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">
                            {t('payment.canceled.message')}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/pricing')}
                            className="w-full bg-primary hover:bg-primary-deep"
                            size="lg"
                        >
                            {t('payment.canceled.retry')}
                        </Button>

                        <Button
                            onClick={() => navigate('/auth')}
                            variant="outline"
                            className="w-full"
                            size="lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('payment.canceled.goBack')}
                        </Button>
                    </div>

                    <p className="text-xs text-center text-gray-500">
                        Hai bisogno di aiuto? Contattaci a support@wedguestweaver.com
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentCanceled;
