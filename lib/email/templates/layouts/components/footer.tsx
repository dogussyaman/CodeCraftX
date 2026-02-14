import { EMAIL_COLORS } from '../../../constants';

interface EmailFooterProps {
    unsubscribeUrl?: string;
}

/**
 * Email footer component
 * Copyright, sosyal medya ve unsubscribe link
 */
export function EmailFooter({ unsubscribeUrl }: EmailFooterProps) {
    return (
        <>
            <tr>
                <td style={{ padding: '0 40px' }}>
                    <hr
                        style={{
                            border: 'none',
                            borderTop: `1px solid ${EMAIL_COLORS.border}`,
                            margin: '32px 0',
                        }}
                    />
                </td>
            </tr>
            <tr>
                <td style={{ padding: '0 40px 40px', textAlign: 'center' }}>
                    {/* Unsubscribe link */}
                    {unsubscribeUrl && (
                        <p
                            style={{
                                fontSize: '12px',
                                color: EMAIL_COLORS.textMuted,
                                marginBottom: '12px',
                            }}
                        >
                            <a
                                href={unsubscribeUrl}
                                style={{
                                    color: EMAIL_COLORS.textMuted,
                                    textDecoration: 'underline',
                                }}
                            >
                                E-posta tercihlerimi güncelle
                            </a>
                        </p>
                    )}

                    {/* Copyright */}
                    <p
                        style={{
                            fontSize: '12px',
                            color: EMAIL_COLORS.textMuted,
                            margin: '8px 0',
                        }}
                    >
                        © 2026 CodeCraftX. Tüm hakları saklıdır.
                    </p>

                    <p
                        style={{
                            fontSize: '12px',
                            color: EMAIL_COLORS.textMuted,
                            margin: '8px 0',
                        }}
                    >
                        CodeCraftX A.Ş. | İstanbul, Türkiye
                    </p>
                </td>
            </tr>
        </>
    );
}
