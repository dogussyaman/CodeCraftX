import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { WelcomeEmailProps } from '../../types';

export function WelcomeEmail({ name, role, profileUrl, siteUrl: siteUrlProp }: WelcomeEmailProps) {
    const baseUrl = siteUrlProp ?? (typeof profileUrl === 'string' && profileUrl ? new URL(profileUrl).origin : 'https://www.codecraftx.xyz');
    const roleText = {
        developer: 'Geliştirici',
        employer: 'İşveren',
        hr: 'İK Uzmanı',
    }[role];

    return (
        <BaseEmailLayout previewText="CodeCraftX yolculuğuna başlamak için profilini tamamla">
            <EmailHeader />

            {/* Content */}
            <tr>
                <td style={{ padding: EMAIL_SIZES.contentPadding }}>
                    <h1
                        style={{
                            fontSize: '28px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 16px',
                            fontWeight: 700,
                        }}
                    >
                        Hoş Geldin! 🎉
                    </h1>

                    <p
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 16px',
                        }}
                    >
                        Merhaba {name},
                    </p>

                    <p
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 16px',
                        }}
                    >
                        CodeCraftX ailesine katıldığın için çok mutluyuz! <strong>{roleText}</strong> olarak platformumuza hoş geldin.
                    </p>

                    <p
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 24px',
                        }}
                    >
                        Hemen profilini tamamlayarak başlayabilirsin. Eksiksiz profiller {' '}
                        <strong style={{ color: EMAIL_COLORS.primary }}>3 kat daha fazla eşleşme</strong> alıyor!
                    </p>

                    <Button href={profileUrl}>Profili Tamamla</Button>

                    <p
                        style={{
                            fontSize: '14px',
                            lineHeight: '22px',
                            color: EMAIL_COLORS.text,
                            margin: '20px 0 0',
                        }}
                    >
                        Blog yazılarımızı inceleyebilir ve topluluk projelerine göz atabilirsin:{' '}
                        <a href={`${baseUrl}/blog`} style={{ color: EMAIL_COLORS.primary }}>Blog</a>
                        {' · '}
                        <a href={`${baseUrl}/projeler`} style={{ color: EMAIL_COLORS.primary }}>Projeler</a>
                    </p>

                    <div
                        style={{
                            backgroundColor: EMAIL_COLORS.background,
                            padding: '20px',
                            borderRadius: '8px',
                            marginTop: '24px',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                color: EMAIL_COLORS.textMuted,
                                margin: '0 0 12px',
                                fontWeight: 600,
                            }}
                        >
                            💡 İpucu:
                        </p>
                        <p
                            style={{
                                fontSize: '14px',
                                lineHeight: '20px',
                                color: EMAIL_COLORS.textMuted,
                                margin: 0,
                            }}
                        >
                            {role === 'developer'
                                ? 'CV\'ni yükle, becerilerini ekle ve projelerini paylaş. Böylece sana en uygun iş ilanlarını bulabiliriz!'
                                : 'Şirket bilgilerini tamamla ve ilk ilanını yayınla. Yapay zeka destekli eşleştirme ile en uygun adayları bul!'}
                        </p>
                    </div>

                    <p
                        style={{
                            fontSize: '14px',
                            lineHeight: '20px',
                            color: EMAIL_COLORS.textMuted,
                            marginTop: '32px',
                        }}
                    >
                        Sorularınız için{' '}
                        <a
                            href="mailto:support@codecraftx.xyz"
                            style={{ color: EMAIL_COLORS.primary }}
                        >
                            support@codecraftx.xyz
                        </a>{' '}
                        adresinden bize ulaşabilirsin.
                    </p>
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export const welcomeEmailSubject = (props: WelcomeEmailProps) =>
    `Hoş geldin, ${props.name}! 🎉`;
