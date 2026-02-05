'use server';

import {
    WelcomeEmail,
    welcomeEmailSubject,
    NewMatchEmail,
    newMatchEmailSubject,
    ApplicationSubmittedEmail,
    applicationSubmittedEmailSubject,
    sendEmail,
} from '@/lib/email';
import { revalidatePath } from 'next/cache';

export async function sendTestEmailAction(type: string, recipientEmail: string) {
    if (!recipientEmail) {
        return { success: false, error: 'Email adresi gereklidir.' };
    }

    try {
        let result;

        switch (type) {
            case 'welcome':
                const welcomeProps = {
                    name: 'Test Kullanıcısı',
                    email: recipientEmail,
                    role: 'developer' as const,
                    profileUrl: 'https://codecraftx.com/dashboard/gelistirici/profil',
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: welcomeEmailSubject(welcomeProps),
                    react: <WelcomeEmail { ...welcomeProps } />,
                    tags: [{ name: 'test_type', value: 'welcome' }],
                });
                break;

            case 'new_match':
                const matchProps = {
                    developerName: 'Test Geliştirici',
                    developerEmail: recipientEmail,
                    jobTitle: 'Senior React Developer',
                    companyName: 'TechCorp A.Ş.',
                    companyLogo: 'https://codecraftx.com/uploads/companies/techcorp-logo.png',
                    matchScore: 92,
                    jobDescription: 'Remote çalışma modeli ile React, TypeScript ve Next.js teknolojilerinde deneyimli...',
                    jobLocation: 'İstanbul (Remote)',
                    jobType: 'remote' as const,
                    salary: '60.000 - 80.000 TL',
                    jobUrl: 'https://codecraftx.com/is-ilanlari/senior-react-developer-123',
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: newMatchEmailSubject(matchProps),
                    react: <NewMatchEmail { ...matchProps } />,
                    tags: [{ name: 'test_type', value: 'new_match' }],
                });
                break;

            case 'application_submitted':
                const appProps = {
                    developerName: 'Test Geliştirici',
                    jobTitle: 'Senior React Developer',
                    companyName: 'TechCorp A.Ş.',
                    appliedAt: new Date().toLocaleString('tr-TR'),
                    applicationUrl: 'https://codecraftx.com/dashboard/gelistirici/basvurular/123',
                };
                result = await sendEmail({
                    to: recipientEmail,
                    subject: applicationSubmittedEmailSubject(appProps),
                    react: <ApplicationSubmittedEmail { ...appProps } />,
                    tags: [{ name: 'test_type', value: 'application_submitted' }],
                });
                break;

            default:
                return { success: false, error: 'Geçersiz email tipi' };
        }

        revalidatePath('/dashboard/admin/email-test');

        // sendEmail returns { success: boolean, data?: any, error?: any }
        return result;
    } catch (error: any) {
        console.error('Test email error:', error);
        return { success: false, error: error.message };
    }
}

