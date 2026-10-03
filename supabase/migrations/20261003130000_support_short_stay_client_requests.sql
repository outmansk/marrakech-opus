-- Keep short-stay requests distinct from monthly rental enquiries.
ALTER TABLE public.client_leads
  DROP CONSTRAINT IF EXISTS client_leads_transaction_type_check;

ALTER TABLE public.client_leads
  ADD CONSTRAINT client_leads_transaction_type_check
  CHECK (transaction_type IN ('location-longue-duree', 'location-courte-duree', 'vente'));

NOTIFY pgrst, 'reload schema';
