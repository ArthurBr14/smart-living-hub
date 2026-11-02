ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE INDEX IF NOT EXISTS reservations_user_id_idx ON public.reservations(user_id);
CREATE OR REPLACE FUNCTION public.reserve_product(p_product_id text, p_name text, p_email text, p_phone text, p_quantity integer) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_name text; v_price numeric; v_code text; v_uid uuid := auth.uid();
BEGIN
IF v_uid IS NULL THEN RAISE EXCEPTION 'Entre na sua conta para fazer a reserva'; END IF;
IF p_name IS NULL OR length(trim(p_name)) NOT BETWEEN 5 AND 100 OR trim(p_name) !~ '[[:space:]]' THEN RAISE EXCEPTION 'Informe seu nome completo'; END IF;
IF p_email IS NULL OR length(p_email)>255 OR trim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' THEN RAISE EXCEPTION 'E-mail inválido'; END IF;
IF p_phone IS NULL OR length(p_phone)>30 OR length(regexp_replace(p_phone,'[^0-9]','','g')) NOT BETWEEN 10 AND 11 THEN RAISE EXCEPTION 'Telefone inválido'; END IF;
IF p_quantity IS NULL OR p_quantity NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'Quantidade inválida'; END IF;
CASE p_product_id WHEN '01' THEN v_name := 'Modu-Desk'; v_price := 1199; WHEN '02' THEN v_name := 'Spider Flex'; v_price := 299; WHEN '03' THEN v_name := 'Tênis McFly'; v_price := 699; ELSE RAISE EXCEPTION 'Produto inválido'; END CASE;
PERFORM pg_advisory_xact_lock(hashtext(v_uid::text));
IF (SELECT count(*) FROM public.reservations WHERE user_id = v_uid AND created_at > now()-interval '1 hour') >= 5 THEN RAISE EXCEPTION 'Limite de reservas atingido. Tente mais tarde'; END IF;
INSERT INTO public.reservations(product_id,product_name,customer_name,email,phone,quantity,unit_price,user_id) VALUES(p_product_id,v_name,trim(p_name),lower(trim(p_email)),p_phone,p_quantity,v_price,v_uid) RETURNING code INTO v_code;
RETURN v_code;
END; $$;
REVOKE ALL ON FUNCTION public.reserve_product(text,text,text,text,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_product(text,text,text,text,integer) TO authenticated;