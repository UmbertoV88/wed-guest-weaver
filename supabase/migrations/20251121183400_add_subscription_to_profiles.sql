-- =====================================================
-- STRIPE SUBSCRIPTION SYSTEM
-- Migration: Add Subscription Columns to Profiles
-- Created: 2025-11-21
-- =====================================================

-- Add subscription-related columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive' 
    CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled')),
  ADD COLUMN IF NOT EXISTS subscription_type TEXT NOT NULL DEFAULT 'monthly' 
    CHECK (subscription_type IN ('monthly', 'yearly', 'lifetime')),
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
  ON public.profiles(stripe_customer_id) 
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription 
  ON public.profiles(stripe_subscription_id) 
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
  ON public.profiles(subscription_status);

-- =====================================================
-- MIGRATE EXISTING USERS AS "ALREADY PAID"
-- Mark all existing users with lifetime access
-- =====================================================

-- Update all existing users to have lifetime access
UPDATE public.profiles
SET 
  subscription_status = 'active',
  subscription_type = 'lifetime',
  currency = 'EUR'
WHERE subscription_status = 'inactive';

-- Add comments
COMMENT ON COLUMN public.profiles.subscription_status IS 
  'Subscription status: active (paid), trialing (48h trial), past_due (payment failed), canceled, inactive';

COMMENT ON COLUMN public.profiles.subscription_type IS 
  'Type of subscription: monthly (€19.90/month), yearly (€179.90/year), lifetime (existing users)';
