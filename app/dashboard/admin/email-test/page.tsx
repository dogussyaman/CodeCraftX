'use client';

import { useState } from 'react';
import { sendTestEmailAction } from './actions';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Send } from 'lucide-react';

const EMAIL_GROUPS = [
    {
        title: 'Auth',
        description: 'Giriş, şifre ve profil',
        types: [
            { id: 'welcome', label: 'Hoş Geldiniz', description: 'Yeni üye kaydı sonrası' },
            { id: 'password_reset', label: 'Şifre Sıfırlama', description: 'Şifre sıfırlama linki' },
            { id: 'password_changed', label: 'Şifre Değiştirildi', description: 'Şifre güncelleme onayı' },
        ],
    },
    {
        title: 'Geliştirici',
        description: 'Eşleşme ve başvuru süreçleri',
        types: [
            { id: 'new_match', label: 'Yeni Eşleşme', description: 'Uygun ilan bulunduğunda' },
            { id: 'application_submitted', label: 'Başvuru Onayı', description: 'Başvuru yapıldıktan sonra' },
            { id: 'application_status_changed', label: 'Başvuru Durumu', description: 'Durum güncellendiğinde' },
            { id: 'interview_invitation', label: 'Görüşme Daveti', description: 'Mülakat davet e-postası' },
        ],
    },
    {
        title: 'İşveren / İK',
        description: 'İlan ve başvuru bildirimleri',
        types: [
            { id: 'new_application', label: 'Yeni Başvuru', description: 'İlana yeni başvuru geldiğinde' },
            { id: 'job_published', label: 'İlan Yayında', description: 'İlan yayınlandığında' },
            { id: 'company_approved', label: 'Şirket Onayı', description: 'Şirket kaydı onaylandığında' },
        ],
    },
    {
        title: 'Admin',
        description: 'Destek ve onay süreçleri',
        types: [
            { id: 'new_support_ticket', label: 'Yeni Destek Talebi', description: 'Admin\'e yeni bilet' },
            { id: 'company_pending_approval', label: 'Şirket Onay Bekliyor', description: 'Yeni şirket talebi' },
        ],
    },
    {
        title: 'Reklam & Duyurular',
        description: 'Kampanya ve ürün güncellemeleri',
        types: [
            { id: 'reklam', label: 'Reklam / Kampanya', description: 'Pazarlama e-postası' },
            { id: 'yeni_gelismeler', label: 'Yeni Gelişmeler', description: 'Ürün güncellemeleri' },
        ],
    },
] as const;

export default function EmailTestPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState<string | null>(null);

    const handleTest = async (type: string) => {
        if (!email?.trim()) {
            toast.error('Lütfen bir email adresi girin');
            return;
        }

        setLoading(type);
        try {
            const result = await sendTestEmailAction(type, email.trim());

            if (result.success) {
                toast.success('Test e-postası gönderildi');
            } else {
                toast.error(result.error ?? 'Gönderilemedi');
            }
        } catch {
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Mail className="size-6" />
                    E-posta Test Paneli
                </h1>
                <p className="text-muted-foreground">
                    Sistemdeki e-posta şablonlarını test edin. Resend API ile gerçek e-posta gönderilir.
                    Sadece Admin ve MT rolleri bu sayfayı kullanabilir.
                </p>
            </div>

            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle>Alıcı adresi</CardTitle>
                    <CardDescription>Test e-postaları bu adrese gidecek</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@email.com"
                        className="max-w-md"
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEmail('team@notificationscodecrafters.xyz')}
                        >
                            team@codecrafters
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEmail('support@notificationscodecrafters.xyz')}
                        >
                            support@codecrafters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-8">
                {EMAIL_GROUPS.map((group) => (
                    <Card key={group.title} className="border-border bg-card">
                        <CardHeader>
                            <CardTitle>{group.title}</CardTitle>
                            <CardDescription>{group.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {group.types.map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                    >
                                        <div>
                                            <h3 className="font-medium">{t.label}</h3>
                                            <p className="text-sm text-muted-foreground">{t.description}</p>
                                        </div>
                                        <Button
                                            onClick={() => handleTest(t.id)}
                                            disabled={!!loading}
                                            size="sm"
                                            className="shrink-0"
                                        >
                                            {loading === t.id ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="size-4 mr-1" />
                                                    Test Et
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                <CardContent className="pt-6">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Önemli</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        Gönderim kotanızdan düşer. Sadece gerekli durumlarda test yapın.
                        Geliştirme ortamında <code className="rounded bg-amber-200/50 dark:bg-amber-900/50 px-1">RESEND_API_KEY</code> tanımlı olmalıdır.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
