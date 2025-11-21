-- Add amount_paid column to budget_vendors table
ALTER TABLE budget_vendors 
ADD COLUMN amount_paid numeric DEFAULT 0 NOT NULL;