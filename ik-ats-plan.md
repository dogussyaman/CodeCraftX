### Amaç

İK / company_admin kullanıcılarının:

- **İlana başvuran adayın tüm detaylarını (CV, ön yazı, maaş beklentisi vb.) görebilmesi**
- **Başvurunun durumunu yönetebilmesi (incele, mülakat ayarla, red, teklif vb.)**
- **Verdiği geri dönüşlerin geliştirici tarafından `Başvurularım` ekranında net şekilde görülmesi**

Bu dosya, bunu adım adım nasıl inşa edeceğini anlatan bir rehberdir.

---

### 1. Veritabanı / SQL Değişiklikleri

#### 1.1. Başvuruya maaş beklentisi ekle

1. `applications` tablosuna yeni kolonlar ekle (ayrı SQL migration dosyası oluştur):
   - `expected_salary INTEGER` – Adayın yazdığı tek fiyat (ör: 65000).
   - `expected_salary_currency TEXT DEFAULT 'TRY'` – İleride çoklu para birimi için esneklik.
   - `expected_salary_visible_to_candidate BOOLEAN DEFAULT TRUE` – Geliştirici kendi başvurusunda görebilsin.
2. `applications` için `CHECK` constraint isteğe bağlıdır (örneğin `expected_salary >= 0`).
3. `FINAL_COMPLETE_SCHEMA.sql` içine de bu kolonları eklemeyi unut (yeni kurulumlarda şema tam olsun).

**SQL Kodu:**

```sql
-- Migration: applications tablosuna maaş beklentisi kolonları ekle
-- Dosya: scripts/063_add_expected_salary_to_applications.sql

ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS expected_salary INTEGER,
ADD COLUMN IF NOT EXISTS expected_salary_currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS expected_salary_visible_to_candidate BOOLEAN DEFAULT TRUE;

-- Constraint: Maaş negatif olamaz
ALTER TABLE public.applications 
ADD CONSTRAINT check_expected_salary_positive 
CHECK (expected_salary IS NULL OR expected_salary >= 0);

-- Index: Maaş beklentisi üzerinde arama için (opsiyonel)
CREATE INDEX IF NOT EXISTS idx_applications_expected_salary 
ON public.applications(expected_salary) 
WHERE expected_salary IS NOT NULL;
```

**FINAL_COMPLETE_SCHEMA.sql'e eklenecek:**

`applications` tablosu tanımına şu satırları ekle (satır 201-211 arasına):

```sql
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  developer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  cv_id UUID REFERENCES public.cvs(id) ON DELETE SET NULL,
  cover_letter TEXT,
  expected_salary INTEGER,
  expected_salary_currency TEXT DEFAULT 'TRY',
  expected_salary_visible_to_candidate BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'yeni' CHECK (status IN ('yeni', 'değerlendiriliyor', 'randevu', 'teklif', 'red', 'pending', 'reviewed', 'interview', 'rejected', 'accepted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, developer_id),
  CONSTRAINT check_expected_salary_positive CHECK (expected_salary IS NULL OR expected_salary >= 0)
);
```

#### 1.2. İlan bazında “maaş beklentisi sorulsun mu?” ayarı

1. `job_postings` tablosuna şu kolonları ekle:
   - `ask_expected_salary BOOLEAN DEFAULT FALSE` – Bu ilan için adaydan maaş beklentisi istenecek mi?
   - `expected_salary_required BOOLEAN DEFAULT FALSE` – Zorunlu mu? (yes/no sorusu gibi çalışacak).
2. Mantık:
   - `ask_expected_salary = FALSE` → Başvuru formunda hiç maaş alanı yok.
   - `ask_expected_salary = TRUE` ve `expected_salary_required = FALSE` → Opsiyonel input.
   - `ask_expected_salary = TRUE` ve `expected_salary_required = TRUE` → Zorunlu input.

**SQL Kodu:**

