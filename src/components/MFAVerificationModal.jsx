import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Shield, KeyRound } from "lucide-react";
import { verifyMFA } from "@/api/mfa";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/utils/themeClasses";

/**
 * MFA Verification Modal
 * Shown on every login to verify TOTP code
 */

const MFAVerificationModal = ({ isOpen, onVerified, onBackupCode }) => {
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!code || (useBackupCode ? code.length !== 9 : code.length !== 6)) {
      toast.error(useBackupCode ? "Enter a 9-character backup code" : "Enter a 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      await verifyMFA(token, code, useBackupCode);

      // Store verification in sessionStorage (cleared on logout)
      sessionStorage.setItem("mfa_verified", "true");
      sessionStorage.setItem("mfa_verified_at", Date.now().toString());

      toast.success("Verification successful!");
      onVerified?.();
    } catch (error) {
      console.error("MFA verification error:", error);
      toast.error("Verification failed", {
        description: error.message || "Invalid code. Please try again.",
      });
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value;
    if (useBackupCode) {
      // Allow format: XXXX-XXXX
      setCode(value.toUpperCase());
    } else {
      // Only digits for TOTP
      setCode(value.replace(/\D/g, ""));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
      <div
        className={`relative w-full max-w-md rounded-[10px] border p-8 ${getThemeClasses.bg.card(isDarkMode)}`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`p-4 rounded-full ${
              isDarkMode ? "bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600" : "bg-gray-900"
            }`}
          >
            <KeyRound className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-6">
          <h2 className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
            Two-Factor Authentication
          </h2>

          <p className={`text-base ${getThemeClasses.text.secondary(isDarkMode)}`}>
            {useBackupCode
              ? "Enter one of your backup codes"
              : "Enter the 6-digit code from your authenticator app"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
              maxLength={useBackupCode ? 9 : 6}
              autoFocus
              disabled={loading}
              className={`w-full text-center text-3xl tracking-widest font-mono p-4 rounded-[10px] border ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-white focus:border-violet-500"
                  : "bg-white border-gray-300 text-gray-900 focus:border-gray-400"
              } focus:outline-none disabled:opacity-50`}
            />
          </div>

          <button
            type="submit"
            disabled={loading || (!useBackupCode && code.length !== 6) || (useBackupCode && code.length !== 9)}
            className={`w-full py-3 rounded-[10px] font-medium ${getThemeClasses.button.primary(
              isDarkMode
            )} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          {/* Toggle backup code */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode("");
              }}
              className={`text-sm ${isDarkMode ? "text-violet-400 hover:text-violet-300" : "text-gray-600 hover:text-gray-900"} underline`}
            >
              {useBackupCode ? "Use authenticator app" : "Use backup code"}
            </button>
          </div>
        </form>

        {/* Help text */}
        <div
          className={`mt-6 p-3 rounded-[10px] text-xs text-center ${
            isDarkMode ? "bg-slate-800 text-slate-400" : "bg-gray-50 text-gray-600"
          }`}
        >
          {useBackupCode
            ? "Each backup code can only be used once"
            : "Open your authenticator app to get the code"}
        </div>
      </div>
    </div>
  );
};

export default MFAVerificationModal;
