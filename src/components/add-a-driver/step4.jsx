import React, { useContext, useState, useEffect } from 'react';
import { Check, Sparkles, Edit, Clock, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { getCreditsBalance } from '@/api/documents';

const Step4 = ({ formData, updateFormData, setCurrentStep, setIsProcessing, setExtractedData }) => {
  const { getToken } = useAuth();
  const [aiCredits, setAiCredits] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(true);

  // Fetch credits on component mount
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setLoadingCredits(true);
        const token = await getToken();
        const balance = await getCreditsBalance(token);
        setAiCredits(balance);
      } catch (error) {
        console.error('Error fetching credits:', error);
        setAiCredits(0);
      } finally {
        setLoadingCredits(false);
      }
    };

    fetchCredits();
  }, [getToken]);

  const documentCount = formData.uploadedDocuments?.length || 0;
  const hasEnoughCredits = aiCredits >= documentCount;

  return (
    <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Choose Processing Method</h2>

      <div className={`p-4 mb-6 border rounded-lg ${
        loadingCredits ? 'bg-gray-50 border-gray-200' :
        hasEnoughCredits ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start">
          {loadingCredits ? (
            <Loader2 className="w-5 h-5 text-gray-600 mt-0.5 mr-3 animate-spin" />
          ) : (
            <AlertCircle className={`w-5 h-5 mt-0.5 mr-3 ${hasEnoughCredits ? 'text-amber-600' : 'text-red-600'}`} />
          )}
          <div>
            {loadingCredits ? (
              <p className="text-sm text-gray-800">
                Loading credits balance...
              </p>
            ) : (
              <>
                <p className={`text-sm ${hasEnoughCredits ? 'text-amber-800' : 'text-red-800'}`}>
                  <strong>AI Credits Available:</strong> {aiCredits} scans remaining
                </p>
                <p className={`mt-1 text-xs ${hasEnoughCredits ? 'text-amber-600' : 'text-red-600'}`}>
                  {hasEnoughCredits ? (
                    <>You have {documentCount} document{documentCount !== 1 ? 's' : ''} to scan. This will use {documentCount} credit{documentCount !== 1 ? 's' : ''}. Manual entry is always free.</>
                  ) : (
                    <>You need {documentCount} credits to scan all documents, but only have {aiCredits}. Please use manual entry or purchase more credits.</>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <button
          onClick={() => {
            updateFormData({ processingMethod: 'ai' });
            setCurrentStep(5);
          }}
          disabled={!hasEnoughCredits || loadingCredits}
          className={`p-6 transition-all duration-300 border-2 rounded-xl ${
            !hasEnoughCredits || loadingCredits
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              : 'border-gray-200 hover:border-blue-500 hover:shadow-lg'
          } group`}
        >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-transform rounded-full bg-gradient-to-r from-purple-500 to-pink-500 group-hover:scale-110">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">AI-Powered Bulk Scan</h3>
            <p className="mb-4 text-sm text-gray-600">
              Scan all {documentCount} document{documentCount !== 1 ? 's' : ''} at once and automatically extract information
            </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-gray-700">95% accuracy</span>
              </div>
              <div className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-gray-700">Scans all documents at once</span>
              </div>
              <div className="flex items-center text-sm">
                <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-gray-700">Uses {documentCount} credit{documentCount !== 1 ? 's' : ''} total</span>
              </div>
            </div>
          </button>

        <button
          onClick={() => {
            updateFormData({ processingMethod: 'manual' });
            setCurrentStep(5);
          }}
          className="p-6 transition-all duration-300 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg group"
        >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-transform rounded-full bg-gradient-to-r from-green-500 to-teal-500 group-hover:scale-110">
              <Edit className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Manual Entry</h3>
            <p className="mb-4 text-sm text-gray-600">
              Enter expiry dates manually while viewing documents
            </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-gray-700">100% free</span>
              </div>
              <div className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-gray-700">Full control</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-700">2-3 minutes per document</span>
              </div>
            </div>
        </button>
      </div>
    </div>
  );
};

export default Step4;