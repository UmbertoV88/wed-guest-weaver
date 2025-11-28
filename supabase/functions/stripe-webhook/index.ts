// @deno-types="https://deno.land/x/deno@v1.37.0/cli/tsc/dts/lib.deno.d.ts"
declare const Deno: any

import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'stripe-signature, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    console.error('No stripe-signature header found')
    return new Response(
      JSON.stringify({ error: 'No signature' }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const body = await req.text()
    
    console.log('Webhook received, verifying signature...')
    
    // Verify webhook signature - MUST use async version for Deno
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    )

    console.log(`Webhook event type: ${event.type}`)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        
        console.log('Processing checkout.session.completed event')
        console.log('Session ID:', session.id)
        console.log('User ID from metadata:', userId)
        
        if (!userId) {
          console.error('No user ID in session metadata')
          break
        }

        // Check if session has a subscription
        if (!session.subscription) {
          console.error('No subscription ID in session')
          break
        }

        console.log('Retrieving subscription from Stripe:', session.subscription)
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        console.log('Subscription status:', subscription.status)
        console.log('Subscription trial end:', subscription.trial_end)

        // Determine subscription type based on price interval
        const priceId = subscription.items.data[0].price.id
        const interval = subscription.items.data[0].price.recurring?.interval
        const subscriptionType = interval === 'year' ? 'yearly' : 'monthly'

        console.log('Price ID:', priceId)
        console.log('Interval:', interval)
        console.log('Subscription type:', subscriptionType)

        // Map Stripe status to our status
        let status = 'active'
        if (subscription.status === 'trialing') {
          status = 'trialing'
        } else if (subscription.status === 'active') {
          status = 'active'
        }

        console.log('Setting subscription status to:', status)

        // Prepare update data
        const updateData: any = {
          stripe_subscription_id: subscription.id,
          subscription_status: status,
          subscription_type: subscriptionType,
          amount_paid: subscription.items.data[0].price.unit_amount! / 100,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }

        // Handle trial
        if (subscription.trial_end) {
          updateData.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString()
          console.log('Trial ends at:', updateData.trial_ends_at)
        } else {
          updateData.trial_ends_at = null
          console.log('No trial period')
        }

        console.log('Updating profile for user:', userId)
        
        // Update user profile with subscription info
        const { data, error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', userId)
          .select()

        if (error) {
          console.error('Error updating profile:', error)
          throw error
        }

        console.log('Profile updated successfully:', data)
        console.log(`Subscription activated for user ${userId}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        
        if (!userId) {
          console.error('No user ID in subscription metadata')
          break
        }

        // Map Stripe status to our status
        let status = 'inactive'
        if (subscription.status === 'active') status = 'active'
        else if (subscription.status === 'trialing') status = 'trialing'
        else if (subscription.status === 'past_due') status = 'past_due'
        else if (subscription.status === 'canceled') status = 'canceled'

        await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            canceled_at: subscription.canceled_at 
              ? new Date(subscription.canceled_at * 1000).toISOString() 
              : null,
          })
          .eq('user_id', userId)

        console.log(`Subscription updated for user ${userId}: ${status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        
        if (!userId) {
          console.error('No user ID in subscription metadata')
          break
        }

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`Subscription canceled for user ${userId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        )
        const userId = subscription.metadata?.supabase_user_id
        
        if (!userId) {
          console.error('No user ID in subscription metadata')
          break
        }

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
          })
          .eq('user_id', userId)

        console.log(`Payment failed for user ${userId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
