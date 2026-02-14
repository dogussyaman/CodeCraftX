import { EMAIL_COLORS, EMAIL_SIZES } from '../../../constants';

/**
 * Email header component
 * Logo ve branding içerir
 */
export function EmailHeader() {
    const logoUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
        : 'https://www.codecraftx.xyz/logo.png';

    return (
        <tr>
            <td
                style={{
                    background: `linear-gradient(135deg, ${EMAIL_COLORS.primary} 0%, #764ba2 100%)`,
                    padding: EMAIL_SIZES.headerPadding,
                    textAlign: 'center',
                }}
            >
                <img
                    src={logoUrl}
                    alt="CodeCraftX"
                    width="120"
                    height="auto"
                    style={{
                        display: 'block',
                        margin: '0 auto',
                    }}
                />
            </td>
        </tr>
    );
}
