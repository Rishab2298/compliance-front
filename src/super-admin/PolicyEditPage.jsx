import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, History, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  getPolicyHistory,
  createPolicy,
  updatePolicy,
  publishPolicy as publishPolicyAPI,
  getPolicyById,
} from "@/api/policies";
import PolicyEditor from "@/components/SuperAdmin/Policies/PolicyEditor";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/utils/themeClasses";
import { PropagateLoader } from "react-spinners";

/**
 * PolicyEditPage Component
 * Allows editing and managing individual policy documents
 */

const POLICY_NAMES = {
  terms_of_service: "Terms of Service",
  privacy_policy: "Privacy Policy",
  data_processing_agreement: "Data Processing Agreement (DPA)",
  sms_consent: "SMS Consent",
  cookie_preferences: "Cookie Preferences",
  support_access: "Support Access",
  ai_fair_use_policy: "AI Fair Use Policy",
  gdpr_data_processing_addendum: "GDPR Data Processing Addendum",
  complaints_policy: "Complaints Policy",
};

const PolicyEditPage = () => {
  const { type } = useParams();
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const policyType = type?.toUpperCase();
  const policyName = POLICY_NAMES[type] || type;

  useEffect(() => {
    loadPolicyHistory();
  }, [type]);

  const loadPolicyHistory = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await getPolicyHistory(token, policyType);
      setHistory(response.policies || []);

      // Set current policy to latest published or latest draft
      const publishedPolicy = response.policies?.find((p) => p.isPublished);
      const latestPolicy = response.policies?.[0];
      setCurrentPolicy(publishedPolicy || latestPolicy || null);
    } catch (error) {
      console.error("Failed to load policy history:", error);
      // Not an error if policy doesn't exist yet
      if (!error.message.includes("not found")) {
        toast.error("Failed to load policy", {
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async ({ content, isMajorVersion }) => {
    try {
      setSaving(true);
      const token = await getToken();

      let response;
      if (history.length === 0) {
        // Create new policy
        response = await createPolicy(token, {
          type: policyType,
          content,
          isPublished: false,
          isMajorVersion,
        });
      } else {
        // Update existing policy (creates new version)
        response = await updatePolicy(token, policyType, {
          content,
          isPublished: false,
          isMajorVersion,
        });
      }

      toast.success("Policy saved", {
        description: `Version ${response.policy.version} saved as draft`,
      });

      await loadPolicyHistory();
    } catch (error) {
      console.error("Failed to save policy:", error);
      toast.error("Failed to save policy", {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async ({ content, isMajorVersion }) => {
    try {
      setSaving(true);
      const token = await getToken();

      let response;
      if (history.length === 0) {
        // Create and publish new policy
        response = await createPolicy(token, {
          type: policyType,
          content,
          isPublished: true,
          isMajorVersion,
        });
      } else {
        // Update and publish policy
        response = await updatePolicy(token, policyType, {
          content,
          isPublished: true,
          isMajorVersion,
        });
      }

      toast.success("Policy published", {
        description: `Version ${response.policy.version} is now live`,
      });

      await loadPolicyHistory();
    } catch (error) {
      console.error("Failed to publish policy:", error);
      toast.error("Failed to publish policy", {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVersionSelect = async (version) => {
    try {
      const token = await getToken();
      const response = await getPolicyById(token, version.id);
      setSelectedVersion(response.policy);
      setShowHistory(false);
    } catch (error) {
      console.error("Failed to load policy version:", error);
      toast.error("Failed to load version", {
        description: error.message,
      });
    }
  };

  const handleRestoreVersion = () => {
    if (selectedVersion) {
      setCurrentPolicy(selectedVersion);
      setSelectedVersion(null);
      toast.info("Version loaded", {
        description: "You can now edit and save/publish this version",
      });
    }
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

  const displayPolicy = selectedVersion || currentPolicy;

  return (
    <div className={`flex flex-col w-full min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      <div className="relative z-10 p-6 space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/super-admin/policies")}
              className={`p-2 rounded-[10px] ${
                isDarkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-white"
                  : "bg-white hover:bg-gray-100 text-gray-900"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1
                className={`text-3xl font-bold ${getThemeClasses.text.primary(
                  isDarkMode
                )}`}
              >
                {policyName}
              </h1>
              {currentPolicy && (
                <p className={`mt-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Current Version: {currentPolicy.version} •{" "}
                  {currentPolicy.isPublished ? (
                    <span className="text-green-600 dark:text-green-400">Published</span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">Draft</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[10px] ${
              isDarkMode
                ? "bg-slate-800 hover:bg-slate-700 text-white"
                : "bg-white hover:bg-gray-100 text-gray-900 border border-gray-300"
            }`}
          >
            <History className="w-5 h-5" />
            Version History ({history.length})
          </button>
        </div>

        {/* Version History Sidebar */}
        {showHistory && (
          <div
            className={`p-4 rounded-[10px] border ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-300"
            }`}
          >
            <h3
              className={`text-lg font-bold mb-4 ${getThemeClasses.text.primary(
                isDarkMode
              )}`}
            >
              Version History
            </h3>
            <div className="space-y-2">
              {history.map((version) => (
                <div
                  key={version.id}
                  className={`p-3 rounded-[10px] cursor-pointer transition-all ${
                    selectedVersion?.id === version.id
                      ? isDarkMode
                        ? "bg-violet-600/20 border border-violet-600"
                        : "bg-blue-50 border border-blue-300"
                      : isDarkMode
                      ? "bg-slate-700 hover:bg-slate-600"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => handleVersionSelect(version)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${getThemeClasses.text.primary(
                            isDarkMode
                          )}`}
                        >
                          Version {version.version}
                        </span>
                        {version.isPublished && (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Published
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs mt-1 ${getThemeClasses.text.secondary(
                          isDarkMode
                        )}`}
                      >
                        {new Date(version.createdAt).toLocaleString()}
                      </div>
                      <div
                        className={`text-xs ${getThemeClasses.text.secondary(
                          isDarkMode
                        )}`}
                      >
                        by {version.createdBy.email}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p
                  className={`text-sm text-center py-4 ${getThemeClasses.text.secondary(
                    isDarkMode
                  )}`}
                >
                  No versions yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* Selected Version Banner */}
        {selectedVersion && (
          <div
            className={`p-4 rounded-[10px] border ${
              isDarkMode
                ? "bg-blue-500/10 border-blue-500/30"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-blue-300" : "text-blue-900"
                  }`}
                >
                  Viewing Version {selectedVersion.version}
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-blue-400" : "text-blue-700"
                  }`}
                >
                  You are viewing a previous version. Click "Restore Version" to edit and
                  save as a new version.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedVersion(null)}
                  className={`px-4 py-2 rounded-[10px] text-sm ${
                    isDarkMode
                      ? "bg-slate-700 hover:bg-slate-600 text-white"
                      : "bg-white hover:bg-gray-100 text-gray-900 border border-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreVersion}
                  className={`px-4 py-2 rounded-[10px] text-sm ${
                    isDarkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Restore Version
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Editor */}
        <PolicyEditor
          initialContent={displayPolicy?.content || ""}
          onSave={handleSave}
          onPublish={handlePublish}
          policyType={policyName}
          currentVersion={displayPolicy?.version}
          loading={saving}
          readOnly={!!selectedVersion}
        />
      </div>
    </div>
  );
};

export default PolicyEditPage;
