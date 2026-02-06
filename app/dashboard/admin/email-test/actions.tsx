'use server';

import { createClient } from '@/lib/supabase/server';
import {
    WelcomeEmail,
    welcomeEmailSubject,
    PasswordResetEmail,
    passwordResetEmailSubject,
    PasswordChangedEmail,
    passwordChangedEmailSubject,
    NewMatchEmail,
    newMatchEmailSubject,
    ApplicationSubmittedEmail,
    applicationSubmittedEmailSubject,
    ApplicationStatusChangedEmail,
    applicationStatusChangedEmailSubject,
    InterviewInvitationEmail,
    interviewInvitationEmailSubject,
    CompanyApprovedEmail,
    companyApprovedEmailSubject,
    JobPublishedEmail,
    jobPublishedEmailSubject,
    NewApplicationEmail,
    newApplicationEmailSubject,
    NewSupportTicketEmail,
    newSupportTicketEmailSubject,
    CompanyPendingApprovalEmail,
    companyPendingApprovalEmailSubject,
    MarketingCampaignEmail,
    marketingCampaignEmailSubject,
    ProductUpdateEmail,
    productUpdateEmailSubject,
    sendEmail,
} from '@/lib/email';
import { revalidatePath } from 'next/cache';

const ALLOWED_ROLES = ['admin', 'platform_admin', 'mt'] as const;

