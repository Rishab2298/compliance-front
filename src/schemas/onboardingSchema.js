import { z } from 'zod';

// Step 1: Company Information Schema
export const companyInfoSchema = z.object({
  legalCompanyName: z.string().min(1, 'Legal company name is required'),
  operatingName: z.string().min(1, 'Operating name (DBA) is required'),
  country: z.string().min(1, 'Please select a country'),
  entityType: z.string().min(1, 'Please select an entity type'),
  businessRegistrationNumber: z.string().min(1, 'Business registration number is required'),
  registeredAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    stateProvince: z.string().min(1, 'State/Province/Region is required'),
    zipPostalCode: z.string().min(1, 'Postal/ZIP code is required'),
  }),
  operatingAddresses: z.array(z.object({
    street: z.string(),
    city: z.string(),
    stateProvince: z.string(),
    zipPostalCode: z.string(),
  })).optional().default([]),
  sameAsRegistered: z.boolean().optional().default(true),
  companyWebsite: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  companySize: z.string().optional(),
  statesProvinces: z.array(z.string()).optional().default([]),
  industryType: z.string().optional(),
});

// Step 2: DSP Verification Schema
export const dspVerificationSchema = z.object({
  isAmazonDSP: z.boolean(),
  dspCompanyName: z.string().optional(),
  stationCodes: z.array(z.string()).optional().default([]),
  dspOwnerName: z.string().optional(),
  opsManagerName: z.string().optional(),
  dspId: z.string().optional(),
  documents: z.array(z.string()).optional().default(["Driver's License"]),
  reminderDays: z.array(z.string()).optional().default(["90d", "30d", "7d"]),
}).refine(
  (data) => {
    // If Amazon DSP, require DSP Company Name
    if (data.isAmazonDSP) {
      return data.dspCompanyName && data.dspCompanyName.length > 0;
    }
    return true;
  },
  {
    message: 'DSP Company Name is required',
    path: ['dspCompanyName'],
  }
).refine(
  (data) => {
    // If Amazon DSP, require at least one station code
    if (data.isAmazonDSP) {
      return data.stationCodes && data.stationCodes.length > 0;
    }
    return true;
  },
  {
    message: 'At least one station code is required',
    path: ['stationCodes'],
  }
).refine(
  (data) => {
    // If Amazon DSP, require DSP Owner Name
    if (data.isAmazonDSP) {
      return data.dspOwnerName && data.dspOwnerName.length > 0;
    }
    return true;
  },
  {
    message: 'DSP Owner Name is required',
    path: ['dspOwnerName'],
  }
).refine(
  (data) => {
    // If Amazon DSP, require Ops Manager Name
    if (data.isAmazonDSP) {
      return data.opsManagerName && data.opsManagerName.length > 0;
    }
    return true;
  },
  {
    message: 'Ops Manager / Fleet Manager Name is required',
    path: ['opsManagerName'],
  }
);

// Step 3: Primary Admin Account Schema
export const primaryAdminAccountSchema = z.object({
  adminFullName: z.string().min(1, 'Full name is required'),
  adminEmail: z.string().email('Valid email is required'),
  adminPhone: z.string().min(1, 'Mobile number is required'),
}).refine(
  (data) => {
    // Validate phone number format (must start with + followed by country code)
    const phoneRegex = /^\+\d{1,3}\d{10,14}$/;
    return phoneRegex.test(data.adminPhone);
  },
  {
    message: 'Phone number must include country code (e.g., +1234567890)',
    path: ['adminPhone'],
  }
);

// Step 4: Billing Setup Schema
export const billingSetupSchema = z.object({
  plan: z.enum(['Free', 'Starter', 'Professional', 'Enterprise'], {
    required_error: 'Please select a plan',
  }),
  billingFrequency: z.enum(['monthly', 'yearly']).optional(),
  paymentMethod: z.enum(['card', 'ach', 'pad', 'invoice']).optional(),
  billingContactName: z.string().optional(),
  billingContactEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
  billingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    stateProvince: z.string().optional(),
    zipPostalCode: z.string().optional(),
  }).optional(),
}).refine(
  (data) => {
    // If not Free plan, require billing frequency
    if (data.plan !== 'Free') {
      return data.billingFrequency !== undefined;
    }
    return true;
  },
  {
    message: 'Billing frequency is required for paid plans',
    path: ['billingFrequency'],
  }
).refine(
  (data) => {
    // If not Free plan and not Enterprise, require payment method
    if (data.plan !== 'Free' && data.plan !== 'Enterprise') {
      return data.paymentMethod !== undefined;
    }
    return true;
  },
  {
    message: 'Payment method is required',
    path: ['paymentMethod'],
  }
).refine(
  (data) => {
    // If not Free plan, require billing contact name
    if (data.plan !== 'Free') {
      return data.billingContactName && data.billingContactName.length > 0;
    }
    return true;
  },
  {
    message: 'Billing contact name is required',
    path: ['billingContactName'],
  }
).refine(
  (data) => {
    // If not Free plan, require billing contact email
    if (data.plan !== 'Free') {
      return data.billingContactEmail && data.billingContactEmail.length > 0;
    }
    return true;
  },
  {
    message: 'Billing contact email is required',
    path: ['billingContactEmail'],
  }
);

