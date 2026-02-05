import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { CompanyPendingApprovalProps } from '../../types';

export function CompanyPendingApprovalEmail({
    companyName,
    contactName,
    contactEmail,
    reviewUrl,
}: CompanyPendingApprovalProps) {
    return (
        <BaseEmailLayout previewText={`${companyName} platformda şirket kaydı oluşturdu`}>
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
                        🏢 Yeni Şirket Onay Bekliyor
                    </h1>

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
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: EMAIL_COLORS.text }}>
                                        Şirket Adı:
                                    </span>
                                    {' '}
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                        {companyName}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px 0' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: EMAIL_COLORS.text }}>
                                        İletişim Kişisi:
                                    </span>
                                    {' '}
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                        {contactName}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px 0' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: EMAIL_COLORS.text }}>
                                        Email:
                                    </span>
                                    {' '}
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                        {contactEmail}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <Button href={reviewUrl}>Şirketi İncele ve Onayla</Button>

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
                                margin: 0,
                            }}
                        >
                            ⚠️ <strong>Onay Gerekli:</strong> Şirket bilgilerini kontrol edip onaylayana
                            kadar şirket iş ilanı yayınlayamaz.
                        </p>
                    </div>
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export const companyPendingApprovalEmailSubject = (props: CompanyPendingApprovalProps) =>
    `🏢 Yeni şirket onay bekliyor: ${props.companyName}`;
