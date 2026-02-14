import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { NewSupportTicketProps } from '../../types';

export function NewSupportTicketEmail({
    ticketId,
    userName,
    userEmail,
    subject,
    ticketUrl,
}: NewSupportTicketProps) {
    return (
        <BaseEmailLayout previewText={`${userName} destek talep etti`}>
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
                        🎫 Yeni Destek Talebi
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
                                        Ticket ID:
                                    </span>
                                    {' '}
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                        #{ticketId}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px 0' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: EMAIL_COLORS.text }}>
                                        Kullanıcı:
                                    </span>
                                    {' '}
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                        {userName}
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
                                        {userEmail}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px 0' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: EMAIL_COLORS.text }}>
                                        Konu:
                                    </span>
                                    {' '}
                                    <span style={{ fontSize: '14px', color: EMAIL_COLORS.textMuted }}>
                                        {subject}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <Button href={ticketUrl}>Talebi Görüntüle</Button>
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export const newSupportTicketEmailSubject = (props: NewSupportTicketProps) =>
    `🎫 Yeni destek talebi #${props.ticketId}: ${props.subject}`;