// Step 5: Legal Consents Schema
export const legalConsentsSchema = z.object({
  agreeToTerms: z.boolean(),
  agreeToPrivacy: z.boolean(),
  agreeToDataProcessing: z.boolean(),
  agreeToAiFairUse: z.boolean(),
  agreeToGdprDataProcessing: z.boolean(),
  agreeToComplaints: z.boolean(),
  consentTimestamp: z.string().optional(),
  consentIpAddress: z.string().optional(),
  consentVersion: z.string().optional().default('1.0'),
}).refine(
  (data) => data.agreeToTerms === true,
  {
    message: 'You must agree to the Terms of Service',
    path: ['agreeToTerms'],
  }
).refine(
  (data) => data.agreeToPrivacy === true,
  {
    message: 'You must agree to the Privacy Policy',
    path: ['agreeToPrivacy'],
  }
).refine(
  (data) => data.agreeToDataProcessing === true,
  {
    message: 'You must agree to the Data Processing Addendum',
    path: ['agreeToDataProcessing'],
  }
).refine(
  (data) => data.agreeToAiFairUse === true,
  {
    message: 'You must agree to the AI Fair Use Policy',
    path: ['agreeToAiFairUse'],
  }
).refine(
  (data) => data.agreeToGdprDataProcessing === true,
  {
    message: 'You must agree to the GDPR Data Processing Addendum',
    path: ['agreeToGdprDataProcessing'],
  }
).refine(
  (data) => data.agreeToComplaints === true,
  {
    message: 'You must agree to the Complaints Policy',
    path: ['agreeToComplaints'],
  }
);

