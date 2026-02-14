import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { NewApplicationProps } from '../../types';

export function NewApplicationEmail({
    companyName,
    hrName,
    jobTitle,
    candidateName,
    matchScore,
    applicationUrl,
}: NewApplicationProps) {
    return (
        <BaseEmailLayout previewText={`${candidateName} ${jobTitle} pozisyonuna başvurdu`}>
            <EmailHeader />

            <tr>
                <td style={{ padding: EMAIL_SIZES.contentPadding }}>
                    <h1
                        style={{
                            fontSize: '28px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 8px',
                            fontWeight: 700,
                        }}
                    >
                        Yeni Başvuru! 📬
                    </h1>

                    <p
                        style={{
                            fontSize: '16px',
                            color: EMAIL_COLORS.textMuted,
                            margin: '0 0 24px',
                        }}
                    >
                        %{matchScore} eşleşme
                    </p>

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
                        <strong>{candidateName}</strong>, <strong>{jobTitle}</strong> pozisyonuna başvurdu.
                    </p>

                    <div
                        style={{
                            backgroundColor: EMAIL_COLORS.background,
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                        }}
                    >
                        {/* Match score */}
                        <div style={{ marginBottom: '16px' }}>
                            <p
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: EMAIL_COLORS.text,
                                    margin: '0 0 8px',
                                }}
                            >
                                🎯 Eşleşme Skoru
                            </p>
                            <div
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        width: `${matchScore}%`,
                                        height: '100%',
                                        backgroundColor: matchScore >= 80 ? EMAIL_COLORS.success : EMAIL_COLORS.primary,
                                    }}
                                />
                            </div>
                            <p
                                style={{
                                    fontSize: '12px',
                                    color: EMAIL_COLORS.textMuted,
                                    marginTop: '8px',
                                    textAlign: 'right',
                                }}
                            >
                                %{matchScore}
                            </p>
                        </div>

                        <p
                            style={{
                                fontSize: '14px',
                                color: EMAIL_COLORS.textMuted,
                                margin: 0,
                            }}
                        >
                            <strong>Aday:</strong> {candidateName}
                            <br />
                            <strong>Pozisyon:</strong> {jobTitle}
                        </p>
                    </div>

                    <Button href={applicationUrl}>Başvuruyu İncele</Button>

                    {matchScore >= 80 && (
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
                                    color: EMAIL_COLORS.text,
                                    margin: 0,
                                }}
                            >
                                🌟 <strong>Yüksek Eşleşme:</strong> Bu aday, pozisyon gereksinimleriyle yüksek oranda
                                eşleşiyor. İncelemenizi öneririz!
                            </p>
                        </div>
                    )}
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export const newApplicationEmailSubject = (props: NewApplicationProps) =>
    `Yeni başvuru: ${props.candidateName} - ${props.jobTitle} (%${props.matchScore} eşleşme)`;
