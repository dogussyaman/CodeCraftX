-- ============================================
-- RLS policies for company_payments
-- Run after 02_add_company_subscription_fields.sql
-- ============================================

ALTER TABLE public.company_payments ENABLE ROW LEVEL SECURITY;

-- Company owner and HR can read their company's payments
DROP POLICY IF EXISTS "company_payments_select_company" ON public.company_payments;
CREATE POLICY "company_payments_select_company" ON public.company_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.company_id = company_payments.company_id
        AND p.role IN ('company_admin', 'hr')
    )
  );

-- Admin, platform_admin, mt can read all payments
DROP POLICY IF EXISTS "company_payments_select_admin" ON public.company_payments;
CREATE POLICY "company_payments_select_admin" ON public.company_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin', 'mt')
    )
  );

-- Insert/Update/Delete: no policy for authenticated users; only service_role (API/server) can write.
-- This prevents client-side direct writes to company_payments in production.

-- ============================================
-- DONE
-- ============================================