// Complete Onboarding Schema - combines all steps
export const onboardingSchema = z.object({
  // Step 1 - Company Information
  legalCompanyName: z.string().min(1, 'Legal company name is required'),
  operatingName: z.string().min(1, 'Operating name (DBA) is required'),
  country: z.string().min(1, 'Please select a country'),
  entityType: z.string().min(1, 'Please select an entity type'),
  businessRegistrationNumber: z.string().min(1, 'Business registration number is required'),
  registeredAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    stateProvince: z.string().min(1, 'State/Province/Region is required'),
    zipPostalCode: z.string().min(1, 'Postal/ZIP code is required'),
  }),
  operatingAddresses: z.array(z.object({
    street: z.string(),
    city: z.string(),
    stateProvince: z.string(),
    zipPostalCode: z.string(),
  })).optional().default([]),
  sameAsRegistered: z.boolean().optional().default(true),
  companyWebsite: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  companySize: z.string().optional(),
  statesProvinces: z.array(z.string()).optional().default([]),
  industryType: z.string().optional(),

  // Step 2 - DSP Verification
  isAmazonDSP: z.boolean(),
  dspCompanyName: z.string().optional(),
  stationCodes: z.array(z.string()).optional().default([]),
  dspOwnerName: z.string().optional(),
  opsManagerName: z.string().optional(),
  dspId: z.string().optional(),
  documents: z.array(z.string()).optional().default(["Driver's License"]),
  reminderDays: z.array(z.string()).optional().default(["90d", "30d", "7d"]),

  // Step 3 - Primary Admin Account
  adminFullName: z.string().min(1, 'Full name is required'),
  adminEmail: z.string().email('Valid email is required'),
  adminPhone: z.string().min(1, 'Mobile number is required'),

  // Step 4 - Billing Setup
  plan: z.enum(['Free', 'Starter', 'Professional', 'Enterprise'], {
    required_error: 'Please select a plan',
  }),
  billingFrequency: z.enum(['monthly', 'yearly']).optional(),
  paymentMethod: z.enum(['card', 'ach', 'pad', 'invoice']).optional(),
  billingContactName: z.string().optional(),
  billingContactEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
  billingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    stateProvince: z.string().optional(),
    zipPostalCode: z.string().optional(),
  }).optional(),

  // Step 5 - Legal Consents
  agreeToTerms: z.boolean(),
  agreeToPrivacy: z.boolean(),
  agreeToDataProcessing: z.boolean(),
  agreeToAiFairUse: z.boolean(),
  agreeToGdprDataProcessing: z.boolean(),
  agreeToComplaints: z.boolean(),
  consentTimestamp: z.string().optional(),
  consentIpAddress: z.string().optional(),
  consentVersion: z.string().optional().default('1.0'),
}).refine(
  (data) => {
    // Phone number format validation
    const phoneRegex = /^\+\d{1,3}\d{10,14}$/;
    return phoneRegex.test(data.adminPhone);
  },
  {
    message: 'Phone number must include country code (e.g., +1234567890)',
    path: ['adminPhone'],
  }
).refine(
  (data) => {
    // DSP Company Name validation - required if Amazon DSP
    if (data.isAmazonDSP) {
      return data.dspCompanyName && data.dspCompanyName.length > 0;
    }
    return true;
  },
  {
    message: 'DSP Company Name is required',
    path: ['dspCompanyName'],
  }
).refine(
  (data) => {
    // Station Codes validation - required if Amazon DSP
    if (data.isAmazonDSP) {
      return data.stationCodes && data.stationCodes.length > 0;
    }
    return true;
  },
  {
    message: 'At least one station code is required',
    path: ['stationCodes'],
  }
).refine(
  (data) => {
    // DSP Owner Name validation - required if Amazon DSP
    if (data.isAmazonDSP) {
      return data.dspOwnerName && data.dspOwnerName.length > 0;
    }
    return true;
  },
  {
    message: 'DSP Owner Name is required',
    path: ['dspOwnerName'],
  }
).refine(
  (data) => {
    // Ops Manager Name validation - required if Amazon DSP
    if (data.isAmazonDSP) {
      return data.opsManagerName && data.opsManagerName.length > 0;
    }
    return true;
  },
  {
    message: 'Ops Manager / Fleet Manager Name is required',
    path: ['opsManagerName'],
  }
).refine(
  (data) => {
    // Billing frequency validation - required for paid plans
    if (data.plan !== 'Free') {
      return data.billingFrequency !== undefined;
    }
    return true;
  },
  {
    message: 'Billing frequency is required for paid plans',
    path: ['billingFrequency'],
  }
).refine(
  (data) => {
    // Payment method validation - required for paid non-Enterprise plans
    if (data.plan !== 'Free' && data.plan !== 'Enterprise') {
      return data.paymentMethod !== undefined;
    }
    return true;
  },
  {
    message: 'Payment method is required',
    path: ['paymentMethod'],
  }
).refine(
  (data) => {
    // Billing contact name validation - required for paid plans
    if (data.plan !== 'Free') {
      return data.billingContactName && data.billingContactName.length > 0;
    }
    return true;
  },
  {
    message: 'Billing contact name is required',
    path: ['billingContactName'],
  }
).refine(
  (data) => {
    // Billing contact email validation - required for paid plans
    if (data.plan !== 'Free') {
      return data.billingContactEmail && data.billingContactEmail.length > 0;
    }
    return true;
  },
  {
    message: 'Billing contact email is required',
    path: ['billingContactEmail'],
  }
).refine(
  (data) => {
    // Terms of Service - always required
    return data.agreeToTerms === true;
  },
  {
    message: 'You must agree to the Terms of Service',
    path: ['agreeToTerms'],
  }
).refine(
  (data) => {
    // Privacy Policy - always required
    return data.agreeToPrivacy === true;
  },
  {
    message: 'You must agree to the Privacy Policy',
    path: ['agreeToPrivacy'],
  }
).refine(
  (data) => {
    // Data Processing Addendum - always required
    return data.agreeToDataProcessing === true;
  },
  {
    message: 'You must agree to the Data Processing Addendum',
    path: ['agreeToDataProcessing'],
  }
).refine(
  (data) => {
    // AI Fair Use Policy - always required
    return data.agreeToAiFairUse === true;
  },
  {
    message: 'You must agree to the AI Fair Use Policy',
    path: ['agreeToAiFairUse'],
  }
).refine(
  (data) => {
    // GDPR Data Processing Addendum - always required
    return data.agreeToGdprDataProcessing === true;
  },
  {
    message: 'You must agree to the GDPR Data Processing Addendum',
    path: ['agreeToGdprDataProcessing'],
  }
).refine(
  (data) => {
    // Complaints Policy - always required
    return data.agreeToComplaints === true;
  },
  {
    message: 'You must agree to the Complaints Policy',
    path: ['agreeToComplaints'],
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
