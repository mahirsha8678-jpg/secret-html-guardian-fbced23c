CREATE TABLE public.protected_payloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payload TEXT NOT NULL,
  k1 INTEGER NOT NULL,
  k2 INTEGER NOT NULL,
  credit_text TEXT NOT NULL,
  credit_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  domain_lock TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.protected_payloads TO service_role;

ALTER TABLE public.protected_payloads ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_protected_payloads_created_at ON public.protected_payloads(created_at DESC);