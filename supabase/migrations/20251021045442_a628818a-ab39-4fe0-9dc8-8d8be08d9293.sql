-- Fix Search Path per funzione rimanente
-- Completa la protezione di tutte le funzioni SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.create_default_budget_categories(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Inserisci categorie predefinite solo se non esistono già
  INSERT INTO public.budget_categories (user_id, name, budgeted, color, sort_order)
  SELECT p_user_id, category_name, 0, category_color, category_order
  FROM (
    VALUES 
      ('Location', '#E11D48', 1),
      ('Catering', '#059669', 2),
      ('Fotografo', '#7C3AED', 3),
      ('Fiori & Decorazioni', '#EA580C', 4),
      ('Musica', '#0891B2', 5),
      ('Abiti', '#DC2626', 6),
      ('Anelli', '#9333EA', 7),
      ('Invitazioni', '#16A34A', 8),
      ('Transport', '#0369A1', 9),
      ('Varie', '#CA8A04', 10)
  ) AS default_categories(category_name, category_color, category_order)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.budget_categories WHERE user_id = p_user_id
  );

  -- Crea anche le impostazioni budget predefinite
  INSERT INTO public.budget_settings (user_id, total_budget)
  VALUES (p_user_id, 35000)
  ON CONFLICT (user_id) DO NOTHING;
END;
$function$;