```sql
-- Migration: job_postings tablosuna maaş beklentisi ayarları ekle
-- Dosya: scripts/064_add_salary_settings_to_job_postings.sql

ALTER TABLE public.job_postings 
ADD COLUMN IF NOT EXISTS ask_expected_salary BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expected_salary_required BOOLEAN DEFAULT FALSE;

-- Constraint: expected_salary_required sadece ask_expected_salary true ise true olabilir
ALTER TABLE public.job_postings 
ADD CONSTRAINT check_salary_required_logic 
CHECK (
  (ask_expected_salary = FALSE AND expected_salary_required = FALSE) OR
  (ask_expected_salary = TRUE)
);

-- Index: Maaş beklentisi istenen ilanları hızlı bulmak için
CREATE INDEX IF NOT EXISTS idx_job_postings_ask_expected_salary 
ON public.job_postings(ask_expected_salary) 
WHERE ask_expected_salary = TRUE;
```

**FINAL_COMPLETE_SCHEMA.sql'e eklenecek:**

`job_postings` tablosu tanımına şu satırları ekle (satır 76-95 arasına):

```sql
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  responsibilities TEXT,
  location TEXT,
  department TEXT,
  employment_type TEXT,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
  experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead')),
  salary_min INTEGER,
  salary_max INTEGER,
  ask_expected_salary BOOLEAN DEFAULT FALSE,
  expected_salary_required BOOLEAN DEFAULT FALSE,
  application_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_salary_required_logic CHECK (
    (ask_expected_salary = FALSE AND expected_salary_required = FALSE) OR
    (ask_expected_salary = TRUE)
  )
);
```

#### 1.3. CV erişim RLS düzeni (İK’nın CV görmesi)

> Referans: `scripts/FINAL_COMPLETE_SCHEMA.sql` içindeki `cvs` ve `applications` RLS blokları.

1. `cvs` tablosunda şu an sadece geliştirici kendi CV’sini görebiliyor:
   - `USING (developer_id = auth.uid())`
2. Ek bir `SELECT` policy ekle:
   - Şart: `auth.uid()` bir **İK / company_admin / admin** olmalı **ve** CV, kendi şirketine ait bir ilana yapılan başvuru üzerinden ilişkili olmalı.
   - Önerilen mantık (yeni policy):
     - `EXISTS (SELECT 1 FROM applications a JOIN job_postings jp ... JOIN profiles p ... WHERE a.cv_id = cvs.id AND jp.company_id = p.company_id AND p.id = auth.uid() AND p.role IN ('hr','company_admin','admin','platform_admin'))`
3. Bu policy’yi ayrı bir migration dosyasına yaz, ardından `FINAL_COMPLETE_SCHEMA.sql` içindeki RLS kısmına da ekle.

#### 1.4. Mülakat (interviews) için INSERT/UPDATE RLS

1. `interviews` tablosunun RLS bölümünü incele:
   - Şu an sadece `SELECT` policy var (`USING (true)`).
2. Şunları ekle:
   - **INSERT policy**: 
     - `auth.uid()` ilgili başvurunun ilanının şirketine bağlı bir kullanıcı (hr/company_admin/admin) ise mülakat oluşturabilsin.
   - **UPDATE policy**:
     - Aynı koşul ile sadece ilgili kullanıcılar mülakat güncelleyebilsin.
   - (İstersen `DELETE` için de benzer bir policy ekleyebilirsin.)
3. Politika koşulu için yine `applications → job_postings → profiles` zincirini kullan.

**SQL Kodu:**

```sql
-- Migration: Interviews tablosu için INSERT/UPDATE/DELETE RLS policies
-- Dosya: scripts/066_add_interviews_rls_policies.sql

-- INSERT Policy: İK/Company Admin/Admin kullanıcılar mülakat oluşturabilir
DROP POLICY IF EXISTS "İK mülakat oluşturabilir" ON public.interviews;

CREATE POLICY "İK mülakat oluşturabilir"
ON public.interviews
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE a.id = interviews.application_id
      AND jp.company_id = p.company_id
      AND p.role IN ('hr', 'company_admin', 'admin', 'platform_admin')
  )
);

-- UPDATE Policy: İK/Company Admin/Admin kullanıcılar mülakat güncelleyebilir
DROP POLICY IF EXISTS "İK mülakat güncelleyebilir" ON public.interviews;

CREATE POLICY "İK mülakat güncelleyebilir"
ON public.interviews
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE a.id = interviews.application_id
      AND jp.company_id = p.company_id
      AND p.role IN ('hr', 'company_admin', 'admin', 'platform_admin')
  )
);

-- DELETE Policy: İK/Company Admin/Admin kullanıcılar mülakat silebilir (opsiyonel)
DROP POLICY IF EXISTS "İK mülakat silebilir" ON public.interviews;

CREATE POLICY "İK mülakat silebilir"
ON public.interviews
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE a.id = interviews.application_id
      AND jp.company_id = p.company_id
      AND p.role IN ('hr', 'company_admin', 'admin', 'platform_admin')
  )
);
```

