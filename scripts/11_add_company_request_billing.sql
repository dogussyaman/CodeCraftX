-- Add billing_period to company_requests for plan selection flow
ALTER TABLE public.company_requests
  ADD COLUMN IF NOT EXISTS billing_period TEXT DEFAULT 'monthly';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.company_requests'::regclass AND conname = 'company_requests_billing_period_check') THEN
    ALTER TABLE public.company_requests ADD CONSTRAINT company_requests_billing_period_check
      CHECK (billing_period IN ('monthly', 'annually'));
  END IF;
END $$;
