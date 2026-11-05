DROP POLICY "Public active products read" ON public.products;
CREATE POLICY "Anon active products read" ON public.products FOR SELECT TO anon USING (active);
CREATE POLICY "Auth products read" ON public.products FOR SELECT TO authenticated USING (active OR public.has_role(auth.uid(), 'admin'::app_role));