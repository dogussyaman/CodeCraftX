import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { InterviewInvitationProps } from '../../types';

export function InterviewInvitationEmail({
    developerName,
    jobTitle,
    companyName,
    interviewDate,
    interviewTime,
    interviewType,
    interviewLink,
    interviewLocation,
}: InterviewInvitationProps) {
    const typeLabels = {
        video: 'Online Görüşme',
        phone: 'Telefon Görüşmesi',
        onsite: 'Yüz Yüze Görüşme',
    };

    const typeEmojis = {
        video: '💻',
        phone: '📞',
        onsite: '🏢',
    };

    return (
        <BaseEmailLayout previewText={`${interviewDate} tarihinde ${interviewTime}'da görüşme`}>
            <EmailHeader />

            <tr>
                <td style={{ padding: EMAIL_SIZES.contentPadding }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <span style={{ fontSize: '64px' }}>🎉</span>
                    </div>

                    <h1
                        style={{
                            fontSize: '28px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 16px',
                            fontWeight: 700,
                            textAlign: 'center',
                        }}
                    >
                        Görüşme Daveti!
                    </h1>

                    <p
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 16px',
                        }}
                    >
                        Merhaba {developerName},
                    </p>

                    <p
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 24px',
                        }}
                    >
                        Harika haber! <strong>{companyName}</strong> şirketi seni <strong>{jobTitle}</strong> pozisyonu için
                        görüşmeye davet ediyor.
                    </p>

                    {/* Interview details */}
                    <div
                        style={{
                            backgroundColor: EMAIL_COLORS.background,
                            padding: '24px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                        }}
                    >
                        <h3
                            style={{
                                fontSize: '18px',
                                color: EMAIL_COLORS.text,
                                margin: '0 0 16px',
                                fontWeight: 600,
                            }}
                        >
                            📅 Görüşme Detayları
                        </h3>

                        <table role="presentation" style={{ width: '100%' }}>
                            <tr>
                                <td style={{ padding: '8px 0' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: EMAIL_COLORS.text }}>
                                        Tarih:
                                    </span>
                                    {' '}
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                        {interviewDate}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px 0' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: EMAIL_COLORS.text }}>
                                        Saat:
                                    </span>
                                    {' '}
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                        {interviewTime}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px 0' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: EMAIL_COLORS.text }}>
                                        Tür:
                                    </span>
                                    {' '}
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                        {typeEmojis[interviewType]} {typeLabels[interviewType]}
                                    </span>
                                </td>
                            </tr>
                            {interviewLink && (
                                <tr>
                                    <td style={{ padding: '8px 0' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: EMAIL_COLORS.text }}>
                                            Link:
                                        </span>
                                        {' '}
                                        <a
                                            href={interviewLink}
                                            style={{
                                                fontSize: '14px',
                                                color: EMAIL_COLORS.primary,
                                                wordBreak: 'break-all',
                                            }}
                                        >
                                            {interviewLink}
                                        </a>
                                    </td>
                                </tr>
                            )}
                            {interviewLocation && (
                                <tr>
                                    <td style={{ padding: '8px 0' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: EMAIL_COLORS.text }}>
                                            Konum:
                                        </span>
                                        {' '}
                                        <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                            {interviewLocation}
                                        </span>
                                    </td>
                                </tr>
                            )}
                        </table>
                    </div>

                    {interviewLink && <Button href={interviewLink}>Görüşme Linkine Git</Button>}

                    {/* Preparation tips */}
                    <div
                        style={{
                            backgroundColor: '#dcfce7',
                            borderLeft: `4px solid ${EMAIL_COLORS.success}`,
                            padding: '16px',
                            borderRadius: '4px',
                            marginTop: '24px',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: EMAIL_COLORS.text,
                                margin: '0 0 12px',
                            }}
                        >
                            💡 Hazırlık İpuçları:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            <li
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                    color: EMAIL_COLORS.text,
                                    marginBottom: '8px',
                                }}
                            >
                                Şirket hakkında araştırma yap
                            </li>
                            <li
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                    color: EMAIL_COLORS.text,
                                    marginBottom: '8px',
                                }}
                            >
                                CV'ndeki projelerden bahsetmeye hazır ol
                            </li>
                            <li
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                    color: EMAIL_COLORS.text,
                                    marginBottom: '8px',
                                }}
                            >
                                Sorular hazırla
                            </li>
                            <li
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                    color: EMAIL_COLORS.text,
                                }}
                            >
                                {interviewType === 'video' && 'Kamera ve mikrofonu test et'}
                                {interviewType === 'phone' && 'Sessiz bir ortam bul'}
                                {interviewType === 'onsite' && 'Yol tarifi al ve zamanında hareket et'}
                            </li>
                        </ul>
                    </div>

                    <p
                        style={{
                            fontSize: '14px',
                            lineHeight: '20px',
                            color: EMAIL_COLORS.textMuted,
                            marginTop: '24px',
                            textAlign: 'center',
                        }}
                    >
                        Başarılar! 🍀
                    </p>
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export const interviewInvitationEmailSubject = (props: InterviewInvitationProps) =>
    `📅 Görüşme Daveti: ${props.jobTitle} - ${props.companyName}`;
