-- Migration: İK kullanıcılarının başvuruya bağlı CV'leri görebilmesi için RLS policy
-- Dosya: scripts/065_add_hr_cv_access_policy.sql

-- Mevcut policy'yi koruyoruz, yeni bir tane ekliyoruz
-- İK/Company Admin/Admin kullanıcılar kendi şirketlerinin ilanlarına yapılan başvuruların CV'lerini görebilir

DROP POLICY IF EXISTS "İK başvuruya bağlı CV'yi görebilir" ON public.cvs;

CREATE POLICY "İK başvuruya bağlı CV'yi görebilir"
ON public.cvs
FOR SELECT
USING (
  -- Geliştirici kendi CV'sini görebilir (mevcut policy korunuyor)
  developer_id = auth.uid()
  OR
  -- İK/Company Admin/Admin kullanıcılar, kendi şirketlerinin ilanlarına yapılan başvuruların CV'lerini görebilir
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE a.cv_id = cvs.id
      AND jp.company_id = p.company_id
      AND p.role IN ('hr', 'company_admin', 'admin', 'platform_admin')
  )
);
