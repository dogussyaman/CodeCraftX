-- ============================================
-- 074: create_company_with_owner INSERT'e plan ekleme
-- Yeni şirketler açıkça plan = 'free' ile oluşturulur (073'teki DEFAULT'a ek olarak).
-- 073_companies_add_plan.sql sonrasında çalıştırın.
-- Supabase SQL Editor'da çalıştırın.
-- ============================================

CREATE OR REPLACE FUNCTION public.create_company_with_owner(
  company_name TEXT,
  company_email TEXT,
  owner_full_name TEXT,
  owner_user_id UUID,
  temp_password TEXT,
  created_by_admin_id UUID DEFAULT NULL,
  company_description TEXT DEFAULT NULL,
  company_industry TEXT DEFAULT NULL,
  company_website TEXT DEFAULT NULL,
  company_location TEXT DEFAULT NULL,
  company_employee_count TEXT DEFAULT NULL,
  company_legal_title TEXT DEFAULT NULL,
  company_tax_number TEXT DEFAULT NULL,
  company_tax_office TEXT DEFAULT NULL,
  company_address TEXT DEFAULT NULL,
  company_phone TEXT DEFAULT NULL,
  company_contact_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id UUID;
  result JSONB;
BEGIN
  IF created_by_admin_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = created_by_admin_id AND role IN ('admin', 'platform_admin')) THEN
      RAISE EXCEPTION 'Sadece admin kullanıcılar şirket oluşturabilir';
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = owner_user_id) THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      must_change_password,
      company_id
    ) VALUES (
      owner_user_id,
      company_email,
      owner_full_name,
      'company_admin',
      TRUE,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      must_change_password = TRUE;
  ELSE
    UPDATE public.profiles
    SET 
      email = company_email,
      full_name = owner_full_name,
      role = 'company_admin',
      must_change_password = TRUE
    WHERE id = owner_user_id;
  END IF;

  INSERT INTO public.companies (
    name,
    description,
    industry,
    website,
    location,
    employee_count,
    legal_title,
    tax_number,
    tax_office,
    address,
    phone,
    contact_email,
    plan,
    created_by,
    owner_profile_id
  ) VALUES (
    company_name,
    company_description,
    company_industry,
    company_website,
    company_location,
    company_employee_count,
    company_legal_title,
    company_tax_number,
    company_tax_office,
    company_address,
    company_phone,
    company_contact_email,
    'free',
    created_by_admin_id,
    owner_user_id
  )
  RETURNING id INTO new_company_id;

  UPDATE public.profiles
  SET company_id = new_company_id
  WHERE id = owner_user_id;

  INSERT INTO public.email_queue (
    recipient_email,
    recipient_name,
    subject,
    html_content,
    text_content,
    email_type,
    metadata
  ) VALUES (
    company_email,
    owner_full_name,
    'Codecrafters - Şirket Hesabınız Oluşturuldu',
    '<h1>Merhaba ' || owner_full_name || '</h1><p>Şirketiniz Codecrafters platformuna başarıyla kaydedildi.</p><p><strong>Giriş Bilgileriniz:</strong></p><p>E-posta: ' || company_email || '</p><p>Şifre: ' || temp_password || '</p><p><strong>ÖNEMLİ:</strong> İlk girişinizde şifrenizi değiştirmeniz gerekmektedir.</p>',
    'Merhaba ' || owner_full_name || E'\n\nŞirketiniz Codecrafters platformuna başarıyla kaydedildi.\n\nGiriş Bilgileriniz:\nE-posta: ' || company_email || E'\nŞifre: ' || temp_password || E'\n\nÖNEMLİ: İlk girişinizde şifrenizi değiştirmeniz gerekmektedir.',
    'company_created',
    jsonb_build_object(
      'company_id', new_company_id,
      'company_name', company_name,
      'user_id', owner_user_id,
      'temp_password', temp_password
    )
  );

  result := jsonb_build_object(
    'success', TRUE,
    'company_id', new_company_id,
    'owner_user_id', owner_user_id
  );

  RETURN result;
END;
$$;
