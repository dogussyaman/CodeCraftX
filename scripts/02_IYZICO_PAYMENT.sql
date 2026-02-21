-- iyzico payment integration: company_payments extensions + payment_logs
-- Run after 00_FINAL_ALL_IN_ONE.sql and 01_ENTERPRISE_UPGRADE.sql (if used)

-- 1. company_payments: iyzico token and conversation id
ALTER TABLE public.company_payments
  ADD COLUMN IF NOT EXISTS iyzico_token TEXT,
  ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- 2. payment_logs: audit log for verify and other payment events
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_payment_id UUID NOT NULL REFERENCES public.company_payments(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_company_payment_id ON public.payment_logs(company_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON public.payment_logs(created_at DESC);

ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Only service role / Edge writes; no SELECT for regular users (platform_admin can be added later)
CREATE POLICY "payment_logs_no_select" ON public.payment_logs
  FOR SELECT USING (false);

CREATE POLICY "payment_logs_service_insert" ON public.payment_logs
  FOR INSERT WITH CHECK (true);
