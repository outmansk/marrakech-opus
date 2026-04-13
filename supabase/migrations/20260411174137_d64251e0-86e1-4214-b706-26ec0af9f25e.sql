
-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('vente', 'location_courte', 'location_longue')),
  property_type TEXT NOT NULL,
  bedrooms INTEGER,
  secure_parking BOOLEAN DEFAULT false,
  environment_type TEXT,
  proximities JSONB DEFAULT '[]'::jsonb,
  image_urls TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visit_requests table
CREATE TABLE public.visit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  requested_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

-- Properties: public read, admin write
CREATE POLICY "Properties are viewable by everyone" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage properties" ON public.properties FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Visit requests: anyone can insert, authenticated can read all
CREATE POLICY "Anyone can create visit requests" ON public.visit_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view visit requests" ON public.visit_requests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update visit requests" ON public.visit_requests FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('property_images', 'property_images', true);

CREATE POLICY "Property images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'property_images');
CREATE POLICY "Authenticated users can upload property images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property_images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update property images" ON storage.objects FOR UPDATE USING (bucket_id = 'property_images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete property images" ON storage.objects FOR DELETE USING (bucket_id = 'property_images' AND auth.uid() IS NOT NULL);
