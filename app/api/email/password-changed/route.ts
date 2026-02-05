import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { sendPasswordChangedEmailUsecase } from '@/lib/email/usecases';

export async function POST() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    const name = profile?.full_name || user.email;

    await sendPasswordChangedEmailUsecase(user.email, {
      name,
      changedAt: new Date().toLocaleString('tr-TR'),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Password changed email error', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}

