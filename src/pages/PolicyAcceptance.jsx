import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import { getAllLatestPublishedPolicies, acceptPolicies } from '@/api/policies';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const PolicyAcceptance = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to 'dark'
    return localStorage.getItem("theme") || "dark";
  });
  const [acceptances, setAcceptances] = useState({
    TERMS_OF_SERVICE: false,
    PRIVACY_POLICY: false,
    DATA_PROCESSING_AGREEMENT: false,
    SMS_CONSENT: false,
    COOKIE_PREFERENCES: false,
    SUPPORT_ACCESS: false,
    AI_FAIR_USE_POLICY: false,
    GDPR_DATA_PROCESSING_ADDENDUM: false,
    COMPLAINTS_POLICY: false,
  });

  const policyLabels = {
    TERMS_OF_SERVICE: 'Terms of Service',
    PRIVACY_POLICY: 'Privacy Policy',
    DATA_PROCESSING_AGREEMENT: 'Data Processing Agreement (DPA)',
    SMS_CONSENT: 'SMS Consent',
    COOKIE_PREFERENCES: 'Cookie Preferences',
    SUPPORT_ACCESS: 'Support Access',
    AI_FAIR_USE_POLICY: 'AI Fair Use Policy',
    GDPR_DATA_PROCESSING_ADDENDUM: 'GDPR Data Processing Addendum',
    COMPLAINTS_POLICY: 'Complaints Policy',
  };

  const policyDescriptions = {
    TERMS_OF_SERVICE: 'I agree to the Complyo Terms of Service.',
    PRIVACY_POLICY: 'I have read and agree to the Privacy Policy.',
    DATA_PROCESSING_AGREEMENT: 'I agree that Complyo processes documents and personal information under the Data Processing Addendum.',
    SMS_CONSENT: 'I agree to receive SMS alerts from Complyo. Message frequency varies. Reply STOP to opt out, HELP for help. Message & data rates may apply. Consent is not a condition of purchase.',
    COOKIE_PREFERENCES: 'I agree to the use of cookies as described in the Cookie Policy.',
    SUPPORT_ACCESS: 'I authorize Complyo support to access my account solely to resolve an active support ticket. Access expires after 72 hours from when granted. You can revoke this permission at any time in your account settings.',
    AI_FAIR_USE_POLICY: 'I agree to use AI features responsibly and in accordance with the AI Fair Use Policy.',
    GDPR_DATA_PROCESSING_ADDENDUM: 'I acknowledge and agree to the GDPR Data Processing Addendum terms for data protection and compliance.',
    COMPLAINTS_POLICY: 'I have read and understand the Complaints Policy and the process for submitting complaints.',
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await getAllLatestPublishedPolicies();
      setPolicies(response.policies || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (policyType) => {
    setAcceptances((prev) => ({
      ...prev,
      [policyType]: !prev[policyType],
    }));
  };

  const allAccepted = Object.values(acceptances).every((v) => v === true);

  const handleSubmit = async () => {
    if (!allAccepted) {
      toast.error('Please accept all policies to continue');
      return;
    }

    try {
      setSubmitting(true);
      const token = await getToken();
      const policyIds = policies.map((p) => p.id);

      await acceptPolicies(token, policyIds);

      // Mark policy check as complete in session storage
      sessionStorage.setItem("policy_check_complete", "true");

      toast.success('Policies accepted successfully!', {
        icon: <CheckCircle className="w-5 h-5" />,
      });

      // Redirect to dashboard after successful acceptance
      setTimeout(() => {
        navigate('/client/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error accepting policies:', error);
      toast.error(error.message || 'Failed to accept policies');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-violet-400 animate-spin" />
          <p className="text-slate-400">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-screen min-h-screen p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Decorative elements */}
      <div className="fixed top-0 rounded-full pointer-events-none left-1/4 w-96 h-96 bg-violet-500/5 blur-3xl"></div>
      <div className="fixed bottom-0 rounded-full pointer-events-none right-1/4 w-96 h-96 bg-purple-500/5 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8 space-y-2 text-center">
          <div className="inline-block p-3 mb-4 rounded-[10px] bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-purple-500/20">
            <FileCheck className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Legal Consents</h1>
          <p className="text-slate-400">
            Please review and accept our terms and policies to access your dashboard
          </p>
        </div>

        {/* Policies */}
        <div className="p-8 space-y-6 bg-slate-900/50 border border-slate-800 rounded-[10px] backdrop-blur-sm">
          <div className="space-y-4">
            {Object.entries(policyLabels).map(([type, label]) => {
              const policy = policies.find((p) => p.type === type);
              const isAccepted = acceptances[type];

              return (
                <div
                  key={type}
                  className={`p-4 border rounded-[10px] transition-all ${
                    isAccepted
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAccepted}
                      onChange={() => handleToggle(type)}
                      className="w-5 h-5 mt-0.5 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">
                        {policyDescriptions[type]}{' '}
                        {policy && (
                          <a
                            href={`/policies/${type.toLowerCase().replace(/_/g, '-')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300"
                          >
                            View {label}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        . <span className="text-red-400">*</span>
                      </p>
                      {policy && (
                        <p className="mt-1 text-xs text-slate-500">
                          Version {policy.version} � Published{' '}
                          {new Date(policy.publishedAt).toLocaleDateString()}
                        </p>
                      )}
                      {type === 'SMS_CONSENT' && (
                        <p className="mt-2 text-xs text-slate-500">
                          By checking this box, you authorize Complyo to send
                          automated text messages to the mobile number provided.
                          Standard messaging rates apply.
                        </p>
                      )}
                      {type === 'SUPPORT_ACCESS' && (
                        <p className="mt-2 text-xs text-slate-500">
                          Access expires after 72 hours from when granted. You can
                          revoke this permission at any time in your account
                          settings.
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          {/* Retention Notice */}
          <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-[10px]">
            <p className="text-xs text-violet-300">
              =� Your acceptance records will be retained for 24-36 months for
              compliance purposes.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!allAccepted || submitting}
              className={`px-8 py-3 text-white border-0 rounded-[10px] transition-all ${
                allAccepted && !submitting
                  ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50'
                  : 'bg-slate-700 cursor-not-allowed opacity-50'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Accept and Continue'
              )}
            </Button>
          </div>

          {!allAccepted && (
            <p className="text-xs text-center text-red-400">
              You must accept all 9 policies to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyAcceptance;
