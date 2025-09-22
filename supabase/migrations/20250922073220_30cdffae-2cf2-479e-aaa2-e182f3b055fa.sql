-- Insert default Italian wedding budget categories
INSERT INTO public.budget_categories (name, icon, default_percentage) VALUES
  ('Cerimonia', 'Church', 8.0),
  ('Banchetto', 'Home', 45.0),
  ('Musica', 'Music', 6.0),
  ('Partecipazioni', 'Mail', 3.0),
  ('Bomboniere', 'Gift', 4.0),
  ('Fiori e decorazioni', 'Flower2', 10.0),
  ('Foto e Video', 'Camera', 12.0),
  ('Trasporti', 'Car', 3.0),
  ('Gioielleria', 'Heart', 5.0),
  ('Sposa e accessori', 'Shirt', 8.0),
  ('Sposo e accessori', 'UserCheck', 4.0),
  ('Bellezza e benessere', 'Sparkles', 3.0),
  ('Viaggio di nozze', 'Plane', 15.0),
  ('Altro', 'MoreHorizontal', 2.0)
ON CONFLICT (name) DO NOTHING;