-- Add user-scoped RLS policies to relazioni table
-- Users can only view relationships between their own guests

CREATE POLICY "Users can view relationships for their own guests"
ON public.relazioni
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invitati ia
    WHERE ia.id = relazioni.invitato_a_id
    AND ia.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.invitati ib
    WHERE ib.id = relazioni.invitato_b_id
    AND ib.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert relationships for their own guests"
ON public.relazioni
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invitati ia
    WHERE ia.id = relazioni.invitato_a_id
    AND ia.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.invitati ib
    WHERE ib.id = relazioni.invitato_b_id
    AND ib.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update relationships for their own guests"
ON public.relazioni
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.invitati ia
    WHERE ia.id = relazioni.invitato_a_id
    AND ia.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.invitati ib
    WHERE ib.id = relazioni.invitato_b_id
    AND ib.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete relationships for their own guests"
ON public.relazioni
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.invitati ia
    WHERE ia.id = relazioni.invitato_a_id
    AND ia.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.invitati ib
    WHERE ib.id = relazioni.invitato_b_id
    AND ib.user_id = auth.uid()
  )
);