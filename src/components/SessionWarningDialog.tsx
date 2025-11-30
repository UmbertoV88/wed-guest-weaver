import { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface SessionWarningDialogProps {
  open: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  warningTimeMs: number;
}

export const SessionWarningDialog = ({
  open,
  onExtendSession,
  onLogout,
  warningTimeMs
}: SessionWarningDialogProps) => {
  const [timeLeft, setTimeLeft] = useState(Math.floor(warningTimeMs / 1000));
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;

    setTimeLeft(Math.floor(warningTimeMs / 1000));

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, warningTimeMs, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            {t('dialogs.sessionWarning.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            La tua sessione scadrà tra{' '}
            <span className="font-mono font-bold text-destructive">
              {formatTime(timeLeft)}
            </span>
            . Vuoi estendere la sessione o preferisci disconnetterti?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onLogout}>
            {t('dialogs.sessionWarning.logout')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onExtendSession}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('dialogs.sessionWarning.stayLoggedIn')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};