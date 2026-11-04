CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 80),
  category text NOT NULL DEFAULT 'NOVIDADE',
  caption text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  price numeric NOT NULL CHECK (price > 0),
  presale_price numeric NOT NULL CHECK (presale_price > 0),
  tags text[] NOT NULL DEFAULT '{}',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (presale_price <= price)
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public active products read" ON public.products FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin products insert" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin products update" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.products (id,name,category,caption,description,image_url,price,presale_price,tags,features,sort_order) VALUES
('01','Modu-Desk','SMART WORKSPACE','Seu espaço. Mais inteligente.','Organização modular que acompanha suas ideias. Conectada, intuitiva e feita para evoluir com você.','assets/modu-desk.jpg',1499,1199,ARRAY['Modular','E-Ink Touch','Conectado'],'[]',1),
('02','Spider Flex','SMART WEAR','Vista sua próxima versão.','O universo do seu herói encontra o tecido inteligente. Estilo que se transforma e se adapta a você.','assets/spider-flex.jpg',399,299,ARRAY['Biomimético','Postura','Color-shift'],'[]',2),
('03','Tênis McFly','SMART MOVEMENT','O futuro está nos seus pés.','Inspirado no cinema. Projetado para o seu movimento. Um ajuste preciso, com um simples toque entre os pés.','assets/mcfly.jpg',899,699,ARRAY['Autoajuste','Ergonômico','Adaptável'],'[]',3);
CREATE OR REPLACE FUNCTION public.reserve_product(p_product_id text, p_name text, p_email text, p_phone text, p_quantity integer) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_name text; v_price numeric; v_code text; v_uid uuid := auth.uid();
BEGIN
IF v_uid IS NULL THEN RAISE EXCEPTION 'Entre na sua conta para fazer a reserva'; END IF;
IF p_name IS NULL OR length(trim(p_name)) NOT BETWEEN 5 AND 100 OR trim(p_name) !~ '[[:space:]]' THEN RAISE EXCEPTION 'Informe seu nome completo'; END IF;
IF p_email IS NULL OR length(p_email)>255 OR trim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' THEN RAISE EXCEPTION 'E-mail inválido'; END IF;
IF p_phone IS NULL OR length(p_phone)>30 OR length(regexp_replace(p_phone,'[^0-9]','','g')) NOT BETWEEN 10 AND 11 THEN RAISE EXCEPTION 'Telefone inválido'; END IF;
IF p_quantity IS NULL OR p_quantity NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'Quantidade inválida'; END IF;
SELECT name, presale_price INTO v_name, v_price FROM public.products WHERE id = p_product_id AND active;
IF v_name IS NULL THEN RAISE EXCEPTION 'Produto inválido'; END IF;
PERFORM pg_advisory_xact_lock(hashtext(v_uid::text));
IF (SELECT count(*) FROM public.reservations WHERE user_id = v_uid AND created_at > now()-interval '1 hour') >= 5 THEN RAISE EXCEPTION 'Limite de reservas atingido. Tente mais tarde'; END IF;
INSERT INTO public.reservations(product_id,product_name,customer_name,email,phone,quantity,unit_price,user_id) VALUES(p_product_id,v_name,trim(p_name),lower(trim(p_email)),p_phone,p_quantity,v_price,v_uid) RETURNING code INTO v_code;
RETURN v_code;
END; $$;
REVOKE ALL ON FUNCTION public.reserve_product(text,text,text,text,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_product(text,text,text,text,integer) TO authenticated;
CREATE POLICY "Public product images read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin product images upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));