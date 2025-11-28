# Test Webhook Stripe - Guida Rapida

## Problema Attuale

Il webhook è stato deployato con logging migliorato, ma dobbiamo verificare che funzioni correttamente.

## Soluzioni Immediate

### Soluzione 1: Aggiorna Manualmente il Database (Più Veloce)

1. Vai su [Supabase Dashboard > SQL Editor](https://supabase.com/dashboard/project/lzhyjbgelvyewsxaecsi/sql)
2. Copia e incolla il contenuto di `fix-test48h-subscription.sql`
3. Esegui la query
4. Ricarica la pagina dell'app - dovresti poter accedere alla dashboard

### Soluzione 2: Riprova l'Evento Webhook da Stripe

1. Vai su [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Clicca sul tuo endpoint webhook
3. Vai alla tab "Events"
4. Trova l'evento `checkout.session.completed` più recente
5. Clicca su "Resend event"
6. Controlla i logs:
   - In Stripe: Dovresti vedere **200 OK**
   - In Supabase: [Function Logs](https://supabase.com/dashboard/project/lzhyjbgelvyewsxaecsi/functions/stripe-webhook/logs)

### Soluzione 3: Nuovo Pagamento di Test

1. Logout dall'account test48h
2. Crea un nuovo account di test (es: `test-nuovo@example.com`)
3. Vai alla pricing page
4. Completa un pagamento con carta test: `4242 4242 4242 4242`
5. Dopo il redirect, controlla:
   - I logs del webhook in Supabase
   - Lo stato della subscription nel database

## Verifica Webhook Logs

Dopo aver riprovato l'evento o fatto un nuovo pagamento, controlla i logs:

```bash
# Apri il browser ai logs del webhook
open https://supabase.com/dashboard/project/lzhyjbgelvyewsxaecsi/functions/stripe-webhook/logs
```

Dovresti vedere output come:
```
Processing checkout.session.completed event
Session ID: cs_test_...
User ID from metadata: <user-id>
Retrieving subscription from Stripe: sub_...
Subscription status: trialing (o active)
Setting subscription status to: trialing (o active)
Updating profile for user: <user-id>
Profile updated successfully: [...]
```

## Debugging

Se il webhook continua a fallire, controlla:

1. **Stripe Dashboard > Webhooks > Events**: Verifica il response code
   - ✅ 200 = Successo
   - ❌ 401 = Problema autenticazione (dovrebbe essere risolto)
   - ❌ 400 = Errore nel payload
   - ❌ 500 = Errore server

2. **Webhook Secret**: Verifica che il secret in Stripe corrisponda a quello in Supabase
   ```bash
   supabase secrets list
   ```

3. **Metadata User ID**: Verifica che il checkout session abbia il metadata `supabase_user_id`

## Test Completo del Flusso

Una volta sistemato test48h, testa il flusso completo:

1. Crea un nuovo account
2. Vai alla pricing page
3. Seleziona un piano
4. Completa il checkout
5. Verifica che:
   - Webhook riceve l'evento (200 OK)
   - Database viene aggiornato
   - Utente può accedere alla dashboard
   - PaymentSuccess page mostra il messaggio corretto
