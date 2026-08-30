CREATE TABLE public.site_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url text NOT NULL UNIQUE,
  source_page text,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  kind text NOT NULL DEFAULT 'other',
  alt_text text,
  content_type text,
  byte_size integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_assets TO anon;
GRANT SELECT ON public.site_assets TO authenticated;
GRANT ALL ON public.site_assets TO service_role;
ALTER TABLE public.site_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site assets are publicly readable" ON public.site_assets FOR SELECT USING (true);

CREATE TABLE public.site_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_key text NOT NULL UNIQUE,
  category text NOT NULL,
  label text,
  volume text,
  diameter text,
  style text,
  material text,
  source_page text,
  source_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_products TO anon;
GRANT SELECT ON public.site_products TO authenticated;
GRANT ALL ON public.site_products TO service_role;
ALTER TABLE public.site_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site products are publicly readable" ON public.site_products FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER site_assets_touch BEFORE UPDATE ON public.site_assets
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER site_products_touch BEFORE UPDATE ON public.site_products
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();