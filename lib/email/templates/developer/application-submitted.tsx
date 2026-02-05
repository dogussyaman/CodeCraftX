import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { ApplicationSubmittedProps } from '../../types';

export function ApplicationSubmittedEmail({
    developerName,
    jobTitle,
    companyName,
    appliedAt,
    applicationUrl,
}: ApplicationSubmittedProps) {
    return (
        <BaseEmailLayout previewText="Başvurun başarıyla gönderildi">
            <EmailHeader />

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
                        Başvurun Alındı ✅
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
                        <strong>{companyName}</strong> şirketindeki <strong>{jobTitle}</strong> pozisyonu için başvurun başarıyla gönderildi!
                    </p>

                    {/* Application details */}
                    <div
                        style={{
                            backgroundColor: EMAIL_COLORS.background,
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                color: EMAIL_COLORS.textMuted,
                                margin: '0 0 8px',
                            }}
                        >
                            <strong>Pozisyon:</strong> {jobTitle}
                        </p>
                        <p
                            style={{
                                fontSize: '14px',
                                color: EMAIL_COLORS.textMuted,
                                margin: '0 0 8px',
                            }}
                        >
                            <strong>Şirket:</strong> {companyName}
                        </p>
                        <p
                            style={{
                                fontSize: '14px',
                                color: EMAIL_COLORS.textMuted,
                                margin: 0,
                            }}
                        >
                            <strong>Başvuru Tarihi:</strong> {appliedAt}
                        </p>
                    </div>

                    {/* Timeline */}
                    <div
                        style={{
                            borderLeft: `3px solid ${EMAIL_COLORS.primary}`,
                            paddingLeft: '20px',
                            marginBottom: '24px',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: EMAIL_COLORS.text,
                                margin: '0 0 16px',
                            }}
                        >
                            Sırada Ne Var?
                        </p>
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '18px' }}>✅</span>
                            {' '}
                            <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                Başvuru gönderildi
                            </span>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '18px' }}>⏳</span>
                            {' '}
                            <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                Şirket başvurunu inceliyor
                            </span>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '18px' }}>📧</span>
                            {' '}
                            <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                Durum güncellemelerini email ile alacaksın
                            </span>
                        </div>
                    </div>

                    <Button href={applicationUrl}>Başvurumu Görüntüle</Button>

                    <div
                        style={{
                            backgroundColor: '#dbeafe',
                            borderLeft: `4px solid ${EMAIL_COLORS.info}`,
                            padding: '16px',
                            borderRadius: '4px',
                            marginTop: '24px',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                color: EMAIL_COLORS.text,
                                margin: 0,
                            }}
                        >
                            💡 <strong>İpucu:</strong> Şirketler genellikle 3-5 gün içinde yanıt veriyor.
                            Dashboard'undan başvuru durumunu takip edebilirsin.
                        </p>
                    </div>
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export const applicationSubmittedEmailSubject = (props: ApplicationSubmittedProps) =>
    `Başvurun alındı: ${props.jobTitle} - ${props.companyName} ✅`;
