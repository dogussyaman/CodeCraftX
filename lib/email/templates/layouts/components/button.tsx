import { EMAIL_COLORS } from '../../../constants';

interface ButtonProps {
    href: string;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
}

/**
 * Email CTA button component
 */
export function Button({ href, children, variant = 'primary' }: ButtonProps) {
    const styles = {
        primary: {
            backgroundColor: EMAIL_COLORS.primary,
            color: '#ffffff',
        },
        secondary: {
            backgroundColor: '#f3f4f6',
            color: EMAIL_COLORS.text,
            border: `1px solid ${EMAIL_COLORS.border}`,
        },
    };

    const selectedStyle = styles[variant];

    return (
        <table role="presentation" style={{ margin: '24px 0' }}>
            <tr>
                <td>
                    <a
                        href={href}
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            ...selectedStyle,
                        }}
                    >
                        {children}
                    </a>
                </td>
            </tr>
        </table>
    );
}
