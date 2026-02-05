import { resend, EMAIL_CONFIG } from '../client';
import type { SendEmailOptions } from '../types';

/**
 * Email gönderim servisi
 * Resend API kullanarak email gönderir
 */
export async function sendEmail({
    to,
    subject,
    html,
    react,
    replyTo = EMAIL_CONFIG.replyTo,
    tags = [],
}: SendEmailOptions) {
    try {
        const recipients = Array.isArray(to) ? to : [to];

        const payload: Parameters<typeof resend.emails.send>[0] = {
            from: EMAIL_CONFIG.from,
            to: recipients,
            subject,
            replyTo,
            tags: [
                ...tags,
                { name: 'environment', value: process.env.NODE_ENV || 'development' },
            ],
        };

        if (react) {
            // Tercihen React tree üzerinden render
            (payload as any).react = react;
        } else if (html) {
            (payload as any).html = html;
        } else {
            throw new Error('sendEmail: either html or react content must be provided');
        }

        const { data, error } = await resend.emails.send(payload);

        if (error) {
            console.error('[Email Error]', error);
            throw new Error(`Email send failed: ${error.message}`);
        }

        console.log('[Email Sent]', { to: recipients, subject, id: data?.id });
        return { success: true, data };
    } catch (error) {
        console.error('[Email Send Exception]', error);
        return { success: false, error };
    }
}

/**
 * Email logunu veritabanına kaydeder (opsiyonel)
 */
export async function logEmail(log: {
    recipient: string;
    templateName: string;
    subject: string;
    status: string;
    resendId?: string;
    errorMessage?: string;
}) {
    // TODO: Supabase email_logs tablosuna kaydet
    console.log('[Email Log]', log);
}
