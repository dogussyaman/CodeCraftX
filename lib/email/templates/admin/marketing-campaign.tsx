import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { MarketingCampaignEmailProps } from '../../types';

export function MarketingCampaignEmail({
    title,
    body,
    ctaText,
    ctaUrl,
    recipientName,
}: MarketingCampaignEmailProps) {
    return (
        <BaseEmailLayout previewText={title}>
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
                        {title}
                    </h1>

                    {recipientName && (
                        <p
                            style={{
                                fontSize: '16px',
                                lineHeight: '24px',
                                color: EMAIL_COLORS.text,
                                margin: '0 0 16px',
                            }}
                        >
                            Merhaba {recipientName},
                        </p>
                    )}

                    <div
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 24px',
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {body}
                    </div>

                    {ctaUrl && ctaText && <Button href={ctaUrl}>{ctaText}</Button>}
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export function marketingCampaignEmailSubject(props: MarketingCampaignEmailProps) {
    return props.title || 'CodeCraftX';
}
