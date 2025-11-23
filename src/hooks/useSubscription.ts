import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { stripeService } from '@/services/stripeService';
import type { UserSubscription } from '@/types/subscription';
import { hasActiveSubscription, needsPayment, isInTrialPeriod } from '@/types/subscription';

/**
 * Hook to manage user subscription state
 * Provides subscription data and helper methods
 */
export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription on mount and when user changes
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const data = await stripeService.getSubscription(user.id);
        setSubscription(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Impossibile caricare lo stato dell\'abbonamento');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = stripeService.subscribeToSubscriptionUpdates(
      user.id,
      (updatedSubscription) => {
        setSubscription(updatedSubscription);
      }
    );

    return unsubscribe;
  }, [user]);

  // Helper computed values
  const isActive = hasActiveSubscription(subscription);
  const requiresPayment = needsPayment(subscription);
  const inTrial = isInTrialPeriod(subscription);

  return {
    subscription,
    loading,
    error,
    isActive,
    requiresPayment,
    inTrial,
    refetch: async () => {
      if (!user) return;
      const data = await stripeService.getSubscription(user.id);
      setSubscription(data);
    }
  };
}
