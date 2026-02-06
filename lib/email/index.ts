// Email template exports - Auth
export { WelcomeEmail, welcomeEmailSubject } from './templates/auth/welcome';
export { PasswordResetEmail, passwordResetEmailSubject } from './templates/auth/password-reset';
export { PasswordChangedEmail, passwordChangedEmailSubject } from './templates/auth/password-changed';
export { CompleteProfileReminderEmail, completeProfileReminderEmailSubject } from './templates/auth/complete-profile';

// Email template exports - Developer
export { NewMatchEmail, newMatchEmailSubject } from './templates/developer/new-match';
export { ApplicationSubmittedEmail, applicationSubmittedEmailSubject } from './templates/developer/application-submitted';
export { ApplicationStatusChangedEmail, applicationStatusChangedEmailSubject } from './templates/developer/application-status-changed';
export { InterviewInvitationEmail, interviewInvitationEmailSubject } from './templates/developer/interview-invitation';

// Email template exports - Employer
export { CompanyApprovedEmail, companyApprovedEmailSubject } from './templates/employer/company-approved';
export { JobPublishedEmail, jobPublishedEmailSubject } from './templates/employer/job-published';
export { NewApplicationEmail, newApplicationEmailSubject } from './templates/employer/new-application';
export { NewCandidateMatchEmail, newCandidateMatchEmailSubject } from './templates/employer/new-candidate-match';

// Email template exports - Admin
export { NewSupportTicketEmail, newSupportTicketEmailSubject } from './templates/admin/new-support-ticket';
export { CompanyPendingApprovalEmail, companyPendingApprovalEmailSubject } from './templates/admin/company-pending-approval';
export { MarketingCampaignEmail, marketingCampaignEmailSubject } from './templates/admin/marketing-campaign';
export { ProductUpdateEmail, productUpdateEmailSubject } from './templates/admin/product-update';

// Services
export { sendEmail, logEmail } from './services/send';

// Types
export * from './types';

// Constants
export * from './constants';

// Client
export { resend, EMAIL_CONFIG } from './client';
