import { useState, useEffect, useRef } from 'react';
import { Download, CheckCircle, AlertCircle, Loader2, ArrowDown } from 'lucide-react';
import { getLatestPublishedPolicy } from '@/api/policies';
import { createSafeMarkup } from '@/lib/sanitize';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const PolicyModal = ({
  isOpen,
  onClose,
  onAccept,
  policyType,
  policyLabel,
  isCurrentlyChecked,
}) => {
  const [policyData, setPolicyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isShortContent, setIsShortContent] = useState(false);
  const contentRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Fetch policy content when modal opens
  useEffect(() => {
    if (isOpen && policyType) {
      fetchPolicyContent();
    }
  }, [isOpen, policyType]);

  // Check if content is scrollable
  useEffect(() => {
    if (policyData && contentRef.current) {
      const element = contentRef.current;
      const isScrollable = element.scrollHeight > element.clientHeight;
      setIsShortContent(!isScrollable);

      if (!isScrollable) {
        // For short content, auto-check after a brief delay to ensure user sees it
        scrollTimeoutRef.current = setTimeout(() => {
          checkScrollPosition();
        }, 500);
      }
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [policyData]);

  // Reset interaction state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasInteracted(false);
      setIsShortContent(false);
      setPolicyData(null);
      setError(null);
    }
  }, [isOpen]);

  const fetchPolicyContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const fetchPromise = getLatestPublishedPolicy(policyType);

      const data = await Promise.race([fetchPromise, timeoutPromise]);
      setPolicyData(data);
    } catch (err) {
      console.error('Error fetching policy:', err);
      setError(err.message || 'Failed to load policy content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (e) => {
    if (!isShortContent) {
      checkScrollPosition();
    }
  };

  const checkScrollPosition = () => {
    if (contentRef.current) {
      const element = contentRef.current;
      const threshold = 20;
      const isAtBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight < threshold;

      if (isAtBottom || isShortContent) {
        setHasInteracted(true);
      }
    }
  };

  const handleContentClick = () => {
    if (isShortContent && !hasInteracted) {
      setHasInteracted(true);
    }
  };

  const downloadPDF = () => {
    if (!policyData) return;

    try {
      // Check if a PDF URL exists
      if (policyData.pdfUrl) {
        // Download the uploaded PDF file
        const filename = `${policyType.toLowerCase()}-v${policyData.version}.pdf`;
        const link = document.createElement('a');
        link.href = policyData.pdfUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback: No PDF available
        alert('PDF not available for this policy. Please contact support.');
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF. Please try again or contact support.');
    }
  };

  const handleAccept = () => {
    onAccept();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading policy content...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-sm text-red-400">Failed to load policy content</p>
          <p className="text-xs text-slate-500">{error}</p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={fetchPolicyContent}
              className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-violet-600 hover:bg-violet-700"
            >
              Retry
            </button>
            <a
              href={`/policies/${policyType.toLowerCase().replace(/_/g, '-')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium transition-colors rounded-lg text-slate-300 bg-slate-700 hover:bg-slate-600"
            >
              Open in new tab
            </a>
          </div>
        </div>
      );
    }

    if (!policyData) {
      return null;
    }

    return (
      <div className="space-y-4">
        {/* Scroll Indicator */}
        {!hasInteracted && (
          <div className={`p-3 rounded-lg border ${
            isShortContent
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            <div className="flex items-center gap-2">
              {isShortContent ? (
                <>
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <p className="text-xs text-blue-300">
                    Click in the policy area below to continue
                  </p>
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4 text-amber-400 animate-bounce" />
                  <p className="text-xs text-amber-300">
                    Please scroll to the bottom to continue
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {hasInteracted && (
          <div className="p-3 border rounded-lg bg-green-500/10 border-green-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-xs text-green-300">
                You can now accept this policy
              </p>
            </div>
          </div>
        )}

        {/* Policy Content */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          onClick={handleContentClick}
          className={`
            max-h-[60vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6
            bg-slate-900/50 border border-slate-700 rounded-lg
            ${isShortContent && !hasInteracted ? 'cursor-pointer hover:bg-slate-900/70 transition-colors' : ''}
          `}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#6366f1 #1e293b',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          <style>
            {`
              .policy-content h1 {
                font-size: 1.875rem;
                font-weight: 700;
                color: #e2e8f0;
                margin-bottom: 1.5rem;
                margin-top: 2rem;
                line-height: 2.25rem;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .policy-content h1:first-child {
                margin-top: 0;
              }
              .policy-content h2 {
                font-size: 1.5rem;
                font-weight: 600;
                color: #e2e8f0;
                margin-bottom: 1rem;
                margin-top: 1.75rem;
                line-height: 2rem;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .policy-content h3 {
                font-size: 1.25rem;
                font-weight: 600;
                color: #cbd5e1;
                margin-bottom: 0.75rem;
                margin-top: 1.5rem;
                line-height: 1.75rem;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .policy-content h4 {
                font-size: 1.125rem;
                font-weight: 600;
                color: #cbd5e1;
                margin-bottom: 0.75rem;
                margin-top: 1.25rem;
                line-height: 1.75rem;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .policy-content h5, .policy-content h6 {
                font-size: 1rem;
                font-weight: 600;
                color: #cbd5e1;
                margin-bottom: 0.5rem;
                margin-top: 1rem;
                line-height: 1.5rem;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .policy-content p {
                color: #cbd5e1;
                margin-bottom: 1rem;
                line-height: 1.75rem;
                font-size: 0.9375rem;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .policy-content ul, .policy-content ol {
                margin-bottom: 1rem;
                margin-top: 0.5rem;
                padding-left: 1.5rem;
                color: #cbd5e1;
              }
              .policy-content li {
                margin-bottom: 0.5rem;
                line-height: 1.75rem;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .policy-content ul {
                list-style-type: disc;
              }
              .policy-content ol {
                list-style-type: decimal;
              }
              .policy-content ul ul, .policy-content ol ul {
                list-style-type: circle;
                margin-top: 0.5rem;
              }
              .policy-content ul ol, .policy-content ol ol {
                list-style-type: lower-alpha;
                margin-top: 0.5rem;
              }
              .policy-content strong, .policy-content b {
                font-weight: 600;
                color: #e2e8f0;
              }
              .policy-content em, .policy-content i {
                font-style: italic;
              }
              .policy-content u {
                text-decoration: underline;
              }
              .policy-content a {
                color: #a78bfa;
                text-decoration: underline;
                word-wrap: break-word;
                overflow-wrap: break-word;
                word-break: break-word;
              }
              .policy-content a:hover {
                color: #c4b5fd;
              }
              .policy-content img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 1rem 0;
              }
              .policy-content blockquote {
                border-left: 4px solid #6366f1;
                padding-left: 1rem;
                margin: 1.5rem 0;
                color: #94a3b8;
                font-style: italic;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .policy-content code {
                background-color: #1e293b;
                color: #e2e8f0;
                padding: 0.125rem 0.375rem;
                border-radius: 0.25rem;
                font-size: 0.875rem;
                font-family: monospace;
              }
              .policy-content pre {
                background-color: #1e293b;
                color: #e2e8f0;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                margin: 1rem 0;
                max-width: 100%;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .policy-content pre code {
                background-color: transparent;
                padding: 0;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .policy-content-table-wrapper {
                width: 100%;
                overflow-x: auto;
                margin: 1.5rem 0;
                -webkit-overflow-scrolling: touch;
              }
              .policy-content table {
                width: 100%;
                min-width: 100%;
                border-collapse: collapse;
                margin: 0;
              }
              .policy-content th, .policy-content td {
                border: 1px solid #475569;
                padding: 0.75rem;
                text-align: left;
                word-wrap: break-word;
                overflow-wrap: break-word;
                max-width: 300px;
              }
              .policy-content th {
                background-color: #1e293b;
                font-weight: 600;
                color: #e2e8f0;
              }
              .policy-content td {
                color: #cbd5e1;
              }
              .policy-content hr {
                border: none;
                border-top: 1px solid #475569;
                margin: 2rem 0;
              }
              .policy-content div {
                margin-bottom: 0.5rem;
              }
              .policy-content {
                max-width: 100%;
                overflow-wrap: break-word;
                word-wrap: break-word;
              }
              .policy-content * {
                max-width: 100%;
              }
            `}
          </style>
          <div
            dangerouslySetInnerHTML={createSafeMarkup(policyData.content)}
            className="policy-content"
          />
        </div>

        {/* Policy Info */}
        <div className="flex items-center justify-between px-4 py-3 border rounded-lg bg-slate-800/50 border-slate-700">
          <div className="text-xs text-slate-400">
            <span className="font-medium text-slate-300">Version:</span> {policyData.version}
            {policyData.publishedAt && (
              <span className="ml-3">
                <span className="font-medium text-slate-300">Published:</span>{' '}
                {new Date(policyData.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[800px] mx-4 bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {policyLabel}
          </DialogTitle>
        </DialogHeader>

        {renderContent()}

        <DialogFooter className="flex flex-row justify-between gap-3 sm:justify-between">
          <button
            onClick={downloadPDF}
            disabled={!policyData || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg text-slate-300 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium transition-colors rounded-lg text-slate-300 bg-slate-700 hover:bg-slate-600"
            >
              {isCurrentlyChecked ? 'Close' : 'Cancel'}
            </button>
            <button
              onClick={handleAccept}
              disabled={!hasInteracted || isLoading || error}
              className="px-6 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600"
            >
              {isCurrentlyChecked ? 'Confirm' : 'Accept Policy'}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyModal;
