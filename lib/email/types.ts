import { EmailPriority } from './constants';
import type { ReactElement } from 'react';

// Genel email gönderim seçenekleri
export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    react?: ReactElement;
    replyTo?: string;
    tags?: Array<{ name: string; value: string }>;
}

// Email log için tip
export interface EmailLog {
    recipient: string;
    templateName: string;
    subject: string;
    status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'complained';
    resendId?: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
}

// Queue job tipi
export interface EmailJob {
    type: 'transactional' | 'marketing';
    template: string;
    to: string | string[];
    subject: string;
    props: Record<string, any>;
    priority: EmailPriority;
}

// Authentication email props
export interface WelcomeEmailProps {
    name: string;
    email: string;
    role: 'developer' | 'employer' | 'hr';
    profileUrl: string;
}

export interface PasswordResetEmailProps {
    name: string;
    resetUrl: string;
    expiresIn: string;
}

export interface PasswordChangedEmailProps {
    name: string;
    changedAt: string;
}

export interface CompleteProfileReminderProps {
    name: string;
    profileCompletionPercentage: number;
    missingFields: string[];
    profileUrl: string;
}

// Developer email props
export interface NewMatchEmailProps {
    developerName: string;
    developerEmail: string;
    jobTitle: string;
    companyName: string;
    companyLogo?: string;
    matchScore: number;
    jobDescription: string;
    jobLocation: string;
    jobType: 'remote' | 'hybrid' | 'onsite';
    salary?: string;
    jobUrl: string;
}

export interface ApplicationSubmittedProps {
    developerName: string;
    jobTitle: string;
    companyName: string;
    appliedAt: string;
    applicationUrl: string;
}

export interface ApplicationStatusChangedProps {
    developerName: string;
    jobTitle: string;
    companyName: string;
    newStatus: 'reviewing' | 'shortlisted' | 'interview' | 'offer' | 'rejected';
    statusMessage?: string;
    applicationUrl: string;
}

export interface InterviewInvitationProps {
    developerName: string;
    jobTitle: string;
    companyName: string;
    interviewDate: string;
    interviewTime: string;
    interviewType: 'video' | 'phone' | 'onsite';
    interviewLink?: string;
    interviewLocation?: string;
}

// Employer email props
export interface CompanyApprovedProps {
    companyName: string;
    contactName: string;
    dashboardUrl: string;
}

export interface JobPublishedProps {
    companyName: string;
    hrName: string;
    jobTitle: string;
    publishedAt: string;
    jobUrl: string;
}

export interface NewApplicationProps {
    companyName: string;
    hrName: string;
    jobTitle: string;
    candidateName: string;
    matchScore: number;
    applicationUrl: string;
}

export interface NewCandidateMatchProps {
    companyName: string;
    hrName: string;
    jobTitle: string;
    candidateName: string;
    matchScore: number;
    profileUrl: string;
}

// Admin email props
export interface NewSupportTicketProps {
    ticketId: string;
    userName: string;
    userEmail: string;
    subject: string;
    ticketUrl: string;
}

export interface CompanyPendingApprovalProps {
    companyName: string;
    contactName: string;
    contactEmail: string;
    reviewUrl: string;
}
