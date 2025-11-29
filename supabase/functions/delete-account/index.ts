// @deno-types="https://deno.land/x/deno@v1.37.0/cli/tsc/dts/lib.deno.d.ts"
declare const Deno: any

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client with Service Role Key to allow admin actions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user token and get user ID
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    const userId = user.id
    console.log(`Processing account deletion for user: ${userId}`)

    // 1. Get Stripe Customer ID from profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (profile?.stripe_customer_id) {
      console.log(`Found Stripe customer ID: ${profile.stripe_customer_id}`)
      
      // 2. Cancel any active subscriptions in Stripe
      // We list subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'all', // Get all to be safe, though we mostly care about active/trialing
      })

      for (const sub of subscriptions.data) {
        if (sub.status === 'active' || sub.status === 'trialing') {
          console.log(`Canceling subscription: ${sub.id}`)
          await stripe.subscriptions.cancel(sub.id)
        }
      }

      // Optional: Delete the customer in Stripe? 
      // Usually better to keep the customer record but marked as deleted or just leave it.
      // Stripe doesn't allow deleting customers with active subscriptions, so we cancelled them first.
      // We can try to delete the customer object to be thorough.
      try {
        await stripe.customers.del(profile.stripe_customer_id)
        console.log('Stripe customer deleted')
      } catch (err) {
        console.error('Error deleting Stripe customer (non-fatal):', err)
      }
    }

    // 3. Delete user from Supabase Auth
    // This should cascade delete the profile if foreign keys are set up correctly.
    // Even if not, the user can no longer login.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      throw deleteError
    }

    console.log('Supabase user deleted successfully')

    return new Response(
      JSON.stringify({ message: 'Account deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error deleting account:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
