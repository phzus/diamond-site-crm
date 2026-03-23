-- ============================================================
-- 1. TABELA: cards (cartões físicos 1–450)
-- ============================================================
CREATE TABLE public.cards (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number     INTEGER NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 450),
  status     TEXT NOT NULL DEFAULT 'available'
               CHECK (status IN ('available', 'in_use', 'blocked')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Popular todos os 450 cartões de uma vez
INSERT INTO public.cards (number)
SELECT generate_series(1, 450);

-- Trigger de updated_at
CREATE TRIGGER set_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 2. TABELA: sessions (check-in / check-out)
-- ============================================================
CREATE TABLE public.sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id        UUID NOT NULL REFERENCES public.leads(id) ON DELETE RESTRICT,
  card_id        UUID NOT NULL REFERENCES public.cards(id) ON DELETE RESTRICT,
  operator_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  checked_in_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_out_at TIMESTAMPTZ,
  amount_spent   NUMERIC(10, 2),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garante que um cartão só pode ter UMA sessão aberta por vez
CREATE UNIQUE INDEX idx_sessions_card_active
  ON public.sessions (card_id)
  WHERE checked_out_at IS NULL;

-- Índices de performance
CREATE INDEX idx_sessions_lead_id      ON public.sessions (lead_id);
CREATE INDEX idx_sessions_checked_in   ON public.sessions (checked_in_at DESC);
CREATE INDEX idx_sessions_open         ON public.sessions (checked_out_at) WHERE checked_out_at IS NULL;

-- ============================================================
-- 3. REALTIME para cards e sessions
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
