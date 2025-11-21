-- Enable Row Level Security on all tables
ALTER TABLE public.invitati ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unita_invito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tavoli ENABLE ROW LEVEL SECURITY;

-- Create profiles table for wedding organizers
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  is_wedding_organizer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, is_wedding_organizer)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    -- First user becomes wedding organizer, others don't
    (SELECT COUNT(*) FROM public.profiles) = 0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create security definer function to check if user is wedding organizer
CREATE OR REPLACE FUNCTION public.is_wedding_organizer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = is_wedding_organizer.user_id 
    AND is_wedding_organizer = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for invitati table
CREATE POLICY "Wedding organizers can view all guests" 
  ON public.invitati 
  FOR SELECT 
  USING (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can insert guests" 
  ON public.invitati 
  FOR INSERT 
  WITH CHECK (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can update guests" 
  ON public.invitati 
  FOR UPDATE 
  USING (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can delete guests" 
  ON public.invitati 
  FOR DELETE 
  USING (public.is_wedding_organizer(auth.uid()));

-- RLS Policies for unita_invito table
CREATE POLICY "Wedding organizers can view all invitation units" 
  ON public.unita_invito 
  FOR SELECT 
  USING (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can insert invitation units" 
  ON public.unita_invito 
  FOR INSERT 
  WITH CHECK (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can update invitation units" 
  ON public.unita_invito 
  FOR UPDATE 
  USING (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can delete invitation units" 
  ON public.unita_invito 
  FOR DELETE 
  USING (public.is_wedding_organizer(auth.uid()));

-- RLS Policies for relazioni table
CREATE POLICY "Wedding organizers can view all relationships" 
  ON public.relazioni 
  FOR SELECT 
  USING (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can insert relationships" 
  ON public.relazioni 
  FOR INSERT 
  WITH CHECK (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can update relationships" 
  ON public.relazioni 
  FOR UPDATE 
  USING (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can delete relationships" 
  ON public.relazioni 
  FOR DELETE 
  USING (public.is_wedding_organizer(auth.uid()));

-- RLS Policies for tavoli table
CREATE POLICY "Wedding organizers can view all tables" 
  ON public.tavoli 
  FOR SELECT 
  USING (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can insert tables" 
  ON public.tavoli 
  FOR INSERT 
  WITH CHECK (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can update tables" 
  ON public.tavoli 
  FOR UPDATE 
  USING (public.is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can delete tables" 
  ON public.tavoli 
  FOR DELETE 
  USING (public.is_wedding_organizer(auth.uid()));