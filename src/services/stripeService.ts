import { supabase } from '@/integrations/supabase/client';
import type { 
  UserSubscription, 
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  CreatePortalSessionRequest,
  CreatePortalSessionResponse
} from '@/types/subscription';

/**
 * Stripe Service
 * Handles all Stripe-related operations via Supabase Edge Functions
 */
class StripeService {
  /**
   * Get user's subscription from profiles table
   */
  async getSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - this shouldn't happen for authenticated users
          return null;
        }
        throw error;
      }

      return data as UserSubscription;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  /**
   * Create Stripe checkout session via Edge Function
   */
  async createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<CreateCheckoutSessionResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          successUrl,
          cancelUrl
        } as CreateCheckoutSessionRequest
      });

      if (error) throw error;

      return data as CreateCheckoutSessionResponse;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Create Stripe Customer Portal session via Edge Function
   * Allows users to manage their subscription
   */
  async createPortalSession(returnUrl: string): Promise<CreatePortalSessionResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          returnUrl
        } as CreatePortalSessionRequest
      });

      if (error) throw error;

      return data as CreatePortalSessionResponse;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  /**
   * Initialize trial period for new user
   * Called after user registration
   */
  async initializeTrialPeriod(userId: string): Promise<UserSubscription | null> {
    try {
      // Calculate trial end date (48 hours from now)
      const trialEndsAt = new Date();
      trialEndsAt.setHours(trialEndsAt.getHours() + 48);

      const { data, error} = await supabase
        .from('profiles' as any)
        .update({
          subscription_status: 'trialing',
          subscription_type: 'monthly', // Default to monthly after trial
          currency: 'EUR',
          trial_ends_at: trialEndsAt.toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return data as UserSubscription;
    } catch (error) {
      console.error('Error initializing trial period:', error);
      return null;
    }
  }

  /**
   * Subscribe to real-time subscription updates
   */
  subscribeToSubscriptionUpdates(
    userId: string,
    callback: (subscription: UserSubscription | null) => void
  ) {
    const channel = supabase
      .channel(`profile-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as UserSubscription);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const stripeService = new StripeService();
