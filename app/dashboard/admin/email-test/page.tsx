'use client';

import { useState } from 'react';
import { sendTestEmailAction } from './actions';
import { toast } from 'sonner';

export default function EmailTestPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState<string | null>(null);

    const handleTest = async (type: string) => {
        if (!email) {
            toast.error('Lütfen bir email adresi girin');
            return;
        }

        setLoading(type);
        try {
            const result = await sendTestEmailAction(type, email);

            if (result.success) {
                toast.success(`${type} emaili başarıyla gönderildi!`);
            } else {
                toast.error(`Hata: ${result.error}`);
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(null);
        }
    };

    const emailTypes = [
        { id: 'welcome', label: 'Hoş Geldiniz Email', description: 'Yeni üye olan kullanıcılar için' },
        { id: 'new_match', label: 'Yeni Eşleşme', description: 'Geliştiricilere uygun ilan bulunduğunda' },
        { id: 'application_submitted', label: 'Başvuru Onayı', description: 'Başvuru yapıldıktan sonra' },
    ];

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Email Test Paneli</h1>
                <p className="text-gray-500">
                    Sistemdeki email şablonlarını test etmek için aşağıdaki formu kullanın.
                    Resend API üzerinden gerçek email gönderimi yapılacaktır.
                </p>
            </div>

            <div className="space-y-4 p-6 border rounded-lg bg-card">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Alıcı Email Adresi
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@email.com"
                        className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Test emailleri bu adrese gönderilecektir.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <button
                            type="button"
                            onClick={() => setEmail('team@notificationscodecrafters.xyz')}
                            className="rounded border px-2 py-1 text-xs hover:bg-accent"
                        >
                            team@notificationscodecrafters.xyz
                        </button>
                        <button
                            type="button"
                            onClick={() => setEmail('support@notificationscodecrafters.xyz')}
                            className="rounded border px-2 py-1 text-xs hover:bg-accent"
                        >
                            support@notificationscodecrafters.xyz
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 pt-4">
                    {emailTypes.map((type) => (
                        <div
                            key={type.id}
                            className="flex items-center justify-between p-4 border rounded-md hover:bg-accent/50 transition-colors"
                        >
                            <div>
                                <h3 className="font-medium">{type.label}</h3>
                                <p className="text-sm text-gray-500">{type.description}</p>
                            </div>
                            <button
                                onClick={() => handleTest(type.id)}
                                disabled={!!loading}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 disabled:opacity-50 min-w-[100px]"
                            >
                                {loading === type.id ? 'Gönderiliyor...' : 'Test Et'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-sm border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    ⚠️ Önemli Not
                </h4>
                <p className="text-yellow-700 dark:text-yellow-300">
                    Bu işlem kotanızdan düşecektir. Sadece gerekli durumlarda test yapın.
                    Eğer environment <code>development</code> ise ve <code>RESEND_API_KEY</code> tanımlı değilse hata alırsınız.
                </p>
            </div>
        </div>
    );
}
