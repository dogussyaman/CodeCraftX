import JobsOverviewPage from "@/app/dashboard/_shared/applications/JobsOverviewPage"

export default async function CompanyApplicationsPage() {
  return <JobsOverviewPage role="company" basePath="/dashboard/company" showCreateJobCta />
}

