import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  Shield,
  Building2,
  FileText,
  Bell,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { onboardingSchema } from "../schemas/onboardingSchema";
import { useNavigate } from "react-router-dom";

export default function OnboardingDark() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return; // wait for user to load

    if (user) {
      const companyId = user.publicMetadata?.companyId;
      if (companyId) {
        navigate("/client/dashboard");
      }
    }
  }, [user, isLoaded, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      companyName: "",
      companySize: "",
      operatingRegion: "",
      statesProvinces: [],
      industryType: "",
      documents: ["Driver's License"],
      reminderDays: ["90d", "30d", "7d"],
      notificationMethod: "both",
      notificationRecipients: ["admin"],
      adminEmail: "",
      adminPhone: "",
      firstDriverName: "",
      firstDriverContact: "",
      firstDriverDocuments: [],
    },
    mode: "onChange",
  });

  const formData = watch();

  const totalSteps = 4;

  const companySizes = [
    "1-10 drivers",
    "11-50 drivers",
    "51-200 drivers",
    "200+ drivers",
  ];

  const regions = ["United States", "Canada", "Both US & Canada"];

  const usStates = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  const canadianProvinces = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Nova Scotia",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
  ];

  const industries = [
    "Amazon DSP",
    "FedEx Ground Contractor",
    "UPS Contractor",
    "Independent Delivery Service",
    "Food Delivery",
    "Other",
  ];

  const documentTypes = [
    { id: "drivers_license", label: "Driver's License", mandatory: true },
    { id: "vehicle_insurance", label: "Vehicle Insurance", mandatory: false },
    { id: "cdl", label: "Commercial Driver's License (CDL)", mandatory: false },
    { id: "dot_medical", label: "DOT Medical Certificate", mandatory: false },
    { id: "background_check", label: "Background Check", mandatory: false },
    { id: "drug_test", label: "Drug Test Results", mandatory: false },
    {
      id: "vehicle_registration",
      label: "Vehicle Registration",
      mandatory: false,
    },
    { id: "proof_of_address", label: "Proof of Address", mandatory: false },
  ];

  const updateFormData = (field, value) => {
    setValue(field, value, { shouldValidate: true });
  };

  const toggleDocument = (docLabel) => {
    if (docLabel === "Driver's License") return; // Can't uncheck mandatory

    const currentDocs = formData.documents || [];

    // Free plan restriction: Only 1 document type allowed (Driver's License is mandatory)
    // Since users are on Free plan during onboarding, restrict to 1 doc type
    const isAdding = !currentDocs.includes(docLabel);

    if (isAdding && currentDocs.length >= 1) {
      // Free plan limit reached
      alert("Free plan allows tracking only 1 document type per driver (Driver's License). Upgrade to a paid plan to track more document types.");
      return;
    }

    const newDocs = currentDocs.includes(docLabel)
      ? currentDocs.filter((d) => d !== docLabel)
      : [...currentDocs, docLabel];
    setValue("documents", newDocs, { shouldValidate: true });
  };

  const toggleStateProvince = (location) => {
    const currentLocations = formData.statesProvinces || [];
    const newLocations = currentLocations.includes(location)
      ? currentLocations.filter((l) => l !== location)
      : [...currentLocations, location];
    setValue("statesProvinces", newLocations, { shouldValidate: true });
  };

  const toggleRecipient = (recipient) => {
    const currentRecipients = formData.notificationRecipients || [];
    const newRecipients = currentRecipients.includes(recipient)
      ? currentRecipients.filter((r) => r !== recipient)
      : [...currentRecipients, recipient];
    setValue("notificationRecipients", newRecipients, { shouldValidate: true });
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    let fieldsToValidate = [];
    let isOptionalStep = false;

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "companyName",
          "companySize",
          "operatingRegion",
          "statesProvinces",
        ];
        break;
      case 2:
        fieldsToValidate = ["documents", "reminderDays"];
        break;
      case 3:
        fieldsToValidate = [
          "notificationMethod",
          "notificationRecipients",
          "adminEmail",
          "adminPhone",
        ];
        break;
      case 4:
        // Step 5 (Quick Start) is optional - no required fields
        isOptionalStep = true;
        fieldsToValidate = ["firstDriverName", "firstDriverContact"];
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
        alert("Please sign in to complete onboarding.");
        return;
      }

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

      // Now submit the onboarding data
      const response = await fetch(`${API_URL}/api/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.error || "Failed to save onboarding data");
      }

      const result = await response.json();

      alert("Onboarding completed successfully! Redirecting to dashboard...");
      // Redirect to dashboard or next page
      navigate("/client/dashboard");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      alert(`Failed to save onboarding data: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLocationOptions = () => {
    if (formData.operatingRegion === "United States") return usStates;
    if (formData.operatingRegion === "Canada") return canadianProvinces;
    return [...usStates, ...canadianProvinces];
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-8 space-y-2 text-center">
              <div className="inline-block p-3 mb-4 rounded-[10px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Building2 className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Company Information
              </h2>
              <p className="text-slate-400">
                Let's start with the basics about your DSP
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) =>
                    updateFormData("companyName", e.target.value)
                  }
                  placeholder="Enter your company name"
                  className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent rounded-[10px] ${
                    errors.companyName
                      ? "border border-red-500 focus:ring-red-500"
                      : "border border-slate-700 focus:ring-blue-500"
                  }`}
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Company Size *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {companySizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateFormData("companySize", size)}
                      className={`px-4 py-3 rounded-[10px] transition-all ${
                        formData.companySize === size
                          ? "bg-blue-500/20 border border-blue-500 text-blue-400"
                          : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600"
                      } ${errors.companySize ? "border border-red-500" : ""}`}>
                      {size}
                    </button>
                  ))}
                </div>
                {errors.companySize && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.companySize.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Primary Operating Region *
                </label>
                <div className="space-y-2">
                  {regions.map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => updateFormData("operatingRegion", region)}
                      className={`w-full px-4 py-3 rounded-[10px] transition-all flex items-center justify-between ${
                        formData.operatingRegion === region
                          ? "bg-blue-500/20 border border-blue-500 text-blue-400"
                          : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600"
                      } ${errors.operatingRegion ? "border border-red-500" : ""}`}>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {region}
                      </span>
                      {formData.operatingRegion === region && (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
                {errors.operatingRegion && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.operatingRegion.message}
                  </p>
                )}
              </div>

              {formData.operatingRegion && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    State(s)/Province(s) of Operation *
                  </label>
                  <div
                    className={`p-4 overflow-y-auto bg-slate-800 max-h-48 rounded-[10px] ${
                      errors.statesProvinces
                        ? "border border-red-500"
                        : "border border-slate-700"
                    }`}>
                    <div className="grid grid-cols-2 gap-2">
                      {getLocationOptions().map((location) => (
                        <label
                          key={location}
                          className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-700/50">
                          <input
                            type="checkbox"
                            checked={formData.statesProvinces.includes(
                              location
                            )}
                            onChange={() => toggleStateProvince(location)}
                            className="w-4 h-4 text-blue-500 rounded bg-slate-700 border-slate-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-300">
                            {location}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.statesProvinces.length > 0 &&
                    !errors.statesProvinces && (
                      <p className="mt-2 text-sm text-slate-400">
                        {formData.statesProvinces.length} selected
                      </p>
                    )}
                  {errors.statesProvinces && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.statesProvinces.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Industry/Service Type
                </label>
                <select
                  value={formData.industryType}
                  onChange={(e) =>
                    updateFormData("industryType", e.target.value)
                  }
                  className={`w-full px-4 py-3 text-white bg-slate-800 focus:outline-none focus:ring-2 rounded-[10px] ${
                    errors.industryType
                      ? "border border-red-500 focus:ring-red-500"
                      : "border border-slate-700 focus:ring-blue-500"
                  }`}>
                  <option value="">Select industry type</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {errors.industryType && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.industryType.message}
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
              <div className="inline-block p-3 mb-4 rounded-[10px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Document Requirements
              </h2>
              <p className="text-slate-400">
                Select which documents you need to track for compliance
              </p>
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-[10px]">
                <p className="text-sm text-yellow-300">
                  <strong>Free Plan:</strong> You can track only 1 document type per driver (Driver's License is included). Upgrade to Starter, Professional, or Enterprise plans to track multiple document types per driver.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {documentTypes.map((doc) => (
                <div
                  key={doc.id}
                  className={`bg-slate-800 p-4 transition-all rounded-[10px] ${
                    formData.documents.includes(doc.label)
                      ? "border border-blue-500"
                      : "border border-slate-700"
                  }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.documents.includes(doc.label)}
                      onChange={() => toggleDocument(doc.label)}
                      disabled={doc.mandatory}
                      className="w-5 h-5 mt-0.5 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {doc.label}
                        </span>
                        {doc.mandatory && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                            Mandatory
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {/* Global Reminder Days Section */}
            <div className="mt-6 p-6 bg-slate-800 border border-slate-700 rounded-[10px]">
              <h3 className="mb-3 text-lg font-semibold text-white">
                Global Reminder Settings
              </h3>
              <p className="mb-4 text-sm text-slate-400">
                Choose up to 3 reminder intervals before document expiry (applies to all document types)
              </p>
              <div className="flex flex-wrap gap-2">
                {["1d", "7d", "14d", "15d", "30d", "45d", "60d", "90d"].map((days) => {
                  const current = formData.reminderDays || [];
                  const isSelected = current.includes(days);
                  const isMaxSelected = current.length >= 3 && !isSelected;

                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        if (isMaxSelected) {
                          // Show toast or alert that max is reached
                          return;
                        }
                        const updated = isSelected
                          ? current.filter((d) => d !== days)
                          : [...current, days];
                        updateFormData("reminderDays", updated);
                      }}
                      disabled={isMaxSelected}
                      className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                          : isMaxSelected
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}>
                      {days}
                    </button>
                  );
                })}
              </div>
              {formData.reminderDays && formData.reminderDays.length >= 3 && (
                <p className="mt-2 text-sm text-yellow-400">
                  Maximum of 3 reminder intervals selected
                </p>
              )}
              {errors.reminderDays && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.reminderDays.message}
                </p>
              )}
              {formData.reminderDays && formData.reminderDays.length > 0 && (
                <div className="p-3 mt-4 rounded-md bg-slate-700/50">
                  <p className="text-sm text-slate-300">
                    Selected ({formData.reminderDays.length}/3): <span className="font-semibold text-blue-400">
                      {formData.reminderDays.join(", ")}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-[10px]">
                <div className="text-blue-400 mt-0.5">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-300">⏰ Automatic Reminders</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Your reminder notifications are sent automatically every day at <span className="font-semibold text-blue-400">8:00 AM Eastern Time</span> (New York/Toronto timezone). You don't need to do anything - we'll notify you when documents are approaching their expiration dates!
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-slate-700/50 border border-slate-600/50 rounded-[10px]">
                <div className="text-slate-400 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">💡 Pro Tip</p>
                  <p className="mt-1 text-sm text-slate-400">
                    We recommend selecting 90d, 30d, and 7d reminders to ensure
                    documents never miss renewals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-8 space-y-2 text-center">
              <div className="inline-block p-3 mb-4 rounded-[10px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Bell className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Notification Preferences
              </h2>
              <p className="text-slate-400">
                Configure how you want to receive compliance alerts
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-3 text-sm font-medium text-slate-300">
                  Primary Notification Method *
                </label>
                <div className="space-y-2">
                  {[
                    {
                      value: "email",
                      label: "Email only",
                      icon: <Mail className="w-5 h-5" />,
                    },
                    {
                      value: "sms",
                      label: "SMS only",
                      icon: <Phone className="w-5 h-5" />,
                    },
                    {
                      value: "both",
                      label: "Both Email & SMS",
                      icon: <Bell className="w-5 h-5" />,
                      recommended: true,
                    },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() =>
                        updateFormData("notificationMethod", method.value)
                      }
                      className={`w-full px-4 py-3 rounded-[10px] transition-all flex items-center justify-between ${
                        formData.notificationMethod === method.value
                          ? "bg-blue-500/20 border border-blue-500 text-blue-400"
                          : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600"
                      }`}>
                      <span className="flex items-center gap-3">
                        {method.icon}
                        {method.label}
                        {method.recommended && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </span>
                      {formData.notificationMethod === method.value && (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-3 text-sm font-medium text-slate-300">
                  Who should receive compliance alerts? *
                </label>
                <div className="space-y-2">
                  {[
                    { value: "admin", label: "Admin/Owner" },
                    { value: "drivers", label: "Drivers directly" },
                  ].map((recipient) => (
                    <label
                      key={recipient.value}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[10px] cursor-pointer transition-all ${
                        formData.notificationRecipients.includes(
                          recipient.value
                        )
                          ? "bg-blue-500/10 border border-blue-500/50"
                          : "bg-slate-800 border border-slate-700 hover:border-slate-600"
                      }`}>
                      <input
                        type="checkbox"
                        checked={formData.notificationRecipients.includes(
                          recipient.value
                        )}
                        onChange={() => toggleRecipient(recipient.value)}
                        className="w-4 h-4 text-blue-500 rounded bg-slate-700 border-slate-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-300">{recipient.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(formData.notificationMethod === "email" ||
                formData.notificationMethod === "both") && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) =>
                      updateFormData("adminEmail", e.target.value)
                    }
                    placeholder="admin@yourcompany.com"
                    className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                      errors.adminEmail
                        ? "border border-red-500 focus:ring-red-500"
                        : "border border-slate-700 focus:ring-blue-500"
                    }`}
                  />
                  {errors.adminEmail && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.adminEmail.message}
                    </p>
                  )}
                </div>
              )}

              {(formData.notificationMethod === "sms" ||
                formData.notificationMethod === "both") && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">
                    Admin Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.adminPhone}
                    onChange={(e) =>
                      updateFormData("adminPhone", e.target.value)
                    }
                    placeholder="+1 (555) 123-4567"
                    className={`w-full px-4 py-3 text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 rounded-[10px] ${
                      errors.adminPhone
                        ? "border border-red-500 focus:ring-red-500"
                        : "border border-slate-700 focus:ring-blue-500"
                    }`}
                  />
                  {errors.adminPhone && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.adminPhone.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="mb-8 space-y-2 text-center">
              <div className="inline-block p-3 mb-4 rounded-[10px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Rocket className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Quick Start</h2>
              <p className="text-slate-400">
                Let's add your first driver to get started!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Driver Name *
                </label>
                <input
                  type="text"
                  value={formData.firstDriverName}
                  onChange={(e) =>
                    updateFormData("firstDriverName", e.target.value)
                  }
                  placeholder="John Doe"
                  className="w-full px-4 py-3 text-white bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-[10px]"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">
                  Driver Email or Phone *
                </label>
                <input
                  type="text"
                  value={formData.firstDriverContact}
                  onChange={(e) =>
                    updateFormData("firstDriverContact", e.target.value)
                  }
                  placeholder="john.doe@email.com or +1 555-123-4567"
                  className="w-full px-4 py-3 text-white bg-slate-800 border border-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-[10px]"
                />
              </div>

              <div>
                <label className="block mb-3 text-sm font-medium text-slate-300">
                  Required Documents
                </label>
                <div className="space-y-2">
                  {formData.documents.map((docLabel) => {
                    return (
                      <div
                        key={docLabel}
                        className="flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-[10px]">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-slate-300">{docLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-[10px]">
                <div className="text-blue-400 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-300">
                    What happens next?
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    We'll send an email to your driver with a secure upload
                    link. No login required!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  /* Handle bulk upload */
                }}
                className="flex items-center justify-center w-full gap-2 px-6 py-3 transition-all bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-[10px]">
                <Upload className="w-5 h-5" />
                Or upload multiple drivers via CSV
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => handleSubmit(onSubmit)()}
                className="text-sm text-slate-400 hover:text-slate-300">
                Skip for now, I'll add drivers later
              </button>
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
      <div className="absolute rounded-full top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-3xl"></div>
      <div className="absolute rounded-full bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="p-6 md:p-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-gradient-to-br from-blue-500 to-cyan-400">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text">
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
                className="h-2 transition-all duration-300 ease-out bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
            </div>
            <div className="flex justify-between mt-4">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex flex-col items-center ${
                    step <= currentStep ? "text-blue-400" : "text-slate-600"
                  }`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step < currentStep
                        ? "bg-blue-500 text-white"
                        : step === currentStep
                        ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white"
                        : "bg-slate-800 text-slate-600"
                    }`}>
                    {step < currentStep ? <Check className="w-4 h-4" /> : step}
                  </div>
                  <span className="hidden mt-2 text-xs md:block">
                    {step === 1 && "Company"}
                    {step === 2 && "Documents"}
                    {step === 3 && "Notifications"}
                    {step === 4 && "Start"}
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
              {currentStep < totalSteps && (
                <button
                  onClick={() => setCurrentStep(totalSteps)}
                  className="px-6 py-3 font-medium transition-colors rounded-[10px] text-slate-400 hover:text-slate-300">
                  Skip to finish
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 font-semibold transition-all rounded-[10px] bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/50 group disabled:opacity-50 disabled:cursor-not-allowed">
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
            <a href="/support" className="text-blue-400 hover:text-blue-300">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
