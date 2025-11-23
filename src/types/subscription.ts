// =====================================================
// SUBSCRIPTION TYPES - Stripe Integration
// Per Wed Guest Weaver - Sistema Paywall
// =====================================================

export type SubscriptionStatus = 
  | 'active'      // Subscription is active and paid
  | 'inactive'    // No subscription
  | 'trialing'    // In trial period (48 hours)
  | 'past_due'    // Payment failed but subscription still active
  | 'canceled';   // Subscription was canceled

export type SubscriptionType = 
  | 'monthly'     // €19.90/month
  | 'yearly'      // €179.90/year
  | 'lifetime';   // Existing users - unlimited access

/**
 * User subscription data (stored in profiles table)
 */
export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_type: SubscriptionType;
  amount_paid: number | null;
  currency: string;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// STRIPE PRICING CONFIGURATION
// =====================================================

export interface StripePriceConfig {
  priceId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  displayName: string;
  // description: string; // Removed as per new STRIPE_PRICES structure
}

/**
 * Stripe price configuration
 * These price IDs must match the prices created in Stripe Dashboard
 */
export const STRIPE_PRICES: Record<'monthly' | 'yearly', StripePriceConfig> = {
  monthly: {
    priceId: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_1SVy95BEIoyzReo7H2GrsKlA',
    amount: 19.90,
    currency: 'EUR',
    interval: 'month',
    displayName: 'Piano Mensile'
  },
  yearly: {
    priceId: import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_1SVy9UBEIoyzReo7fRxHFuJD',
    amount: 179.90,
    currency: 'EUR',
    interval: 'year',
    displayName: 'Piano Annuale'
  }
};

// =====================================================
// STRIPE API TYPES
// =====================================================

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CreatePortalSessionRequest {
  returnUrl: string;
}

export interface CreatePortalSessionResponse {
  url: string;
}

// =====================================================
// SUBSCRIPTION HELPERS
// =====================================================

/**
 * Check if user has an active subscription (including trial)
 */
export function hasActiveSubscription(subscription: UserSubscription | null): boolean {
  if (!subscription) return false;
  return subscription.subscription_status === 'active' || subscription.subscription_status === 'trialing';
}

/**
 * Check if user is currently in trial period
 */
export function isInTrialPeriod(subscription: UserSubscription | null): boolean {
  if (!subscription || subscription.subscription_status !== 'trialing') return false;

  if (!subscription.trial_ends_at) return false;

  const trialEnd = new Date(subscription.trial_ends_at);
  return trialEnd > new Date();
}

/**
 * Get remaining trial hours
 */
export function getRemainingTrialHours(subscription: UserSubscription | null): number {
  if (!subscription || !subscription.trial_ends_at) return 0;
  
  const trialEnd = new Date(subscription.trial_ends_at);
  const now = new Date();
  
  const diffMs = trialEnd.getTime() - now.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  
  return diffHours;
}

/**
 * Check if subscription needs payment
 */
export function needsPayment(subscription: UserSubscription | null): boolean {
  if (!subscription) return true;
  
  // Lifetime users never need payment
  if (subscription.subscription_type === 'lifetime') return false;
  
  // Active or trialing users don't need payment
  if (subscription.subscription_status === 'active' || subscription.subscription_status === 'trialing') {
    return false;
  }
  
  return true;
}

/**
 * Format subscription display name
 */
export function getSubscriptionDisplayName(subscription: UserSubscription | null): string {
  if (!subscription) return 'Nessun abbonamento';
  
  switch (subscription.subscription_type) {
    case 'monthly':
      return 'Piano Mensile';
    case 'yearly':
      return 'Piano Annuale';
    case 'lifetime':
      return 'Accesso Illimitato';
    default:
      return 'Abbonamento';
  }
}
