import JobApplicationsPage from "@/app/dashboard/_shared/applications/JobApplicationsPage"

interface JobApplicationsPageProps {
  params: Promise<{ jobId: string }>
}

export default async function CompanyJobApplicationsPage({ params }: JobApplicationsPageProps) {
  return <JobApplicationsPage role="company" params={params} showAssignButton={false} />
}

