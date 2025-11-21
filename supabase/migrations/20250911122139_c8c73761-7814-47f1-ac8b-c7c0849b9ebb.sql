-- Enable RLS on all public tables that don't have it enabled
ALTER TABLE public.piani_salvati ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tavoli ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unita_invito ENABLE ROW LEVEL SECURITY;

-- Create missing RLS policies for piani_salvati table
CREATE POLICY "Wedding organizers can view all saved plans" 
ON public.piani_salvati 
FOR SELECT 
USING (is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can insert saved plans" 
ON public.piani_salvati 
FOR INSERT 
WITH CHECK (is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can update saved plans" 
ON public.piani_salvati 
FOR UPDATE 
USING (is_wedding_organizer(auth.uid()));

CREATE POLICY "Wedding organizers can delete saved plans" 
ON public.piani_salvati 
FOR DELETE 
USING (is_wedding_organizer(auth.uid()));