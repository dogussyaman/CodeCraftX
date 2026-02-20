import JobsOverviewPage from "@/app/dashboard/_shared/applications/JobsOverviewPage"

export default async function HRApplicationsPage() {
  return <JobsOverviewPage role="hr" basePath="/dashboard/ik" showCreateJobCta={false} />
}

