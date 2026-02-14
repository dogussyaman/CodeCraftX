import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Email yapılandırması
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'CodeCraftX <no-reply@codecraftx.xyz>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@codecraftx.xyz',
  admin: process.env.EMAIL_ADMIN || 'admin@codecraftx.xyz',
} as const;
