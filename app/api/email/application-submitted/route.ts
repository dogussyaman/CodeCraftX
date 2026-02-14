import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  sendApplicationSubmittedEmailUsecase,
  sendNewApplicationEmailUsecase,
} from '@/lib/email/usecases';

export async function POST(req: NextRequest) {
  try {
    const { applicationId } = (await req.json()) as { applicationId?: string };

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'applicationId is required' },
        { status: 400 },
      );
    }

    const supabase = await createServerClient();

    const { data: application, error } = await supabase
      .from('applications')
      .select(
        `
        id,
        created_at,
        match_score,
        developer:developer_id (
          full_name,
          email
        ),
        job:job_id (
          title,
          companies:company_id (
            name,
            contact_email
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

    const appRow: any = application;
    const dev = Array.isArray(appRow.developer) ? appRow.developer[0] : appRow.developer;
    const job = Array.isArray(appRow.job) ? appRow.job[0] : appRow.job;
    const company = job?.companies && (Array.isArray(job.companies) ? job.companies[0] : job.companies);

    const developerEmail = dev?.email as string | undefined;
    const developerName = (dev?.full_name as string | null) ?? 'Geliştirici';
    const jobTitle = (job?.title as string | null) ?? 'İlan';
    const companyName = company?.name ?? 'Şirket';
    const companyContactEmail = company?.contact_email as string | undefined;

    if (!developerEmail) {
      return NextResponse.json(
        { success: false, error: 'Developer email not found' },
        { status: 400 },
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

    await sendApplicationSubmittedEmailUsecase(developerEmail, {
      developerName,
      jobTitle,
      companyName,
      appliedAt: new Date(application.created_at ?? new Date()).toLocaleString(
        'tr-TR',
      ),
      applicationUrl: `${siteUrl}/dashboard/gelistirici/basvurular/${applicationId}`,
    });

    // İşverene yeni başvuru bildirimi (opsiyonel)
    if (companyContactEmail) {
      await sendNewApplicationEmailUsecase(companyContactEmail, {
        companyName,
        hrName: 'İK Ekibi',
        jobTitle,
        candidateName: developerName,
        matchScore: appRow.match_score ?? 0,
        applicationUrl: `${siteUrl}/dashboard/ik/basvurular`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Application submitted email error', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}

