import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { PasswordChangedEmailProps } from '../../types';

export function PasswordChangedEmail({ name, changedAt }: PasswordChangedEmailProps) {
    return (
        <BaseEmailLayout previewText="Şifren başarıyla değiştirildi">
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
                        Şifre Değiştirildi ✅
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
                        Hesap şifren başarıyla değiştirildi.
                    </p>

                    <div
                        style={{
                            backgroundColor: EMAIL_COLORS.background,
                            padding: '16px',
                            borderRadius: '8px',
                            marginTop: '16px',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                color: EMAIL_COLORS.textMuted,
                                margin: '0 0 8px',
                            }}
                        >
                            <strong>Değişiklik Zamanı:</strong> {changedAt}
                        </p>
                    </div>

                    <div
                        style={{
                            backgroundColor: '#fee2e2',
                            borderLeft: `4px solid ${EMAIL_COLORS.error}`,
                            padding: '16px',
                            borderRadius: '4px',
                            marginTop: '24px',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                color: EMAIL_COLORS.text,
                                margin: '0 0 8px',
                                fontWeight: 600,
                            }}
                        >
                            🔒 Güvenlik Uyarısı:
                        </p>
                        <p
                            style={{
                                fontSize: '14px',
                                lineHeight: '20px',
                                color: EMAIL_COLORS.text,
                                margin: 0,
                            }}
                        >
                            Eğer bu değişikliği sen yapmadıysan, lütfen derhal{' '}
                            <a href="mailto:support@codecraftx.xyz" style={{ color: EMAIL_COLORS.error }}>
                                support@codecraftx.xyz
                            </a>{' '}
                            adresinden bize ulaş.
                        </p>
                    </div>
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export const passwordChangedEmailSubject = () => 'Şifren değiştirildi - CodeCraftX';
