import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface LogoutConfirmDialogProps {
  onSignOut: () => Promise<void>;
  signingOut?: boolean;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  children?: React.ReactNode;
  showConfirmation?: boolean;
  collapsed?: boolean;
}

export const LogoutConfirmDialog = ({
  onSignOut,
  signingOut = false,
  className,
  variant = "outline",
  size = "default",
  children,
  showConfirmation = true,
  collapsed = false
}: LogoutConfirmDialogProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const { t } = useTranslation();

  const handleLogoutClick = () => {
    if (showConfirmation) {
      setShowDialog(true);
    } else {
      onSignOut();
    }
  };

  const handleConfirm = () => {
    onSignOut();
    setShowDialog(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(
          "gap-2 text-destructive border-destructive/20 hover:bg-destructive/10",
          collapsed && "justify-center px-2",
          className
        )}
        onClick={handleLogoutClick}
        disabled={signingOut}
      >
        <LogOut className={cn("w-4 h-4", signingOut && "animate-spin")} />
        {!collapsed && (children || (signingOut ? t('common.status.loading') : t('header.logout')))}
      </Button>

      <ConfirmDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={t('dialogs.logout.title')}
        description={t('dialogs.logout.message')}
        confirmText={t('dialogs.logout.confirm')}
        cancelText={t('dialogs.logout.cancel')}
        onConfirm={handleConfirm}
        variant="destructive"
      />
    </>
  );
};