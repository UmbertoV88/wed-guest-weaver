# Stripe Paywall Integration - Setup Guide

## 📋 Panoramica

Questo progetto ora include un sistema di paywall con Stripe che limita l'accesso alla piattaforma solo agli utenti paganti. I nuovi utenti ricevono 48 ore di prova gratuita.

## 💰 Piani Disponibili

- **Piano Mensile**: €19.90/mese
- **Piano Annuale**: €14.90/mese (€178.80/anno) - Risparmio del 25%
- **Periodo di Prova**: 48 ore gratuite per tutti i nuovi utenti
- **Utenti Esistenti**: Accesso illimitato (lifetime)

## 🚀 Setup Iniziale

### 1. Configurare Stripe

1. Crea un account su [Stripe](https://dashboard.stripe.com/register)
2. Vai su **Developers > API Keys**
3. Copia le chiavi API (usa le chiavi di test per sviluppo)

### 2. Creare Prodotti e Prezzi in Stripe

1. Vai su **Products** nel dashboard Stripe
2. Clicca **Add Product**

**Piano Mensile:**
- Nome: "Wed Guest Weaver - Piano Mensile"
- Prezzo: €19.90
- Tipo: Recurring
- Intervallo: Monthly
- Copia il **Price ID** (inizia con `price_...`)

**Piano Annuale:**
- Nome: "Wed Guest Weaver - Piano Annuale"
- Prezzo: €178.80
- Tipo: Recurring
- Intervallo: Yearly
- Copia il **Price ID** (inizia con `price_...`)

### 3. Configurare Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto:

```bash
cp .env.example .env.local
```

Compila con i tuoi valori:

```env
# Stripe Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
VITE_STRIPE_PRICE_MONTHLY=price_...
VITE_STRIPE_PRICE_YEARLY=price_...
```

### 4. Eseguire la Migrazione Database

La migrazione crea la tabella `user_subscriptions` e marca gli utenti esistenti come "già pagati":

```bash
# Se usi Supabase CLI
supabase db push

# Oppure applica manualmente la migrazione
# File: supabase/migrations/20251121181203_create_user_subscriptions.sql
```

### 5. Deploy delle Edge Functions

Le Edge Functions gestiscono i pagamenti in modo sicuro lato server:

```bash
# Deploy tutte le functions
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook

# Configura i secrets per le functions
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 6. Configurare Webhook Stripe

1. Vai su **Developers > Webhooks** nel dashboard Stripe
2. Clicca **Add endpoint**
3. URL endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
4. Seleziona questi eventi:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copia il **Signing secret** e aggiungilo a `.env.local` come `STRIPE_WEBHOOK_SECRET`

## 🧪 Testing Locale

### 1. Avvia il Server di Sviluppo

```bash
npm run dev
```

### 2. Test con Stripe CLI (Opzionale)

Per testare i webhook localmente:

```bash
# Installa Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhook events
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

### 3. Carte di Test Stripe

Usa queste carte per testare i pagamenti:

- **Successo**: `4242 4242 4242 4242`
- **Fallimento**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Usa qualsiasi data futura e CVC valido (es. 123).

## 📱 Flusso Utente

### Nuovo Utente

1. Registrazione → Inizia periodo di prova di 48 ore
2. Accesso completo alla piattaforma per 48 ore
3. Banner in alto mostra ore rimanenti
4. Alla scadenza → Redirect a `/pricing`
5. Scelta piano e pagamento
6. Accesso illimitato dopo pagamento

### Utente Esistente

- Accesso illimitato automatico (marcato come "lifetime")
- Nessun pagamento richiesto

## 🔧 Gestione Abbonamenti

Gli utenti possono gestire il loro abbonamento tramite il Stripe Customer Portal:

- Aggiornare metodo di pagamento
- Cambiare piano (mensile ↔ annuale)
- Cancellare abbonamento
- Visualizzare storico fatture

## 🐛 Troubleshooting

### "user_subscriptions table not found"

Assicurati di aver eseguito la migrazione database.

### "Invalid Stripe key"

Verifica che le chiavi in `.env.local` siano corrette e corrispondano all'ambiente (test/live).

### Webhook non funzionano

1. Verifica che il webhook secret sia corretto
2. Controlla i log in Stripe Dashboard > Developers > Webhooks
3. Assicurati che l'URL dell'endpoint sia corretto

### TypeScript errors su "user_subscriptions"

Normale - la tabella non è nei tipi generati. Usa `as any` per le query Supabase (già implementato).

## 📚 Documentazione Aggiuntiva

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🎯 Prossimi Passi

1. Testare il flusso completo in modalità test
2. Configurare le chiavi di produzione quando pronto
3. Aggiungere email di notifica per scadenze
4. Implementare analytics per conversioni
