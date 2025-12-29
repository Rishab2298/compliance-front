import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Check,
  Mail,
  Phone,
  CreditCard,
  DollarSign,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { onboardingSchema } from "../schemas/onboardingSchema";
import { useNavigate } from "react-router-dom";
import CSVUploadDialog from "@/components/CSVUploadDialog";
import PolicyModal from "@/components/PolicyModal";
import { bulkImportDrivers } from "@/api/drivers";
import { upgradePlan } from "@/api/billing";
import { toast } from "sonner";
import { getAllLatestPublishedPolicies } from "@/api/policies";

export default function OnboardingDark() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [bulkUploadedDrivers, setBulkUploadedDrivers] = useState([]);
  const [showOperatingAddressForm, setShowOperatingAddressForm] = useState(false);
  const [currentOperatingAddress, setCurrentOperatingAddress] = useState({
    street: "",
    city: "",
    stateProvince: "",
    zipPostalCode: "",
  });

  // Policy modal state
  const [activePolicyModal, setActivePolicyModal] = useState(null);
  const [preloadedPolicies, setPreloadedPolicies] = useState({});
  const [policiesLoading, setPoliciesLoading] = useState(true);
  const [policiesLoaded, setPoliciesLoaded] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const { getToken } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const { user, isLoaded } = useUser();

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      // Step 1 - Company Information
      legalCompanyName: "",
      operatingName: "",
      country: "",
      entityType: "",
      businessRegistrationNumber: "",
      registeredAddress: {
        street: "",
        city: "",
        stateProvince: "",
        zipPostalCode: "",
      },
      operatingAddresses: [],
      sameAsRegistered: true,
      companyWebsite: "",
      companySize: "",
      statesProvinces: [],
      industryType: "",
      // Step 2 - DSP Verification
      isAmazonDSP: false,
      dspCompanyName: "",
      stationCodes: [],
      dspOwnerName: "",
      opsManagerName: "",
      dspId: "",
      documents: ["Driver's License"],
      reminderDays: ["90d", "30d", "7d"],
      // Step 3 - Primary Admin Account
      adminFullName: "",
      adminEmail: "",
      adminPhone: "",
      // Step 4 - Billing Setup
      plan: "Free",
      billingFrequency: "monthly",
      paymentMethod: "card",
      billingContactName: "",
      billingContactEmail: "",
      billingAddress: {
        street: "",
        city: "",
        stateProvince: "",
        zipPostalCode: "",
      },
      // Step 5 - Legal Consents
      agreeToTerms: false,
      agreeToPrivacy: false,
      agreeToDataProcessing: false,
      agreeToAiFairUse: false,
      agreeToGdprDataProcessing: false,
      agreeToComplaints: false,
      consentTimestamp: "",
      consentIpAddress: "",
      consentVersion: "1.0",
    },
    mode: "onChange",
  });

  const formData = watch();

  const totalSteps = 4;

  // Pre-populate admin data from Clerk user
  useEffect(() => {
    if (!isLoaded) return; // wait for user to load

    if (user) {
      const role = user.publicMetadata?.role;
      const companyId = user.publicMetadata?.companyId;

      // Redirect SUPER_ADMIN to super admin dashboard
      if (role === 'SUPER_ADMIN') {
        navigate("/super-admin/dashboard");
        return;
      }

      // Redirect regular users with company to dashboard
      if (companyId) {
        navigate("/client/dashboard");
        return;
      }

      // Pre-populate admin email from Clerk user
      if (user.primaryEmailAddress?.emailAddress) {
        setValue("adminEmail", user.primaryEmailAddress.emailAddress);
      }

      // Pre-populate admin full name if available
      if (user.fullName) {
        setValue("adminFullName", user.fullName);
      } else if (user.firstName && user.lastName) {
        setValue("adminFullName", `${user.firstName} ${user.lastName}`);
      } else if (user.firstName) {
        setValue("adminFullName", user.firstName);
      }
    }
  }, [user, isLoaded, navigate, setValue]);

  // Preload all policies when component mounts
  useEffect(() => {
    const CACHE_KEY = 'onboarding_policies_cache';
    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

    const preloadPolicies = async () => {
      try {
        // Check sessionStorage cache first
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          try {
            const { policies: cachedPolicies, timestamp } = JSON.parse(cachedData);
            const isExpired = Date.now() - timestamp > CACHE_DURATION;

            if (!isExpired && cachedPolicies) {
              console.log('✅ Using cached policies from sessionStorage');
              setPreloadedPolicies(cachedPolicies);
              setPoliciesLoaded(true);
              setPoliciesLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse cached policies, fetching fresh:', e);
          }
        }

        console.log('🔄 Preloading policies from server...');
        setPoliciesLoading(true);

        // Fetch policies
        const policies = await getAllLatestPublishedPolicies();

        // Convert array to object with type as key for easy lookup
        const policiesMap = policies.reduce((acc, policy) => {
          acc[policy.type] = policy;
          return acc;
        }, {});

        // Cache in sessionStorage
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          policies: policiesMap,
          timestamp: Date.now()
        }));

        setPreloadedPolicies(policiesMap);
        setPoliciesLoaded(true);
        setShowSuccessBanner(true);
        console.log('✅ Policies preloaded and cached successfully:', Object.keys(policiesMap));

        // Auto-hide success banner after 5 seconds
        setTimeout(() => {
          setShowSuccessBanner(false);
        }, 5000);
      } catch (error) {
        console.error('❌ Failed to preload policies:', error);
        // Don't block onboarding if preloading fails
        // Policies will be fetched individually when modals open
        setPoliciesLoaded(true); // Mark as "loaded" to hide loading state
      } finally {
        setPoliciesLoading(false);
      }
    };

    preloadPolicies();
  }, []);

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
    "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
    "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
    "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
    "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos",
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
    "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
    "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
    "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
    "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
    "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
    "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
    "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
    "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  const entityTypes = ["Corp", "Inc", "LLC", "Ltd", "Partnership", "Sole Proprietorship", "Other"];

  const updateFormData = (field, value) => {
    setValue(field, value, { shouldValidate: true });
  };

  // Policy configuration mapping
  const policyConfig = {
    agreeToTerms: {
      type: 'TERMS_OF_SERVICE',
      label: 'Terms of Service'
    },
    agreeToPrivacy: {
      type: 'PRIVACY_POLICY',
      label: 'Privacy Policy'
    },
    agreeToDataProcessing: {
      type: 'DATA_PROCESSING_AGREEMENT',
      label: 'Data Processing Addendum'
    },
    agreeToAiFairUse: {
      type: 'AI_FAIR_USE_POLICY',
      label: 'AI Fair Use Policy'
    },
    agreeToGdprDataProcessing: {
      type: 'GDPR_DATA_PROCESSING_ADDENDUM',
      label: 'GDPR Data Processing Addendum'
    },
    agreeToComplaints: {
      type: 'COMPLAINTS_POLICY',
      label: 'Complaints Policy'
    }
  };

  // Policy modal handlers
  const handlePolicyCheckboxClick = (fieldName) => {
    setActivePolicyModal(fieldName);
  };

  const handlePolicyAccept = (fieldName) => {
    updateFormData(fieldName, true);
    setActivePolicyModal(null);
  };

  const handlePolicyModalClose = () => {
    setActivePolicyModal(null);
  };

  // Format phone number to ensure it starts with country code
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');

    // If doesn't start with +, add +1 for US/Canada by default
    if (!cleaned.startsWith('+')) {
      if (cleaned.length > 0) {
        cleaned = '+1' + cleaned;
      }
    }

    return cleaned;
  };

  const addStationCode = (code) => {
    if (code && !formData.stationCodes.includes(code)) {
      setValue("stationCodes", [...formData.stationCodes, code], { shouldValidate: true });
    }
  };

  const removeStationCode = (code) => {
    setValue("stationCodes", formData.stationCodes.filter(c => c !== code), { shouldValidate: true });
  };

  const addOperatingAddress = () => {
    // Validate that all fields are filled
    if (
      !currentOperatingAddress.street ||
      !currentOperatingAddress.city ||
      !currentOperatingAddress.stateProvince ||
      !currentOperatingAddress.zipPostalCode
    ) {
      toast.error("Please fill in all operating address fields");
      return;
    }

    // Add to operatingAddresses array
    setValue("operatingAddresses", [...formData.operatingAddresses, currentOperatingAddress], {
      shouldValidate: true,
    });

    // Reset form and hide it
    setCurrentOperatingAddress({
      street: "",
      city: "",
      stateProvince: "",
      zipPostalCode: "",
    });
    setShowOperatingAddressForm(false);
  };

  const removeOperatingAddress = (index) => {
    setValue("operatingAddresses", formData.operatingAddresses.filter((_, i) => i !== index), {
      shouldValidate: true,
    });
  };

  const handleCSVUpload = async (driversData) => {
    try {
      const token = await getToken();
      const results = await bulkImportDrivers(driversData, token);

      // Update state with successful uploads
      if (results.successful.length > 0) {
        setBulkUploadedDrivers(results.successful);
        toast.success(`Successfully imported ${results.successful.length} driver(s)`);
      }

      // Show limit warning if limit was reached
      if (results.limitReached) {
        toast.warning(`Driver limit reached!`, {
          description: `Successfully added ${results.successful.length} driver(s). ${results.failed.length} driver(s) could not be added. Free plan allows up to 5 drivers. Please upgrade to add more.`,
          duration: 8000,
        });
      } else if (results.failed.length > 0) {
        // Show regular errors
        const failedDrivers = results.failed.slice(0, 3).map(f => `${f.firstName} ${f.lastName}: ${f.error}`).join('\n');
        const moreText = results.failed.length > 3 ? `\n...and ${results.failed.length - 3} more` : '';

        toast.error(`Failed to import ${results.failed.length} driver(s)`, {
          description: failedDrivers + moreText,
          duration: 6000,
        });
      }

      // If nothing succeeded and nothing failed, something is wrong
      if (results.successful.length === 0 && results.failed.length === 0) {
        toast.error('No drivers were imported. Please check your CSV file.');
      }
    } catch (error) {
      console.error('Error bulk uploading drivers:', error);
      throw error;
    }
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    let fieldsToValidate = [];
    let isOptionalStep = false;

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "legalCompanyName",
          "operatingName",
          "country",
          "entityType",
          "businessRegistrationNumber",
          "registeredAddress",
        ];
        break;
      case 2:
        fieldsToValidate = [
          "adminFullName",
          "adminEmail",
          "adminPhone",
        ];
        break;
      case 3:
        // Step 3 (Billing Setup) - Conditional validation based on plan
        if (formData.plan !== 'Free') {
          fieldsToValidate = [
            "plan",
            "billingFrequency",
            "billingContactName",
            "billingContactEmail",
          ];
          // Add payment method for non-Enterprise plans
          if (formData.plan !== 'Enterprise') {
            fieldsToValidate.push("paymentMethod");
          }
        } else {
          // Free plan only needs plan selection
          fieldsToValidate = ["plan"];
        }
        break;
      case 4:
        // Step 4 (Legal Consents) - All policies are now required
        fieldsToValidate = [
          "agreeToTerms",
          "agreeToPrivacy",
          "agreeToDataProcessing",
          "agreeToAiFairUse",
          "agreeToGdprDataProcessing",
          "agreeToComplaints"
        ];
        break;
    }

    // For required steps, validate all fields before proceeding
    if (!isOptionalStep && fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        // Prevent navigation if validation fails
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Get the Clerk auth token
      const token = await getToken();

      if (!token) {
        toast.error("Please sign in to complete onboarding.");
        return;
      }

      // Capture consent metadata
      const consentData = {
        ...data,
        consentTimestamp: new Date().toISOString(),
        consentIpAddress: await fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(ipData => ipData.ip)
          .catch(() => 'unknown'),
      };

      // First, sync the user to ensure they exist in the database
      console.log("Syncing user with database...");
      const syncResponse = await fetch(`${API_URL}/api/users/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!syncResponse.ok) {
        const syncError = await syncResponse.json();
        console.error("User sync error:", syncError);
        throw new Error(syncError.error || "Failed to sync user");
      }

      const syncResult = await syncResponse.json();
      console.log("User synced:", syncResult);

      // Now submit the onboarding data with consent metadata
      const response = await fetch(`${API_URL}/api/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(consentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.error || "Failed to save onboarding data");
      }

      const onboardingResult = await response.json();
      console.log("Onboarding result:", onboardingResult);

      // If paid plan, redirect to Stripe checkout
      if (data.plan !== 'Free') {
        toast.success("Onboarding completed! Setting up payment...");

        // Wait for database transaction to commit and Clerk session to sync
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
          console.log("Calling upgradePlan with:", { plan: data.plan, billingFrequency: data.billingFrequency });

          // Get fresh token to ensure Clerk session is updated
          const freshToken = await getToken();
          const result = await upgradePlan(data.plan, data.billingFrequency, freshToken);

          console.log("Upgrade plan result:", result);

          if (result.checkoutUrl) {
            toast.success("Redirecting to payment gateway...");
            // Redirect to Stripe checkout
            window.location.href = result.checkoutUrl;
          } else {
            console.error("No checkout URL in result:", result);
            throw new Error("No checkout URL received");
          }
        } catch (billingError) {
          console.error("=== Billing Setup Error ===");
          console.error("Error object:", billingError);
          console.error("Error message:", billingError.message);
          console.error("Error stack:", billingError.stack);

          // Show detailed error to user for debugging
          const errorMessage = billingError.message || 'Unknown error occurred';

          toast.error(`Payment setup failed: ${errorMessage}`, {
            description: "You can set up billing from the dashboard.",
            duration: 5000,
          });

          console.log("Navigating to dashboard after error...");

          // Wait a moment before navigating
          await new Promise(resolve => setTimeout(resolve, 2000));
          navigate("/client/dashboard");
        }
      } else {
        // Free plan - wait for Clerk session to sync before navigating
        toast.success("Onboarding completed successfully!");

        // Wait for database transaction to commit and Clerk session to sync
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Force refresh Clerk session to ensure companyId is updated
        await getToken();

        navigate("/client/dashboard");
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast.error(`Failed to save onboarding data: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-8 space-y-2 text-center">
              <div className="inline-block p-3 mb-4 rounded-[10px] bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-purple-500/20">
                <Building2 className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Company Information
              </h2>
              <p className="text-slate-400">
                Let's start with the legal details about your company
              </p>
            </div>

            <div className="space-y-4">
              {/* Legal Company Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Legal Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.legalCompanyName}
                  onChange={(e) =>
                    updateFormData("legalCompanyName", e.target.value)
                  }
                  placeholder="e.g., ABC Logistics Inc."
                  className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent rounded-[10px] ${
                    errors.legalCompanyName
                      ? "border border-red-500 focus:ring-red-500"
                      : "border border-slate-700 focus:ring-violet-500"
                  }`}
                />
                {errors.legalCompanyName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.legalCompanyName.message}
                  </p>
                )}
              </div>

              {/* Operating Name (DBA) */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Operating Name (DBA) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.operatingName}
                  onChange={(e) =>
                    updateFormData("operatingName", e.target.value)
                  }
                  placeholder="e.g., ABC Delivery Services"
                  className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent rounded-[10px] ${
                    errors.operatingName
                      ? "border border-red-500 focus:ring-red-500"
                      : "border border-slate-700 focus:ring-violet-500"
                  }`}
                />
                {errors.operatingName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.operatingName.message}
                  </p>
                )}
              </div>

              {/* Country Selection */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => updateFormData("country", e.target.value)}
                  className={`w-full px-4 py-3 text-white bg-slate-800 focus:outline-none focus:ring-2 rounded-[10px] ${
                    errors.country
                      ? "border border-red-500 focus:ring-red-500"
                      : "border border-slate-700 focus:ring-violet-500"
                  }`}>
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.country.message}
                  </p>
                )}
              </div>

              {/* Entity Type */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Entity Type *
                </label>
                <select
                  value={formData.entityType}
                  onChange={(e) =>
                    updateFormData("entityType", e.target.value)
                  }
                  className={`w-full px-4 py-3 text-white bg-slate-800 focus:outline-none focus:ring-2 rounded-[10px] ${
                    errors.entityType
                      ? "border border-red-500 focus:ring-red-500"
                      : "border border-slate-700 focus:ring-violet-500"
                  }`}>
                  <option value="">Select entity type</option>
                  {entityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.entityType && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.entityType.message}
                  </p>
                )}
              </div>

              {/* Business Registration Number */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Business Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) =>
                    updateFormData("businessRegistrationNumber", e.target.value)
                  }
                  placeholder="e.g., 123456789, XX-XXXXXXX, or your country's format"
                  className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                    errors.businessRegistrationNumber
                      ? "border border-red-500 focus:ring-red-500"
                      : "border border-slate-700 focus:ring-violet-500"
                  }`}
                />
                {errors.businessRegistrationNumber && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.businessRegistrationNumber.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Enter your EIN, Corporation Number, Tax ID, or equivalent registration number
                </p>
              </div>

              {/* Registered Address */}
              <div className="p-4 border border-slate-700 bg-slate-800/50 rounded-[10px]">
                <h3 className="mb-3 text-sm font-semibold text-white">
                  Registered Address *
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-slate-400">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.registeredAddress?.street || ""}
                      onChange={(e) =>
                        setValue("registeredAddress", {
                          ...formData.registeredAddress,
                          street: e.target.value,
                        }, { shouldValidate: true })
                      }
                      placeholder="123 Main Street"
                      className={`w-full px-3 py-2 text-sm text-white bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                        errors.registeredAddress?.street
                          ? "border border-red-500 focus:ring-red-500"
                          : "border border-slate-700 focus:ring-violet-500"
                      }`}
                    />
                    {errors.registeredAddress?.street && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.registeredAddress.street.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-xs font-medium text-slate-400">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.registeredAddress?.city || ""}
                        onChange={(e) =>
                          setValue("registeredAddress", {
                            ...formData.registeredAddress,
                            city: e.target.value,
                          }, { shouldValidate: true })
                        }
                        placeholder="City"
                        className={`w-full px-3 py-2 text-sm text-white bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                          errors.registeredAddress?.city
                            ? "border border-red-500 focus:ring-red-500"
                            : "border border-slate-700 focus:ring-violet-500"
                        }`}
                      />
                      {errors.registeredAddress?.city && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.registeredAddress.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-slate-400">
                        State/Province/Region *
                      </label>
                      <input
                        type="text"
                        value={formData.registeredAddress?.stateProvince || ""}
                        onChange={(e) =>
                          setValue("registeredAddress", {
                            ...formData.registeredAddress,
                            stateProvince: e.target.value,
                          }, { shouldValidate: true })
                        }
                        placeholder="e.g., Ontario, California, etc."
                        className={`w-full px-3 py-2 text-sm text-white bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                          errors.registeredAddress?.stateProvince
                            ? "border border-red-500 focus:ring-red-500"
                            : "border border-slate-700 focus:ring-violet-500"
                        }`}
                      />
                      {errors.registeredAddress?.stateProvince && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.registeredAddress.stateProvince.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-slate-400">
                      Postal Code / ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.registeredAddress?.zipPostalCode || ""}
                      onChange={(e) =>
                        setValue("registeredAddress", {
                          ...formData.registeredAddress,
                          zipPostalCode: e.target.value,
                        }, { shouldValidate: true })
                      }
                      placeholder="e.g., A1A 1A1, 12345, etc."
                      className={`w-full px-3 py-2 text-sm text-white bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                        errors.registeredAddress?.zipPostalCode
                          ? "border border-red-500 focus:ring-red-500"
                          : "border border-slate-700 focus:ring-violet-500"
                      }`}
                    />
                    {errors.registeredAddress?.zipPostalCode && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.registeredAddress.zipPostalCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Operating/Warehouse Address */}
              <div>
                <label className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.sameAsRegistered}
                    onChange={(e) => {
                      updateFormData("sameAsRegistered", e.target.checked);
                      if (e.target.checked) {
                        setShowOperatingAddressForm(false);
                      }
                    }}
                    className="w-4 h-4 rounded text-violet-500 bg-slate-700 border-slate-600 focus:ring-violet-500"
                  />
                  Operating address is same as registered address
                </label>
                {!formData.sameAsRegistered && (
                  <div className="p-4 border border-slate-700 bg-slate-800/50 rounded-[10px]">
                    <p className="mb-3 text-xs text-slate-400">
                      Add your operating/warehouse addresses
                    </p>

                    {/* Display saved operating addresses */}
                    {formData.operatingAddresses.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {formData.operatingAddresses.map((address, index) => (
                          <div
                            key={index}
                            className="p-3 bg-slate-900 border border-slate-700 rounded-[10px] flex justify-between items-start">
                            <div className="text-xs text-slate-300">
                              <p>{address.street}</p>
                              <p>
                                {address.city}, {address.stateProvince} {address.zipPostalCode}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOperatingAddress(index)}
                              className="text-xs text-red-400 hover:text-red-300">
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {!showOperatingAddressForm && (
                      <button
                        type="button"
                        onClick={() => setShowOperatingAddressForm(true)}
                        className="text-sm text-violet-400 hover:text-violet-300">
                        + Add Operating Address
                      </button>
                    )}

                    {showOperatingAddressForm && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="block mb-1 text-xs font-medium text-slate-400">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={currentOperatingAddress.street}
                            onChange={(e) =>
                              setCurrentOperatingAddress({
                                ...currentOperatingAddress,
                                street: e.target.value,
                              })
                            }
                            placeholder="123 Main Street"
                            className="w-full px-3 py-2 text-sm text-white bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-700 rounded-[10px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block mb-1 text-xs font-medium text-slate-400">
                              City *
                            </label>
                            <input
                              type="text"
                              value={currentOperatingAddress.city}
                              onChange={(e) =>
                                setCurrentOperatingAddress({
                                  ...currentOperatingAddress,
                                  city: e.target.value,
                                })
                              }
                              placeholder="City"
                              className="w-full px-3 py-2 text-sm text-white bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-700 rounded-[10px]"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-medium text-slate-400">
                              State/Province/Region *
                            </label>
                            <input
                              type="text"
                              value={currentOperatingAddress.stateProvince}
                              onChange={(e) =>
                                setCurrentOperatingAddress({
                                  ...currentOperatingAddress,
                                  stateProvince: e.target.value,
                                })
                              }
                              placeholder="e.g., Ontario, California, etc."
                              className="w-full px-3 py-2 text-sm text-white bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-700 rounded-[10px]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-slate-400">
                            Postal Code / ZIP Code *
                          </label>
                          <input
                            type="text"
                            value={currentOperatingAddress.zipPostalCode}
                            onChange={(e) =>
                              setCurrentOperatingAddress({
                                ...currentOperatingAddress,
                                zipPostalCode: e.target.value,
                              })
                            }
                            placeholder="e.g., A1A 1A1, 12345, etc."
                            className="w-full px-3 py-2 text-sm text-white bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-700 rounded-[10px]"
                          />
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setShowOperatingAddressForm(false);
                              setCurrentOperatingAddress({
                                street: "",
                                city: "",
                                stateProvince: "",
                                zipPostalCode: "",
                              });
                            }}
                            className="px-4 py-2 text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-[10px] transition-colors">
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={addOperatingAddress}
                            className="px-4 py-2 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded-[10px] transition-colors">
                            Save Address
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Company Website */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Company Website <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.companyWebsite}
                  onChange={(e) =>
                    updateFormData("companyWebsite", e.target.value)
                  }
                  placeholder="https://www.yourcompany.com"
                  className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                    errors.companyWebsite
                      ? "border border-red-500 focus:ring-red-500"
                      : "border border-slate-700 focus:ring-violet-500"
                  }`}
                />
                {errors.companyWebsite && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.companyWebsite.message}
                  </p>
                )}
              </div>

            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-8 space-y-2 text-center">
              <div className="inline-block p-3 mb-4 rounded-[10px] bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-purple-500/20">
                <img src="/logo.png" alt="Complyo Logo" className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Primary Admin Account
              </h2>
              <p className="text-slate-400">
                Set up the main administrator for your company
              </p>
            </div>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.adminFullName}
                  onChange={(e) =>
                    updateFormData("adminFullName", e.target.value)
                  }
                  placeholder="e.g., John Smith"
                  className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                    errors.adminFullName
                      ? "border border-red-500 focus:ring-red-500"
                      : "border border-slate-700 focus:ring-violet-500"
                  }`}
                />
                {errors.adminFullName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.adminFullName.message}
                  </p>
                )}
              </div>

              {/* Work Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Work Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) =>
                      updateFormData("adminEmail", e.target.value)
                    }
                    placeholder="admin@company.com"
                    className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                      errors.adminEmail
                        ? "border border-red-500 focus:ring-red-500"
                        : "border border-slate-700 focus:ring-violet-500"
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
                {errors.adminEmail && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.adminEmail.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  This email is automatically fetched from your account
                </p>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.adminPhone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      updateFormData("adminPhone", formatted);
                    }}
                    placeholder="+1 234 567 8900"
                    className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                      errors.adminPhone
                        ? "border border-red-500 focus:ring-red-500"
                        : "border border-slate-700 focus:ring-violet-500"
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <Phone className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
                {errors.adminPhone && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.adminPhone.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Include country code (e.g., +1 for US/Canada)
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-[10px]">
                <div className="flex gap-3">
                  <img src="/logo.png" alt="Complyo Logo" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-violet-300">Primary Administrator</p>
                    <p className="mt-1 text-sm text-slate-300">
                      This account will have full access to all company settings, driver management, and compliance tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-8 space-y-2 text-center">
              <div className="inline-block p-3 mb-4 rounded-[10px] bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-purple-500/20">
                <CreditCard className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Billing Setup</h2>
              <p className="text-slate-400">
                Choose your plan and set up billing information
              </p>
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block mb-3 text-sm font-medium text-slate-300">
                Select Your Plan *
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { name: 'Free', price: '$0', features: ['Basic features', 'Email support'] },
                  { name: 'Starter', price: '$49', features: ['All Free features', 'SMS notifications', 'Priority support'] },
                  { name: 'Professional', price: '$149', features: ['All Starter features', 'Advanced analytics', 'API access'] }
                ].map((plan) => (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() => updateFormData("plan", plan.name)}
                    className={`p-4 text-left border rounded-[10px] transition-all ${
                      formData.plan === plan.name
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                        <p className="text-sm text-slate-400">{plan.price}/month</p>
                      </div>
                      {formData.plan === plan.name && (
                        <Check className="w-5 h-5 text-violet-400" />
                      )}
                    </div>
                    <ul className="space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="w-1 h-1 rounded-full bg-violet-400"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              {errors.plan && (
                <p className="mt-1 text-sm text-red-400">{errors.plan.message}</p>
              )}
            </div>

            {/* Conditional Fields for Paid Plans */}
            {formData.plan !== 'Free' && (
              <>
                {/* Billing Frequency */}
                <div>
                  <label className="block mb-3 text-sm font-medium text-slate-300">
                    Billing Frequency *
                  </label>
                  <div className="flex gap-3">
                    {['monthly', 'yearly'].map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => updateFormData("billingFrequency", freq)}
                        className={`flex-1 px-4 py-3 border rounded-[10px] transition-all ${
                          formData.billingFrequency === freq
                            ? 'border-violet-500 bg-violet-500/10 text-white'
                            : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                        }`}>
                        <div className="flex items-center justify-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium capitalize">{freq}</span>
                        </div>
                        {freq === 'yearly' && (
                          <span className="block mt-1 text-xs text-green-400">Save 20%</span>
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.billingFrequency && (
                    <p className="mt-1 text-sm text-red-400">{errors.billingFrequency.message}</p>
                  )}
                </div>

                {/* Payment Method - Not for Enterprise */}
                {formData.plan !== 'Enterprise' && (
                  <div>
                    <label className="block mb-3 text-sm font-medium text-slate-300">
                      Payment Method *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'card', label: 'Credit/Debit Card' },
                        { value: 'ach', label: 'ACH Transfer' },
                        { value: 'pad', label: 'PAD (Canada)' }
                      ].map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => updateFormData("paymentMethod", method.value)}
                          className={`px-4 py-3 border rounded-[10px] transition-all ${
                            formData.paymentMethod === method.value
                              ? 'border-violet-500 bg-violet-500/10 text-white'
                              : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                          }`}>
                          {method.label}
                        </button>
                      ))}
                    </div>
                    {errors.paymentMethod && (
                      <p className="mt-1 text-sm text-red-400">{errors.paymentMethod.message}</p>
                    )}
                  </div>
                )}

                {/* Invoice notice for Enterprise */}
                {formData.plan === 'Enterprise' && (
                  <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-[10px]">
                    <p className="text-sm text-violet-300">
                      Enterprise plan uses invoice billing. Our team will contact you to set up your account.
                    </p>
                  </div>
                )}

                {/* Billing Contact Name */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    Billing Contact Name *
                  </label>
                  <input
                    type="text"
                    value={formData.billingContactName}
                    onChange={(e) => updateFormData("billingContactName", e.target.value)}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 text-white bg-slate-800 border placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-[10px] ${
                      errors.billingContactName ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.billingContactName && (
                    <p className="mt-1 text-sm text-red-400">{errors.billingContactName.message}</p>
                  )}
                </div>

                {/* Billing Contact Email */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    Billing Contact Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute w-5 h-5 text-slate-400 left-3 top-3.5" />
                    <input
                      type="email"
                      value={formData.billingContactEmail}
                      onChange={(e) => updateFormData("billingContactEmail", e.target.value)}
                      placeholder="billing@company.com"
                      className={`w-full pl-10 pr-4 py-3 text-white bg-slate-800 border placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-[10px] ${
                        errors.billingContactEmail ? 'border-red-500' : 'border-slate-700'
                      }`}
                    />
                  </div>
                  {errors.billingContactEmail && (
                    <p className="mt-1 text-sm text-red-400">{errors.billingContactEmail.message}</p>
                  )}
                </div>

                {/* Billing Address */}
                <div>
                  <label className="block mb-3 text-sm font-medium text-slate-300">
                    Billing Address
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.billingAddress?.street || ''}
                      onChange={(e) => updateFormData("billingAddress", {
                        ...formData.billingAddress,
                        street: e.target.value
                      })}
                      placeholder="Street Address"
                      className="w-full px-4 py-3 text-white bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-[10px]"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={formData.billingAddress?.city || ''}
                        onChange={(e) => updateFormData("billingAddress", {
                          ...formData.billingAddress,
                          city: e.target.value
                        })}
                        placeholder="City"
                        className="w-full px-4 py-3 text-white bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-[10px]"
                      />
                      <input
                        type="text"
                        value={formData.billingAddress?.stateProvince || ''}
                        onChange={(e) => updateFormData("billingAddress", {
                          ...formData.billingAddress,
                          stateProvince: e.target.value
                        })}
                        placeholder="State/Province"
                        className="w-full px-4 py-3 text-white bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-[10px]"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.billingAddress?.zipPostalCode || ''}
                      onChange={(e) => updateFormData("billingAddress", {
                        ...formData.billingAddress,
                        zipPostalCode: e.target.value
                      })}
                      placeholder="ZIP/Postal Code"
                      className="w-full px-4 py-3 text-white bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-[10px]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Free Plan Notice */}
            {formData.plan === 'Free' && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-[10px]">
                <p className="text-sm text-green-300">
                  You've selected the Free plan. No payment information required!
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        const isUS = formData.country === 'United States';
        const isCanada = formData.country === 'Canada';
        const termsLink = '/policies/terms-of-service';
        const privacyLink = '/policies/privacy-policy';
        const dpaLink = '/policies/data-processing-agreement';
        const aiFairUseLink = '/policies/ai-fair-use-policy';
        const gdprDpaLink = '/policies/gdpr-data-processing-addendum';
        const complaintsLink = '/policies/complaints-policy';

        return (
          <div className="space-y-6">
            <div className="mb-8 space-y-2 text-center">
              <div className="inline-block p-3 mb-4 rounded-[10px] bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-purple-500/20">
                <FileCheck className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Legal Consents</h2>
              <p className="text-slate-400">
                Please review and accept our terms and policies
              </p>
            </div>

            {/* Policy Loading Notice */}
            {policiesLoading && !policiesLoaded && (
              <div className="p-4 border rounded-[10px] bg-blue-500/10 border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5">
                    <svg className="animate-spin text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="text-sm text-blue-300">
                    Loading policy documents... This will only take a moment.
                  </p>
                </div>
              </div>
            )}

            {/* Policy Loaded Success - Auto-hides after 5 seconds */}
            {showSuccessBanner && !policiesLoading && policiesLoaded && Object.keys(preloadedPolicies).length > 0 && (
              <div className="p-4 border rounded-[10px] bg-green-500/10 border-green-500/30 transition-opacity duration-500">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-green-300">
                    All policy documents loaded. Click any checkbox below to review.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Terms of Service (Required) */}
              <div className={`p-4 border rounded-[10px] ${
                errors.agreeToTerms ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => {
                      e.preventDefault();
                      handlePolicyCheckboxClick('agreeToTerms');
                    }}
                    className="w-5 h-5 mt-0.5 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      I agree to the{' '}
                      <a
                        href={termsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">
                        Complyo Terms of Service
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      . <span className="text-red-400">*</span>
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Our Terms of Service outline the rules and regulations for using Complyo's services, including user responsibilities and limitations.
                    </p>
                  </div>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-2 ml-8 text-xs text-red-400">{errors.agreeToTerms.message}</p>
                )}
              </div>

              {/* Privacy Policy (Required) */}
              <div className={`p-4 border rounded-[10px] ${
                errors.agreeToPrivacy ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToPrivacy}
                    onChange={(e) => {
                      e.preventDefault();
                      handlePolicyCheckboxClick('agreeToPrivacy');
                    }}
                    className="w-5 h-5 mt-0.5 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      I have read and agree to the{' '}
                      <a
                        href={privacyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">
                        Privacy Policy
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      . <span className="text-red-400">*</span>
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Our Privacy Policy explains how we collect, use, and protect your personal information and driver data.
                    </p>
                  </div>
                </label>
                {errors.agreeToPrivacy && (
                  <p className="mt-2 ml-8 text-xs text-red-400">{errors.agreeToPrivacy.message}</p>
                )}
              </div>

              {/* Data Processing Addendum (Required) */}
              <div className={`p-4 border rounded-[10px] ${
                errors.agreeToDataProcessing ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToDataProcessing}
                    onChange={(e) => {
                      e.preventDefault();
                      handlePolicyCheckboxClick('agreeToDataProcessing');
                    }}
                    className="w-5 h-5 mt-0.5 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      I agree that Complyo processes documents and personal information under the{' '}
                      <a
                        href={dpaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">
                        Data Processing Addendum
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      . <span className="text-red-400">*</span>
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      This addendum defines how Complyo processes, stores, and protects your data in compliance with applicable regulations.
                    </p>
                  </div>
                </label>
                {errors.agreeToDataProcessing && (
                  <p className="mt-2 ml-8 text-xs text-red-400">{errors.agreeToDataProcessing.message}</p>
                )}
              </div>

              {/* AI Fair Use Policy (Required) */}
              <div className={`p-4 border rounded-[10px] ${
                errors.agreeToAiFairUse ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToAiFairUse}
                    onChange={(e) => {
                      e.preventDefault();
                      handlePolicyCheckboxClick('agreeToAiFairUse');
                    }}
                    className="w-5 h-5 mt-0.5 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      I agree to the{' '}
                      <a
                        href={aiFairUseLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">
                        AI Fair Use Policy
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      . <span className="text-red-400">*</span>
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Our AI Fair Use Policy outlines acceptable use of AI-powered features including document analysis, data extraction, and compliance checking.
                    </p>
                  </div>
                </label>
                {errors.agreeToAiFairUse && (
                  <p className="mt-2 ml-8 text-xs text-red-400">{errors.agreeToAiFairUse.message}</p>
                )}
              </div>

              {/* GDPR Data Processing Addendum (Required) */}
              <div className={`p-4 border rounded-[10px] ${
                errors.agreeToGdprDataProcessing ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToGdprDataProcessing}
                    onChange={(e) => {
                      e.preventDefault();
                      handlePolicyCheckboxClick('agreeToGdprDataProcessing');
                    }}
                    className="w-5 h-5 mt-0.5 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      I agree to the{' '}
                      <a
                        href={gdprDpaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">
                        GDPR Data Processing Addendum
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      . <span className="text-red-400">*</span>
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      This addendum ensures compliance with GDPR requirements for data processing, security, and user rights protection.
                    </p>
                  </div>
                </label>
                {errors.agreeToGdprDataProcessing && (
                  <p className="mt-2 ml-8 text-xs text-red-400">{errors.agreeToGdprDataProcessing.message}</p>
                )}
              </div>

              {/* Complaints Policy (Required) */}
              <div className={`p-4 border rounded-[10px] ${
                errors.agreeToComplaints ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToComplaints}
                    onChange={(e) => {
                      e.preventDefault();
                      handlePolicyCheckboxClick('agreeToComplaints');
                    }}
                    className="w-5 h-5 mt-0.5 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      I agree to the{' '}
                      <a
                        href={complaintsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">
                        Complaints Policy
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      . <span className="text-red-400">*</span>
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Our Complaints Policy outlines the process for raising concerns, filing complaints, and resolving disputes with Complyo.
                    </p>
                  </div>
                </label>
                {errors.agreeToComplaints && (
                  <p className="mt-2 ml-8 text-xs text-red-400">{errors.agreeToComplaints.message}</p>
                )}
              </div>

              {/* Region Notice */}
              <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-[10px]">
                <p className="text-xs text-violet-300">
                  {isUS && "🇺🇸 You're viewing US-specific terms and policies."}
                  {isCanada && "🇨🇦 You're viewing Canada-specific terms and policies."}
                  {!isUS && !isCanada && "🌍 General terms and policies apply."}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-w-full min-h-screen text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Decorative elements */}
      <div className="absolute rounded-full top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 blur-3xl"></div>
      <div className="absolute rounded-full bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="p-6 md:p-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] ">
              <img src="/logo.png" alt="Complyo Logo" className="w-8 h-8" />
            </div>
            <span className="text-xl font-bold font-white">
              complyo.co
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 md:px-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-slate-400">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-2 transition-all duration-300 ease-out bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
            </div>
            <div className="flex justify-between mt-4">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex flex-col items-center ${
                    step <= currentStep ? "text-violet-400" : "text-slate-600"
                  }`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step < currentStep
                        ? "bg-violet-500 text-white"
                        : step === currentStep
                        ? "bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 text-white"
                        : "bg-slate-800 text-slate-600"
                    }`}>
                    {step < currentStep ? <Check className="w-4 h-4" /> : step}
                  </div>
                  <span className="hidden mt-2 text-xs md:block">
                    {step === 1 && "Company"}
                    {step === 2 && "Admin"}
                    {step === 3 && "Billing"}
                    {step === 4 && "Legal"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-8 md:px-10">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-[10px] md:p-12">
              {renderStep()}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="p-6 md:p-10">
          <div className="flex items-center justify-between max-w-3xl gap-4 mx-auto">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-[10px] font-medium transition-all ${
                currentStep === 1
                  ? "opacity-0 pointer-events-none"
                  : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
              }`}>
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {/* {currentStep < totalSteps && currentStep <= 3 && (
                <button
                  onClick={() => setCurrentStep(totalSteps)}
                  className="px-6 py-3 font-medium transition-colors rounded-[10px] text-slate-400 hover:text-slate-300">
                  Skip to finish
                </button>
              )} */}
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 font-semibold transition-all rounded-[10px] bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50 group disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting
                  ? "Saving..."
                  : currentStep === totalSteps
                  ? "Complete Setup"
                  : "Continue"}
                {!isSubmitting && (
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-slate-500">
            Need help?{" "}
            <a href="/support" className="text-violet-400 hover:text-violet-300">
              Contact support
            </a>
          </p>
        </div>
      </div>

      <CSVUploadDialog
        isOpen={csvDialogOpen}
        onClose={() => setCsvDialogOpen(false)}
        onUpload={handleCSVUpload}
      />

      {activePolicyModal && (
        <PolicyModal
          isOpen={!!activePolicyModal}
          onClose={handlePolicyModalClose}
          onAccept={() => handlePolicyAccept(activePolicyModal)}
          policyType={policyConfig[activePolicyModal].type}
          policyLabel={policyConfig[activePolicyModal].label}
          isCurrentlyChecked={formData[activePolicyModal]}
          preloadedData={preloadedPolicies[policyConfig[activePolicyModal].type]}
        />
      )}
    </div>
  );
}
