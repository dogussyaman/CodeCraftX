-- ============================================
-- Company subscription fields + company_payments table
-- Run in Supabase SQL Editor. No full schema rewrite.
-- ============================================

-- 1. Add subscription columns to public.companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'pending_payment',
  ADD COLUMN IF NOT EXISTS billing_period TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS current_plan_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP WITH TIME ZONE;

-- Enforce check constraints (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.companies'::regclass AND conname = 'companies_subscription_status_check') THEN
    ALTER TABLE public.companies ADD CONSTRAINT companies_subscription_status_check
      CHECK (subscription_status IN ('pending_payment', 'active', 'past_due', 'cancelled'));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.companies'::regclass AND conname = 'companies_billing_period_check') THEN
    ALTER TABLE public.companies ADD CONSTRAINT companies_billing_period_check
      CHECK (billing_period IN ('monthly', 'annually'));
  END IF;
END $$;

-- 2. Create company_payments table
CREATE TABLE IF NOT EXISTS public.company_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'orta', 'premium')),
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'annually')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TRY',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  provider TEXT NOT NULL DEFAULT 'mock',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 3. Indexes for company_payments
CREATE INDEX IF NOT EXISTS idx_company_payments_company_id ON public.company_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_company_payments_status ON public.company_payments(status);
CREATE INDEX IF NOT EXISTS idx_company_payments_status_created_at ON public.company_payments(status, created_at);

-- ============================================
-- DONE
-- ============================================
