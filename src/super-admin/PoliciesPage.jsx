import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { getPolicyStatus } from "@/api/policies";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/utils/themeClasses";
import { PropagateLoader } from "react-spinners";

/**
 * Policies Management Page
 * Allows super-admin to manage all policy documents
 */

const POLICY_TYPES = [
  {
    type: "TERMS_OF_SERVICE",
    name: "Terms of Service",
    description: "User agreement and terms for using the platform",
    icon: FileText,
  },
  {
    type: "PRIVACY_POLICY",
    name: "Privacy Policy",
    description: "Data collection, usage, and privacy practices",
    icon: Shield,
  },
  {
    type: "DATA_PROCESSING_AGREEMENT",
    name: "Data Processing Agreement (DPA)",
    description: "GDPR/PIPEDA compliance agreement for data processing",
    icon: FileText,
  },
  {
    type: "SMS_CONSENT",
    name: "SMS Consent",
    description: "User consent for SMS notifications and communications",
    icon: FileText,
  },
  {
    type: "COOKIE_PREFERENCES",
    name: "Cookie Preferences",
    description: "Cookie usage and user preferences",
    icon: FileText,
  },
  {
    type: "SUPPORT_ACCESS",
    name: "Support Access",
    description: "Terms for customer support access to user data",
    icon: Shield,
  },
  {
    type: "AI_FAIR_USE_POLICY",
    name: "AI Fair Use Policy",
    description: "Guidelines for fair and responsible use of AI features",
    icon: Shield,
  },
  {
    type: "GDPR_DATA_PROCESSING_ADDENDUM",
    name: "GDPR Data Processing Addendum",
    description: "Additional GDPR compliance terms and data processing obligations",
    icon: FileText,
  },
  {
    type: "COMPLAINTS_POLICY",
    name: "Complaints Policy",
    description: "Process for submitting and handling user complaints",
    icon: FileText,
  },
];

const PoliciesPage = () => {
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [policiesStatus, setPoliciesStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoliciesStatus();
  }, []);

  const loadPoliciesStatus = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await getPolicyStatus(token);
      setPoliciesStatus(response.policies || []);
    } catch (error) {
      console.error("Failed to load policies status:", error);
      toast.error("Failed to load policies", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPolicyInfo = (type) => {
    return POLICY_TYPES.find((p) => p.type === type);
  };

  const getStatusBadge = (status) => {
    if (status.hasPublished) {
      return (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Published</span>
        </div>
      );
    } else if (status.totalVersions > 0) {
      return (
        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Draft</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Not Created</span>
        </div>
      );
    }
  };

  const handleEditPolicy = (type) => {
    navigate(`/super-admin/policies/${type.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
            : "bg-gray-50"
        }`}
      >
        <PropagateLoader color={isDarkMode ? "#a78bfa" : "#1f2937"} />
      </div>
    );
  }

  const completionRate =
    (policiesStatus.filter((p) => p.hasPublished).length / POLICY_TYPES.length) * 100;

  return (
    <div className={`flex flex-col w-full min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}
            >
              Policy Management
            </h1>
            <p className={`mt-2 ${getThemeClasses.text.secondary(isDarkMode)}`}>
              Create and manage all policy documents for user onboarding and compliance
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-[10px] border ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Total Policies
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${getThemeClasses.text.primary(
                    isDarkMode
                  )}`}
                >
                  {POLICY_TYPES.length}
                </p>
              </div>
              <FileText
                className={`w-8 h-8 ${
                  isDarkMode ? "text-violet-400" : "text-gray-600"
                }`}
              />
            </div>
          </div>

          <div
            className={`p-4 rounded-[10px] border ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Published
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${getThemeClasses.text.primary(
                    isDarkMode
                  )}`}
                >
                  {policiesStatus.filter((p) => p.hasPublished).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div
            className={`p-4 rounded-[10px] border ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Drafts
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${getThemeClasses.text.primary(
                    isDarkMode
                  )}`}
                >
                  {
                    policiesStatus.filter((p) => !p.hasPublished && p.totalVersions > 0)
                      .length
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div
            className={`p-4 rounded-[10px] border ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Completion
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${getThemeClasses.text.primary(
                    isDarkMode
                  )}`}
                >
                  {Math.round(completionRate)}%
                </p>
              </div>
              <div className="relative w-12 h-12">
                <svg className="transform -rotate-90" width="48" height="48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke={isDarkMode ? "#334155" : "#e5e7eb"}
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke={isDarkMode ? "#a78bfa" : "#1f2937"}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(completionRate / 100) * 125.6} 125.6`}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Warning if policies not published */}
        {policiesStatus.filter((p) => p.hasPublished).length < POLICY_TYPES.length && (
          <div
            className={`p-4 rounded-[10px] border ${
              isDarkMode
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isDarkMode ? "text-yellow-400" : "text-yellow-600"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-yellow-300" : "text-yellow-900"
                  }`}
                >
                  Incomplete Policy Setup
                </p>
                <p
                  className={`text-sm mt-1 ${
                    isDarkMode ? "text-yellow-400" : "text-yellow-700"
                  }`}
                >
                  {POLICY_TYPES.length -
                    policiesStatus.filter((p) => p.hasPublished).length}{" "}
                  policies are not yet published. Users may not be able to complete
                  onboarding until all policies are available.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POLICY_TYPES.map((policyInfo) => {
            const status = policiesStatus.find((p) => p.type === policyInfo.type) || {
              hasPublished: false,
              latestVersion: null,
              totalVersions: 0,
              lastUpdated: null,
            };
            const Icon = policyInfo.icon;

            return (
              <div
                key={policyInfo.type}
                className={`p-6 rounded-[10px] border transition-all hover:shadow-lg ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 hover:border-violet-600"
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-[10px] ${
                      isDarkMode
                        ? "bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600"
                        : "bg-gray-900"
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {getStatusBadge(status)}
                </div>

                <h3
                  className={`text-lg font-bold mb-2 ${getThemeClasses.text.primary(
                    isDarkMode
                  )}`}
                >
                  {policyInfo.name}
                </h3>

                <p
                  className={`text-sm mb-4 ${getThemeClasses.text.secondary(isDarkMode)}`}
                >
                  {policyInfo.description}
                </p>

                {status.totalVersions > 0 && (
                  <div
                    className={`text-xs mb-4 ${getThemeClasses.text.secondary(
                      isDarkMode
                    )}`}
                  >
                    {status.latestVersion && (
                      <div>Latest: v{status.latestVersion}</div>
                    )}
                    <div>{status.totalVersions} version(s)</div>
                    {status.lastUpdated && (
                      <div>
                        Updated: {new Date(status.lastUpdated).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleEditPolicy(policyInfo.type)}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-[10px] text-sm font-medium ${
                    isDarkMode
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  {status.totalVersions > 0 ? (
                    <>
                      <Edit className="w-4 h-4" />
                      Edit Policy
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Policy
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;
