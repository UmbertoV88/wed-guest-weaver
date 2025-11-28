-- Script per aggiornare manualmente lo stato dell'abbonamento per test48h
-- Questo è un workaround temporaneo mentre testiamo il webhook

-- Prima, trova l'user_id dell'utente test48h
-- Sostituisci 'test48h@example.com' con l'email effettiva se diversa

-- Opzione 1: Se conosci l'email esatta
UPDATE profiles
SET 
  subscription_status = 'active',
  subscription_type = 'monthly',
  trial_ends_at = NULL,
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 month',
  updated_at = NOW()
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email ILIKE '%test48h%'
  LIMIT 1
);

-- Opzione 2: Se conosci l'user_id direttamente
-- UPDATE profiles
-- SET 
--   subscription_status = 'active',
--   subscription_type = 'monthly',
--   trial_ends_at = NULL,
--   current_period_start = NOW(),
--   current_period_end = NOW() + INTERVAL '1 month',
--   updated_at = NOW()
-- WHERE user_id = 'your-user-id-here';

-- Verifica il risultato
SELECT 
  user_id,
  subscription_status,
  subscription_type,
  trial_ends_at,
  current_period_start,
  current_period_end
FROM profiles
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email ILIKE '%test48h%'
  LIMIT 1
);
