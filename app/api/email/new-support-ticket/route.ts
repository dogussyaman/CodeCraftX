import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { sendNewSupportTicketEmailUsecase } from '@/lib/email/usecases';
import { EMAIL_CONFIG } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { ticketId } = (await req.json()) as { ticketId?: string };

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'ticketId is required' },
        { status: 400 },
      );
    }

    const supabase = await createServerClient();

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('id, user_id, email, subject, status')
      .eq('id', ticketId)
      .maybeSingle();

    if (error || !ticket) {
      return NextResponse.json(
        { success: false, error: error?.message ?? 'Ticket not found' },
        { status: 404 },
      );
    }

    let userName = 'Kullanıcı';
    if (ticket.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', ticket.user_id)
        .maybeSingle();
      if (profile?.full_name) {
        userName = profile.full_name;
      }
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

    await sendNewSupportTicketEmailUsecase(EMAIL_CONFIG.admin, {
      ticketId: ticket.id,
      userName,
      userEmail: ticket.email ?? '',
      subject: ticket.subject ?? 'Yeni destek talebi',
      ticketUrl: `${siteUrl}/dashboard/admin`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('New support ticket email error', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}

