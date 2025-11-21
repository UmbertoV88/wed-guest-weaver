-- Elimina il trigger esistente se presente
DROP TRIGGER IF EXISTS sync_wedding_date_trigger ON public.profiles;
DROP TRIGGER IF EXISTS sync_wedding_date_on_insert_trigger ON public.profiles;

-- Modifica la funzione sync_wedding_date_to_budget_settings per gestire INSERT e UPDATE
CREATE OR REPLACE FUNCTION public.sync_wedding_date_to_budget_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
$$;

-- Ricrea i trigger
CREATE TRIGGER sync_wedding_date_trigger
  AFTER UPDATE OF wedding_date ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_wedding_date_to_budget_settings();

CREATE TRIGGER sync_wedding_date_on_insert_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_wedding_date_to_budget_settings();

-- Sincronizza i dati esistenti: copia wedding_date da profiles a budget_settings
UPDATE public.budget_settings
SET wedding_date = profiles.wedding_date,
    updated_at = NOW()
FROM public.profiles
WHERE budget_settings.user_id = profiles.user_id
  AND budget_settings.wedding_date IS DISTINCT FROM profiles.wedding_date;