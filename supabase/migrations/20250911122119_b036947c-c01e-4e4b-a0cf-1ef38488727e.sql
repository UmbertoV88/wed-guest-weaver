-- Add user_id columns to tables
ALTER TABLE public.invitati ADD COLUMN user_id UUID;
ALTER TABLE public.unita_invito ADD COLUMN user_id UUID;

-- Assign all existing guests to the first user (Umberto)
UPDATE public.invitati 
SET user_id = '3ee3d300-3383-4cbe-b687-acf1f478f879'
WHERE user_id IS NULL;

UPDATE public.unita_invito 
SET user_id = '3ee3d300-3383-4cbe-b687-acf1f478f879'
WHERE user_id IS NULL;

-- Make user_id NOT NULL after migration
ALTER TABLE public.invitati ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.unita_invito ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE public.invitati ADD CONSTRAINT invitati_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.unita_invito ADD CONSTRAINT unita_invito_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for invitati table
-- Add policy for normal users to see only their guests
CREATE POLICY "Users can view their own guests" 
ON public.invitati 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own guests" 
ON public.invitati 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own guests" 
ON public.invitati 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own guests" 
ON public.invitati 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update RLS policies for unita_invito table
CREATE POLICY "Users can view their own invitation units" 
ON public.unita_invito 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invitation units" 
ON public.unita_invito 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invitation units" 
ON public.unita_invito 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invitation units" 
ON public.unita_invito 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to promote users to wedding organizer (only for super admin)
CREATE OR REPLACE FUNCTION public.promote_to_wedding_organizer(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow Umberto (super admin) to promote users
  IF auth.uid() != '3ee3d300-3383-4cbe-b687-acf1f478f879' THEN
    RAISE EXCEPTION 'Only super admin can promote users';
  END IF;
  
  UPDATE public.profiles 
  SET is_wedding_organizer = true 
  WHERE user_id = target_user_id;
END;
$$;