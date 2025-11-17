import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  Shield,
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
import { bulkCreateDrivers } from "@/api/drivers";
import { upgradePlan } from "@/api/billing";
import { toast } from "sonner";

export default function OnboardingDark() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [bulkUploadedDrivers, setBulkUploadedDrivers] = useState([]);
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
      agreeToSmsConsent: false,
      agreeToSupportAccess: false,
      consentTimestamp: "",
      consentIpAddress: "",
      consentVersion: "1.0",
    },
    mode: "onChange",
  });

  const formData = watch();

  const totalSteps = 5;

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

  const countries = ["United States", "Canada"];

  const entityTypes = ["Corp", "Inc", "LLC", "Ltd", "Partnership"];

  const updateFormData = (field, value) => {
    setValue(field, value, { shouldValidate: true });
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

  const handleCSVUpload = async (driversData) => {
    try {
      const token = await getToken();
      const results = await bulkCreateDrivers(driversData, token);

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
        // Conditionally validate DSP fields if user selected "Yes"
        if (formData.isAmazonDSP) {
          fieldsToValidate = [
            "dspCompanyName",
            "stationCodes",
            "dspOwnerName",
            "opsManagerName",
          ];
        }
        // No validation needed if not Amazon DSP
        break;
      case 3:
        fieldsToValidate = [
          "adminFullName",
          "adminEmail",
          "adminPhone",
        ];
        break;
      case 4:
        // Step 4 (Billing Setup) - Conditional validation based on plan
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
      case 5:
        // Step 5 (Legal Consents) - Conditional validation
        fieldsToValidate = ["agreeToTerms", "agreeToPrivacy"];
        // Add Data Processing Addendum if Amazon DSP
        if (formData.isAmazonDSP) {
          fieldsToValidate.push("agreeToDataProcessing");
        }
        // Add SMS Consent if paid plan
        if (formData.plan !== 'Free') {
          fieldsToValidate.push("agreeToSmsConsent");
        }
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
        // Free plan - go straight to dashboard
        toast.success("Onboarding completed successfully!");
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
                <div className="grid grid-cols-2 gap-3">
                  {countries.map((country) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => updateFormData("country", country)}
                      className={`px-4 py-3 rounded-[10px] transition-all flex items-center justify-center gap-2 ${
                        formData.country === country
                          ? "bg-violet-500/20 border border-violet-500 text-violet-400"
                          : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600"
                      } ${errors.country ? "border border-red-500" : ""}`}>
                      {formData.country === country && <Check className="w-4 h-4" />}
                      {country}
                    </button>
                  ))}
                </div>
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
              {formData.country && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    {formData.country === "United States"
                      ? "EIN (Employer Identification Number) *"
                      : "Business Number / Corporation Number *"}
                  </label>
                  <input
                    type="text"
                    value={formData.businessRegistrationNumber}
                    onChange={(e) =>
                      updateFormData("businessRegistrationNumber", e.target.value)
                    }
                    placeholder={
                      formData.country === "United States"
                        ? "XX-XXXXXXX (e.g., 12-3456789)"
                        : "123456789 (9 digits)"
                    }
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
                    {formData.country === "United States"
                      ? "Format: XX-XXXXXXX (two digits, hyphen, seven digits)"
                      : "Format: 9 digits (no spaces or hyphens)"}
                  </p>
                </div>
              )}

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
                        {formData.country === "Canada" ? "Province *" : "State *"}
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
                        placeholder={formData.country === "Canada" ? "e.g., Ontario" : "e.g., California"}
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
                      {formData.country === "Canada" ? "Postal Code *" : "ZIP Code *"}
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
                      placeholder={
                        formData.country === "Canada" ? "A1A 1A1" : "12345"
                      }
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
                    onChange={(e) => updateFormData("sameAsRegistered", e.target.checked)}
                    className="w-4 h-4 rounded text-violet-500 bg-slate-700 border-slate-600 focus:ring-violet-500"
                  />
                  Operating address is same as registered address
                </label>
                {!formData.sameAsRegistered && (
                  <div className="p-4 border border-slate-700 bg-slate-800/50 rounded-[10px]">
                    <p className="mb-3 text-xs text-slate-400">
                      Add your operating/warehouse addresses
                    </p>
                    <button
                      type="button"
                      className="text-sm text-violet-400 hover:text-violet-300">
                      + Add Operating Address
                    </button>
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
                <Building2 className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                DSP Verification
              </h2>
              <p className="text-slate-400">
                Tell us if you're an Amazon Delivery Service Partner
              </p>
            </div>

            <div className="space-y-6">
              {/* Amazon DSP Yes/No Toggle */}
              <div>
                <label className="block mb-3 text-sm font-medium text-slate-300">
                  Are you an Amazon DSP? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateFormData("isAmazonDSP", true)}
                    className={`px-6 py-4 rounded-[10px] transition-all flex items-center justify-center gap-2 ${
                      formData.isAmazonDSP === true
                        ? "bg-violet-500/20 border border-violet-500 text-violet-400"
                        : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}>
                    {formData.isAmazonDSP === true && <Check className="w-5 h-5" />}
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData("isAmazonDSP", false)}
                    className={`px-6 py-4 rounded-[10px] transition-all flex items-center justify-center gap-2 ${
                      formData.isAmazonDSP === false
                        ? "bg-violet-500/20 border border-violet-500 text-violet-400"
                        : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}>
                    {formData.isAmazonDSP === false && <Check className="w-5 h-5" />}
                    No
                  </button>
                </div>
              </div>

              {/* DSP Fields - Show only if Amazon DSP */}
              {formData.isAmazonDSP && (
                <div className="p-6 space-y-4 border border-violet-500/30 bg-violet-500/5 rounded-[10px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Amazon DSP Information
                    </h3>
                  </div>

                  {/* DSP Company Name */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-300">
                      DSP Company Name (as per Amazon Portal) *
                    </label>
                    <input
                      type="text"
                      value={formData.dspCompanyName}
                      onChange={(e) =>
                        updateFormData("dspCompanyName", e.target.value)
                      }
                      placeholder="Enter DSP company name"
                      className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                        errors.dspCompanyName
                          ? "border border-red-500 focus:ring-red-500"
                          : "border border-slate-700 focus:ring-violet-500"
                      }`}
                    />
                    {errors.dspCompanyName && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.dspCompanyName.message}
                      </p>
                    )}
                  </div>

                  {/* Station Codes */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-300">
                      Station Code(s) *
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="stationCodeInput"
                          placeholder="e.g., DLA9, DCA2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target;
                              addStationCode(input.value.trim().toUpperCase());
                              input.value = '';
                            }
                          }}
                          className={`flex-1 px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                            errors.stationCodes
                              ? "border border-red-500 focus:ring-red-500"
                              : "border border-slate-700 focus:ring-violet-500"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('stationCodeInput');
                            addStationCode(input.value.trim().toUpperCase());
                            input.value = '';
                          }}
                          className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-[10px] transition-colors">
                          Add
                        </button>
                      </div>
                      {formData.stationCodes && formData.stationCodes.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-[10px]">
                          {formData.stationCodes.map((code, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-1 bg-violet-500/20 border border-violet-500/50 text-violet-300 rounded-[6px]">
                              <span className="font-mono text-sm">{code}</span>
                              <button
                                type="button"
                                onClick={() => removeStationCode(code)}
                                className="text-violet-400 hover:text-violet-200">
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.stationCodes && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.stationCodes.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* DSP Owner Name */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-300">
                      DSP Owner Name *
                    </label>
                    <input
                      type="text"
                      value={formData.dspOwnerName}
                      onChange={(e) =>
                        updateFormData("dspOwnerName", e.target.value)
                      }
                      placeholder="Enter owner name"
                      className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                        errors.dspOwnerName
                          ? "border border-red-500 focus:ring-red-500"
                          : "border border-slate-700 focus:ring-violet-500"
                      }`}
                    />
                    {errors.dspOwnerName && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.dspOwnerName.message}
                      </p>
                    )}
                  </div>

                  {/* Ops Manager / Fleet Manager */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-300">
                      Ops Manager / Fleet Manager Name *
                    </label>
                    <input
                      type="text"
                      value={formData.opsManagerName}
                      onChange={(e) =>
                        updateFormData("opsManagerName", e.target.value)
                      }
                      placeholder="Enter manager name"
                      className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                        errors.opsManagerName
                          ? "border border-red-500 focus:ring-red-500"
                          : "border border-slate-700 focus:ring-violet-500"
                      }`}
                    />
                    {errors.opsManagerName && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.opsManagerName.message}
                      </p>
                    )}
                  </div>

                  {/* DSP ID (Optional) */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-300">
                      DSP ID <span className="text-slate-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.dspId}
                      onChange={(e) =>
                        updateFormData("dspId", e.target.value)
                      }
                      placeholder="Enter DSP ID"
                      className="w-full px-4 py-3 text-white bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-[10px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-8 space-y-2 text-center">
              <div className="inline-block p-3 mb-4 rounded-[10px] bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-purple-500/20">
                <Shield className="w-8 h-8 text-violet-400" />
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
                  <Shield className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
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

      case 4:
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
                  { name: 'Professional', price: '$149', features: ['All Starter features', 'Advanced analytics', 'API access'] },
                  { name: 'Enterprise', price: 'Custom', features: ['All Professional features', 'Dedicated support', 'Custom integrations'] }
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

      case 5:
        const isUS = formData.country === 'United States';
        const isCanada = formData.country === 'Canada';
        const termsLink = '/policies/terms-of-service';
        const privacyLink = '/policies/privacy-policy';
        const dpaLink = '/policies/data-processing-agreement';
        const smsConsentLink = '/policies/sms-consent';
        const cookieLink = '/policies/cookie-preferences';
        const supportAccessLink = '/policies/support-access';

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

            <div className="space-y-4">
              {/* Terms of Service (Required) */}
              <div className={`p-4 border rounded-[10px] ${
                errors.agreeToTerms ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
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
                    onChange={(e) => updateFormData("agreeToPrivacy", e.target.checked)}
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
                  </div>
                </label>
                {errors.agreeToPrivacy && (
                  <p className="mt-2 ml-8 text-xs text-red-400">{errors.agreeToPrivacy.message}</p>
                )}
              </div>

              {/* Data Processing Addendum (Required for DSPs) */}
              {formData.isAmazonDSP && (
                <div className={`p-4 border rounded-[10px] ${
                  errors.agreeToDataProcessing ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeToDataProcessing}
                      onChange={(e) => updateFormData("agreeToDataProcessing", e.target.checked)}
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
                    </div>
                  </label>
                  {errors.agreeToDataProcessing && (
                    <p className="mt-2 ml-8 text-xs text-red-400">{errors.agreeToDataProcessing.message}</p>
                  )}
                </div>
              )}

              {/* SMS Consent (Required if SMS Enabled - paid plans) */}
              {formData.plan !== 'Free' && (
                <div className={`p-4 border rounded-[10px] ${
                  errors.agreeToSmsConsent ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeToSmsConsent}
                      onChange={(e) => updateFormData("agreeToSmsConsent", e.target.checked)}
                      className="w-5 h-5 mt-0.5 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">
                        I agree to receive{' '}
                        <a
                          href={smsConsentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">
                          SMS alerts
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {' '}from Complyo. Message frequency varies. Reply STOP to opt out, HELP for help. Message & data rates may apply. Consent is not a condition of purchase. <span className="text-red-400">*</span>
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        By checking this box, you authorize Complyo to send automated text messages to the mobile number provided. Standard messaging rates apply.
                      </p>
                    </div>
                  </label>
                  {errors.agreeToSmsConsent && (
                    <p className="mt-2 ml-8 text-xs text-red-400">{errors.agreeToSmsConsent.message}</p>
                  )}
                </div>
              )}

              {/* Cookie Preferences (Required) */}
              <div className={`p-4 border rounded-[10px] ${
                errors.agreeToCookies ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToCookies || true}
                    onChange={(e) => updateFormData("agreeToCookies", e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      I agree to the use of{' '}
                      <a
                        href={cookieLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">
                        cookies
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {' '}as described in the Cookie Policy. <span className="text-red-400">*</span>
                    </p>
                  </div>
                </label>
              </div>

              {/* Support Access (Required) */}
              <div className={`p-4 border rounded-[10px] ${
                errors.agreeToSupportAccess ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToSupportAccess}
                    onChange={(e) => updateFormData("agreeToSupportAccess", e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      I authorize Complyo{' '}
                      <a
                        href={supportAccessLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">
                        support to access
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {' '}my account solely to resolve an active support ticket. <span className="text-red-400">*</span>
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Access expires after 72 hours from when granted. You can revoke this permission at any time in your account settings.
                    </p>
                  </div>
                </label>
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
            <div className="p-2 rounded-[10px] bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text">
              DSP ComplianceManager
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
              {[1, 2, 3, 4, 5].map((step) => (
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
                    {step === 2 && "DSP Info"}
                    {step === 3 && "Admin"}
                    {step === 4 && "Billing"}
                    {step === 5 && "Legal"}
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
              {currentStep < totalSteps && currentStep <= 3 && (
                <button
                  onClick={() => setCurrentStep(totalSteps)}
                  className="px-6 py-3 font-medium transition-colors rounded-[10px] text-slate-400 hover:text-slate-300">
                  Skip to finish
                </button>
              )}
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
    </div>
  );
}
