-- Inserire categoria Bomboniere
INSERT INTO budget_categories (
  user_id, 
  name, 
  budgeted, 
  color, 
  icon, 
  sort_order, 
  is_active
) VALUES (
  '3ee3d300-3383-4cbe-b687-acf1f478f879',
  'Bomboniere',
  0,
  '#EC4899',
  'Gift',
  11,
  true
)
ON CONFLICT (user_id, name) DO NOTHING;