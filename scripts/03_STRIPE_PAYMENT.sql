-- Stripe payment integration
-- Run after 00_FINAL_ALL_IN_ONE.sql, 01_ENTERPRISE_UPGRADE.sql, 02_IYZICO_PAYMENT.sql

-- 1. payments tablosu (subscription genişletilebilir)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'try',
  status TEXT NOT NULL CHECK (status IN ('pending','succeeded','failed')) DEFAULT 'pending',
  idempotency_key TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_pi ON public.payments(stripe_payment_intent_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency ON public.payments(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- 2. company_payments: iyzico kolonları kaldır, stripe kolonu ekle
ALTER TABLE public.company_payments
  DROP COLUMN IF EXISTS iyzico_token,
  DROP COLUMN IF EXISTS conversation_id;

ALTER TABLE public.company_payments
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- 3. profiles: Stripe Customer (subscription için)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- 4. payments RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT/UPDATE: service role ile (webhook/API) - RLS bypass edilir
-- Normal kullanıcılar için INSERT/UPDATE policy yok; sadece service role kullanılacak
