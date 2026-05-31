CREATE POLICY "Backend service can manage protected payloads"
ON public.protected_payloads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);