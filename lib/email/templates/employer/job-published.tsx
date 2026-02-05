import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { JobPublishedProps } from '../../types';

export function JobPublishedEmail({
    companyName,
    hrName,
    jobTitle,
    publishedAt,
    jobUrl,
}: JobPublishedProps) {
    return (
        <BaseEmailLayout previewText="İlanınız yayında ve adaylarla eşleştirme başladı">
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
                        İlan Yayında! 🚀
                    </h1>

                    <p
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 16px',
                        }}
                    >
                        Merhaba {hrName},
                    </p>

                    <p
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 24px',
                        }}
                    >
                        <strong>{jobTitle}</strong> pozisyonu başarıyla yayınlandı ve AI destekli eşleştirme sistemi çalışmaya başladı!
                    </p>

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
                                fontWeight: 600,
                                color: EMAIL_COLORS.text,
                                margin: '0 0 8px',
                            }}
                        >
                            📌 İlan Bilgileri:
                        </p>
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
                            <strong>Yayın Tarihi:</strong> {publishedAt}
                        </p>
                    </div>

                    <Button href={jobUrl}>İlanı Görüntüle</Button>

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
                            🤖 <strong>AI Çalışıyor:</strong> Yapay zeka algoritması ilanınızla eşleşen adayları
                            bulmaya başladı. Eşleşmeler ve başvurular email ile bildirilecek.
                        </p>
                    </div>
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export const jobPublishedEmailSubject = (props: JobPublishedProps) =>
    `İlan yayında: ${props.jobTitle} 🚀`;
