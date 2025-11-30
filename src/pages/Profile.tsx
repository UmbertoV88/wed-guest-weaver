import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useProfile } from '@/hooks/useProfile';
import { stripeService } from '@/services/stripeService';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { User, CreditCard, Trash2, Mail, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useTranslation } from 'react-i18next';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import CommonHeader from "@/components/CommonHeader";

const Profile = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user, signOut, signingOut } = useAuth();
    const { subscription, loading: subLoading } = useSubscription();
    const { profile, isWeddingOrganizer } = useProfile();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isManagingSub, setIsManagingSub] = useState(false);

    const dateLocale = i18n.language === 'it' ? it : enUS;

    const handleManageSubscription = async () => {
        try {
            setIsManagingSub(true);
            const { url } = await stripeService.createPortalSession(window.location.href);
            window.location.href = url;
        } catch (error) {
            console.error('Error opening portal:', error);
            toast.error(t('profile.toasts.portalError'));
        } finally {
            setIsManagingSub(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);

            const { error } = await supabase.functions.invoke('delete-account');

            if (error) throw error;

            toast.success(t('profile.toasts.deleteSuccess'));
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error(t('profile.toasts.deleteError'));
        } finally {
            setIsDeleting(false);
        }
    };

    if (!user) return null;

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-gray-50">
                <DashboardSidebar
                    onSignOut={signOut}
                    signingOut={signingOut}
                />

                <SidebarInset className="flex-1 flex flex-col">
                    <CommonHeader showSidebarTrigger={true} />

                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
                                <p className="text-gray-500 mt-2">{t('profile.subtitle')}</p>
                            </div>

                            {/* User Info Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        {t('profile.personalInfo.title')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500">{t('profile.personalInfo.email')}</label>
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500">{t('profile.personalInfo.weddingDate')}</label>
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {profile?.wedding_date
                                                    ? format(new Date(profile.wedding_date), "d MMMM yyyy", { locale: dateLocale })
                                                    : t('profile.personalInfo.notSet')
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Subscription Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        {t('profile.subscription.title')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('profile.subscription.description')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                        <div className="space-y-1">
                                            <div className="font-medium">{t('profile.subscription.currentStatus')}</div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={subscription?.subscription_status === 'active' ? 'default' : 'secondary'}>
                                                    {subscription?.subscription_status === 'active' ? t('profile.subscription.status.active') :
                                                        subscription?.subscription_status === 'trialing' ? t('profile.subscription.status.trialing') :
                                                            subscription?.subscription_status === 'canceled' ? t('profile.subscription.status.canceled') : t('profile.subscription.status.inactive')}
                                                </Badge>
                                                {subscription?.subscription_type === 'yearly' && (
                                                    <Badge variant="outline" className="text-primary border-primary">{t('profile.subscription.yearly')}</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={handleManageSubscription}
                                            disabled={isManagingSub}
                                        >
                                            {isManagingSub ? t('profile.subscription.loading') : t('profile.subscription.manage')}
                                        </Button>
                                    </div>

                                    {subscription?.trial_ends_at && subscription.subscription_status === 'trialing' && (
                                        <p className="text-sm text-muted-foreground">
                                            {t('profile.subscription.trialEnds', { date: format(new Date(subscription.trial_ends_at), "d MMMM yyyy 'alle' HH:mm", { locale: dateLocale }) })}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="border-red-100">
                                <CardHeader>
                                    <CardTitle className="text-red-600 flex items-center gap-2">
                                        <Trash2 className="w-5 h-5" />
                                        {t('profile.dangerZone.title')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {t('profile.dangerZone.description')}
                                    </p>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full sm:w-auto">
                                                {t('profile.dangerZone.deleteAccount')}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('profile.dangerZone.confirmTitle')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('profile.dangerZone.confirmDescription')}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('profile.dangerZone.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDeleteAccount}
                                                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                                >
                                                    {isDeleting ? t('profile.dangerZone.deleting') : t('profile.dangerZone.confirm')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default Profile;
