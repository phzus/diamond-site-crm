-- ============================================================
-- 0. EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABELA: profiles
-- Extensão de auth.users — criada automaticamente via trigger
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'collaborator'
                  CHECK (role IN ('admin', 'collaborator')),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: criar profile automaticamente ao criar usuário no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'collaborator')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. TABELA: leads
-- ============================================================
CREATE TABLE public.leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  source              TEXT NOT NULL DEFAULT 'landing-page'
                        CHECK (source IN ('landing-page', 'manual')),
  status              TEXT NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new', 'contacted', 'scheduled', 'visited', 'converted', 'discarded')),
  priority            TEXT NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags                TEXT[] NOT NULL DEFAULT '{}',
  message             TEXT,
  last_contacted_at   TIMESTAMPTZ,
  next_follow_up_at   TIMESTAMPTZ,
  submission_count    INTEGER NOT NULL DEFAULT 1,
  utm_source          TEXT,
  utm_medium          TEXT,
  utm_campaign        TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraint: email único (case-insensitive)
CREATE UNIQUE INDEX idx_leads_email_unique ON public.leads (LOWER(email));

-- Índices de performance
CREATE INDEX idx_leads_status       ON public.leads (status);
CREATE INDEX idx_leads_created_at   ON public.leads (created_at DESC);
CREATE INDEX idx_leads_assigned_to  ON public.leads (assigned_to);
CREATE INDEX idx_leads_priority     ON public.leads (priority);

-- ============================================================
-- 3. TABELA: lead_notes
-- ============================================================
CREATE TABLE public.lead_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_by  UUID NOT NULL REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lead_notes_lead_id ON public.lead_notes (lead_id);

-- ============================================================
-- 4. TABELA: lead_activities
-- ============================================================
CREATE TABLE public.lead_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  action_type   TEXT NOT NULL
                  CHECK (action_type IN ('status_changed', 'note_added', 'assigned', 'created', 'field_updated')),
  from_value    TEXT,
  to_value      TEXT,
  performed_by  UUID NOT NULL REFERENCES public.profiles(id),
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lead_activities_lead_id    ON public.lead_activities (lead_id);
CREATE INDEX idx_lead_activities_created_at ON public.lead_activities (created_at DESC);

-- ============================================================
-- 5. TABELA: audit_logs
-- ============================================================
CREATE TABLE public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  metadata      JSONB,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id    ON public.audit_logs (user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- ============================================================
-- 6. TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
