-- Add CPF field to leads table
-- CPF is the Brazilian individual taxpayer identification number
-- Used as the primary identifier for check-in operations

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Case-insensitive unique index (only for non-null CPFs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_cpf_unique
  ON public.leads (cpf)
  WHERE cpf IS NOT NULL;
