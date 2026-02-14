-- CodeCraftX: Görüşmeye davet edilen İK çalışanları (toplantı katılımcıları)
-- 10_applications_interviews_feedback.sql sonrası çalıştırın.

-- interviews: Görüşmeye katılacak İK/şirket kullanıcılarının profile id listesi
ALTER TABLE public.interviews
  ADD COLUMN IF NOT EXISTS invited_attendee_ids UUID[] DEFAULT '{}';

COMMENT ON COLUMN public.interviews.invited_attendee_ids IS 'Görüşmeye davet edilen İK/şirket çalışanı profile id listesi; aday toplantıda kimlerin olacağını görebilir.';
