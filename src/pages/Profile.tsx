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
import { it } from 'date-fns/locale';
import DashboardSidebar from '@/components/DashboardSidebar';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import CommonHeader from "@/components/CommonHeader";

const Profile = () => {
    const navigate = useNavigate();
    const { user, signOut, signingOut } = useAuth();
    const { subscription, loading: subLoading } = useSubscription();
    const { profile, isWeddingOrganizer } = useProfile();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isManagingSub, setIsManagingSub] = useState(false);

    const handleManageSubscription = async () => {
        try {
            setIsManagingSub(true);
            const { url } = await stripeService.createPortalSession(window.location.href);
            window.location.href = url;
        } catch (error) {
            console.error('Error opening portal:', error);
            toast.error("Errore nell'apertura del portale abbonamento");
        } finally {
            setIsManagingSub(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);

            const { error } = await supabase.functions.invoke('delete-account');

            if (error) throw error;

            toast.success("Account eliminato con successo");
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error("Errore durante l'eliminazione dell'account. Riprova più tardi.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!user) return null;

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-gray-50">
                <DashboardSidebar
                    user={user}
                    profile={profile}
                    isWeddingOrganizer={isWeddingOrganizer}
                    onSignOut={signOut}
                    signingOut={signingOut}
                />

                <SidebarInset className="flex-1 flex flex-col">
                    <CommonHeader showSidebarTrigger={true} />

                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Il tuo Profilo</h1>
                                <p className="text-gray-500 mt-2">Gestisci le tue informazioni personali e l'abbonamento.</p>
                            </div>

                            {/* User Info Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Informazioni Personali
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-500">Data Matrimonio</label>
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {profile?.wedding_date
                                                    ? format(new Date(profile.wedding_date), "d MMMM yyyy", { locale: it })
                                                    : "Non impostata"
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
                                        Abbonamento
                                    </CardTitle>
                                    <CardDescription>
                                        Gestisci il tuo piano e i metodi di pagamento
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                        <div className="space-y-1">
                                            <div className="font-medium">Stato Attuale</div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={subscription?.subscription_status === 'active' ? 'default' : 'secondary'}>
                                                    {subscription?.subscription_status === 'active' ? 'Attivo' :
                                                        subscription?.subscription_status === 'trialing' ? 'Periodo di Prova' :
                                                            subscription?.subscription_status === 'canceled' ? 'Cancellato' : 'Inattivo'}
                                                </Badge>
                                                {subscription?.subscription_type === 'yearly' && (
                                                    <Badge variant="outline" className="text-primary border-primary">Annuale</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={handleManageSubscription}
                                            disabled={isManagingSub}
                                        >
                                            {isManagingSub ? 'Caricamento...' : 'Gestisci Abbonamento'}
                                        </Button>
                                    </div>

                                    {subscription?.trial_ends_at && subscription.subscription_status === 'trialing' && (
                                        <p className="text-sm text-muted-foreground">
                                            Il periodo di prova scade il {format(new Date(subscription.trial_ends_at), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="border-red-100">
                                <CardHeader>
                                    <CardTitle className="text-red-600 flex items-center gap-2">
                                        <Trash2 className="w-5 h-5" />
                                        Zona Pericolo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 mb-4">
                                        L'eliminazione dell'account è irreversibile. Tutti i tuoi dati, inclusi la lista invitati, i tavoli e il budget, verranno cancellati permanentemente.
                                        Anche l'abbonamento verrà terminato immediatamente.
                                    </p>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full sm:w-auto">
                                                Elimina Account
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Questa azione non può essere annullata. Eliminerà permanentemente il tuo account e rimuoverà tutti i tuoi dati dai nostri server.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDeleteAccount}
                                                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                                >
                                                    {isDeleting ? 'Eliminazione...' : 'Sì, elimina il mio account'}
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