**FINAL_COMPLETE_SCHEMA.sql'e eklenecek:**

`interviews` RLS bölümüne (satır 1028-1030 arası) şu policy'leri ekle:

```sql
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "İlgili kullanıcılar mülakat görebilir" ON public.interviews FOR SELECT USING (true);
CREATE POLICY "İK mülakat oluşturabilir" ON public.interviews FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE a.id = interviews.application_id
      AND jp.company_id = p.company_id
      AND p.role IN ('hr', 'company_admin', 'admin', 'platform_admin')
  )
);
CREATE POLICY "İK mülakat güncelleyebilir" ON public.interviews FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE a.id = interviews.application_id
      AND jp.company_id = p.company_id
      AND p.role IN ('hr', 'company_admin', 'admin', 'platform_admin')
  )
);
CREATE POLICY "İK mülakat silebilir" ON public.interviews FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE a.id = interviews.application_id
      AND jp.company_id = p.company_id
      AND p.role IN ('hr', 'company_admin', 'admin', 'platform_admin')
  )
);
```

#### 1.5. Başvuru durum geçmişi ve notları

1. `application_status_history` zaten var, SELECT/INSERT policy’leri tanımlı:
   - Bu tabloyu aktif kullanacağız, ek SQL gerekmiyor.
2. `application_notes`:
   - SELECT şu an `USING (true)` (herkes görebiliyor) – ileride daraltmak isteyebilirsin.
   - INSERT: `auth.uid() = created_by` – İK not ekleyebilir.
3. Eğer geliştiriciye gösterilecek notlar olacaksa:
   - Zaten `is_visible_to_developer BOOLEAN` alanı var.
   - Yalnızca bu alanı `TRUE` olan notları geliştirici tarafında göster.

**SQL Kodu (Opsiyonel - İyileştirme):**

Eğer `application_notes` için daha sıkı bir SELECT policy istersen:

```sql
-- Migration: application_notes için daha sıkı SELECT policy (opsiyonel)
-- Dosya: scripts/067_improve_application_notes_rls.sql

-- Mevcut policy'yi kaldır
DROP POLICY IF EXISTS "İlgili kullanıcılar notları görebilir" ON public.application_notes;

-- Yeni policy: 
-- - Geliştirici sadece is_visible_to_developer = true olan notları görebilir
-- - İK/Admin kendi şirketlerinin başvurularının tüm notlarını görebilir
CREATE POLICY "İlgili kullanıcılar notları görebilir"
ON public.application_notes
FOR SELECT
USING (
  -- Geliştirici sadece kendine gösterilen notları görebilir
  (
    is_visible_to_developer = TRUE
    AND EXISTS (
      SELECT 1
      FROM public.applications a
      WHERE a.id = application_notes.application_id
        AND a.developer_id = auth.uid()
    )
  )
  OR
  -- İK/Admin kendi şirketlerinin başvurularının tüm notlarını görebilir
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE a.id = application_notes.application_id
      AND jp.company_id = p.company_id
      AND p.role IN ('hr', 'company_admin', 'admin', 'platform_admin')
  )
  OR
  -- Notu oluşturan kişi her zaman görebilir
  created_by = auth.uid()
);
```

**Not:** Bu iyileştirme opsiyoneldir. Mevcut `USING (true)` policy'si de çalışır, ancak daha güvenli olması için yukarıdaki policy'yi kullanabilirsin.

---

### 2. Backend / Servis Katmanı (opsiyonel ama önerilir)

Amaç: Karmaşık SQL’leri component içinden yazmak yerine **tek bir server action veya API route** üzerinden yönetmek.

#### 2.1. Başvuru statüsü güncelleme servisi

1. `applications` tablosunda statüleri güncellemek için bir server action / route yaz:
   - Girdi: `application_id`, `new_status` (`pending/reviewed/interview/rejected/accepted` vb.), opsiyonel `reason`, `note`.
