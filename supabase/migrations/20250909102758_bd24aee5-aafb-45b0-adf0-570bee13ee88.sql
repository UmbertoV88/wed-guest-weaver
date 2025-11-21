-- Create enum types for guest categories and status
CREATE TYPE public.guest_category AS ENUM (
  'family-his',
  'family-hers', 
  'friends',
  'colleagues'
);

CREATE TYPE public.guest_status AS ENUM (
  'pending',
  'confirmed',
  'deleted'
);

-- Create guests table
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 50),
  category public.guest_category NOT NULL,
  allergies TEXT,
  status public.guest_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create companions table
CREATE TABLE public.companions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 50),
  allergies TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public access for wedding guest management)
-- Guests policies
CREATE POLICY "Anyone can view guests" 
ON public.guests 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create guests" 
ON public.guests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update guests" 
ON public.guests 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete guests" 
ON public.guests 
FOR DELETE 
USING (true);

-- Companions policies
CREATE POLICY "Anyone can view companions" 
ON public.companions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create companions" 
ON public.companions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update companions" 
ON public.companions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete companions" 
ON public.companions 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_guests_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_guests_status ON public.guests(status);
CREATE INDEX idx_guests_category ON public.guests(category);
CREATE INDEX idx_companions_guest_id ON public.companions(guest_id);