import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MailerSend, EmailParams, Sender, Recipient } from "npm:mailersend@2.3.0";

const mailerSend = new MailerSend({
  apiKey: Deno.env.get("MAILERSEND_API_KEY") || "",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderPayload {
  reminderId?: string;
  manualTrigger?: boolean;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let remindersToProcess = [];

    // Se chiamato manualmente con un reminder specifico
    if (req.method === "POST") {
      const payload: ReminderPayload = await req.json();
      
      if (payload.reminderId) {
        const { data, error } = await supabase
          .from('payment_reminders')
          .select(`
            *,
            budget_vendors!inner (
              id, name, default_cost, amount_paid, payment_due_date
            )
          `)
          .eq('id', payload.reminderId)
          .single();

        if (error) throw error;
        remindersToProcess = [data];
      }
    } 
    // Se chiamato dal cron job
    else {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('payment_reminders')
        .select(`
          *,
          budget_vendors!inner (
            id, name, default_cost, amount_paid, payment_due_date
          )
        `)
        .eq('status', 'pending')
        .lte('scheduled_date', today);

      if (error) throw error;
      remindersToProcess = data || [];
    }

    console.log(`Processing ${remindersToProcess.length} reminders`);

    const results = [];

    for (const reminder of remindersToProcess) {
      try {
        const vendor = reminder.budget_vendors;
        const remainingAmount = (vendor.default_cost || 0) - (vendor.amount_paid || 0);

        // Ottieni l'email dell'utente
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('user_id', reminder.user_id)
          .single();

        if (profileError) throw profileError;

        const userEmail = profile.email;
        const userName = profile.full_name || 'Utente';
        
        if (!userEmail) {
          throw new Error('User email not found');
        }

        // Invia email se richiesto
        if (reminder.notify_email) {
          const emailSubject = reminder.reminder_type === 'auto_7_days' 
            ? `⏰ Promemoria: Pagamento in scadenza tra 7 giorni`
            : reminder.reminder_type === 'auto_due_date'
            ? `🚨 Promemoria: Pagamento in scadenza OGGI`
            : `📅 Promemoria Personalizzato: Pagamento`;

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #E11D48;">Promemoria Pagamento</h2>
              <p>Ciao ${userName},</p>
              <p>Ti ricordiamo che hai un pagamento in scadenza per:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1f2937;">${vendor.name}</h3>
                <p><strong>Importo rimanente:</strong> €${remainingAmount.toFixed(2)}</p>
                <p><strong>Data di scadenza:</strong> ${new Date(vendor.payment_due_date).toLocaleDateString('it-IT')}</p>
              </div>

              ${reminder.custom_message ? `<p><em>"${reminder.custom_message}"</em></p>` : ''}

              <p>Accedi al tuo <a href="https://lzhyjbgelvyewsxaecsi.supabase.co" style="color: #E11D48;">dashboard finanziario</a> per gestire il pagamento.</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 12px;">
                Questo è un promemoria automatico dal tuo Wedding Planner.<br>
                Se hai già effettuato il pagamento, puoi ignorare questa email.
              </p>
            </div>
          `;

          // IMPORTANTE: Sostituisci con la tua email verificata in MailerSend
          const sentFrom = new Sender("test-3m5jgro107xgdpyo.mlsender.net", "Wedding Planner");
          const recipients = [new Recipient(userEmail, userName)];

          const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject(emailSubject)
            .setHtml(emailHtml)
            .setText(`Promemoria pagamento per ${vendor.name}. Importo rimanente: €${remainingAmount.toFixed(2)}. Scadenza: ${new Date(vendor.payment_due_date).toLocaleDateString('it-IT')}`);

          try {
            const response = await mailerSend.email.send(emailParams);
            console.log(`Email sent to ${userEmail} for reminder ${reminder.id}. Response:`, response);
          } catch (emailError: any) {
            console.error(`MailerSend error:`, emailError);
            throw new Error(`MailerSend API error: ${emailError.message || JSON.stringify(emailError)}`);
          }
        }

        // Aggiorna lo stato del promemoria
        const { error: updateError } = await supabase
          .from('payment_reminders')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', reminder.id);

        if (updateError) throw updateError;

        results.push({
          reminderId: reminder.id,
          status: 'success',
          vendor: vendor.name
        });

      } catch (error: any) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        
        // Segna come fallito
        await supabase
          .from('payment_reminders')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', reminder.id);

        results.push({
          reminderId: reminder.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Error in send-payment-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
