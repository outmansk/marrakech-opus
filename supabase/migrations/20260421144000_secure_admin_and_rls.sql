-- Create profiles table for role-based access control
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Trigger to create profile when auth.user creates
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- We also make sure the current users are admins / they have a profile
INSERT INTO public.profiles (id, role)
SELECT id, 'admin' FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin';

---------------------------------------------------
-- Apply RLS policies to properties_v2
---------------------------------------------------
ALTER TABLE public.properties_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can view published v2" ON properties_v2;
CREATE POLICY "public can view published v2" ON public.properties_v2 FOR SELECT USING (
  statut = 'publie' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "admin full access v2" ON properties_v2;
CREATE POLICY "admin full access v2" ON public.properties_v2 FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

---------------------------------------------------
-- Apply RLS policies to properties
---------------------------------------------------
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
CREATE POLICY "public can view published properties" ON public.properties FOR SELECT USING (
  is_available = true OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Authenticated users can manage properties" ON public.properties;
CREATE POLICY "admin full access properties" ON public.properties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

---------------------------------------------------
-- Apply RLS policies to articles
---------------------------------------------------
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les articles publiés sont visibles par tous" ON public.articles;
CREATE POLICY "public can view published articles" ON public.articles FOR SELECT USING (
  est_publie = true OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Les admins gèrent les articles" ON public.articles;
CREATE POLICY "admin full access articles" ON public.articles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

---------------------------------------------------
-- Apply RLS policies to visit_requests
---------------------------------------------------
ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create visit requests" ON public.visit_requests;
CREATE POLICY "Anyone can create visit requests" ON public.visit_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view visit requests" ON public.visit_requests;
CREATE POLICY "Admins can view visit requests" ON public.visit_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Authenticated users can update visit requests" ON public.visit_requests;
CREATE POLICY "Admins can update visit requests" ON public.visit_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Authenticated users can delete visit requests" ON public.visit_requests;
CREATE POLICY "Admins can delete visit requests" ON public.visit_requests FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Images
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;

CREATE POLICY "Admins can upload property images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'property_images' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update property images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'property_images' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete property images" ON storage.objects FOR DELETE USING (
  bucket_id = 'property_images' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
