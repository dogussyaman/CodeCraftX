import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmailUsecase } from '@/lib/email/usecases';

export async function POST(req: NextRequest) {
  try {
    const { name, email, role } = (await req.json()) as {
      name?: string;
      email?: string;
      role?: 'developer' | 'employer' | 'hr';
    };

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'name and email are required' }, { status: 400 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

    await sendWelcomeEmailUsecase({
      name,
      email,
      role: role ?? 'developer',
      profileUrl: `${siteUrl}/dashboard/gelistirici/profil`,
      siteUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Welcome email error', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}

