-- Add icon column to budget_categories table
ALTER TABLE public.budget_categories
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Package';

-- Add comment to document the column
COMMENT ON COLUMN public.budget_categories.icon IS 'Icon name from lucide-react icon set';