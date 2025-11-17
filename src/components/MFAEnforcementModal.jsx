import React, { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, AlertTriangle } from "lucide-react";
import { PropagateLoader } from "react-spinners";
import { getMFAStatus } from "@/api/mfa";
import { getAcceptanceStatus } from "@/api/policies";
import MFASetup from "./MFASetup";
import MFAVerificationModal from "./MFAVerificationModal";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/utils/themeClasses";

/**
 * MFA Enforcement Modal
 * Forces users to set up MFA and verify on every login
 */

const MFAEnforcementModal = ({ children }) => {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mfaStatus, setMfaStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  // Initialize mfaVerified from sessionStorage
  const getInitialMfaVerified = () => {
    const sessionVerified = sessionStorage.getItem("mfa_verified") === "true";
    const verifiedAt = sessionStorage.getItem("mfa_verified_at");
    const isExpired = verifiedAt && Date.now() - parseInt(verifiedAt) > 24 * 60 * 60 * 1000;
    return sessionVerified && !isExpired;
  };

  const [mfaVerified, setMfaVerified] = useState(getInitialMfaVerified);

  // Initialize policyCheckComplete from sessionStorage
  const getInitialPolicyCheckComplete = () => {
    return sessionStorage.getItem("policy_check_complete") === "true";
  };

  const [policyCheckComplete, setPolicyCheckComplete] = useState(getInitialPolicyCheckComplete);

  useEffect(() => {
    if (userId) {
      // Always check MFA status from backend first
      checkMFAStatus();
    } else {
      // User logged out - clear MFA verification and policy check
      sessionStorage.removeItem("mfa_verified");
      sessionStorage.removeItem("mfa_verified_at");
      sessionStorage.removeItem("policy_check_complete");
      setMfaVerified(false);
      setPolicyCheckComplete(false);
    }
  }, [userId]);

  const checkMFAStatus = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const status = await getMFAStatus(token);
      setMfaStatus(status);

      // Check if MFA is enabled and verified in database
      if (status?.enabled && status?.verified) {
        // MFA is set up in database
        // Check if already verified in this session
        const sessionVerified = sessionStorage.getItem("mfa_verified") === "true";
        const verifiedAt = sessionStorage.getItem("mfa_verified_at");
        const isExpired = verifiedAt && Date.now() - parseInt(verifiedAt) > 24 * 60 * 60 * 1000;

        if (sessionVerified && !isExpired) {
          // Already verified in this session, skip verification modal
          setMfaVerified(true);
          setShowVerification(false);
          await checkPolicyAcceptance();
        } else {
          // Need to verify for this session
          setShowVerification(true);
          setMfaVerified(false);
        }
      } else {
        // MFA not set up yet, will show setup modal
        setMfaVerified(false);
        setShowVerification(false);
      }
    } catch (error) {
      console.error("Failed to get MFA status:", error);
      // On error, don't block the user
      setMfaStatus({ enabled: false, verified: false });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    checkMFAStatus(); // Refresh status
  };

  const handleVerificationComplete = async () => {
    setShowVerification(false);
    setMfaVerified(true);

    // After MFA verification, check policy acceptance for team members
    await checkPolicyAcceptance();
  };

  const checkPolicyAcceptance = async () => {
    try {
      // Check session storage first
      const policyCheckCompleteSession = sessionStorage.getItem("policy_check_complete") === "true";
      if (policyCheckCompleteSession) {
        setPolicyCheckComplete(true);
        return;
      }

      // Wait for user to be loaded
      if (!user) {
        setPolicyCheckComplete(true);
        sessionStorage.setItem("policy_check_complete", "true");
        return;
      }

      const role = user?.publicMetadata?.role;
      const companyId = user?.publicMetadata?.companyId;

      // Skip policy check for super admins and admins without company (during onboarding)
      if (role === 'SUPER_ADMIN' || !companyId) {
        setPolicyCheckComplete(true);
        sessionStorage.setItem("policy_check_complete", "true");
        return;
      }

      // Check if user has accepted policies (for team members only)
      const token = await getToken();
      const status = await getAcceptanceStatus(token);

      if (status.needsPolicyAcceptance) {
        // Don't mark as complete, navigate to policy page
        navigate('/policy-acceptance');
      } else {
        setPolicyCheckComplete(true);
        sessionStorage.setItem("policy_check_complete", "true");
      }
    } catch (error) {
      console.error('Failed to check policy acceptance:', error);
      // On error, allow access (fail open)
      setPolicyCheckComplete(true);
      sessionStorage.setItem("policy_check_complete", "true");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gray-50'}`}>
        <PropagateLoader color={isDarkMode ? "#a78bfa" : "#1f2937"} />
      </div>
    );
  }

  // If MFA is not enabled or not set up in database, show setup enforcement modal
  if (mfaStatus && (!mfaStatus.enabled || !mfaStatus.verified)) {
    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <div
            className={`relative w-full max-w-lg rounded-[10px] border p-8 ${getThemeClasses.bg.card(isDarkMode)}`}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className={`p-4 rounded-full ${
                  isDarkMode ? "bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600" : "bg-gray-900"
                }`}
              >
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4">
              <h2 className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                Two-Factor Authentication Required
              </h2>

              <p className={`text-base ${getThemeClasses.text.secondary(isDarkMode)}`}>
                To protect your account and comply with security policies, you must enable
                two-factor authentication before continuing.
              </p>

              <div
                className={`p-4 rounded-[10px] border ${isDarkMode ? "bg-yellow-500/10 border-yellow-500/30" : "bg-yellow-50 border-yellow-200"}`}
              >
                <div className="flex items-start gap-3 text-left">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? "text-yellow-300" : "text-yellow-900"}`}>
                      This is mandatory for all users
                    </p>
                    <p className={`text-sm mt-1 ${isDarkMode ? "text-yellow-400" : "text-yellow-700"}`}>
                      You'll need a smartphone with Google Authenticator, Authy, or Microsoft
                      Authenticator installed.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-[10px] ${isDarkMode ? "bg-slate-800" : "bg-gray-50"} text-left space-y-2`}>
                <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                  Setup takes only 2 minutes:
                </p>
                <ul className={`text-sm space-y-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? "bg-violet-400" : "bg-gray-600"}`}></span>
                    Scan a QR code with your authenticator app
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? "bg-violet-400" : "bg-gray-600"}`}></span>
                    Enter a 6-digit verification code
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? "bg-violet-400" : "bg-gray-600"}`}></span>
                    Save your backup codes
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowSetup(true)}
                className={`w-full py-3 rounded-[10px] font-medium text-base ${getThemeClasses.button.primary(isDarkMode)}`}
              >
                Set Up Two-Factor Authentication
              </button>

              <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                You cannot access the application until MFA is enabled
              </p>
            </div>
          </div>
        </div>

        {/* MFA Setup Modal */}
        <MFASetup
          isOpen={showSetup}
          onClose={() => setShowSetup(false)}
          onSuccess={handleSetupComplete}
        />
      </>
    );
  }

  // MFA is enabled in database - check if verified for this session
  if (mfaStatus && mfaStatus.enabled && mfaStatus.verified && showVerification) {
    return (
      <>
        <MFAVerificationModal
          isOpen={true}
          onVerified={handleVerificationComplete}
        />
      </>
    );
  }

  // MFA is enabled and verified - check if policy check is complete
  // If we're on the policy acceptance page, allow access
  // If policy check is not complete and we're not on the policy page, show loading
  if (location.pathname === '/policy-acceptance') {
    return <>{children}</>;
  }

  if (!policyCheckComplete) {
    // Still checking policy acceptance
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gray-50'}`}>
        <PropagateLoader color={isDarkMode ? "#a78bfa" : "#1f2937"} />
      </div>
    );
  }

  // MFA is enabled, verified, and policies are accepted (or not needed) - render children
  return <>{children}</>;
};

export default MFAEnforcementModal;
