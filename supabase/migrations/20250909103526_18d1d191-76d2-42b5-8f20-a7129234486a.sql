-- Enable realtime for tables
ALTER TABLE public.guests REPLICA IDENTITY FULL;
ALTER TABLE public.companions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.guests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.companions;