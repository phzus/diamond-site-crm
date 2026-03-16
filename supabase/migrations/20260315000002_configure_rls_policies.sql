-- ============================================================
-- HELPER: função para obter o role do usuário logado
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- TABELA: profiles
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuário autenticado pode ver seu próprio perfil
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin pode ver todos os perfis
CREATE POLICY "profiles: admin select all"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Admin pode inserir novos perfis (criação via convite)
CREATE POLICY "profiles: admin insert"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

-- Admin pode atualizar qualquer perfil; usuário pode atualizar o próprio
CREATE POLICY "profiles: update"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id OR public.get_user_role() = 'admin'
  );

-- Somente admin pode deletar perfis
CREATE POLICY "profiles: admin delete"
  ON public.profiles FOR DELETE
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- TABELA: leads
-- ============================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler leads
CREATE POLICY "leads: authenticated select"
  ON public.leads FOR SELECT
  USING (auth.role() = 'authenticated');

-- Qualquer usuário autenticado pode criar leads
CREATE POLICY "leads: authenticated insert"
  ON public.leads FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Qualquer usuário autenticado pode editar leads
CREATE POLICY "leads: authenticated update"
  ON public.leads FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Somente admin pode deletar leads
CREATE POLICY "leads: admin delete"
  ON public.leads FOR DELETE
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- TABELA: lead_notes
-- ============================================================
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ler notas
CREATE POLICY "lead_notes: authenticated select"
  ON public.lead_notes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Qualquer autenticado pode criar notas
CREATE POLICY "lead_notes: authenticated insert"
  ON public.lead_notes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Autor ou admin pode deletar nota
CREATE POLICY "lead_notes: delete own or admin"
  ON public.lead_notes FOR DELETE
  USING (
    auth.uid() = created_by OR public.get_user_role() = 'admin'
  );

-- ============================================================
-- TABELA: lead_activities
-- ============================================================
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ler atividades
CREATE POLICY "lead_activities: authenticated select"
  ON public.lead_activities FOR SELECT
  USING (auth.role() = 'authenticated');

-- Sistema e usuários autenticados podem inserir atividades
CREATE POLICY "lead_activities: authenticated insert"
  ON public.lead_activities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Ninguém pode editar ou deletar atividades (imutável por design)

-- ============================================================
-- TABELA: audit_logs
-- ============================================================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Somente admin pode ler audit logs
CREATE POLICY "audit_logs: admin select"
  ON public.audit_logs FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Usuários autenticados e service_role podem inserir audit logs
CREATE POLICY "audit_logs: service insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
