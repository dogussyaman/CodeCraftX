import JobApplicationsPage from "@/app/dashboard/_shared/applications/JobApplicationsPage"

interface HrJobApplicationsPageProps {
  params: Promise<{ jobId: string }>
}

export default async function HrJobApplicationsPage({ params }: HrJobApplicationsPageProps) {
  return <JobApplicationsPage role="hr" params={params} showAssignButton />
}

