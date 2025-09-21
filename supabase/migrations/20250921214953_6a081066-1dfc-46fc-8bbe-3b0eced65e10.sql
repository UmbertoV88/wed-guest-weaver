-- Create budget categories table
CREATE TABLE public.budget_categories (
  id integer NOT NULL DEFAULT nextval('budget_categories_id_seq'::regclass) PRIMARY KEY,
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  icon character varying,
  default_percentage decimal(5,2),
  created_at timestamp with time zone DEFAULT now()
);

-- Create sequence for budget_categories
CREATE SEQUENCE IF NOT EXISTS budget_categories_id_seq;
ALTER SEQUENCE budget_categories_id_seq OWNED BY public.budget_categories.id;

-- Create budget items table  
CREATE TABLE public.budget_items (
  id integer NOT NULL DEFAULT nextval('budget_items_id_seq'::regclass) PRIMARY KEY,
  user_id uuid NOT NULL,
  category_id integer NOT NULL,
  vendor_name character varying NOT NULL,
  description text,
  budgeted_amount decimal(10,2) NOT NULL DEFAULT 0,
  actual_amount decimal(10,2) DEFAULT 0,
  paid_amount decimal(10,2) DEFAULT 0,
  due_date date,
  status character varying DEFAULT 'pending',
  priority character varying DEFAULT 'medium',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create sequence for budget_items
CREATE SEQUENCE IF NOT EXISTS budget_items_id_seq;
ALTER SEQUENCE budget_items_id_seq OWNED BY public.budget_items.id;

-- Enable RLS on budget_categories
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for budget_categories
CREATE POLICY "Users can view their own budget categories" 
ON public.budget_categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget categories" 
ON public.budget_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget categories" 
ON public.budget_categories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget categories" 
ON public.budget_categories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Wedding organizers can manage all budget categories
CREATE POLICY "Wedding organizers can view all budget categories" 
ON public.budget_categories 
FOR SELECT 
USING (is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can insert budget categories" 
ON public.budget_categories 
FOR INSERT 
WITH CHECK (is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can update budget categories" 
ON public.budget_categories 
FOR UPDATE 
USING (is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can delete budget categories" 
ON public.budget_categories 
FOR DELETE 
USING (is_wedding_organizer(auth.uid()));

-- Enable RLS on budget_items
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Create policies for budget_items
CREATE POLICY "Users can view their own budget items" 
ON public.budget_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget items" 
ON public.budget_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget items" 
ON public.budget_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget items" 
ON public.budget_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Wedding organizers can manage all budget items
CREATE POLICY "Wedding organizers can view all budget items" 
ON public.budget_items 
FOR SELECT 
USING (is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can insert budget items" 
ON public.budget_items 
FOR INSERT 
WITH CHECK (is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can update budget items" 
ON public.budget_items 
FOR UPDATE 
USING (is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can delete budget items" 
ON public.budget_items 
FOR DELETE 
USING (is_wedding_organizer(auth.uid()));

-- Create trigger for automatic timestamp updates on budget_items
CREATE TRIGGER update_budget_items_updated_at
BEFORE UPDATE ON public.budget_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default budget categories
INSERT INTO public.budget_categories (name, icon, default_percentage, user_id) VALUES
('Location', '🏛️', 30.00, '00000000-0000-0000-0000-000000000000'),
('Catering', '🍽️', 25.00, '00000000-0000-0000-0000-000000000000'),
('Fotografia', '📸', 15.00, '00000000-0000-0000-0000-000000000000'),
('Fiori e Decorazioni', '🌸', 10.00, '00000000-0000-0000-0000-000000000000'),
('Musica', '🎵', 8.00, '00000000-0000-0000-0000-000000000000'),
('Vestiti', '👗', 7.00, '00000000-0000-0000-0000-000000000000'),
('Trasporti', '🚗', 3.00, '00000000-0000-0000-0000-000000000000'),
('Altro', '📋', 2.00, '00000000-0000-0000-0000-000000000000');