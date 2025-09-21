-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS budget_categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS budget_items_id_seq;

-- Create budget categories table
CREATE TABLE public.budget_categories (
  id integer NOT NULL DEFAULT nextval('budget_categories_id_seq'::regclass) PRIMARY KEY,
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  icon character varying,
  default_percentage decimal(5,2),
  created_at timestamp with time zone DEFAULT now()
);

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

-- Set sequence ownership
ALTER SEQUENCE budget_categories_id_seq OWNED BY public.budget_categories.id;
ALTER SEQUENCE budget_items_id_seq OWNED BY public.budget_items.id;

-- Enable RLS
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Budget categories policies
CREATE POLICY "Users can view their own budget categories" ON public.budget_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own budget categories" ON public.budget_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget categories" ON public.budget_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget categories" ON public.budget_categories FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Wedding organizers can view all budget categories" ON public.budget_categories FOR SELECT USING (is_wedding_organizer(auth.uid()));
CREATE POLICY "Wedding organizers can insert budget categories" ON public.budget_categories FOR INSERT WITH CHECK (is_wedding_organizer(auth.uid()));
CREATE POLICY "Wedding organizers can update budget categories" ON public.budget_categories FOR UPDATE USING (is_wedding_organizer(auth.uid()));
CREATE POLICY "Wedding organizers can delete budget categories" ON public.budget_categories FOR DELETE USING (is_wedding_organizer(auth.uid()));

-- Budget items policies
CREATE POLICY "Users can view their own budget items" ON public.budget_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own budget items" ON public.budget_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget items" ON public.budget_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget items" ON public.budget_items FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Wedding organizers can view all budget items" ON public.budget_items FOR SELECT USING (is_wedding_organizer(auth.uid()));
CREATE POLICY "Wedding organizers can insert budget items" ON public.budget_items FOR INSERT WITH CHECK (is_wedding_organizer(auth.uid()));
CREATE POLICY "Wedding organizers can update budget items" ON public.budget_items FOR UPDATE USING (is_wedding_organizer(auth.uid()));
CREATE POLICY "Wedding organizers can delete budget items" ON public.budget_items FOR DELETE USING (is_wedding_organizer(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_budget_items_updated_at
BEFORE UPDATE ON public.budget_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();