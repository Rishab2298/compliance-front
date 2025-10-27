import { useState, useEffect } from "react";
import { CheckCircle, Sparkles, FileText, ChevronLeft, ChevronRight, Save, Loader2, ZoomIn, ZoomOut, AlertCircle } from "lucide-react";
import { useAuth } from '@clerk/clerk-react';
import { getDocumentDownloadUrl, updateDocumentDetails } from '@/api/documents';
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

const Step6 = ({ formData, updateFormData, extractedData, documentTypes = [], setCurrentStep }) => {
  const { getToken } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [verifiedDocuments, setVerifiedDocuments] = useState(new Set());

  // If manual entry was used, skip verification
  useEffect(() => {
    if (formData.processingMethod === 'manual') {
      // Skip to next step for manual entry
      setCurrentStep(7);
    }
  }, [formData.processingMethod, setCurrentStep]);

  const uploadedDocuments = formData.uploadedDocuments || [];
  const currentDocument = uploadedDocuments[currentIndex];

  // Find the extracted data for current document
  const currentExtractedData = extractedData?.results?.find(
    r => r.documentId === currentDocument?.id
  );

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

  // Pre-fill form with AI-extracted data when document changes
  useEffect(() => {
    if (currentDocument && currentExtractedData?.success && currentExtractedData.extractedData) {
      const extracted = currentExtractedData.extractedData;
      setFormDetails({
        type: extracted.type || '',
        documentNumber: extracted.documentNumber || '',
        issuedDate: extracted.issuedDate || '',
        expiryDate: extracted.expiryDate || '',
        notes: extracted.notes || '',
      });
      setZoom(100);
    } else if (currentDocument) {
      // No extracted data or failed extraction - show empty form
      setFormDetails({
        type: '',
        documentNumber: '',
        issuedDate: '',
        expiryDate: '',
        notes: '',
      });
      setZoom(100);
    }
  }, [currentDocument, currentExtractedData]);

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

      // Mark as verified
      const newVerifiedSet = new Set([...verifiedDocuments, currentDocument.id]);
      setVerifiedDocuments(newVerifiedSet);

      // Update formData with verification status
      updateFormData({
        verifiedDocuments: Array.from(newVerifiedSet),
        allDocumentsVerified: newVerifiedSet.size === uploadedDocuments.length,
      });

      toast.success('Document verified and saved successfully');

      // Move to next document if available, but don't auto-advance to next step
      if (currentIndex < uploadedDocuments.length - 1) {
        handleNext();
      } else {
        // Stay on this document - user needs to click "Next Step" button
        toast.success('All documents verified! Click "Next Step" to continue.');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error(error.message || 'Failed to save document details');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Can only navigate, not skip verification
    if (currentIndex < uploadedDocuments.length - 1) {
      handleNext();
    }
    // Don't allow moving to next step without all verified
  };

  // Show loading if processing AI
  if (formData.processingMethod === 'ai' && !extractedData) {
    return (
      <div className="p-8 bg-white shadow-lg rounded-xl animate-fadeIn">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          <span className="ml-3 text-gray-600">Loading AI results...</span>
        </div>
      </div>
    );
  }

  if (!currentDocument) {
    return <div className="p-8 text-center">No documents to verify</div>;
  }

  const isCurrentVerified = verifiedDocuments.has(currentDocument.id);
  const totalVerified = verifiedDocuments.size;

  return (
    <div className="p-0 bg-white shadow-lg rounded-xl animate-fadeIn">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Verify Document Details ({currentIndex + 1} of {uploadedDocuments.length})
              </h2>
              <div className="flex items-center px-2 py-1 bg-purple-100 rounded-full">
                <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">AI Extracted</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Review and correct the AI-extracted data for {currentDocument.filename}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-[10px]">
            <CheckCircle className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {totalVerified} / {uploadedDocuments.length} verified
            </span>
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

          {/* Verification Status for Current Document */}
          {isCurrentVerified && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-[10px]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">This document is verified</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Form */}
        <div className="w-[450px] p-6 flex flex-col">
          <div className="flex-1 space-y-6 overflow-auto">
            {/* AI Confidence Badge */}
            {currentExtractedData?.success && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-[10px]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-900">
                    <strong>AI extracted data below.</strong> Please review and correct if needed.
                  </span>
                </div>
              </div>
            )}

            {/* Extraction Failed Message */}
            {currentExtractedData && !currentExtractedData.success && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-[10px]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-900">
                    AI extraction failed. Please enter details manually.
                  </span>
                </div>
              </div>
            )}

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
                disabled={saving || currentIndex === uploadedDocuments.length - 1}
                className="flex-1 rounded-[10px]"
              >
                {currentIndex === uploadedDocuments.length - 1 ? 'Last Document' : 'Skip to Next'}
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
                    {isCurrentVerified ? 'Update & Next' : 'Verify & Save'}
                  </>
                )}
              </Button>
            </div>

            {/* Verification Status Message */}
            {totalVerified === uploadedDocuments.length ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-[10px]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    All documents verified! Click "Next Step" to continue.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-[10px]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">
                    Please verify all {uploadedDocuments.length} documents before proceeding ({uploadedDocuments.length - totalVerified} remaining)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6;
