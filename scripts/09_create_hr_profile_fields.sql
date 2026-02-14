-- Migration: create_hr_user güncellemesi (bio, website, avatar_url)
-- Mevcut veritabanında 00_FINAL_ALL_IN_ONE.sql zaten çalıştırılmışsa sadece bu script'i çalıştırın.
-- Yeni kurulumda: önce 00_FINAL_ALL_IN_ONE.sql, ardından bu dosyayı çalıştırın.
CREATE OR REPLACE FUNCTION public.create_hr_user(
  hr_email TEXT,
  hr_full_name TEXT,
  hr_user_id UUID,
  temp_password TEXT,
  company_id_param UUID,
  created_by_user_id UUID,
  hr_title TEXT DEFAULT NULL,
  hr_phone TEXT DEFAULT NULL,
  hr_bio TEXT DEFAULT NULL,
  hr_website TEXT DEFAULT NULL,
  hr_avatar_url TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  company_owner_id UUID;
  result JSONB;
BEGIN
  SELECT owner_profile_id INTO company_owner_id FROM public.companies WHERE id = company_id_param;
  IF company_owner_id IS NULL THEN
    RAISE EXCEPTION 'Şirket bulunamadı';
  END IF;
  IF created_by_user_id != company_owner_id AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = created_by_user_id AND role IN ('admin', 'platform_admin')) THEN
    RAISE EXCEPTION 'Sadece şirket sahibi veya admin İK kullanıcısı ekleyebilir';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = hr_user_id) THEN
    INSERT INTO public.profiles (id, email, full_name, role, phone, title, bio, website, avatar_url, must_change_password, company_id)
    VALUES (hr_user_id, hr_email, hr_full_name, 'hr', hr_phone, hr_title, hr_bio, hr_website, hr_avatar_url, TRUE, company_id_param)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      phone = EXCLUDED.phone,
      title = EXCLUDED.title,
      bio = EXCLUDED.bio,
      website = EXCLUDED.website,
      avatar_url = EXCLUDED.avatar_url,
      must_change_password = TRUE,
      company_id = EXCLUDED.company_id;
  ELSE
    UPDATE public.profiles SET
      email = hr_email,
      full_name = hr_full_name,
      role = 'hr',
      phone = hr_phone,
      title = hr_title,
      bio = hr_bio,
      website = hr_website,
      avatar_url = hr_avatar_url,
      must_change_password = TRUE,
      company_id = company_id_param
    WHERE id = hr_user_id;
  END IF;

  INSERT INTO public.email_queue (recipient_email, recipient_name, subject, html_content, text_content, email_type, metadata)
  VALUES (
    hr_email,
    hr_full_name,
    'Codecrafters - İK Hesabınız Oluşturuldu',
    '<h1>Merhaba ' || hr_full_name || '</h1><p>Codecrafters platformuna İK kullanıcısı olarak eklendiniz.</p><p><strong>Giriş Bilgileriniz:</strong></p><p>E-posta: ' || hr_email || '</p><p>Şifre: ' || temp_password || '</p><p><strong>ÖNEMLİ:</strong> İlk girişinizde şifrenizi değiştirmeniz gerekmektedir.</p>',
    'Merhaba ' || hr_full_name || E'\n\nCodecrafters platformuna İK kullanıcısı olarak eklendiniz.\n\nGiriş Bilgileriniz:\nE-posta: ' || hr_email || E'\nŞifre: ' || temp_password || E'\n\nÖNEMLİ: İlk girişinizde şifrenizi değiştirmeniz gerekmektedir.',
    'hr_invited',
    jsonb_build_object('company_id', company_id_param, 'user_id', hr_user_id, 'temp_password', temp_password)
  );

  result := jsonb_build_object('success', TRUE, 'hr_user_id', hr_user_id);
  RETURN result;
END;
$$;
