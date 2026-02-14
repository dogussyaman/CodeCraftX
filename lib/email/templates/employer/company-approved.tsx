import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { CompanyApprovedProps } from '../../types';

export function CompanyApprovedEmail({
    companyName,
    contactName,
    dashboardUrl,
}: CompanyApprovedProps) {
    return (
        <BaseEmailLayout previewText="Şirket kaydınız onaylandı. İlan yayınlamaya başlayabilirsiniz!">
            <EmailHeader />

            <tr>
                <td style={{ padding: EMAIL_SIZES.contentPadding }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <span style={{ fontSize: '64px' }}>🎉</span>
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
                        Şirket Kaydınız Onaylandı!
                    </h1>

                    <p
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 16px',
                        }}
                    >
                        Merhaba {contactName},
                    </p>

                    <p
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 24px',
                        }}
                    >
                        <strong>{companyName}</strong> şirketiniz CodeCraftX platformunda onaylandı ve artık aktif!
                    </p>

                    <div
                        style={{
                            backgroundColor: '#dcfce7',
                            borderLeft: `4px solid ${EMAIL_COLORS.success}`,
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
                            ✨ Artık Yapabilecekleriniz:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            <li
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                    color: EMAIL_COLORS.text,
                                    marginBottom: '8px',
                                }}
                            >
                                İş ilanı yayınlama
                            </li>
                            <li
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                    color: EMAIL_COLORS.text,
                                    marginBottom: '8px',
                                }}
                            >
                                AI destekli yetenek eşleştirme
                            </li>
                            <li
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                    color: EMAIL_COLORS.text,
                                    marginBottom: '8px',
                                }}
                            >
                                Başvuru yönetimi
                            </li>
                            <li
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '20px',
                                    color: EMAIL_COLORS.text,
                                }}
                            >
                                Aday profil görüntüleme
                            </li>
                        </ul>
                    </div>

                    <Button href={dashboardUrl}>İlk İlanı Yayınla</Button>

                    <div
                        style={{
                            backgroundColor: EMAIL_COLORS.background,
                            padding: '20px',
                            borderRadius: '8px',
                            marginTop: '24px',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                color: EMAIL_COLORS.textMuted,
                                margin: 0,
                            }}
                        >
                            💡 <strong>İpucu:</strong> İlanlarınıza detaylı beceri gereksinimleri eklerseniz,
                            AI eşleştirme algoritması daha doğru adayları bulabilir.
                        </p>
                    </div>
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export const companyApprovedEmailSubject = (props: CompanyApprovedProps) =>
    `🎉 ${props.companyName} onaylandı - İlan yayınlamaya başla!`;
