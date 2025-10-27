import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, FileText, ChevronLeft, ChevronRight, Save, ZoomIn, ZoomOut, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { bulkScanDocumentsWithAI, getDocumentDownloadUrl, updateDocumentDetails } from '@/api/documents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const Step5 = ({ formData, updateFormData, setCurrentStep, isProcessing, setIsProcessing, extractedData, setExtractedData, documentTypes = [] }) => {
  const { getToken } = useAuth();
  const [scanningDocuments, setScanningDocuments] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [scanError, setScanError] = useState(null);

  // AI Mode: Trigger bulk scan when component mounts
  useEffect(() => {
    if (formData.processingMethod === 'ai' && !scanResults && !scanError) {
      performBulkScan();
    }
  }, [formData.processingMethod]);

  const performBulkScan = async () => {
    setScanningDocuments(true);
    setIsProcessing(true);
    setScanError(null);

    try {
      const token = await getToken();
      const documentIds = formData.uploadedDocuments.map(doc => doc.id);

      // Call bulk scan API
      const result = await bulkScanDocumentsWithAI(documentIds, token);

      // Store scan results for verification in Step 6
      setScanResults(result);
      setExtractedData(result);

      toast.success(
        `Successfully scanned ${documentIds.length} document${documentIds.length !== 1 ? 's' : ''}!`,
        {
          description: `Used ${result.totalCreditsUsed} credit${result.totalCreditsUsed !== 1 ? 's' : ''}. ${result.creditsRemaining} credits remaining.`,
        }
      );

      // Move to Step 6 for verification
      setTimeout(() => {
        setCurrentStep(6);
      }, 2000);
    } catch (error) {
      console.error('Error scanning documents:', error);
      setScanError(error.message);
      toast.error('Failed to scan documents', {
        description: error.message || 'Please try manual entry instead.',
      });
    } finally {
      setScanningDocuments(false);
      setIsProcessing(false);
    }
  };

  // AI Mode: Show loading/processing state
  if (formData.processingMethod === 'ai') {
    if (scanningDocuments) {
      return (
        <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
          <div className="py-12 text-center">
            <div className="relative inline-flex">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              <Sparkles className="absolute top-0 right-0 w-6 h-6 text-purple-500 animate-pulse" />
            </div>
            <h2 className="mt-6 mb-2 text-2xl font-bold text-gray-800">Scanning Documents with AI</h2>
            <p className="text-gray-600">Extracting information from all {formData.uploadedDocuments?.length || 0} documents...</p>

            <div className="max-w-md mx-auto mt-8 space-y-3">
              {formData.uploadedDocuments?.map((doc, index) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{doc.filename}</span>
                  </div>
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Show success state
    if (scanResults && !scanError) {
      return (
        <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Scan Complete!</h2>
            <p className="mb-6 text-gray-600">
              Successfully scanned {scanResults.results.length} document{scanResults.results.length !== 1 ? 's' : ''}
            </p>

            <div className="max-w-md mx-auto space-y-3">
              {scanResults.results.map((result) => {
                const doc = formData.uploadedDocuments.find(d => d.id === result.documentId);
                return (
                  <div key={result.documentId} className="flex items-center justify-between p-4 rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">{doc?.filename}</span>
                    </div>
                    {result.success && (
                      <span className="text-xs text-green-600">Extracted</span>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-6 text-sm text-gray-500">Moving to next step...</p>
          </div>
        </div>
      );
    }

    // Show error state
    if (scanError) {
      return (
        <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Scan Failed</h2>
            <p className="mb-6 text-gray-600">{scanError}</p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  setScanError(null);
                  performBulkScan();
                }}
                className="bg-blue-600 hover:bg-blue-700 rounded-[10px]"
              >
                Retry Scan
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  updateFormData({ processingMethod: 'manual' });
                  setScanError(null);
                }}
                className="rounded-[10px]"
              >
                Use Manual Entry
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Manual Mode: Show document slider
  if (formData.processingMethod === 'manual') {
    return (
      <ManualEntrySlider
        formData={formData}
        setCurrentStep={setCurrentStep}
        documentTypes={documentTypes}
      />
    );
  }

  return null;
};

// Manual Entry Slider Component
const ManualEntrySlider = ({ formData, setCurrentStep, documentTypes = [] }) => {
  const { getToken } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [zoom, setZoom] = useState(100);

  const uploadedDocuments = formData.uploadedDocuments || [];
  const currentDocument = uploadedDocuments[currentIndex];

  const [formDetails, setFormDetails] = useState({
    type: '',
    documentNumber: '',
    issuedDate: '',
    expiryDate: '',
    notes: '',
  });

  // Load image URL when document changes
  useEffect(() => {
    const loadImage = async () => {
      if (currentDocument?.id) {
        setLoadingImage(true);
        try {
          const token = await getToken();
          const url = await getDocumentDownloadUrl(currentDocument.id, token);
          setImageUrl(url);
        } catch (error) {
          console.error('Error loading image:', error);
          toast.error('Failed to load document image');
        } finally {
          setLoadingImage(false);
        }
      }
    };

    loadImage();
  }, [currentDocument, getToken]);

  // Reset form when document changes
  useEffect(() => {
    if (currentDocument) {
      setFormDetails({
        type: '',
        documentNumber: '',
        issuedDate: '',
        expiryDate: '',
        notes: '',
      });
      setZoom(100);
    }
  }, [currentDocument]);

  const handleNext = () => {
    if (currentIndex < uploadedDocuments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formDetails.type) {
      toast.error('Please select a document type');
      return;
    }

    if (!formDetails.expiryDate) {
      toast.error('Please enter an expiry date');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      await updateDocumentDetails(currentDocument.id, formDetails, token);
      toast.success('Document details saved successfully');

      // Move to next document if available
      if (currentIndex < uploadedDocuments.length - 1) {
        handleNext();
      } else {
        // All documents processed, move to next step
        setCurrentStep(6);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error(error.message || 'Failed to save document details');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < uploadedDocuments.length - 1) {
      handleNext();
    } else {
      setCurrentStep(6);
    }
  };

  if (!currentDocument) {
    return <div className="p-8 text-center">No documents to process</div>;
  }

  return (
    <div className="p-0 bg-white shadow-lg rounded-xl animate-fadeIn">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Enter Document Details ({currentIndex + 1} of {uploadedDocuments.length})
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details for {currentDocument.filename}
            </p>
          </div>
        </div>
      </div>

      <div className="flex overflow-hidden">
        {/* Left Side - Image Viewer */}
        <div className="flex flex-col flex-1 p-6 border-r border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Document Preview</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="rounded-[10px]"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="w-12 text-sm text-center text-gray-600">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="rounded-[10px]"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-auto bg-white rounded-[10px] border border-gray-200 min-h-[400px]">
            {loadingImage ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <p className="text-sm text-gray-500">Loading document...</p>
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={currentDocument.filename}
                style={{ width: `${zoom}%`, height: 'auto' }}
                className="object-contain"
              />
            ) : (
              <p className="text-sm text-gray-500">No preview available</p>
            )}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-[450px] p-6 flex flex-col">
          <div className="flex-1 space-y-6 overflow-auto">
            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-gray-900">
                Document Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formDetails.type}
                onValueChange={(value) =>
                  setFormDetails((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="rounded-[10px]">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Number */}
            <div className="space-y-2">
              <Label htmlFor="documentNumber" className="text-sm font-medium text-gray-900">
                Document Number / ID
              </Label>
              <Input
                id="documentNumber"
                value={formDetails.documentNumber}
                onChange={(e) =>
                  setFormDetails((prev) => ({ ...prev, documentNumber: e.target.value }))
                }
                placeholder="e.g., DL123456789"
                className="rounded-[10px]"
              />
            </div>

            {/* Issued Date */}
            <div className="space-y-2">
              <Label htmlFor="issuedDate" className="text-sm font-medium text-gray-900">
                Issue Date
              </Label>
              <Input
                id="issuedDate"
                type="date"
                value={formDetails.issuedDate}
                onChange={(e) =>
                  setFormDetails((prev) => ({ ...prev, issuedDate: e.target.value }))
                }
                className="rounded-[10px]"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-900">
                Expiry Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={formDetails.expiryDate}
                onChange={(e) =>
                  setFormDetails((prev) => ({ ...prev, expiryDate: e.target.value }))
                }
                className="rounded-[10px]"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-900">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formDetails.notes}
                onChange={(e) =>
                  setFormDetails((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Additional notes about this document..."
                className="rounded-[10px] min-h-[100px]"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-6 mt-6 space-y-3 border-t border-gray-200">
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="rounded-[10px]"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                {currentIndex + 1} / {uploadedDocuments.length}
              </span>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentIndex === uploadedDocuments.length - 1}
                className="rounded-[10px]"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={saving}
                className="flex-1 rounded-[10px]"
              >
                Skip
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gray-800 text-white hover:bg-gray-900 rounded-[10px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save & Next
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5;
