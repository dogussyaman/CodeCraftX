import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { CompleteProfileReminderProps } from '../../types';

export function CompleteProfileReminderEmail({
    name,
    profileCompletionPercentage,
    missingFields,
    profileUrl,
}: CompleteProfileReminderProps) {
    return (
        <BaseEmailLayout previewText="Profilini tamamla ve fırsatları kaçırma!">
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
                        Profilini Tamamla! 📝
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
                            margin: '0 0 24px',
                        }}
                    >
                        Profilin şu anda <strong>%{profileCompletionPercentage}</strong> tamamlanmış durumda.
                        Tam kapasite ile eşleşmeler almak için eksik bilgilerini tamamlamanı öneriyoruz.
                    </p>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '24px' }}>
                        <div
                            style={{
                                width: '100%',
                                height: '8px',
                                backgroundColor: EMAIL_COLORS.background,
                                borderRadius: '4px',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    width: `${profileCompletionPercentage}%`,
                                    height: '100%',
                                    backgroundColor: EMAIL_COLORS.primary,
                                    transition: 'width 0.3s ease',
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
                            %{profileCompletionPercentage} tamamlandı
                        </p>
                    </div>

                    {/* Missing fields */}
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
                            Eksik Alanlar:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {missingFields.map((field) => (
                                <li
                                    key={field}
                                    style={{
                                        fontSize: '14px',
                                        color: EMAIL_COLORS.textMuted,
                                        marginBottom: '8px',
                                    }}
                                >
                                    {field}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Button href={profileUrl}>Profilimi Tamamla</Button>

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
                            💡 <strong>İpucu:</strong> Tamamlanmış profiller ortalama <strong>3 kat daha fazla</strong> eşleşme alıyor!
                        </p>
                    </div>
                </td>
            </tr>

            <EmailFooter unsubscribeUrl={`${profileUrl}/email-preferences`} />
        </BaseEmailLayout>
    );
}

export const completeProfileReminderEmailSubject = (props: CompleteProfileReminderProps) =>
    `${props.name}, profilini tamamla! (%${props.profileCompletionPercentage} tamamlandı)`;