export async function sendTestEmailAction(type: string, recipientEmail: string) {
    if (!recipientEmail?.trim()) {
        return { success: false, error: 'Email adresi gereklidir.' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const role = (profile?.role as string) ?? '';
    if (!ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number])) {
        return { success: false, error: 'Bu işlem için yetkiniz yok (Admin veya MT).' };
    }

    try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.codecraftx.xyz';
        let result: { success: boolean; data?: unknown; error?: unknown };

        switch (type) {
            case 'welcome': {
                const props = {
                    name: 'Test Kullanıcısı',
                    email: recipientEmail,
                    role: 'developer' as const,
                    profileUrl: `${siteUrl}/dashboard/gelistirici/profil`,
                    siteUrl,
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: welcomeEmailSubject(props),
                    react: <WelcomeEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'welcome' }],
                });
                break;
            }
            case 'password_reset': {
                const props = {
                    name: 'Test Kullanıcısı',
                    resetUrl: `${siteUrl}/auth/sifre-sifirla?token=test-token`,
                    expiresIn: '1 saat',
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: passwordResetEmailSubject(),
                    react: <PasswordResetEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'password_reset' }],
                });
                break;
            }
            case 'password_changed': {
                const props = {
                    name: 'Test Kullanıcısı',
                    changedAt: new Date().toLocaleString('tr-TR'),
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: 'Şifreniz değiştirildi - CodeCraftX',
                    react: <PasswordChangedEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'password_changed' }],
                });
                break;
            }
            case 'new_match': {
                const props = {
                    developerName: 'Test Geliştirici',
                    developerEmail: recipientEmail,
                    jobTitle: 'Senior React Developer',
                    companyName: 'TechCorp A.Ş.',
                    companyLogo: `${siteUrl}/logo.png`,
                    matchScore: 92,
                    jobDescription: 'Remote çalışma modeli ile React, TypeScript ve Next.js deneyimli...',
                    jobLocation: 'İstanbul (Remote)',
                    jobType: 'remote' as const,
                    salary: '60.000 - 80.000 TL',
                    jobUrl: `${siteUrl}/is-ilanlari/senior-react-developer-123`,
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: newMatchEmailSubject(props),
                    react: <NewMatchEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'new_match' }],
                });
                break;
            }
            case 'application_submitted': {
                const props = {
                    developerName: 'Test Geliştirici',
                    jobTitle: 'Senior React Developer',
                    companyName: 'TechCorp A.Ş.',
                    appliedAt: new Date().toLocaleString('tr-TR'),
                    applicationUrl: `${siteUrl}/dashboard/gelistirici/basvurular`,
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: applicationSubmittedEmailSubject(props),
                    react: <ApplicationSubmittedEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'application_submitted' }],
                });
                break;
            }
            case 'application_status_changed': {
                const props = {
                    developerName: 'Test Geliştirici',
                    jobTitle: 'Senior React Developer',
                    companyName: 'TechCorp A.Ş.',
                    newStatus: 'interview' as const,
                    statusMessage: 'Görüşme tarihi yakında iletilecektir.',
                    applicationUrl: `${siteUrl}/dashboard/gelistirici/basvurular`,
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: applicationStatusChangedEmailSubject(props),
                    react: <ApplicationStatusChangedEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'application_status_changed' }],
                });
                break;
            }
            case 'interview_invitation': {
                const props = {
                    developerName: 'Test Geliştirici',
                    jobTitle: 'Senior React Developer',
                    companyName: 'TechCorp A.Ş.',
                    interviewDate: '15 Mart 2026',
                    interviewTime: '14:00',
                    interviewType: 'video' as const,
                    interviewLink: 'https://meet.example.com/abc',
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: interviewInvitationEmailSubject(props),
                    react: <InterviewInvitationEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'interview_invitation' }],
                });
                break;
            }
            case 'new_application': {
                const props = {
                    companyName: 'TechCorp A.Ş.',
                    hrName: 'Test İK',
                    jobTitle: 'Senior React Developer',
                    candidateName: 'Test Geliştirici',
                    matchScore: 88,
                    applicationUrl: `${siteUrl}/dashboard/ik/basvurular`,
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: newApplicationEmailSubject(props),
                    react: <NewApplicationEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'new_application' }],
                });
                break;
            }
            case 'job_published': {
                const props = {
                    companyName: 'TechCorp A.Ş.',
                    hrName: 'Test İK',
                    jobTitle: 'Senior React Developer',
                    publishedAt: new Date().toLocaleString('tr-TR'),
                    jobUrl: `${siteUrl}/is-ilanlari/123`,
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: jobPublishedEmailSubject(props),
                    react: <JobPublishedEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'job_published' }],
                });
                break;
            }
            case 'company_approved': {
                const props = {
                    companyName: 'TechCorp A.Ş.',
                    contactName: 'Test Yetkili',
                    dashboardUrl: `${siteUrl}/dashboard/company`,
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: companyApprovedEmailSubject(props),
                    react: <CompanyApprovedEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'company_approved' }],
                });
                break;
            }
            case 'new_support_ticket': {
                const props = {
                    ticketId: 'TKT-001',
                    userName: 'Test Kullanıcı',
                    userEmail: recipientEmail,
                    subject: 'Test destek talebi',
                    ticketUrl: `${siteUrl}/dashboard/admin/destek`,
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: newSupportTicketEmailSubject(props),
                    react: <NewSupportTicketEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'new_support_ticket' }],
                });
                break;
            }
            case 'company_pending_approval': {
                const props = {
                    companyName: 'Yeni Şirket A.Ş.',
                    contactName: 'Test İletişim',
                    contactEmail: recipientEmail,
                    reviewUrl: `${siteUrl}/dashboard/admin/sirket-talepleri`,
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: companyPendingApprovalEmailSubject(props),
                    react: <CompanyPendingApprovalEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'company_pending_approval' }],
                });
                break;
            }
            case 'reklam': {
                const props = {
                    title: 'Özel Kampanya: İlk İlanınız Ücretsiz',
                    body: 'Bu ay içinde platforma eklediğiniz ilk ilan için ücret alınmayacaktır. Hemen ilan oluşturup nitelikli adaylarla eşleşin.',
                    ctaText: 'İlan Oluştur',
                    ctaUrl: `${siteUrl}/dashboard/ik/ilanlar/olustur`,
                    recipientName: 'Değerli İşveren',
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: marketingCampaignEmailSubject(props),
                    react: <MarketingCampaignEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'reklam' }],
                });
                break;
            }
            case 'yeni_gelismeler': {
                const props = {
                    title: 'Yeni Gelişmeler - CodeCraftX',
                    updates: [
                        'Kaydettiğim İlanlar: İlanları daha sonra başvurmak için kaydedebilirsiniz.',
                        'Bildirimler: Daha sade ve tür etiketli bildirim kartları.',
                        'Şirket bildirimleri: Şirket yöneticileri ekip içi bildirim gönderebilir.',
                    ],
                    ctaUrl: siteUrl,
                    ctaText: 'Platforma Git',
                    recipientName: 'Kullanıcı',
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: productUpdateEmailSubject(props),
                    react: <ProductUpdateEmail {...props} />,
                    tags: [{ name: 'test_type', value: 'yeni_gelismeler' }],
                });
                break;
            }
            default:
                return { success: false, error: 'Geçersiz email tipi' };
        }

        revalidatePath('/dashboard/admin/email-test');
        if (!result.success && result.error) {
            const err = result.error as unknown;
            return {
                success: false,
                error: typeof err === 'string' ? err : (err as Error)?.message ?? 'Gönderilemedi',
            };
        }
        return result as { success: boolean; error?: string };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
        console.error('Test email error:', error);
        return { success: false, error: message };
    }
}
