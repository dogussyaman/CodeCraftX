import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { ApplicationStatusChangedProps } from '../../types';

export function ApplicationStatusChangedEmail({
    developerName,
    jobTitle,
    companyName,
    newStatus,
    statusMessage,
    applicationUrl,
}: ApplicationStatusChangedProps) {
    const statusConfig = {
        reviewing: {
            title: 'Başvurun İnceleniyor 👀',
            emoji: '⏳',
            message: 'Başvurun şirket tarafından inceleme aşamasına alındı.',
            color: EMAIL_COLORS.info,
        },
        shortlisted: {
            title: 'Kısa Listeye Alındın! 🌟',
            emoji: '⭐',
            message: 'Tebrikler! Ön elemeyi geçtin ve kısa listeye alındın.',
            color: EMAIL_COLORS.success,
        },
        interview: {
            title: 'Görüşme Daveti! 🎉',
            emoji: '🎉',
            message: 'Harika haber! Görüşme için davet edildin.',
            color: EMAIL_COLORS.success,
        },
        offer: {
            title: 'Teklif Aldın! 🎊',
            emoji: '🎊',
            message: 'Tebrikler! Şirket sana iş teklifi sunmak istiyor.',
            color: EMAIL_COLORS.success,
        },
        rejected: {
            title: 'Başvuru Durumu',
            emoji: '💙',
            message: 'Maalesef bu sefer olmadı, ama pes etme!',
            color: EMAIL_COLORS.textMuted,
        },
    };

    const config = statusConfig[newStatus];

    return (
        <BaseEmailLayout previewText={config.message}>
            <EmailHeader />

            <tr>
                <td style={{ padding: EMAIL_SIZES.contentPadding }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <span style={{ fontSize: '48px' }}>{config.emoji}</span>
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
                        {config.title}
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
                        <strong>{companyName}</strong> şirketindeki <strong>{jobTitle}</strong> pozisyonu için
                        başvuru durumun güncellendi.
                    </p>

                    <div
                        style={{
                            backgroundColor: EMAIL_COLORS.background,
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            borderLeft: `4px solid ${config.color}`,
                        }}
                    >
                        <p
                            style={{
                                fontSize: '16px',
                                color: EMAIL_COLORS.text,
                                margin: 0,
                                fontWeight: 600,
                            }}
                        >
                            {config.message}
                        </p>
                    </div>

                    {statusMessage && (
                        <div
                            style={{
                                backgroundColor: '#f9fafb',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '24px',
                            }}
                        >
                            <p
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: EMAIL_COLORS.text,
                                    margin: '0 0 8px',
                                }}
                            >
                                Şirketten Mesaj:
                            </p>
                            <p
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                    color: EMAIL_COLORS.textMuted,
                                    margin: 0,
                                    fontStyle: 'italic',
                                }}
                            >
                                "{statusMessage}"
                            </p>
                        </div>
                    )}

                    <Button href={applicationUrl}>Başvuru Detaylarını Gör</Button>

                    {newStatus === 'rejected' && (
                        <div
                            style={{
                                backgroundColor: '#dbeafe',
                                padding: '16px',
                                borderRadius: '8px',
                                marginTop: '24px',
                            }}
                        >
                            <p
                                style={{
                                    fontSize: '14px',
                                    color: EMAIL_COLORS.text,
                                    margin: '0 0 12px',
                                    fontWeight: 600,
                                }}
                            >
                                💪 Vazgeçme!
                            </p>
                            <p
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                    color: EMAIL_COLORS.textMuted,
                                    margin: 0,
                                }}
                            >
                                Sana uygun başka fırsatlar var. Dashboard'una göz at ve başvurmaya devam et!
                            </p>
                        </div>
                    )}
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export const applicationStatusChangedEmailSubject = (props: ApplicationStatusChangedProps) => {
    const statusTitles = {
        reviewing: 'Başvurun inceleniyor',
        shortlisted: 'Kısa listeye alındın!',
        interview: '🎉 Görüşme daveti',
        offer: '🎊 İş teklifi aldın',
        rejected: 'Başvuru durumu güncellendi',
    };

    return `${statusTitles[props.newStatus]}: ${props.jobTitle}`;
};