2. İçeride:
   - `applications.status` alanını güncelle.
   - Aynı transaction içinde `application_status_history` tablosuna kayıt ekle.
3. Yetki kontrolünü RLS’ye bırakabilirsin ama istersen ek kontroller ekle (ör: sadece İK/owner).

#### 2.2. Mülakat oluşturma servisi

1. Yeni bir server action / route:
   - Girdi: `application_id`, `scheduled_at`, `interview_type`, `title`, `description`, `duration_minutes`, vb.
2. İçeride:
   - `interviews` tablosuna insert at.
   - İstersen `application_status_history` içine de “interview scheduled” notu bırak.

#### 2.3. Başvuru notu ekleme servisi

1. `application_notes` için basit bir fonksiyon:
   - Girdi: `application_id`, `title`, `content`, `note_type`, `is_visible_to_developer`.
2. İçeride:
   - `created_by = auth.uid()` ile insert yap.

---

### 3. Frontend – İş İlanı Oluşturma / Düzenleme (İK & Company Admin)

Dosyalar: 
- `app/dashboard/ik/ilanlar/page.tsx`
- İlan oluşturma formu (muhtemelen `app/dashboard/ik/ilanlar/olustur/page.tsx` veya `_components` altında).

#### 3.1. Formda maaş beklentisi ayarları

1. İlan formuna iki yeni alan ekle:
   - `ask_expected_salary` için bir **switch / checkbox**:
     - Label: “Başvuru formunda adaydan maaş beklentisi iste”.
   - `expected_salary_required` için bir **yes/no toggle**:
     - Yalnız `ask_expected_salary = true` olduğunda aktif olsun.
     - Label: “Bu alan zorunlu olsun”.
2. Form submit’inde bu iki alanı `job_postings` tablosuna yaz.

#### 3.2. İlan detay UI iyileştirmeleri (public `is-ilanlari/[id]`)

1. `app/(main)/is-ilanlari/[id]/page.tsx` içinde:
   - İlan başlığının altında maaş aralığı, lokasyon, seviye vb. bilgileri daha belirgin (badge, ikon vb.) yap.
   - “Başvuru Yap” butonunun yanında/altında:
     - Eğer `ask_expected_salary` açıksa, adayın bu ilan için maaş beklentisi isteneceğini kısaca belirt (bilgilendirme text’i).
2. Tasarımı bozmadan Radix/Shadcn bileşenleri ile küçük düzenlemeler ekleyebilirsin (ör. grid/spacing).

---

### 4. Frontend – Başvuru Formu (Geliştirici tarafı)

Dosya: `components/job-apply-modal.tsx`

#### 4.1. İlan ayarlarını çek

1. Modal açılırken sadece CV/cover letter değil, ilgili ilandan da şu alanları çek:
   - `job_postings.ask_expected_salary`
   - `job_postings.expected_salary_required`
2. Bunu yapmak için:
   - Modal’a `jobId` zaten geliyor, supabase ile `job_postings` tablosundan bu iki alanı al.

#### 4.2. Maaş beklentisi input’u

1. State ekle: `expectedSalary` (number veya string).
2. UI:
   - `ask_expected_salary = true` ise:
     - CV ve ön yazı bölümünün altında bir `Input` ekle.
     - Label: “Maaş beklentiniz (aylık, net TL)”.
     - Placeholder: “Örn: 65000”.
3. Validasyon:
   - `expected_salary_required = true` ve kullanıcı değer girmediyse:
     - `toast.error("Lütfen maaş beklentinizi girin")`.
     - `handleApply` içinde başvuruyu göndermeden return et.

#### 4.3. Başvuru insert’ine maaş ekle

1. `supabase.from("applications").insert({ ... })` kısmına şu alanı ekle:
   - `expected_salary: expectedSalary ? Number(expectedSalary) : null`.
2. Gerekirse currency alanını da ekle (`expected_salary_currency: "TRY"`).

---

### 5. Frontend – İK Başvurular Ekranı

Dosya: `app/dashboard/ik/basvurular/page.tsx`

#### 5.1. Sorguyu zenginleştir

1. Supabase select’ini aşağıdaki alanlarla genişlet:
   - `applications.cover_letter`
   - `applications.expected_salary`
   - `cvs:cv_id (file_url, file_name)` join’i (CV için).
