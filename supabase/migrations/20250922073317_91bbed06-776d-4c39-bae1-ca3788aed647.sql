-- Allow NULL user_id for system-wide categories
ALTER TABLE public.budget_categories ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow viewing system categories
DROP POLICY IF EXISTS "Users can view their own budget categories" ON public.budget_categories;
CREATE POLICY "Users can view their own budget categories and system categories" 
ON public.budget_categories 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Insert default Italian wedding budget categories (system-wide)
INSERT INTO public.budget_categories (name, icon, default_percentage, user_id) VALUES
  ('Cerimonia', 'Church', 8.0, NULL),
  ('Banchetto', 'Home', 45.0, NULL),
  ('Musica', 'Music', 6.0, NULL),
  ('Partecipazioni', 'Mail', 3.0, NULL),
  ('Bomboniere', 'Gift', 4.0, NULL),
  ('Fiori e decorazioni', 'Flower2', 10.0, NULL),
  ('Foto e Video', 'Camera', 12.0, NULL),
  ('Trasporti', 'Car', 3.0, NULL),
  ('Gioielleria', 'Heart', 5.0, NULL),
  ('Sposa e accessori', 'Shirt', 8.0, NULL),
  ('Sposo e accessori', 'UserCheck', 4.0, NULL),
  ('Bellezza e benessere', 'Sparkles', 3.0, NULL),
  ('Viaggio di nozze', 'Plane', 15.0, NULL),
  ('Altro', 'MoreHorizontal', 2.0, NULL);