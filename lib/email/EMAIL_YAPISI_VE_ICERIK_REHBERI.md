# E-posta Yapısı ve İçerik Güncelleme Rehberi

Admin panelinden test e-postaları **Resend API** ile gerçekten gönderilir. Aşağıda e-posta sisteminin yapısı ve **içeriği / görünümü nerede değiştireceğiniz** tek tek yazıyor.

---

## 1) Admin test sayfası (e-postaları nereden gönderiyorsunuz?)

| Ne | Dosya / Yer |
|----|--------------|
| **Sayfa (UI)** | [`app/dashboard/admin/email-test/page.tsx`](../app/dashboard/admin/email-test/page.tsx) |
| **Gönderim mantığı** | [`app/dashboard/admin/email-test/actions.tsx`](../app/dashboard/admin/email-test/actions.tsx) |

- **page.tsx:** E-posta adresi girişi ve gruplar (Auth, Geliştirici, İşveren, Admin, Reklam). Yeni bir “tip” eklemek veya grupları değiştirmek için bu dosyadaki `EMAIL_GROUPS` dizisini düzenleyin.
- **actions.tsx:** Her e-posta tipi için hangi şablonun kullanıldığı ve **test için kullanılan props** (isim, şirket adı, linkler vb.) burada. Sadece test verisini değiştirmek için ilgili `case` bloğundaki `props` objesini güncelleyin. **Asıl e-posta metni ve tasarımı şablon dosyalarındadır** (aşağıda).

---

## 2) E-posta içeriğini nerede değiştirirsiniz? (Şablonlar)

Her e-posta tipinin **görünen metni ve HTML yapısı** aşağıdaki **tek bir .tsx dosyasında**. İçerik / metin / buton metni değiştirmek için ilgili şablonu açın.

### Auth (giriş, şifre, profil)

| Test panelindeki adı | İçeriği değiştirdiğiniz dosya |
|----------------------|-------------------------------|
| Hoş Geldiniz | `lib/email/templates/auth/welcome.tsx` |
| Şifre Sıfırlama | `lib/email/templates/auth/password-reset.tsx` |
| Şifre Değiştirildi | `lib/email/templates/auth/password-changed.tsx` |

*(Complete Profile şablonu var ama test panelinde buton yok; gerekirse `lib/email/templates/auth/complete-profile.tsx`)*

### Geliştirici (eşleşme, başvuru)

| Test panelindeki adı | İçeriği değiştirdiğiniz dosya |
|----------------------|-------------------------------|
| Yeni Eşleşme | `lib/email/templates/developer/new-match.tsx` |
| Başvuru Onayı | `lib/email/templates/developer/application-submitted.tsx` |
| Başvuru Durumu | `lib/email/templates/developer/application-status-changed.tsx` |
| Görüşme Daveti | `lib/email/templates/developer/interview-invitation.tsx` |

### İşveren / İK

| Test panelindeki adı | İçeriği değiştirdiğiniz dosya |
|----------------------|-------------------------------|
| Yeni Başvuru | `lib/email/templates/employer/new-application.tsx` |
| İlan Yayında | `lib/email/templates/employer/job-published.tsx` |
| Şirket Onayı | `lib/email/templates/employer/company-approved.tsx` |

### Admin (destek, onay)

| Test panelindeki adı | İçeriği değiştirdiğiniz dosya |
|----------------------|-------------------------------|
| Yeni Destek Talebi | `lib/email/templates/admin/new-support-ticket.tsx` |
| Şirket Onay Bekliyor | `lib/email/templates/admin/company-pending-approval.tsx` |

### Reklam & Duyurular

| Test panelindeki adı | İçeriği değiştirdiğiniz dosya |
|----------------------|-------------------------------|
| Reklam / Kampanya | `lib/email/templates/admin/marketing-campaign.tsx` |
| Yeni Gelişmeler | `lib/email/templates/admin/product-update.tsx` |

---

## 3) Tüm e-postaların ortak görünümü (layout)

Tüm şablonlar **aynı iskeleti** kullanıyor. Bunu değiştirirseniz **her e-postanın** üstü, altı ve genel kutusu değişir.

