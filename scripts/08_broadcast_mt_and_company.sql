-- MT: Allow MT role to send broadcast notifications (same as admin)
CREATE OR REPLACE FUNCTION public.broadcast_notification(
  p_title TEXT, p_body TEXT DEFAULT NULL, p_href TEXT DEFAULT NULL,
  p_target_role TEXT DEFAULT 'all', p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_effective_role TEXT; v_inserted_count INTEGER := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')) THEN
    RAISE EXCEPTION 'Sadece admin veya MT kullanıcılar toplu bildirim gönderebilir';
  END IF;
  v_effective_role := lower(coalesce(p_target_role, 'all'));
  IF v_effective_role = 'all' THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, title, body, href, data)
    SELECT p.id, auth.uid(), 'system', p_title, p_body, p_href, coalesce(p_data, '{}'::jsonb) FROM public.profiles p;
  ELSE
    INSERT INTO public.notifications (recipient_id, actor_id, type, title, body, href, data)
    SELECT p.id, auth.uid(), 'system', p_title, p_body, p_href, coalesce(p_data, '{}'::jsonb)
    FROM public.profiles p WHERE lower(p.role) = v_effective_role;
  END IF;
  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
  RETURN v_inserted_count;
END; $$;

-- Company: Şirket yöneticisi kendi şirketindeki kullanıcılara (company_id eşleşen) in-app bildirim gönderebilir
CREATE OR REPLACE FUNCTION public.broadcast_notification_to_company(
  p_company_id UUID, p_title TEXT, p_body TEXT DEFAULT NULL, p_href TEXT DEFAULT NULL
)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_inserted_count INTEGER := 0;
BEGIN
  -- Sadece ilgili şirketin sahibi (company_admin + owner_profile_id) veya admin/mt
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND (
      (p.role IN ('admin', 'platform_admin', 'mt'))
      OR (p.role = 'company_admin' AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = p_company_id AND c.owner_profile_id = p.id))
      OR (p.company_id = p_company_id AND p.role IN ('company_admin', 'hr'))
    )
  ) THEN
    RAISE EXCEPTION 'Bu şirkete bildirim gönderme yetkiniz yok';
  END IF;

  INSERT INTO public.notifications (recipient_id, actor_id, type, title, body, href, data)
  SELECT p.id, auth.uid(), 'system', p_title, p_body, p_href, '{}'::jsonb
  FROM public.profiles p
  WHERE p.company_id = p_company_id;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
  RETURN v_inserted_count;
END; $$;
