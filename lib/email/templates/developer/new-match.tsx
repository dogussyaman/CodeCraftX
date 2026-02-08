import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { NewMatchEmailProps } from '../../types';

export function NewMatchEmail({
    developerName,
    jobTitle,
    companyName,
    companyLogo,
    matchScore,
    jobDescription,
    jobLocation,
    jobType,
    jobUrl,
}: NewMatchEmailProps) {
    const jobTypeLabels = {
        remote: 'Uzaktan',
        hybrid: 'Hibrit',
        onsite: 'Ofiste',
    };

    return (
        <BaseEmailLayout previewText={`${companyName} şirketi senin profilinle ilgileniyor!`}>
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
                        Yeni Eşleşme! 🎯
                    </h1>

                    <p
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.textMuted,
                            margin: '0 0 24px',
                        }}
                    >
                        Profilinle <strong style={{ color: EMAIL_COLORS.primary }}>%{matchScore}</strong> eşleşme
                    </p>

                    {/* Company section */}
                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        {companyLogo && (
                            <img
                                src={companyLogo}
                                alt={companyName}
                                width="80"
                                height="80"
                                style={{
                                    borderRadius: '50%',
                                    marginBottom: '12px',
                                }}
                            />
                        )}
                    </div>

                    <h2
                        style={{
                            fontSize: '22px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 8px',
                            fontWeight: 600,
                        }}
                    >
                        {jobTitle}
                    </h2>

                    <p
                        style={{
                            fontSize: '16px',
                            color: EMAIL_COLORS.textMuted,
                            margin: '0 0 24px',
                        }}
                    >
                        {companyName}
                    </p>

                    {/* Job details */}
                    <div
                        style={{
                            backgroundColor: EMAIL_COLORS.background,
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                        }}
                    >
                        <table role="presentation" style={{ width: '100%' }}>
                            <tr>
                                <td style={{ padding: '8px 0' }}>
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>📍</span>
                                    {' '}
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.text }}>{jobLocation}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px 0' }}>
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>💼</span>
                                    {' '}
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.text }}>{jobTypeLabels[jobType]}</span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    {/* Job description preview */}
                    <p
                        style={{
                            fontSize: '14px',
                            lineHeight: '22px',
                            color: EMAIL_COLORS.textMuted,
                            marginBottom: '24px',
                            fontStyle: 'italic',
                        }}
                    >
                        "{jobDescription.substring(0, 200)}..."
                    </p>

                    <Button href={jobUrl}>İlanı İncele ve Başvur</Button>

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
                            🤖 <strong>AI Eşleştirme:</strong> Bu pozisyon senin becerilerin ve deneyiminle yüksek oranda eşleşiyor.
                            Başvuru yapmanı öneririz!
                        </p>
                    </div>
                </td>
            </tr>

            <EmailFooter unsubscribeUrl={`${jobUrl.split('/jobs')[0]}/email-preferences`} />
        </BaseEmailLayout>
    );
}

export const newMatchEmailSubject = (props: NewMatchEmailProps) =>
    `🎯 %${props.matchScore} Eşleşme: ${props.jobTitle} - ${props.companyName}`;
