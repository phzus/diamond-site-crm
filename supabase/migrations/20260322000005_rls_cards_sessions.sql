-- ============================================================
-- RLS: cards
-- ============================================================
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Todos os usuários autenticados podem ler
CREATE POLICY "cards_select" ON public.cards
  FOR SELECT TO authenticated USING (true);

-- Todos os usuários autenticados podem atualizar status
CREATE POLICY "cards_update" ON public.cards
  FOR UPDATE TO authenticated USING (true);

-- ============================================================
-- RLS: sessions
-- ============================================================
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Todos os usuários autenticados podem ler
CREATE POLICY "sessions_select" ON public.sessions
  FOR SELECT TO authenticated USING (true);

-- Todos os usuários autenticados podem criar sessões
CREATE POLICY "sessions_insert" ON public.sessions
  FOR INSERT TO authenticated WITH CHECK (true);

-- Todos os usuários autenticados podem fechar (update) sessões
CREATE POLICY "sessions_update" ON public.sessions
  FOR UPDATE TO authenticated USING (true);

-- Somente admins podem deletar sessões
CREATE POLICY "sessions_delete" ON public.sessions
  FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');
