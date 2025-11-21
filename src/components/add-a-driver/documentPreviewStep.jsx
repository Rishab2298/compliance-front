import { FileText, Mail, MessageSquare } from "lucide-react";
import { getThemeClasses } from "@/utils/themeClasses";

const DocumentPreviewStep = ({ formData, documentTypes = [], isDarkMode }) => {
  if (documentTypes.length === 0) {
    return (
      <div className={`p-8 text-center border-2 border-dashed rounded-lg ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <FileText className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`} />
        <h3 className={`mb-2 text-lg font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
          No document types configured
        </h3>
        <p className={getThemeClasses.text.secondary(isDarkMode)}>
          Please configure document types in your company settings first.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h2 className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>Documents to Request</h2>
        <p className={`mt-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
          The driver will be asked to upload the following documents
        </p>
      </div>

      {/* Info Banner */}
      <div className={`p-4 mb-6 border rounded-lg ${
        isDarkMode
          ? 'border-violet-500/30 bg-violet-500/10'
          : 'border-blue-200 bg-blue-50'
      }`}>
        <div className="flex items-start gap-3">
          <div className="flex gap-2 mt-1">
            {formData.email && <Mail className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-blue-600'}`} />}
            {formData.phone && <MessageSquare className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-blue-600'}`} />}
          </div>
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-violet-200' : 'text-blue-900'}`}>Secure Link Will Be Sent</h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-violet-300' : 'text-blue-800'}`}>
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
            <p className={`mt-1 text-xs ${isDarkMode ? 'text-violet-400' : 'text-blue-700'}`}>
              The link will expire in 7 days
            </p>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        <h3 className={`text-sm font-semibold uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>
          Required Documents ({documentTypes.length})
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {documentTypes.map((docType, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 transition-all border-2 rounded-xl ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-800/50'
                  : 'border-gray-200'
              }`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-violet-500/20' : 'bg-blue-50'}`}>
                <FileText className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>{docType}</h4>
                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>Will be requested from driver</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className={`p-4 mt-6 border-l-4 rounded-r-lg ${
        isDarkMode
          ? 'border-green-500 bg-green-500/10'
          : 'border-green-500 bg-green-50'
      }`}>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-900'}`}>
          Ready to send! Click "Next Step" to continue and review before sending the invitation.
        </p>
      </div>
    </div>
  );
};

export default DocumentPreviewStep;
