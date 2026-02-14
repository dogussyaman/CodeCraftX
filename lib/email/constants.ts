// Email renk paleti
export const EMAIL_COLORS = {
    primary: '#6366f1',
    secondary: '#10b981',
    background: '#f6f6f6',
    cardBackground: '#ffffff',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
} as const;

// Email fontları
export const EMAIL_FONTS = {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const;

// Email boyutları
export const EMAIL_SIZES = {
    maxWidth: '600px',
    headerPadding: '20px',
    contentPadding: '40px',
    footerPadding: '20px',
} as const;

// Email queue priority
export enum EmailPriority {
    CRITICAL = 1,
    HIGH = 2,
    NORMAL = 3,
    LOW = 4,
    BULK = 5,
}
