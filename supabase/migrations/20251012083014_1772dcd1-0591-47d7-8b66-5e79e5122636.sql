-- Aggiungi colonna complete_payment_date alla tabella budget_vendors
ALTER TABLE public.budget_vendors 
ADD COLUMN IF NOT EXISTS complete_payment_date DATE;

-- Commento per documentazione
COMMENT ON COLUMN public.budget_vendors.complete_payment_date 
IS 'Data in cui il fornitore è stato completamente pagato (amount_paid >= default_cost)';

-- Popola i dati esistenti: setta complete_payment_date = updated_at per fornitori già completamente pagati
UPDATE public.budget_vendors
SET complete_payment_date = updated_at::DATE
WHERE amount_paid >= COALESCE(default_cost, 0)
  AND default_cost > 0
  AND complete_payment_date IS NULL;

-- Funzione trigger per aggiornare automaticamente complete_payment_date
CREATE OR REPLACE FUNCTION public.update_complete_payment_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Se amount_paid raggiunge o supera default_cost, setta la data di completamento
  IF NEW.amount_paid >= COALESCE(NEW.default_cost, 0) AND NEW.default_cost > 0 THEN
    IF OLD.complete_payment_date IS NULL THEN
      NEW.complete_payment_date := CURRENT_DATE;
    END IF;
  -- Se amount_paid scende sotto default_cost, rimuovi la data di completamento
  ELSIF NEW.amount_paid < COALESCE(NEW.default_cost, 0) THEN
    NEW.complete_payment_date := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger che esegue la funzione prima di ogni UPDATE su amount_paid
CREATE TRIGGER trigger_update_complete_payment_date
  BEFORE UPDATE OF amount_paid, default_cost ON public.budget_vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_complete_payment_date();

COMMENT ON FUNCTION public.update_complete_payment_date() 
IS 'Aggiorna automaticamente complete_payment_date quando amount_paid >= default_cost';