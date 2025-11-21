import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseLogoutOptions {
  showConfirmation?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useLogout = (options: UseLogoutOptions = {}) => {
  const { signOut, signingOut } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const { showConfirmation = true, onSuccess, onError } = options;

  const logout = async () => {
    try {
      await signOut();
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    }
  };

  const handleLogoutClick = () => {
    if (showConfirmation) {
      setShowDialog(true);
    } else {
      logout();
    }
  };

  const confirmLogout = () => {
    logout();
    setShowDialog(false);
  };

  const cancelLogout = () => {
    setShowDialog(false);
  };

  return {
    logout,
    handleLogoutClick,
    confirmLogout,
    cancelLogout,
    signingOut,
    showDialog,
    setShowDialog
  };
};