import { FileText, Mail, MessageSquare } from "lucide-react";

const DocumentPreviewStep = ({ formData, documentTypes = [] }) => {
  if (documentTypes.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-gray-200 border-dashed rounded-lg">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No document types configured
        </h3>
        <p className="text-gray-500">
          Please configure document types in your company settings first.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Documents to Request</h2>
        <p className="mt-1 text-gray-600">
          The driver will be asked to upload the following documents
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-start gap-3">
          <div className="flex gap-2 mt-1">
            {formData.email && <Mail className="w-5 h-5 text-blue-600" />}
            {formData.phone && <MessageSquare className="w-5 h-5 text-blue-600" />}
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Secure Link Will Be Sent</h3>
            <p className="mt-1 text-sm text-blue-800">
              {formData.email && formData.phone ? (
                <>An email and SMS will be sent to <strong>{formData.firstName} {formData.lastName}</strong> with a secure upload link.</>
              ) : formData.email ? (
                <>An email will be sent to <strong>{formData.email}</strong> with a secure upload link.</>
              ) : formData.phone ? (
                <>An SMS will be sent to <strong>{formData.phone}</strong> with a secure upload link.</>
              ) : (
                <>A secure upload link will be generated for this driver.</>
              )}
            </p>
            <p className="mt-1 text-xs text-blue-700">
              The link will expire in 7 days
            </p>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase">
          Required Documents ({documentTypes.length})
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {documentTypes.map((docType, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 transition-all border-2 border-gray-200 rounded-xl"
            >
              <div className="p-2 rounded-lg bg-blue-50">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{docType}</h4>
                <p className="text-xs text-gray-500">Will be requested from driver</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 mt-6 border-l-4 border-green-500 rounded-r-lg bg-green-50">
        <p className="text-sm font-medium text-green-900">
          Ready to send! Click "Next Step" to continue and review before sending the invitation.
        </p>
      </div>
    </div>
  );
};

export default DocumentPreviewStep;
