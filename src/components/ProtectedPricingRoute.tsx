import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface ProtectedPricingRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedPricingRoute: Ensures only authenticated users without active subscription can access pricing
 * - Non-authenticated users → redirect to /auth
 * - Authenticated users WITH active subscription/trial → redirect to /dashboard
 * - Authenticated users WITHOUT subscription → allow access to pricing
 */
const ProtectedPricingRoute: React.FC<ProtectedPricingRouteProps> = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const { loading: subLoading, isActive } = useSubscription();

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

    // If user has active subscription or trial, redirect to dashboard
    if (isActive) {
        return <Navigate to="/dashboard" replace />;
    }

    // User is authenticated but needs subscription - show pricing
    return <>{children}</>;
};

export default ProtectedPricingRoute;
