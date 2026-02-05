'use server';

import {
  sendEmail,
  WelcomeEmail,
  welcomeEmailSubject,
  PasswordResetEmail,
  passwordResetEmailSubject,
  PasswordChangedEmail,
  passwordChangedEmailSubject,
  CompleteProfileReminderEmail,
  completeProfileReminderEmailSubject,
  NewMatchEmail,
  newMatchEmailSubject,
  ApplicationSubmittedEmail,
  applicationSubmittedEmailSubject,
  ApplicationStatusChangedEmail,
  applicationStatusChangedEmailSubject,
  InterviewInvitationEmail,
  interviewInvitationEmailSubject,
  CompanyApprovedEmail,
  companyApprovedEmailSubject,
  JobPublishedEmail,
  jobPublishedEmailSubject,
  NewApplicationEmail,
  newApplicationEmailSubject,
  NewCandidateMatchEmail,
  newCandidateMatchEmailSubject,
  NewSupportTicketEmail,
  newSupportTicketEmailSubject,
  CompanyPendingApprovalEmail,
  companyPendingApprovalEmailSubject,
} from '@/lib/email';

import type {
  WelcomeEmailProps,
  PasswordResetEmailProps,
  PasswordChangedEmailProps,
  CompleteProfileReminderProps,
  NewMatchEmailProps,
  ApplicationSubmittedProps,
  ApplicationStatusChangedProps,
  InterviewInvitationProps,
  CompanyApprovedProps,
  JobPublishedProps,
  NewApplicationProps,
  NewCandidateMatchProps,
  NewSupportTicketProps,
  CompanyPendingApprovalProps,
} from '@/lib/email';

// ========== Auth ==========

export async function sendWelcomeEmailUsecase(props: WelcomeEmailProps) {
  return sendEmail({
    to: props.email,
    subject: welcomeEmailSubject(props),
    react: <WelcomeEmail {...props} />,
    tags: [
      { name: 'category', value: 'auth' },
      { name: 'template', value: 'welcome' },
    ],
  });
}

export async function sendPasswordResetEmailUsecase(to: string, props: PasswordResetEmailProps) {
  return sendEmail({
    to,
    subject: passwordResetEmailSubject(props),
    react: <PasswordResetEmail {...props} />,
    tags: [
      { name: 'category', value: 'auth' },
      { name: 'template', value: 'password_reset' },
    ],
  });
}

export async function sendPasswordChangedEmailUsecase(to: string, props: PasswordChangedEmailProps) {
  return sendEmail({
    to,
    subject: passwordChangedEmailSubject(props),
    react: <PasswordChangedEmail {...props} />,
    tags: [
      { name: 'category', value: 'auth' },
      { name: 'template', value: 'password_changed' },
    ],
  });
}

export async function sendCompleteProfileReminderEmailUsecase(to: string, props: CompleteProfileReminderProps) {
  return sendEmail({
    to,
    subject: completeProfileReminderEmailSubject(props),
    react: <CompleteProfileReminderEmail {...props} />,
    tags: [
      { name: 'category', value: 'auth' },
      { name: 'template', value: 'complete_profile_reminder' },
    ],
  });
}

// ========== Developer ==========

export async function sendNewMatchEmailUsecase(props: NewMatchEmailProps) {
  return sendEmail({
    to: props.developerEmail,
    subject: newMatchEmailSubject(props),
    react: <NewMatchEmail {...props} />,
    tags: [
      { name: 'category', value: 'developer' },
      { name: 'template', value: 'new_match' },
      { name: 'match_score', value: String(props.matchScore) },
    ],
  });
}

export async function sendApplicationSubmittedEmailUsecase(to: string, props: ApplicationSubmittedProps) {
  return sendEmail({
    to,
    subject: applicationSubmittedEmailSubject(props),
    react: <ApplicationSubmittedEmail {...props} />,
    tags: [
      { name: 'category', value: 'developer' },
      { name: 'template', value: 'application_submitted' },
    ],
  });
}

export async function sendApplicationStatusChangedEmailUsecase(to: string, props: ApplicationStatusChangedProps) {
  return sendEmail({
    to,
    subject: applicationStatusChangedEmailSubject(props),
    react: <ApplicationStatusChangedEmail {...props} />,
    tags: [
      { name: 'category', value: 'developer' },
      { name: 'template', value: 'application_status_changed' },
      { name: 'status', value: props.newStatus },
    ],
  });
}

export async function sendInterviewInvitationEmailUsecase(to: string, props: InterviewInvitationProps) {
  return sendEmail({
    to,
    subject: interviewInvitationEmailSubject(props),
    react: <InterviewInvitationEmail {...props} />,
    tags: [
      { name: 'category', value: 'developer' },
      { name: 'template', value: 'interview_invitation' },
    ],
  });
}

// ========== Employer ==========

export async function sendCompanyApprovedEmailUsecase(to: string, props: CompanyApprovedProps) {
  return sendEmail({
    to,
    subject: companyApprovedEmailSubject(props),
    react: <CompanyApprovedEmail {...props} />,
    tags: [
      { name: 'category', value: 'employer' },
      { name: 'template', value: 'company_approved' },
    ],
  });
}

export async function sendJobPublishedEmailUsecase(to: string, props: JobPublishedProps) {
  return sendEmail({
    to,
    subject: jobPublishedEmailSubject(props),
    react: <JobPublishedEmail {...props} />,
    tags: [
      { name: 'category', value: 'employer' },
      { name: 'template', value: 'job_published' },
    ],
  });
}

export async function sendNewApplicationEmailUsecase(to: string, props: NewApplicationProps) {
  return sendEmail({
    to,
    subject: newApplicationEmailSubject(props),
    react: <NewApplicationEmail {...props} />,
    tags: [
      { name: 'category', value: 'employer' },
      { name: 'template', value: 'new_application' },
    ],
  });
}

export async function sendNewCandidateMatchEmailUsecase(to: string, props: NewCandidateMatchProps) {
  return sendEmail({
    to,
    subject: newCandidateMatchEmailSubject(props),
    react: <NewCandidateMatchEmail {...props} />,
    tags: [
      { name: 'category', value: 'employer' },
      { name: 'template', value: 'new_candidate_match' },
    ],
  });
}

// ========== Admin ==========

export async function sendNewSupportTicketEmailUsecase(to: string, props: NewSupportTicketProps) {
  return sendEmail({
    to,
    subject: newSupportTicketEmailSubject(props),
    react: <NewSupportTicketEmail {...props} />,
    tags: [
      { name: 'category', value: 'admin' },
      { name: 'template', value: 'new_support_ticket' },
    ],
  });
}

export async function sendCompanyPendingApprovalEmailUsecase(to: string, props: CompanyPendingApprovalProps) {
  return sendEmail({
    to,
    subject: companyPendingApprovalEmailSubject(props),
    react: <CompanyPendingApprovalEmail {...props} />,
    tags: [
      { name: 'category', value: 'admin' },
      { name: 'template', value: 'company_pending_approval' },
    ],
  });
}

