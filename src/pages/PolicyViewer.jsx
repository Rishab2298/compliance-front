import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { getLatestPublishedPolicy } from '@/api/policies';
import { createSafeMarkup } from '@/lib/sanitize';

const PolicyViewer = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState(null);
  const [error, setError] = useState(null);

  const handleGoBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // If opened in new tab, navigate to home
      navigate('/');
    }
  };

  const policyTitles = {
    'terms-of-service': 'Terms of Service',
    'privacy-policy': 'Privacy Policy',
    'data-processing-agreement': 'Data Processing Agreement',
    'sms-consent': 'SMS Consent',
    'cookie-preferences': 'Cookie Policy',
    'support-access': 'Support Access Agreement',
  };

  const policyTypeMap = {
    'terms-of-service': 'TERMS_OF_SERVICE',
    'privacy-policy': 'PRIVACY_POLICY',
    'data-processing-agreement': 'DATA_PROCESSING_AGREEMENT',
    'sms-consent': 'SMS_CONSENT',
    'cookie-preferences': 'COOKIE_PREFERENCES',
    'support-access': 'SUPPORT_ACCESS',
  };

  useEffect(() => {
    fetchPolicy();
  }, [type]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      setError(null);

      const policyType = policyTypeMap[type];
      if (!policyType) {
        setError('Invalid policy type');
        return;
      }

      const response = await getLatestPublishedPolicy(policyType);
      setPolicy(response);
    } catch (err) {
      console.error('Error fetching policy:', err);
      setError(err.message || 'Failed to load policy');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-violet-400 animate-spin" />
          <p className="text-slate-400">Loading policy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-md text-center">
          <div className="inline-block p-4 mb-4 rounded-full bg-red-500/10">
            <FileText className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Policy Not Found</h2>
          <p className="mb-6 text-slate-400">{error}</p>
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-6 py-3 text-white transition-colors rounded-lg bg-violet-600 hover:bg-violet-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="fixed top-0 rounded-full pointer-events-none left-1/4 w-96 h-96 bg-violet-500/5 blur-3xl"></div>
      <div className="fixed bottom-0 rounded-full pointer-events-none right-1/4 w-96 h-96 bg-purple-500/5 blur-3xl"></div>

      <header className="relative z-10 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl px-6 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <Link
              to="/"
              className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text"
            >
              Complyo
            </Link>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl px-6 py-12 mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-block p-3 mb-4 rounded-lg bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-purple-500/20">
            <FileText className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">
            {policyTitles[type]}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
            <span>Version {policy?.version}</span>
            <span>•</span>
            <span>
              Published {new Date(policy?.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        <article className="prose prose-invert prose-slate max-w-none">
          <div className="p-8 border bg-slate-900/50 border-slate-800 rounded-xl backdrop-blur-sm">
            <div
              className="text-slate-300 policy-content"
              dangerouslySetInnerHTML={createSafeMarkup(policy?.content || '')}
            />
          </div>
        </article>

        <div className="flex justify-center mt-12">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-6 py-3 text-white transition-colors border rounded-lg bg-slate-800 hover:bg-slate-700 border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Previous Page
          </button>
        </div>
      </main>

      <footer className="relative z-10 mt-16 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl px-6 py-8 mx-auto">
          <div className="text-sm text-center text-slate-500">
            <p>© {new Date().getFullYear()} Complyo. All rights reserved.</p>
            <p className="mt-2">
              For questions about this policy, contact{' '}
              <a href="mailto:support@complyo.io" className="text-violet-400 hover:text-violet-300">
                support@complyo.io
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PolicyViewer;
