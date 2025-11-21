-- Fix Search Path per funzioni vulnerabili
-- Questo previene attacchi di code execution tramite search_path manipulation

-- Fix 1: update_complete_payment_date
CREATE OR REPLACE FUNCTION public.update_complete_payment_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Fix 2: sync_wedding_date_to_budget_settings
CREATE OR REPLACE FUNCTION public.sync_wedding_date_to_budget_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  RAISE NOTICE 'Wedding date sync trigger fired for user_id: %', NEW.user_id;
  
  -- Verifica se wedding_date è cambiata o se è il primo inserimento
  IF OLD IS NULL OR OLD.wedding_date IS DISTINCT FROM NEW.wedding_date THEN
    
    RAISE NOTICE 'Wedding date changed from % to %', COALESCE(OLD.wedding_date::text, 'NULL'), COALESCE(NEW.wedding_date::text, 'NULL');
    
    -- Inserisci o aggiorna budget_settings con la nuova wedding_date
    INSERT INTO public.budget_settings (user_id, wedding_date, total_budget, created_at, updated_at)
    VALUES (NEW.user_id, NEW.wedding_date, 35000, NOW(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      wedding_date = NEW.wedding_date,
      updated_at = NOW();
      
    RAISE NOTICE 'Budget settings updated with new wedding date for user: %', NEW.user_id;
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix 3: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix 4: update_category_spent
CREATE OR REPLACE FUNCTION public.update_category_spent()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    -- Caso 1: INSERT - aggiorna solo la nuova categoria
    IF TG_OP = 'INSERT' THEN
        UPDATE budget_categories 
        SET spent = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM budget_items 
            WHERE category_id = NEW.category_id
            AND category_id IS NOT NULL
        )
        WHERE id = NEW.category_id;
        RETURN NEW;
    END IF;
    
    -- Caso 2: UPDATE - aggiorna entrambe le categorie se è cambiata
    IF TG_OP = 'UPDATE' THEN
        -- Aggiorna la nuova categoria
        IF NEW.category_id IS NOT NULL THEN
            UPDATE budget_categories 
            SET spent = (
                SELECT COALESCE(SUM(amount), 0) 
                FROM budget_items 
                WHERE category_id = NEW.category_id
            )
            WHERE id = NEW.category_id;
        END IF;
        
        -- Se la categoria è cambiata, aggiorna anche quella precedente
        IF OLD.category_id IS NOT NULL AND OLD.category_id != NEW.category_id THEN
            UPDATE budget_categories 
            SET spent = (
                SELECT COALESCE(SUM(amount), 0) 
                FROM budget_items 
                WHERE category_id = OLD.category_id
            )
            WHERE id = OLD.category_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Caso 3: DELETE - aggiorna la categoria da cui è stato rimosso l'item
    IF TG_OP = 'DELETE' THEN
        IF OLD.category_id IS NOT NULL THEN
            UPDATE budget_categories 
            SET spent = (
                SELECT COALESCE(SUM(amount), 0) 
                FROM budget_items 
                WHERE category_id = OLD.category_id
            )
            WHERE id = OLD.category_id;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$function$;