-- Add default_cost field to budget_vendors table
ALTER TABLE public.budget_vendors 
ADD COLUMN default_cost numeric DEFAULT NULL;