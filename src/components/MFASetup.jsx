import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { X, Shield, Copy, Download, Check, AlertCircle } from "lucide-react";
import { setupTOTP, verifyAndEnableTOTP } from "@/api/mfa";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/utils/themeClasses";

/**
 * MFA Setup Modal
 * Guides users through enabling two-factor authentication
 */

const MFASetup = ({ isOpen, onClose, onSuccess }) => {
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();

  const [step, setStep] = useState(1); // 1: QR Code, 2: Verify, 3: Backup Codes
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [downloadedCodes, setDownloadedCodes] = useState(false);

  useEffect(() => {
    if (isOpen && step === 1) {
      initializeSetup();
    }
  }, [isOpen]);

  const initializeSetup = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await setupTOTP(token);

      setQrCode(data.qrCode);
      setSecret(data.secret);
    } catch (error) {
      console.error("MFA setup error:", error);
      toast.error("Failed to initialize MFA setup", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const data = await verifyAndEnableTOTP(token, verifyCode);

      setBackupCodes(data.backupCodes);
      setStep(3);
      toast.success("MFA enabled successfully!");
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    toast.success("Secret copied to clipboard");
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join("\n");
    const blob = new Blob([`Complyo Backup Codes\n\nSave these codes in a secure location.\nEach code can only be used once.\n\n${text}`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `complyo-backup-codes-${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadedCodes(true);
    toast.success("Backup codes downloaded");
  };

  const handleComplete = () => {
    if (!downloadedCodes) {
      toast.warning("Please download your backup codes before completing setup");
      return;
    }

    onSuccess?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`relative w-full max-w-2xl rounded-[10px] border p-6 ${getThemeClasses.bg.card(isDarkMode)}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-[10px] ${isDarkMode ? "bg-violet-500/20" : "bg-gray-100"}`}>
              <Shield className={`w-6 h-6 ${isDarkMode ? "text-violet-400" : "text-gray-700"}`} />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                Set up Two-Factor Authentication
              </h2>
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Step {step} of 3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-[10px] ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"}`}
          >
            <X className={`w-5 h-5 ${getThemeClasses.text.secondary(isDarkMode)}`} />
          </button>
        </div>

        {/* Step 1: Scan QR Code */}
        {step === 1 && (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-[10px] border ${isDarkMode ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200"}`}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? "text-blue-300" : "text-blue-900"}`}>
                    You'll need an authenticator app
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}>
                    Download Google Authenticator, Authy, or Microsoft Authenticator on your phone
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-violet-500"></div>
              </div>
            ) : (
              <>
                {/* QR Code */}
                <div className="flex flex-col items-center space-y-4">
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    Scan this QR code with your authenticator app:
                  </p>
                  {qrCode && (
                    <div className={`p-4 rounded-[10px] border ${isDarkMode ? "bg-white border-slate-700" : "bg-white border-gray-200"}`}>
                      <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                    </div>
                  )}
                </div>

                {/* Manual Entry */}
                <div className="space-y-2">
                  <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                    Can't scan? Enter this code manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code
                      className={`flex-1 p-3 rounded-[10px] text-center font-mono text-sm ${
                        isDarkMode ? "bg-slate-800 text-violet-400" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {secret}
                    </code>
                    <button
                      onClick={copySecret}
                      className={`p-3 rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                    >
                      {copiedSecret ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className={`w-full py-3 rounded-[10px] font-medium ${getThemeClasses.button.primary(isDarkMode)}`}
                >
                  Continue
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)} mb-4`}>
                Enter the 6-digit code from your authenticator app to verify:
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className={`w-full text-center text-3xl tracking-widest font-mono p-4 rounded-[10px] border ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-white focus:border-violet-500"
                    : "bg-white border-gray-300 text-gray-900 focus:border-gray-400"
                } focus:outline-none`}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className={`flex-1 py-3 rounded-[10px] font-medium ${getThemeClasses.button.secondary(isDarkMode)}`}
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={loading || verifyCode.length !== 6}
                className={`flex-1 py-3 rounded-[10px] font-medium ${getThemeClasses.button.primary(isDarkMode)} disabled:opacity-50`}
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Backup Codes */}
        {step === 3 && (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-[10px] border ${isDarkMode ? "bg-yellow-500/10 border-yellow-500/30" : "bg-yellow-50 border-yellow-200"}`}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? "text-yellow-300" : "text-yellow-900"}`}>
                    Save these backup codes now!
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-yellow-400" : "text-yellow-700"}`}>
                    You'll need them to access your account if you lose your authenticator app. Each code can only be used once.
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-[10px] border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"}`}>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <code
                    key={index}
                    className={`p-2 rounded text-center font-mono text-sm ${
                      isDarkMode ? "bg-slate-700 text-violet-400" : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <button
              onClick={downloadBackupCodes}
              className={`w-full py-3 rounded-[10px] font-medium flex items-center justify-center gap-2 ${
                downloadedCodes
                  ? isDarkMode
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-green-50 text-green-700 border border-green-200"
                  : getThemeClasses.button.secondary(isDarkMode)
              }`}
            >
              {downloadedCodes ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />}
              {downloadedCodes ? "Downloaded" : "Download Backup Codes"}
            </button>

            <button
              onClick={handleComplete}
              disabled={!downloadedCodes}
              className={`w-full py-3 rounded-[10px] font-medium ${getThemeClasses.button.primary(isDarkMode)} disabled:opacity-50`}
            >
              Complete Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MFASetup;
