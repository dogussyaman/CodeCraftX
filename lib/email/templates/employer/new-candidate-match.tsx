import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { NewCandidateMatchProps } from '../../types';

export function NewCandidateMatchEmail({
    companyName,
    hrName,
    jobTitle,
    candidateName,
    matchScore,
    profileUrl,
}: NewCandidateMatchProps) {
    return (
        <BaseEmailLayout previewText="Yeni bir yetenek ilanınla eşleşti!">
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
                        Yeni Aday Eşleşti! 🎯
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
                        <strong>{candidateName}</strong>, <strong>{jobTitle}</strong> ilanınla {' '}
                        <strong style={{ color: EMAIL_COLORS.primary }}>%{matchScore}</strong> eşleşiyor!
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
                                margin: '0 0 12px',
                            }}
                        >
                            🎯 Eşleşme Detayları:
                        </p>
                        <div
                            style={{
                                width: '100%',
                                height: '10px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '5px',
                                overflow: 'hidden',
                                marginBottom: '8px',
                            }}
                        >
                            <div
                                style={{
                                    width: `${matchScore}%`,
                                    height: '100%',
                                    backgroundColor: EMAIL_COLORS.primary,
                                }}
                            />
                        </div>
                        <p
                            style={{
                                fontSize: '12px',
                                color: EMAIL_COLORS.textMuted,
                                textAlign: 'right',
                            }}
                        >
                            %{matchScore} eşleşme
                        </p>
                    </div>

                    <Button href={profileUrl}>Profili İncele</Button>

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
                            💡 <strong>İpucu:</strong> Eşleşme skoruna göre adaylar otomatik olarak sıralanıyor.
                            Profili inceleyip görüşme daveti gönderebilirsiniz.
                        </p>
                    </div>
                </td>
            </tr>

            <EmailFooter unsubscribeUrl={`${profileUrl.split('/profile')[0]}/email-preferences`} />
        </BaseEmailLayout>
    );
}

export const newCandidateMatchEmailSubject = (props: NewCandidateMatchProps) =>
    `%${props.matchScore} eşleşen aday: ${props.candidateName} - ${props.jobTitle}`;