| Ne değişecek | Dosya |
|--------------|--------|
| **Genel kutu, arka plan, genel stiller** | `lib/email/templates/layouts/base-html.tsx` |
| **Üst kısım (logo, üst bant)** | `lib/email/templates/layouts/components/header.tsx` |
| **Alt kısım (telif, adres, “E-posta tercihlerimi güncelle”)** | `lib/email/templates/layouts/components/footer.tsx` |
| **Buton stili (CTA)** | `lib/email/templates/layouts/components/button.tsx` |

Örnek: Logo URL’ini veya “© 2026 CodeCraftX” metnini değiştirmek → `header.tsx` ve `footer.tsx`.

---

## 4) Renkler ve fontlar (tüm e-postalar)

Tek yerden yönetilir; bir dosyayı değiştirirseniz tüm şablonlara yansır.

| Dosya | İçerik |
|-------|--------|
| **`lib/email/constants.ts`** | `EMAIL_COLORS` (primary, background, text, textMuted, border, success, warning, error, info), `EMAIL_FONTS`, `EMAIL_SIZES` (maxWidth, headerPadding, contentPadding) |

Örnek: Ana vurgu rengini veya kart arka plan rengini değiştirmek → `constants.ts` içindeki `EMAIL_COLORS`.

---

## 5) Konu satırı (subject) nerede?

Her şablonda hem **React bileşeni** hem de **konu satırı fonksiyonu** export edilir. Konu satırını değiştirmek için:

- İlgili şablon dosyasının **sonunda** `export const ...EmailSubject = (...)` veya `export function ...EmailSubject(...)` şeklinde tanımlı fonksiyonu bulun.
- Örnek: `welcome.tsx` → `welcomeEmailSubject(props)`; `new-match.tsx` → `newMatchEmailSubject(props)`.

Konu satırı bazen **actions.tsx** içinde doğrudan string de yazılı olabilir (örn. `password_changed` için `'Şifreniz değiştirildi - CodeCraftX'`). O zaman ya şablondaki subject fonksiyonunu kullanın ya da actions’taki sabit metni değiştirin.

---

## 6) Akış özeti (hangi sayfa / yapı ne işe yarıyor?)

```
Admin: Email Test sayfası (page.tsx)
   → "Test Et" tıklanınca actions.tsx içindeki sendTestEmailAction(tip, email) çalışır
   → actions.tsx ilgili tip için props üretir ve lib/email’den şablon + sendEmail çağırır
   → lib/email/services/send.ts → Resend API ile gerçek e-posta gider

İçerik/görünüm:
   → Her e-posta tipi = lib/email/templates/.../ ilgili .tsx (içerik burada)
   → Ortak üst/alt/renk = layouts (base-html, header, footer, button) + constants.ts
```

---

## 7) Hızlı referans: “Şunu değiştireceğim” → Dosya

| Değiştirmek istediğiniz | Dosya / yer |
|-------------------------|-------------|
| Test sayfasındaki gruplar veya butonlar | `app/dashboard/admin/email-test/page.tsx` → `EMAIL_GROUPS` |
| Test e-postasında giden örnek isim, şirket, link | `app/dashboard/admin/email-test/actions.tsx` → ilgili `case` içindeki `props` |
| Belirli bir e-postanın metni / HTML’i | `lib/email/templates/.../` ilgili şablon .tsx (yukarıdaki tablolar) |
| Logo, üst bant | `lib/email/templates/layouts/components/header.tsx` |
| Alt yazı, telif, adres | `lib/email/templates/layouts/components/footer.tsx` |
| Genel kutu ve body stili | `lib/email/templates/layouts/base-html.tsx` |
| Renkler, fontlar, padding | `lib/email/constants.ts` |
| E-posta konu satırı | İlgili şablon dosyasının sonundaki `...EmailSubject` fonksiyonu veya actions’taki subject |

Bu rehberi takip ederek hem sayfa bazlı (admin test sayfası, layout sayfaları) hem de içerik bazlı (her e-posta tipi için tek şablon) güncellemelerinizi yapabilirsiniz.
