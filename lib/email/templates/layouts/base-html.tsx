import { EMAIL_COLORS, EMAIL_FONTS, EMAIL_SIZES } from '../../constants';

interface BaseEmailLayoutProps {
    children: React.ReactNode;
    previewText?: string;
}

/**
 * Email için temel HTML layout
 * Tüm email template'leri bu layout'u kullanır
 */
export function BaseEmailLayout({ children, previewText }: BaseEmailLayoutProps) {
    return (
        <html lang="tr">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: ${EMAIL_FONTS.body};
            background-color: ${EMAIL_COLORS.background};
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          img {
            border: 0;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }
          table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
          a {
            color: ${EMAIL_COLORS.primary};
            text-decoration: none;
          }
        `}</style>
            </head>
            <body style={{ margin: 0, padding: 0, backgroundColor: EMAIL_COLORS.background }}>
                {previewText && (
                    <div
                        style={{
                            display: 'none',
                            maxHeight: 0,
                            overflow: 'hidden',
                            opacity: 0,
                        }}
                    >
                        {previewText}
                    </div>
                )}
                <table
                    role="presentation"
                    style={{
                        width: '100%',
                        backgroundColor: EMAIL_COLORS.background,
                        padding: '20px 0',
                    }}
                >
                    <tr>
                        <td align="center">
                            <table
                                role="presentation"
                                style={{
                                    maxWidth: EMAIL_SIZES.maxWidth,
                                    width: '100%',
                                    backgroundColor: EMAIL_COLORS.cardBackground,
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                }}
                            >
                                {children}
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    );
}
