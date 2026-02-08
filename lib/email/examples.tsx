/**
 * Örnek kullanım dosyası
 * Email template'lerinin nasıl kullanılacağını gösterir
 */

import {
    sendEmail,
    WelcomeEmail,
    welcomeEmailSubject,
    NewMatchEmail,
    newMatchEmailSubject,
    ApplicationSubmittedEmail,
    applicationSubmittedEmailSubject,
} from '@/lib/email';
import { renderEmailTemplate } from '@/lib/email/utils/helpers';

// ============================================
// 1. Hoş Geldiniz Email'i Gönderme
// ============================================
export async function sendWelcomeEmailExample() {
    const props = {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        role: 'developer' as const,
        profileUrl: 'https://www.codecraftx.xyz/dashboard/gelistirici/profil',
    };

    const html = renderEmailTemplate(<WelcomeEmail {...props} />);
    const subject = welcomeEmailSubject(props);

    return sendEmail({
        to: props.email,
        subject,
        html,
        tags: [
            { name: 'category', value: 'auth' },
            { name: 'template', value: 'welcome' },
        ],
    });
}

// ============================================
// 2. Yeni Eşleşme Bildirimi
// ============================================
export async function sendNewMatchExample() {
    const props = {
        developerName: 'Ahmet Yılmaz',
        developerEmail: 'ahmet@example.com',
        jobTitle: 'Senior React Developer',
        companyName: 'TechCorp A.Ş.',
        companyLogo: 'https://www.codecraftx.xyz/uploads/companies/techcorp-logo.png',
        matchScore: 92,
        jobDescription:
            'Remote çalışma modeli ile React, TypeScript ve Next.js teknolojilerinde deneyimli...',
        jobLocation: 'İstanbul (Remote)',
        jobType: 'remote' as const,
        jobUrl: 'https://www.codecraftx.xyz/is-ilanlari/senior-react-developer-123',
    };

    const html = renderEmailTemplate(<NewMatchEmail {...props} />);
    const subject = newMatchEmailSubject(props);

    return sendEmail({
        to: props.developerEmail,
        subject,
        html,
        tags: [
            { name: 'category', value: 'developer' },
            { name: 'template', value: 'new_match' },
            { name: 'match_score', value: props.matchScore.toString() },
        ],
    });
}

// ============================================
// 3. Başvuru Onayı
// ============================================
export async function sendApplicationConfirmationExample() {
    const props = {
        developerName: 'Ahmet Yılmaz',
        jobTitle: 'Senior React Developer',
        companyName: 'TechCorp A.Ş.',
        appliedAt: '5 Şubat 2026, 14:30',
        applicationUrl: 'https://www.codecraftx.xyz/dashboard/gelistirici/basvurular/123',
    };

    const html = renderEmailTemplate(<ApplicationSubmittedEmail {...props} />);
    const subject = applicationSubmittedEmailSubject(props);

    return sendEmail({
        to: 'ahmet@example.com',
        subject,
        html,
        tags: [
            { name: 'category', value: 'developer' },
            { name: 'template', value: 'application_submitted' },
        ],
    });
}

// ============================================
// 4. Server Action İçinden Kullanım
// ============================================
'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function handleNewApplicationAction(
    developerId: string,
    jobId: string
) {
    // Initialize Supabase client
    const supabase = await createServerClient();

    // 1. Başvuruyu veritabanına kaydet
    const { data: application, error } = await supabase
        .from('applications')
        .insert({
            developer_id: developerId,
            job_id: jobId,
            status: 'pending',
        })
        .select(
            `
      *,
      developer:profiles(*),
      job:jobs(*, company:companies(*))
    `
        )
        .single();

    if (error) throw error;

    // 2. Geliştiriciye onay emaili gönder
    const developerProps = {
        developerName: application.developer.full_name,
        jobTitle: application.job.title,
        companyName: application.job.company.name,
        appliedAt: new Date().toLocaleString('tr-TR'),
        applicationUrl: `https://www.codecraftx.xyz/dashboard/gelistirici/basvurular/${application.id}`,
    };

    await sendEmail({
        to: application.developer.email,
        subject: applicationSubmittedEmailSubject(developerProps),
        html: renderEmailTemplate(<ApplicationSubmittedEmail {...developerProps} />),
        tags: [
            { name: 'category', value: 'developer' },
            { name: 'template', value: 'application_submitted' },
        ],
    });

    // 3. İşverene yeni başvuru bildirimi (opsiyonel)
    // ...

    return { success: true, applicationId: application.id };
}

// ============================================
// 5. Toplu Email Gönderimi (Queue Kullanımı)
// ============================================
export async function sendBulkEmailsExample() {
    // TODO: BullMQ veya benzeri queue sistemi ile
    // Şimdilik basit loop ile gösteriyoruz

    const recipients = [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' },
    ];

    const results = await Promise.allSettled(
        recipients.map((recipient) =>
            sendEmail({
                to: recipient.email,
                subject: `Merhaba ${recipient.name}`,
                html: renderEmailTemplate(
                    <WelcomeEmail
                        name={recipient.name}
                        email={recipient.email}
                        role="developer"
                        profileUrl="https://www.codecraftx.xyz/dashboard/gelistirici/profil"
                    />
                ),
            })
        )
    );

    return results;
}
