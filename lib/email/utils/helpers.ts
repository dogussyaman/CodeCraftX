import { renderToStaticMarkup } from 'react-dom/server';

/**
 * React component'i HTML string'e çevirir
 * Email gönderimi için kullanılır
 */
export function renderEmailTemplate(component: React.ReactNode): string {
    return renderToStaticMarkup(component);
}

/**
 * Email adresini validate eder
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Email adreslerini normalize eder (array'e çevirir)
 */
export function normalizeEmailRecipients(to: string | string[]): string[] {
    return Array.isArray(to) ? to : [to];
}

/**
 * Tarihi email için uygun formata çevirir
 * Örnek: "5 Şubat 2026, Çarşamba - 14:30"
 */
export function formatEmailDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
    };

    return new Intl.DateTimeFormat('tr-TR', options).format(date);
}

/**
 * Relatif zaman formatı
 * Örnek: "2 saat önce", "3 gün önce"
 */
export function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 30) return `${diffDays} gün önce`;

    return formatEmailDate(date);
}
