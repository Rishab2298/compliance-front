import React, { useState, useEffect } from "react";
import { Check, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { createDriver } from "@/api/drivers";
import { createDriverInvitation } from "@/api/driverInvitations";
import { useCurrentPlan } from "@/hooks/useBilling";
import { useQueryClient } from "@tanstack/react-query";
import DocumentUploadStep from "@/components/add-a-driver/documentUploadStep";
import DocumentPreviewStep from "@/components/add-a-driver/documentPreviewStep";
import Step4 from "@/components/add-a-driver/step4";
import Step5 from "@/components/add-a-driver/step5";
import Step6 from "@/components/add-a-driver/step6";
import Step7 from "@/components/add-a-driver/step7";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/utils/themeClasses";

export default function AddADriver() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const { data: currentPlanData, isLoading: planLoading } = useCurrentPlan();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [companyDocumentTypes, setCompanyDocumentTypes] = useState([]);
  const [loadingDocTypes, setLoadingDocTypes] = useState(true);
  const [createdDriverId, setCreatedDriverId] = useState(null);
  const [creatingDriver, setCreatingDriver] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const companyId = user?.publicMetadata?.companyId;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    employeeId: "",
    documentOption: "",
    documents: {},
    processingMethod: "",
    reminders: {
      email: true,
      sms: false,
      days: [90, 30, 7],
    },
  });

  // Fetch company document types on mount
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      if (!companyId) {
        setLoadingDocTypes(false);
        return;
      }

      try {
        setLoadingDocTypes(true);
        const token = await getToken();

        const response = await fetch(`${API_URL}/api/document-types/company/${companyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch document types');
        }

        const result = await response.json();

        if (result.success) {
          setCompanyDocumentTypes(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching document types:', error);
      } finally {
        setLoadingDocTypes(false);
      }
    };

    fetchDocumentTypes();
  }, [companyId]);

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Upload Method" },
    { number: 3, title: "Documents" },
    { number: 4, title: "Processing" },
    { number: 5, title: "Verification" },
    { number: 6, title: "Reminders" },
    { number: 7, title: "Review" },
    { number: 8, title: "Complete" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const updateFormData = (updates) => {
    setFormData({ ...formData, ...updates });
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.location.trim()) newErrors.location = "Location is required";
      if (!formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required";
    }

    if (step === 2) {
      if (!formData.documentOption) newErrors.documentOption = "Please select an upload method";
    }

    if (step === 3) {
      // Only validate document uploads if user chose to upload now
      if (formData.documentOption === "upload") {
        // Check if documents have been uploaded
        const uploadedDocs = formData.uploadedDocuments || [];

        if (uploadedDocs.length === 0) {
          newErrors.documents = "Please upload at least one document";
        } else if (uploadedDocs.length < companyDocumentTypes.length) {
          newErrors.documents = `Please upload all ${companyDocumentTypes.length} required documents (${uploadedDocs.length} uploaded so far)`;
        }
      }
      // For "link" and "skip" options, no validation needed at Step 3
    }

    if (step === 6) {
      // Validate that all documents are verified (only for AI processing)
      if (formData.processingMethod === "ai") {
        const uploadedDocs = formData.uploadedDocuments || [];
        const verifiedDocs = formData.verifiedDocuments || [];

        if (!formData.allDocumentsVerified && verifiedDocs.length < uploadedDocs.length) {
          newErrors.verification = `Please verify all ${uploadedDocs.length} documents before proceeding (${uploadedDocs.length - verifiedDocs.length} remaining)`;
        }
      }
      // Manual entry already saved in Step 5, no validation needed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createDriverRecord = async () => {
    setCreatingDriver(true);
    try {
      const token = await getToken();

      // Check driver limit before creating
      if (currentPlanData) {
        const currentDrivers = currentPlanData.usage?.drivers?.current || 0;
        const maxDrivers = currentPlanData.usage?.drivers?.limit || 0;

        // -1 means unlimited
        if (maxDrivers !== -1 && currentDrivers >= maxDrivers) {
          toast.error("Driver limit reached", {
            description: `Please upgrade your plan to add more drivers. Current limit: ${maxDrivers} drivers.`,
          });
          setCreatingDriver(false);
          return null;
        }
      }

      // Build payload with personal info
      const driverPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        employeeId: formData.employeeId,
        documentOption: "upload", // Temporary - will be updated later
      };

      const result = await createDriver(driverPayload, token);
      console.log("Driver created successfully:", result);
      setCreatedDriverId(result.driver.id);
      return result.driver.id;
    } catch (error) {
      console.error("Error creating driver:", error);
      setSubmitError(error.message || "Failed to create driver. Please try again.");
      throw error;
    } finally {
      setCreatingDriver(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    // Create driver after step 1 (before moving to step 2)
    if (currentStep === 1 && !createdDriverId) {
      try {
        await createDriverRecord();
      } catch (error) {
        // Error already handled in createDriverRecord
        return;
      }
    }

    // Special handling for "Skip" flow - jump directly to step 8
    if (formData.documentOption === "skip" && currentStep === 2) {
      setCurrentStep(8);
      toast.success("Driver created successfully", {
        description: `${formData.firstName} ${formData.lastName} has been added to your driver roster.`,
      });
      return;
    }

    // Special handling for "Send Link" flow
    if (formData.documentOption === "link" && currentStep === 3) {
      // Skip steps 4, 5, 6 and go directly to step 7 (Review)
      setCurrentStep(7);
      return;
    }

    // Show toast when completing step 7 (reminders configured)
    if (currentStep === 7) {
      toast.success("Reminder preferences saved", {
        description: `Email and SMS notifications have been configured for ${formData.firstName} ${formData.lastName}.`,
      });
    }

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate("/client/drivers");
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNavigateToDrivers = async () => {
    // Refresh driver data and compliance scores before navigating
    if (createdDriverId) {
      console.log('🔄 Refreshing driver data before navigation...');
      await queryClient.invalidateQueries({ queryKey: ['driver', createdDriverId] });
      await queryClient.invalidateQueries({ queryKey: ['documents', createdDriverId] });

      // Add small delay to ensure backend has fully updated
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force immediate refetch of drivers list to update compliance score
      await queryClient.refetchQueries({ queryKey: ['drivers'] });
      console.log('✅ All data refreshed');
    }
    navigate("/client/drivers");
  };

  const selectDocumentOption = (option) => {
    setFormData({
      ...formData,
      documentOption: option,
    });
    if (errors.documentOption) {
      setErrors({ ...errors, documentOption: "" });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const token = await getToken();

      // Driver is already created, just send invitation if needed
      if (formData.documentOption === "link" && createdDriverId) {
        const invitationPayload = {
          driverId: createdDriverId,
          email: formData.email,
          phone: formData.phone,
          requestedDocuments: companyDocumentTypes, // Use all company document types
          sendEmail: !!formData.email,
          sendSMS: !!formData.phone,
        };

        const invitationResult = await createDriverInvitation(invitationPayload, token);
        console.log("Driver invitation sent:", invitationResult);
        toast.success("Invitation sent successfully", {
          description: `An invitation email has been sent to ${formData.firstName} ${formData.lastName}.`,
        });
      } else {
        toast.success("Driver created successfully", {
          description: `${formData.firstName} ${formData.lastName} has been added to your driver roster.`,
        });
      }

      // Invalidate queries to refresh driver data and compliance scores
      if (createdDriverId) {
        console.log('🔄 Refreshing driver data and compliance scores...');
        await queryClient.invalidateQueries({ queryKey: ['driver', createdDriverId] });
        await queryClient.invalidateQueries({ queryKey: ['documents', createdDriverId] });

        // Add small delay to ensure backend has fully updated document status
        await new Promise(resolve => setTimeout(resolve, 500));

        // Force immediate refetch of drivers list to update compliance score in table
        await queryClient.refetchQueries({ queryKey: ['drivers'] });
        console.log('✅ All data refreshed');
      }

      // Navigate to success or drivers list page
      setTimeout(() => {
        navigate("/client/drivers");
      }, 1500);
    } catch (error) {
      console.error("Error in final submission:", error);
      setSubmitError(error.message || "Failed to complete driver setup. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 w-full h-full overflow-y-auto ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gray-50'}`}>
      <div className="container max-w-4xl min-h-full px-6 py-8 mx-auto">
        {/* Header */}
        <div className="justify-center w-full mb-8 text-center">
          <h1 className={`text-2xl font-bold text-center ${getThemeClasses.text.primary(isDarkMode)}`}>Add a Driver</h1>
          <p className={`mt-1 text-sm text-center ${getThemeClasses.text.secondary(isDarkMode)}`}>
            Complete the steps below to add a new driver to your roster
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step.number === currentStep
                        ? isDarkMode
                          ? "bg-violet-500 text-white"
                          : "bg-gray-800 text-white"
                        : step.number < currentStep
                        ? isDarkMode
                          ? "bg-violet-600 text-white"
                          : "bg-gray-600 text-white"
                        : isDarkMode
                        ? "bg-slate-800 text-slate-500 border border-slate-700"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                    {step.number < currentStep ? (
                      <Check size={16} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      step.number === currentStep
                        ? getThemeClasses.text.primary(isDarkMode)
                        : step.number < currentStep
                        ? isDarkMode
                          ? "text-slate-400"
                          : "text-gray-600"
                        : getThemeClasses.text.secondary(isDarkMode)
                    }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      step.number < currentStep
                        ? isDarkMode
                          ? "bg-violet-600"
                          : "bg-gray-600"
                        : isDarkMode
                        ? "bg-slate-800"
                        : "bg-gray-200"
                    }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className={`rounded-[10px] p-6 md:p-8 border ${getThemeClasses.bg.card(isDarkMode)}`}>
          {currentStep === 1 && (
            <>
              <div className="mb-6">
                <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  Personal Information
                </h2>
                <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Please fill in your basic details to get started
                </p>
              </div>

              <div className="space-y-6">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className={`block mb-2 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 transition-all border rounded-[10px] outline-none ${
                        errors.firstName
                          ? "border-red-500"
                          : getThemeClasses.input.default(isDarkMode)
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className={`block mb-2 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 transition-all border rounded-[10px] outline-none ${
                        errors.lastName
                          ? "border-red-500"
                          : getThemeClasses.input.default(isDarkMode)
                      }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className={`block mb-2 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 transition-all border rounded-[10px] outline-none ${
                      errors.email
                        ? "border-red-500"
                        : getThemeClasses.input.default(isDarkMode)
                    }`}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone & Location */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="phone"
                      className={`block mb-2 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 transition-all border rounded-[10px] outline-none ${
                        errors.phone
                          ? "border-red-500"
                          : getThemeClasses.input.default(isDarkMode)
                      }`}
                      placeholder="+15550000000"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      className={`block mb-2 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 transition-all border rounded-[10px] outline-none ${
                        errors.location
                          ? "border-red-500"
                          : getThemeClasses.input.default(isDarkMode)
                      }`}
                      placeholder="New York, NY"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>
                </div>

                {/* Employee ID */}
                <div>
                  <label
                    htmlFor="employeeId"
                    className={`block mb-2 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                    Employee ID
                  </label>
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 transition-all border rounded-[10px] outline-none ${
                      errors.employeeId
                        ? "border-red-500"
                        : getThemeClasses.input.default(isDarkMode)
                    }`}
                    placeholder="EMP-12345"
                  />
                  {errors.employeeId && (
                    <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>
                  )}
                </div>

                {/* Tip */}
                <div className={`mt-6 p-4 border rounded-[10px] ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-sm leading-relaxed ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    <span className="font-light">💡<strong>Tip:</strong>  Make sure to include the country code in the phone number without any spaces or hyphens. For example: <span className="font-mono font-medium">+15551234567</span> for United States or <span className="font-mono font-medium">+16131234567</span> for Canada. This ensures SMS notifications are delivered successfully to the driver.
                 </span> </p>
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="mb-6">
                <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  Document Upload
                </h2>
                <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  How would you like to add the documents?
                </p>
              </div>

              <div className="space-y-4">
                {/* Upload Now Option */}
                <button
                  type="button"
                  onClick={() => selectDocumentOption("upload")}
                  className={`w-full p-5 border rounded-[10px] transition-all text-left ${
                    formData.documentOption === "upload"
                      ? isDarkMode
                        ? "border-violet-500 bg-slate-800/50"
                        : "border-gray-800 bg-gray-50"
                      : isDarkMode
                      ? "border-slate-700 hover:border-slate-600 hover:bg-slate-800/30"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}>
                  <div className="flex items-start">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 mr-3 shrink-0 ${
                        formData.documentOption === "upload"
                          ? isDarkMode
                            ? "border-violet-500"
                            : "border-gray-800"
                          : isDarkMode
                          ? "border-slate-600"
                          : "border-gray-300"
                      }`}>
                      {formData.documentOption === "upload" && (
                        <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-violet-500' : 'bg-gray-800'}`}></div>
                      )}
                    </div>
                    <div>
                      <h3 className={`mb-1 text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                        Upload Now
                      </h3>
                      <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Upload your documents immediately and complete the
                        process right away
                      </p>
                    </div>
                  </div>
                </button>

                {/* Send Link Option */}
                <button
                  type="button"
                  onClick={() => selectDocumentOption("link")}
                  className={`w-full p-5 border rounded-[10px] transition-all text-left ${
                    formData.documentOption === "link"
                      ? isDarkMode
                        ? "border-violet-500 bg-slate-800/50"
                        : "border-gray-800 bg-gray-50"
                      : isDarkMode
                      ? "border-slate-700 hover:border-slate-600 hover:bg-slate-800/30"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}>
                  <div className="flex items-start">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 mr-3 shrink-0 ${
                        formData.documentOption === "link"
                          ? isDarkMode
                            ? "border-violet-500"
                            : "border-gray-800"
                          : isDarkMode
                          ? "border-slate-600"
                          : "border-gray-300"
                      }`}>
                      {formData.documentOption === "link" && (
                        <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-violet-500' : 'bg-gray-800'}`}></div>
                      )}
                    </div>
                    <div>
                      <h3 className={`mb-1 text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                        Send Link to Driver
                      </h3>
                      <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        We'll send a secure link to the driver to upload
                        documents at their convenience
                      </p>
                    </div>
                  </div>
                </button>

                {/* Skip for Now Option */}
                <button
                  type="button"
                  onClick={() => selectDocumentOption("skip")}
                  className={`w-full p-5 border rounded-[10px] transition-all text-left ${
                    formData.documentOption === "skip"
                      ? isDarkMode
                        ? "border-violet-500 bg-slate-800/50"
                        : "border-gray-800 bg-gray-50"
                      : isDarkMode
                      ? "border-slate-700 hover:border-slate-600 hover:bg-slate-800/30"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}>
                  <div className="flex items-start">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 mr-3 shrink-0 ${
                        formData.documentOption === "skip"
                          ? isDarkMode
                            ? "border-violet-500"
                            : "border-gray-800"
                          : isDarkMode
                          ? "border-slate-600"
                          : "border-gray-300"
                      }`}>
                      {formData.documentOption === "skip" && (
                        <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-violet-500' : 'bg-gray-800'}`}></div>
                      )}
                    </div>
                    <div>
                      <h3 className={`mb-1 text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                        Skip for Now
                      </h3>
                      <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Continue with the registration and add documents later
                        from your dashboard
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
          {currentStep === 3 && (
            <>
              {formData.documentOption === "upload" ? (
                <DocumentUploadStep
                  formData={formData}
                  updateFormData={updateFormData}
                  uploadProgress={uploadProgress}
                  setUploadProgress={setUploadProgress}
                  errors={errors}
                  documentTypes={companyDocumentTypes}
                  driverId={createdDriverId}
                  planData={currentPlanData}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <DocumentPreviewStep
                  formData={formData}
                  documentTypes={companyDocumentTypes}
                  isDarkMode={isDarkMode}
                />
              )}
            </>
          )}
          {currentStep === 4 && (
            <Step4
              formData={formData}
              updateFormData={updateFormData}
              setCurrentStep={setCurrentStep}
              setIsProcessing={setIsProcessing}
              setExtractedData={setExtractedData}
              isDarkMode={isDarkMode}
            />
          )}
          {currentStep === 5 && (
            <Step5
              formData={formData}
              updateFormData={updateFormData}
              setCurrentStep={setCurrentStep}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              extractedData={extractedData}
              setExtractedData={setExtractedData}
              documentTypes={companyDocumentTypes}
              isDarkMode={isDarkMode}
            />
          )}
          {currentStep === 6 && (
            <>
              <Step6
                formData={formData}
                updateFormData={updateFormData}
                extractedData={extractedData}
                documentTypes={companyDocumentTypes}
                setCurrentStep={setCurrentStep}
                isDarkMode={isDarkMode}
              />
              {errors.verification && (
                <div className={`mt-4 p-4 border-l-4 border-red-500 rounded-r-[10px] ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>{errors.verification}</p>
                </div>
              )}
            </>
          )}
          {currentStep === 7 && (
            <Step7
              formData={formData}
              updateFormData={updateFormData}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Success Step */}
          {currentStep === 8 && (
            <div className="p-8">
              {formData.documentOption === "skip" ? (
                // Documents Skipped UI
                <div className="max-w-md mx-auto text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 mb-4 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                    <CheckCircle className={`w-8 h-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
                  </div>
                  <h3 className={`mb-2 text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                    Documents Skipped
                  </h3>
                  <p className={`mb-4 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    You've chosen to skip document uploads for now. You can add documents later from the driver's profile page.
                  </p>
                  <div className={`p-4 border rounded-[10px] ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-start gap-3 text-left">
                      <Check className={`flex-shrink-0 w-5 h-5 mt-0.5 ${isDarkMode ? 'text-violet-400' : 'text-gray-600'}`} />
                      <div>
                        <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>What happens next?</p>
                        <p className={`mt-1 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                          After creating the driver, you can upload documents or send them an invitation link to upload documents themselves.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular success UI
                <div className="text-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className={`w-12 h-12 mx-auto mb-4 animate-spin ${isDarkMode ? 'text-violet-500' : 'text-gray-800'}`} />
                      <h2 className={`mb-2 text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                        Creating Driver Profile...
                      </h2>
                      <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Please wait while we save your driver information.
                      </p>
                    </>
                  ) : submitError ? (
                    <>
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <h2 className="mb-2 text-lg font-semibold text-red-600">
                        Failed to Create Driver
                      </h2>
                      <p className={`mb-6 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>{submitError}</p>
                      <button
                        onClick={() => {
                          setCurrentStep(1);
                          setSubmitError(null);
                        }}
                        className={`px-6 py-2.5 text-white transition-all rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}>
                        Try Again
                      </button>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                      <h2 className={`mb-2 text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                        {formData.documentOption === "link"
                          ? "Invitation Sent Successfully!"
                          : "Driver Added Successfully!"}
                      </h2>
                      <p className={`mb-6 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        {formData.documentOption === "link" ? (
                          <>
                            An email{formData.phone && " and SMS"} with a secure upload link has been sent to{" "}
                            {formData.firstName} {formData.lastName}.
                          </>
                        ) : (
                          <>
                            {formData.firstName} {formData.lastName} has been added to your driver roster.
                          </>
                        )}
                      </p>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={handleNavigateToDrivers}
                          className={`px-6 py-2.5 text-white transition-all rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}>
                          View All Drivers
                        </button>
                        <button
                          onClick={() => window.location.reload()}
                          className={`px-6 py-2.5 transition-all border rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}>
                          Add Another Driver
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {currentStep <= 8 && (
            <div className={`flex justify-between pt-6 mt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting || (currentStep === 8 && formData.documentOption === "skip")}
                className={`px-6 py-2.5 border rounded-[10px] font-medium transition-all ${
                  isSubmitting || (currentStep === 8 && formData.documentOption === "skip")
                    ? isDarkMode
                      ? "text-slate-600 border-slate-700 cursor-not-allowed"
                      : "text-gray-400 border-gray-200 cursor-not-allowed"
                    : getThemeClasses.button.secondary(isDarkMode)
                }`}>
                {currentStep === 1 ? "Cancel" : "Back"}
              </button>
              <button
                type="button"
                onClick={
                  currentStep === 8 && formData.documentOption === "skip"
                    ? handleNavigateToDrivers
                    : currentStep === 7
                    ? () => {
                        setCurrentStep(8);
                        handleSubmit();
                      }
                    : handleNext
                }
                disabled={isSubmitting || creatingDriver}
                className={`px-8 py-2.5 font-medium text-white transition-all rounded-[10px] ${
                  isSubmitting || creatingDriver
                    ? isDarkMode
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-gray-400 cursor-not-allowed"
                    : getThemeClasses.button.primary(isDarkMode)
                }`}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </span>
                ) : creatingDriver ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Driver...
                  </span>
                ) : currentStep === 8 && formData.documentOption === "skip" ? (
                  "Go to Drivers"
                ) : currentStep === 7 ? (
                  "Complete & Submit"
                ) : (
                  "Next Step"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
