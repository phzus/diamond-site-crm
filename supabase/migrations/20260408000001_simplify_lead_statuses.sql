-- Simplifica os status de leads para apenas 3: new, frequent, blocked
-- Migração dos dados existentes:
--   contacted, scheduled, visited, converted → frequent
--   discarded → blocked
--   new → new (sem alteração)

-- 1. Remover a constraint antiga
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- 2. Migrar dados existentes para os novos status
UPDATE public.leads SET status = 'frequent' WHERE status IN ('contacted', 'scheduled', 'visited', 'converted');
UPDATE public.leads SET status = 'blocked'  WHERE status = 'discarded';

-- 3. Adicionar nova constraint com apenas 3 status
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check CHECK (status IN ('new', 'frequent', 'blocked'));
