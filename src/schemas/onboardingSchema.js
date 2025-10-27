import { z } from 'zod';

// Step 1: Company Information Schema
export const companyInfoSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companySize: z.string().min(1, 'Please select company size'),
  operatingRegion: z.string().min(1, 'Please select operating region'),
  statesProvinces: z.array(z.string()).min(1, 'Please select at least one state/province'),
  industryType: z.string().optional(),
});

// Step 2: Document Requirements Schema
export const documentRequirementsSchema = z.object({
  documents: z.array(z.string()).min(1, 'At least one document type is required'),
  reminderDays: z
    .array(z.string())
    .min(1, 'At least one reminder interval is required')
    .max(3, 'Maximum of 3 reminder intervals allowed'),
});

// Step 3: Notification Preferences Schema
export const notificationPreferencesSchema = z.object({
  notificationMethod: z.enum(['email', 'sms', 'both'], {
    required_error: 'Please select a notification method',
  }),
  notificationRecipients: z
    .array(z.string())
    .min(1, 'Please select at least one recipient'),
  adminEmail: z.string().optional(),
  adminPhone: z.string().optional(),
}).refine(
  (data) => {
    if (data.notificationMethod === 'email' || data.notificationMethod === 'both') {
      return data.adminEmail && data.adminEmail.length > 0 && z.string().email().safeParse(data.adminEmail).success;
    }
    return true;
  },
  {
    message: 'Valid admin email is required for email notifications',
    path: ['adminEmail'],
  }
).refine(
  (data) => {
    if (data.notificationMethod === 'sms' || data.notificationMethod === 'both') {
      return data.adminPhone && data.adminPhone.length > 0;
    }
    return true;
  },
  {
    message: 'Admin phone is required for SMS notifications',
    path: ['adminPhone'],
  }
);

// Step 4: Team Setup Schema (optional)
export const teamSetupSchema = z.object({
  teamMembers: z.array(
    z.object({
      email: z.string().email('Invalid email'),
      role: z.string(),
      name: z.string().optional(),
    })
  ).optional().default([]),
});

// Step 5: Quick Start Schema
export const quickStartSchema = z.object({
  firstDriverName: z.string().optional(),
  firstDriverContact: z.string().optional(),
  firstDriverDocuments: z.array(z.string()).optional().default([]),
});

// Complete Onboarding Schema - combines all steps
export const onboardingSchema = z.object({
  // Step 1
  companyName: z.string().min(1, 'Company name is required'),
  companySize: z.string().min(1, 'Please select company size'),
  operatingRegion: z.string().min(1, 'Please select operating region'),
  statesProvinces: z.array(z.string()).min(1, 'Please select at least one state/province'),
  industryType: z.string().optional(),

  // Step 2
  documents: z.array(z.string()).min(1, 'At least one document type is required'),
  reminderDays: z
    .array(z.string())
    .min(1, 'At least one reminder interval is required')
    .max(3, 'Maximum of 3 reminder intervals allowed'),

  // Step 3
  notificationMethod: z.enum(['email', 'sms', 'both'], {
    required_error: 'Please select a notification method',
  }),
  notificationRecipients: z
    .array(z.string())
    .min(1, 'Please select at least one recipient'),
  adminEmail: z.string().optional(),
  adminPhone: z.string().optional(),

  // Step 4
  teamMembers: z.array(
    z.object({
      email: z.string().email('Invalid email'),
      role: z.string(),
      name: z.string().optional(),
    })
  ).optional().default([]),

  // Step 5
  firstDriverName: z.string().optional(),
  firstDriverContact: z.string().optional(),
  firstDriverDocuments: z.array(z.string()).optional().default([]),
}).refine(
  (data) => {
    if (data.notificationMethod === 'email' || data.notificationMethod === 'both') {
      return data.adminEmail && data.adminEmail.length > 0 && z.string().email().safeParse(data.adminEmail).success;
    }
    return true;
  },
  {
    message: 'Valid admin email is required for email notifications',
    path: ['adminEmail'],
  }
).refine(
  (data) => {
    if (data.notificationMethod === 'sms' || data.notificationMethod === 'both') {
      return data.adminPhone && data.adminPhone.length > 0;
    }
    return true;
  },
  {
    message: 'Admin phone is required for SMS notifications',
    path: ['adminPhone'],
  }
);

// Backend validation schema (for API)
export const onboardingBackendSchema = z.object({
  companyName: z.string().min(1),
  companySize: z.string().min(1),
  operatingRegion: z.string().min(1),
  statesProvinces: z.array(z.string()).min(1),
  industryType: z.string().optional(),
  documents: z.array(z.string()).min(1),
  reminderDays: z.array(z.string()).min(1).max(3),
  notificationMethod: z.enum(['email', 'sms', 'both']),
  notificationRecipients: z.array(z.string()).min(1),
  adminEmail: z.string().email().optional(),
  adminPhone: z.string().optional(),
  teamMembers: z.array(
    z.object({
      email: z.string().email(),
      role: z.string(),
      name: z.string().optional(),
    })
  ).optional(),
  firstDriverName: z.string().optional(),
  firstDriverContact: z.string().optional(),
});
