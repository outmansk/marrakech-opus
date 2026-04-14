-- Création sécurisée de la table articles pour le blog SEO
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS est_publie BOOLEAN DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Activation du Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Les articles publiés sont visibles par tous' AND tablename = 'articles') THEN
    CREATE POLICY "Les articles publiés sont visibles par tous" ON public.articles FOR SELECT USING (est_publie = true OR auth.uid() IS NOT NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Les admins gèrent les articles' AND tablename = 'articles') THEN
    CREATE POLICY "Les admins gèrent les articles" ON public.articles FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;
