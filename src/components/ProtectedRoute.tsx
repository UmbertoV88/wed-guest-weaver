import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getRemainingTrialHours } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, isActive, inTrial } = useSubscription();

  // Show loading spinner while checking auth and subscription
  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user doesn't have active subscription (and not in trial), redirect to pricing
  if (!isActive) {
    return <Navigate to="/pricing" replace />;
  }

  // If in trial, show trial badge
  const trialHours = getRemainingTrialHours(subscription);

  return (
    <>
      {inTrial && trialHours > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 text-center text-sm shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              <strong>Periodo di prova:</strong> {trialHours} ore rimanenti
            </span>
            <Badge variant="secondary" className="ml-2 bg-white text-orange-700">
              Gratuito
            </Badge>
          </div>
        </div>
      )}
      <div className={inTrial && trialHours > 0 ? 'pt-10' : ''}>
        {children}
      </div>
    </>
  );
};

export default ProtectedRoute;