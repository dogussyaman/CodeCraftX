# Email System Documentation

## 📧 Email Template'leri

Bu klasör, CodeCraftX platformunun tüm email template'lerini içerir.

### Klasör Yapısı

```
lib/email/
├── client.ts                    # Resend client konfigürasyonu
├── constants.ts                 # Email sabitleri (renkler, fontlar)
├── types.ts                     # TypeScript interface'leri
├── index.ts                     # Ana export dosyası
│
├── services/
│   └── send.ts                  # Email gönderim servisi
│
└── templates/
    ├── layouts/
    │   ├── base-html.tsx        # Temel HTML layout
    │   └── components/
    │       ├── header.tsx       # Email header (logo)
    │       ├── footer.tsx       # Email footer
    │       └── button.tsx       # CTA button
    │
    ├── auth/                    # Kimlik doğrulama emailler
    │   ├── welcome.tsx
    │   ├── password-reset.tsx
    │   ├── password-changed.tsx
    │   └── complete-profile.tsx
    │
    ├── developer/               # Geliştirici emailler
    │   ├── new-match.tsx
    │   ├── application-submitted.tsx
    │   ├── application-status-changed.tsx
    │   └── interview-invitation.tsx
    │
    ├── employer/                # İşveren emailler
    │   ├── company-approved.tsx
    │   ├── job-published.tsx
    │   ├── new-application.tsx
    │   └── new-candidate-match.tsx
    │
    └── admin/                   # Admin emailler
        ├── new-support-ticket.tsx
        └── company-pending-approval.tsx
```

### MVP Template'leri (15 adet)

✅ **Authentication (4)**
- Welcome Email
- Password Reset
- Password Changed
- Complete Profile Reminder

✅ **Developer (4)**
- New Match Notification
- Application Submitted
- Application Status Changed
- Interview Invitation

✅ **Employer (4)**
- Company Approved
- Job Published
- New Application
- New Candidate Match

✅ **Admin (2)**
- New Support Ticket
- Company Pending Approval

## 🚀 Kullanım

### Email Gönderme Örneği

```typescript
import { sendEmail, WelcomeEmail, welcomeEmailSubject } from '@/lib/email';
import { renderToStaticMarkup } from 'react-dom/server';

// Email template'i render et
const emailHtml = renderToStaticMarkup(
  <WelcomeEmail
    name="Ahmet"
    role="developer"
    profileUrl="https://www.codecraftx.xyz/dashboard/gelistirici/profil"
  />
);

// Email gönder
await sendEmail({
  to: 'ahmet@example.com',
  subject: welcomeEmailSubject({ name: 'Ahmet', role: 'developer' }),
  html: emailHtml,
  tags: [
    { name: 'category', value: 'auth' },
    { name: 'template', value: 'welcome' },
  ],
});
```

### Server Action'dan Kullanım

```typescript
'use server';

import { sendEmail, NewMatchEmail, newMatchEmailSubject } from '@/lib/email';
import { renderToStaticMarkup } from 'react-dom/server';

export async function notifyNewMatch(matchData: NewMatchEmailProps) {
  const html = renderToStaticMarkup(<NewMatchEmail {...matchData} />);
  
  return sendEmail({
    to: matchData.developerEmail,
    subject: newMatchEmailSubject(matchData),
    html,
    tags: [
      { name: 'category', value: 'developer' },
      { name: 'template', value: 'new_match' },
    ],
  });
}
```

## ⚙️ Ortam Değişkenleri

`.env.local` dosyasına ekle:

```bash
# Resend API Key
RESEND_API_KEY=re_xxxxx

# Email adresleri
EMAIL_FROM=CodeCraftX <no-reply@codecraftx.xyz>
EMAIL_REPLY_TO=support@codecraftx.xyz
EMAIL_ADMIN=admin@codecraftx.xyz

# Site URL (email içindeki linkler için)
NEXT_PUBLIC_SITE_URL=https://www.codecraftx.xyz
```

## 🎨 Template Özellikleri

- ✅ Responsive design (mobil uyumlu)
- ✅ Email client uyumluluğu (Gmail, Outlook vb.)
- ✅ Inline CSS (email clientler için)
- ✅ Dark mode safe renkler
- ✅ Type-safe props (TypeScript)
- ✅ Ortak layout kullanımı
- ✅ Reusable componentler

## 📝 Yeni Template Ekleme

1. `templates/` altında ilgili klasöre yeni `.tsx` dosyası oluştur
2. Template componentini ve subject fonksiyonunu yaz
3. `types.ts`'e props interface'i ekle
4. `index.ts`'e export ekle

## 🔍 Testing

Email preview için (development ortamında):
- Preview route eklenebilir: `/api/email/preview/[template]`
- Resend Dashboard'dan test gönderimi yapılabilir

## 📚 Referanslar

- [Resend Documentation](https://resend.com/docs)
- [Email Client CSS Support](https://www.campaignmonitor.com/css/)
