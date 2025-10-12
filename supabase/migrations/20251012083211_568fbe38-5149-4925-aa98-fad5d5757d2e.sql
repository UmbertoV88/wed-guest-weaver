-- Fix security warning: Set search_path for update_complete_payment_date function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;