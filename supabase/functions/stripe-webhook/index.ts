import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

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
        
        if (!userId) {
          console.error('No user ID in session metadata')
          break
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Determine subscription type based on price interval
        const priceId = subscription.items.data[0].price.id
        const interval = subscription.items.data[0].price.recurring?.interval
        const subscriptionType = interval === 'year' ? 'yearly' : 'monthly'

        // Update user profile with subscription info
        await supabase
          .from('profiles')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: 'active',
            subscription_type: subscriptionType,
            amount_paid: subscription.items.data[0].price.unit_amount! / 100,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_ends_at: null, // Clear trial
          })
          .eq('user_id', userId)

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
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
