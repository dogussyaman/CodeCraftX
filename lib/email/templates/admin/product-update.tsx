import { BaseEmailLayout } from '../layouts/base-html';
import { EmailHeader } from '../layouts/components/header';
import { EmailFooter } from '../layouts/components/footer';
import { Button } from '../layouts/components/button';
import { EMAIL_COLORS, EMAIL_SIZES } from '../../constants';
import type { ProductUpdateEmailProps } from '../../types';

export function ProductUpdateEmail({
    title,
    updates,
    ctaUrl,
    ctaText,
    recipientName,
}: ProductUpdateEmailProps) {
    const list = Array.isArray(updates) ? updates : (updates ? [updates] : []);

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

                    <p
                        style={{
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: EMAIL_COLORS.text,
                            margin: '0 0 16px',
                        }}
                    >
                        Yeni güncellemelerimizi aşağıda bulabilirsiniz.
                    </p>

                    {list.length > 0 && (
                        <ul
                            style={{
                                fontSize: '16px',
                                lineHeight: '26px',
                                color: EMAIL_COLORS.text,
                                margin: '0 0 24px',
                                paddingLeft: '20px',
                            }}
                        >
                            {list.map((item, i) => (
                                <li key={i} style={{ marginBottom: '8px' }}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}

                    {ctaUrl && (
                        <Button href={ctaUrl}>{ctaText || 'Platforma Git'}</Button>
                    )}
                </td>
            </tr>

            <EmailFooter />
        </BaseEmailLayout>
    );
}

export function productUpdateEmailSubject(props: ProductUpdateEmailProps) {
    return props.title || 'Yeni Gelişmeler - CodeCraftX';
}