2. Select örneği:
   - `select("*, job_postings:job_id(title), profiles:developer_id(full_name,email,phone), cvs:cv_id(file_url,file_name)")`

#### 5.2. Kartta detayları göster

1. Her başvuru kartında:
   - Adayın ismi, ilan başlığı, email/telefon (şimdiki gibi).
   - Eğer `expected_salary` doluysa:
     - “Maaş beklentisi: 65.000 ₺” satırı.
   - Eğer `cover_letter` doluysa:
     - İlk 1–2 satırı kısa olarak göster.
     - “Ön yazıyı görüntüle” linki ile modal aç (tam metin için).
   - Eğer `cvs.file_url` varsa:
     - “CV’yi indir / görüntüle” butonu (`Link` ile yeni sekmede açılabilir).

#### 5.3. Başvuru durumu ve geri bildirim

1. Kartın sağ tarafına bir durum seçici ekle:
   - Dropdown / segmented control: `Bekliyor`, `İncelendi`, `Görüşme`, `Reddedildi`, `Kabul Edildi`.
   - Seçim değişince:
     - 2.1’de yazdığın **status update** server action’ını çağır.
2. Red veya teklif durumunda isteğe bağlı açıklama:
   - Eğer yeni durum `rejected` veya `accepted` ise küçük bir modal açıp:
     - “Geliştiriciye gösterilecek kısa mesaj” alanı iste.
   - Bu mesajı:
     - `application_notes` tablosuna `is_visible_to_developer = TRUE` olacak şekilde kaydet.

#### 5.4. Mülakat planlama

1. Kart içinde “Mülakat Planla” butonu ekle.
2. Modal:
   - Alanlar: `tarih/saat`, `süre`, `tip` (telefon/video/onsite), `başlık`, `açıklama`.
3. Submit’te:
   - 2.2’deki mülakat servis’ini çağır.
   - Durum otomatik olarak `interview` yapılabilir (status update servisini de çağır).

---

### 6. Frontend – Geliştirici `Başvurularım` Ekranı

Dosya: `app/dashboard/gelistirici/basvurular/page.tsx`

#### 6.1. Sorguyu güncelle

1. Select’e şu alanları ekle:
   - `applications.expected_salary`
   - `applications.cover_letter`
   - İsteğe bağlı: Son durum geçmişi veya notlar için:
     - `application_notes` içinden `is_visible_to_developer = true` olanlar (ayrı bir sorgu veya view ile).

#### 6.2. Geri dönüşü göster

1. Kartta:
   - İK tarafından seçilen durum badge’i zaten var.
   - Altına:
     - Eğer `expected_salary` doluysa: “Sizin maaş beklentiniz: ...”.
     - Eğer görünür not varsa: “Şirketten mesaj” başlığı altında metni göster.
2. Mülakat atandıysa:
   - `interviews` tablosundan geliştiriciye de açık olan bilgileri (tarih, tip, açıklama) göster (ilgili RLS’yi çok geniş tutma, ama `SELECT USING (true)` zaten var).

---

### 7. Test Senaryoları (kısaca)

1. **Maaş beklentisi zorunlu değil:**
   - İlan oluştururken `ask_expected_salary = true`, `expected_salary_required = false`.
   - Başvuru formunda alan görünüyor, boş bıraksan da başvuru gidebiliyor.
2. **Maaş beklentisi zorunlu:**
   - `ask_expected_salary = true`, `expected_salary_required = true`.
   - Boş bırakıldığında hata mesajı geliyor, insert çağrılmıyor.
3. **İK CV ve ön yazı görüntüleme:**
   - Aynı şirkete bağlı İK kullanıcısı giriş yapmışken `Başvurular` sayfasında CV linki ve ön yazı modal’ı sorunsuz açılıyor.
4. **Geliştirici geri bildirim görme:**
   - İK başvuruyu `Reddedildi` yapıp kısa mesaj eklediğinde geliştirici `Başvurularım` ekranında hem yeni durumu hem mesajı görebiliyor.

Bu planı adım adım takip ederek önce **veritabanı & RLS**, sonra **backend servisleri**, en son da **frontend ekranlarını** güncelleyebilirsin.

