-- Add SELECT policy for authenticated users on products
CREATE POLICY "Authenticated can read visible products"
ON public.products
FOR SELECT
TO authenticated
USING ((visible = true) OR is_admin());
