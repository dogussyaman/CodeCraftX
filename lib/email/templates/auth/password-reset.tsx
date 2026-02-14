import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { PasswordResetEmailProps } from '../../types';

export function PasswordResetEmail({ name, resetUrl, expiresIn }: PasswordResetEmailProps) {
    return (
        <BaseEmailLayout previewText="Şifreni sıfırlamak için bu linke tıkla">
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
                        Şifre Sıfırlama
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
                        Şifreni sıfırlama talebinde bulundun. Aşağıdaki butona tıklayarak yeni şifreni oluşturabilirsin.
                    </p>

                    <Button href={resetUrl}>Şifremi Sıfırla</Button>

                    <div
                        style={{
                            backgroundColor: '#fef3c7',
                            borderLeft: `4px solid ${EMAIL_COLORS.warning}`,
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
                            ⚠️ Önemli:
                        </p>
                        <p
                            style={{
                                fontSize: '14px',
                                lineHeight: '20px',
                                color: EMAIL_COLORS.text,
                                margin: 0,
                            }}
                        >
                            Bu link <strong>{expiresIn}</strong> geçerlidir. Eğer sen talep etmediysen bu emaili görmezden gelebilirsin.
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
                        Buton çalışmıyorsa aşağıdaki linki kopyalayıp tarayıcına yapıştırabilirsin:
                        <br />
                        <a
                            href={resetUrl}
                            style={{
                                color: EMAIL_COLORS.primary,
                                wordBreak: 'break-all',
                                fontSize: '12px',
                            }}
                        >
                            {resetUrl}
                        </a>
                    </p>
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export const passwordResetEmailSubject = () => 'Şifre sıfırlama talebi - CodeCraftX';
