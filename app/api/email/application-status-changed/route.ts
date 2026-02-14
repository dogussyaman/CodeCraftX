import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { sendApplicationStatusChangedEmailUsecase } from '@/lib/email/usecases';

const STATUS_MAP: Record<string, 'reviewing' | 'shortlisted' | 'interview' | 'offer' | 'rejected'> = {
  pending: 'reviewing',
  reviewed: 'shortlisted',
  interview: 'interview',
  accepted: 'offer',
  rejected: 'rejected',
};

export async function POST(req: NextRequest) {
  try {
    const { applicationId, status } = (await req.json()) as {
      applicationId?: string;
      status?: string;
    };

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, error: 'applicationId and status are required' },
        { status: 400 },
      );
    }

    const mappedStatus = STATUS_MAP[status];

    if (!mappedStatus) {
      return NextResponse.json(
        { success: false, error: `Unsupported status: ${status}` },
        { status: 400 },
      );
    }

    const supabase = await createServerClient();

    const { data: application, error } = await supabase
      .from('applications')
      .select(
        `
        id,
        developer:developer_id (
          full_name,
          email
        ),
        job:job_id (
          title,
          companies:company_id (
            name
          )
        )
      `,
      )
      .eq('id', applicationId)
      .maybeSingle();

    if (error || !application) {
      return NextResponse.json(
        { success: false, error: error?.message ?? 'Application not found' },
        { status: 404 },
      );
    }

    const developerEmail = application.developer?.email as string | undefined;
    const developerName = (application.developer?.full_name as string | null) ?? 'Geliştirici';
    const jobTitle = (application.job?.title as string | null) ?? 'İlan';
    const companyName = (application.job?.companies?.name as string | null) ?? 'Şirket';

    if (!developerEmail) {
      return NextResponse.json(
        { success: false, error: 'Developer email not found' },
        { status: 400 },
      );
    }

    const statusMessageMap: Record<typeof mappedStatus, string> = {
      reviewing: 'Başvurunuz değerlendirme aşamasında.',
      shortlisted: 'Başvurunuz olumlu değerlendirildi ve kısa listeye alındı.',
      interview: 'Sizinle bir görüşme planlanmak isteniyor.',
      offer: 'Sizin için bir teklif hazırlandı.',
      rejected: 'Bu pozisyon için başvurunuz uygun bulunmadı.',
    };

    await sendApplicationStatusChangedEmailUsecase(developerEmail, {
      developerName,
      jobTitle,
      companyName,
      newStatus: mappedStatus,
      statusMessage: statusMessageMap[mappedStatus],
      applicationUrl: `/dashboard/gelistirici/basvurular`, // email template içinde bağlam için
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Application status changed email error', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}

