-- Add payment_due_date column to budget_vendors table
ALTER TABLE public.budget_vendors 
ADD COLUMN payment_due_date DATE NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.budget_vendors.payment_due_date IS 'Optional due date for vendor payment';