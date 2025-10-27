import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Upload, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import {
  getDriverInvitationByToken,
  completeDriverInvitation,
  getDriverUploadPresignedUrls,
  createDriverDocuments
} from "@/api/driverInvitations";
import { uploadToS3 } from "@/api/documents";
import { toast } from "sonner";
import { validateFile } from "@/lib/utils";

export default function DriverUploadPortal() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      const response = await getDriverInvitationByToken(token);

      if (response.success) {
        setInvitation(response.data);
      } else {
        setError(response.message || "Invalid invitation link");
      }
    } catch (err) {
      console.error("Error loading invitation:", err);
      setError(err.message || "Failed to load invitation. The link may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (documentType, file) => {
    if (!file) return;

    // Validate file using utility function
    const validation = validateFile(file);
    if (!validation.valid) {
      validation.errors.forEach(error => {
        toast.error(error);
      });
      return;
    }

    try {
      // Set initial progress
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

      // Step 1: Get presigned URL from backend
      toast.info('Preparing upload...');
      const presignedData = await getDriverUploadPresignedUrls(token, [{
        filename: file.name,
        contentType: file.type,
        documentType: documentType,
      }]);

      const presigned = presignedData[0];

      // Step 2: Upload directly to S3
      await uploadToS3(presigned.uploadUrl, file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [documentType]: progress }));
      });

      // Step 3: Create document record in database
      await createDriverDocuments(token, [{
        key: presigned.key,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        documentType: documentType,
      }]);

      // Mark as uploaded
      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          uploaded: true,
        },
      }));

      toast.success(`${documentType} uploaded successfully!`);
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.error(err.message || "Failed to upload file. Please try again.");

      // Clear progress on error
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[documentType];
        return updated;
      });
    }
  };

  const removeDocument = (documentType) => {
    setUploadedDocuments(prev => {
      const updated = { ...prev };
      delete updated[documentType];
      return updated;
    });
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[documentType];
      return updated;
    });
  };

  const handleSubmit = async () => {
    // Validate that all requested documents are uploaded
    const missingDocuments = invitation.requestedDocuments.filter(
      doc => !uploadedDocuments[doc]
    );

    if (missingDocuments.length > 0) {
      toast.error(`Please upload all required documents: ${missingDocuments.join(", ")}`);
      return;
    }

    try {
      setIsSubmitting(true);

      // Mark invitation as complete
      await completeDriverInvitation(token);

      toast.success("Documents submitted successfully!");
      setCompleted(true);
    } catch (err) {
      console.error("Error submitting documents:", err);
      toast.error(err.message || "Failed to submit documents. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md p-8 text-center bg-white shadow-xl rounded-2xl">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Invalid Link</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex items-center justify-center min-w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md p-8 text-center bg-white shadow-xl rounded-2xl">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Documents Submitted!</h1>
          <p className="text-gray-600">
            Thank you for uploading your documents. {invitation.companyName} will review them shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-full min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full p-2 mx-auto md:w-1/2">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Document Upload</h1>
          <p className="text-gray-600">
            Upload your documents for {invitation.companyName}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Hello {invitation.driverName}, please upload the following documents
          </p>
        </div>

        {/* Document Upload Section */}
        <div className="p-8 bg-white shadow-xl rounded-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Required Documents</h2>
            <p className="text-sm text-gray-600">
              Please upload all requested documents below
            </p>
          </div>

          <div className="space-y-6">
            {invitation.requestedDocuments.map((docType) => {
              const uploaded = uploadedDocuments[docType];
              const progress = uploadProgress[docType];

              return (
                <div
                  key={docType}
                  className="p-6 border-2 border-gray-200 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{docType}</h3>
                        {uploaded && (
                          <p className="text-sm text-green-600">Uploaded</p>
                        )}
                      </div>
                    </div>
                    {uploaded && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>

                  {!uploaded ? (
                    <>
                      <label className="block">
                        <div className="flex items-center justify-center p-6 transition-all border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Click to upload or drag and drop
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              JPG, JPEG, PNG only (Max 10MB)
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                          onChange={(e) => handleFileSelect(docType, e.target.files[0])}
                        />
                      </label>

                      {progress !== undefined && progress < 100 && (
                        <div className="mt-4">
                          <div className="flex justify-between mb-1 text-sm text-gray-600">
                            <span>Uploading...</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 transition-all duration-300 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{uploaded.name}</p>
                          <p className="text-sm text-gray-500">
                            {(uploaded.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => removeDocument(docType)}
                          className="px-3 py-1 text-sm text-red-600 transition-colors rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="pt-6 mt-8 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                invitation.requestedDocuments.length !== Object.keys(uploadedDocuments).length
              }
              className={`w-full px-6 py-3 font-semibold text-white transition-all rounded-lg ${
                isSubmitting ||
                invitation.requestedDocuments.length !== Object.keys(uploadedDocuments).length
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-300"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Documents"
              )}
            </button>
            <p className="mt-3 text-sm text-center text-gray-500">
              {Object.keys(uploadedDocuments).length} of {invitation.requestedDocuments.length}{" "}
              documents uploaded
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            If you have any questions, please contact {invitation.companyName} directly.
          </p>
        </div>
      </div>
    </div>
  );
}
