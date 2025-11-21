import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { ChevronLeft, ChevronRight, Save, Loader2, ZoomIn, ZoomOut, Sparkles, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { updateDocumentDetails, getDocumentDownloadUrl, getCreditsBalance, scanDocumentWithAI } from '@/api/documents';

const DocumentDetailsModal = ({ isOpen, onClose, documents, documentTypes, documentTypeConfigs = [], onSave }) => {
  const { getToken } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [credits, setCredits] = useState(null);
  const [scanning, setScanning] = useState(false);

  const currentDocument = documents[currentIndex];

  // State for form data - will be populated dynamically based on document type
  const [formData, setFormData] = useState({});
  const [selectedDocumentTypeConfig, setSelectedDocumentTypeConfig] = useState(null);

  // Load image URL when document changes
  useEffect(() => {
    const loadImage = async () => {
      if (currentDocument?.s3Key) {
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

  // Reset form when document changes or document type changes
  useEffect(() => {
    if (currentDocument) {
      // Find the document type configuration
      const docTypeConfig = documentTypeConfigs.find(config => config.name === currentDocument.type);
      setSelectedDocumentTypeConfig(docTypeConfig);

      // Initialize form data dynamically based on fields
      const initialFormData = { type: currentDocument.type || '' };

      if (docTypeConfig && docTypeConfig.fields) {
        // Skip 'documentType' field as it's auto-populated
        docTypeConfig.fields
          .filter(field => field.name !== 'documentType')
          .forEach(field => {
            // Get existing value from document if available
            const existingValue = currentDocument[field.name];

            // Initialize based on field type
            if (field.type === 'date') {
              initialFormData[field.name] = existingValue
                ? new Date(existingValue).toISOString().split('T')[0]
                : '';
            } else if (field.type === 'boolean') {
              initialFormData[field.name] = existingValue || false;
            } else {
              initialFormData[field.name] = existingValue || '';
            }
          });
      }

      // Always include notes field
      initialFormData.notes = currentDocument.notes || '';

      setFormData(initialFormData);
      setZoom(100);
    }
  }, [currentDocument, documentTypeConfigs]);

  // Fetch credits balance on mount
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = await getToken();
        const balance = await getCreditsBalance(token);
        setCredits(balance);
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    if (isOpen) {
      fetchCredits();
    }
  }, [isOpen, getToken]);

  const handleNext = () => {
    if (currentIndex < documents.length - 1) {
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
    if (!formData.type) {
      toast.error('Please select a document type');
      return;
    }

    // Validate required fields based on document type configuration
    if (selectedDocumentTypeConfig && selectedDocumentTypeConfig.fields) {
      const requiredFields = selectedDocumentTypeConfig.fields.filter(
        field => field.required && field.name !== 'documentType'
      );

      for (const field of requiredFields) {
        if (!formData[field.name]) {
          toast.error(`Please enter ${field.label}`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const token = await getToken();
      await updateDocumentDetails(currentDocument.id, formData, token);
      toast.success('Document details saved successfully');

      // Call onSave callback (don't await - let it run in background)
      if (onSave) {
        onSave();
      }

      // Move to next document if available
      if (currentIndex < documents.length - 1) {
        handleNext();
      } else {
        // All documents processed, close modal
        onClose();
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error(error.message || 'Failed to save document details');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < documents.length - 1) {
      handleNext();
    } else {
      onClose();
    }
  };

  const handleAIScan = async () => {
    // Check if credits are available
    if (credits === null || credits < 1) {
      toast.error('Insufficient AI credits', {
        description: 'You need at least 1 credit to scan a document.',
      });
      return;
    }

    setScanning(true);
    try {
      const token = await getToken();
      console.log('Scanning document:', currentDocument.id);
      const result = await scanDocumentWithAI(currentDocument.id, token);

      console.log('AI Scan Result:', result);
      console.log('Extracted Data:', result.extractedData);

      // Update credits balance
      setCredits(result.creditsRemaining);

      // Pre-fill form with extracted data
      const extractedData = result.extractedData;

      console.log('AI extracted data:', extractedData);

      // Dynamically update form fields based on extracted data
      setFormData((prev) => {
        const updated = { ...prev };

        // Update all fields that were extracted
        Object.keys(extractedData).forEach(key => {
          if (extractedData[key] !== undefined && extractedData[key] !== null && extractedData[key] !== '') {
            updated[key] = extractedData[key];
          }
        });

        console.log('Updated form data:', updated);
        return updated;
      });

      // If document type was detected by AI, update the configuration AND form data
      if (extractedData.documentType && extractedData.documentType !== formData.type) {
        console.log('AI detected document type:', extractedData.documentType);
        const docTypeConfig = documentTypeConfigs.find(config => config.name === extractedData.documentType);
        if (docTypeConfig) {
          setSelectedDocumentTypeConfig(docTypeConfig);
          // Also update the form data's type field
          setFormData((prev) => ({
            ...prev,
            type: extractedData.documentType
          }));
        }
      }

      toast.success('Document scanned successfully', {
        description: `${result.creditsUsed} credit used. ${result.creditsRemaining} credits remaining.`,
      });
    } catch (error) {
      console.error('Error scanning document:', error);
      toast.error('Failed to scan document', {
        description: error.message || 'Please try again or enter details manually.',
      });
    } finally {
      setScanning(false);
    }
  };

  // Helper function to handle document type change
  const handleDocumentTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, type: value }));

    // Find and set the new document type configuration
    const docTypeConfig = documentTypeConfigs.find(config => config.name === value);
    setSelectedDocumentTypeConfig(docTypeConfig);

    // Reset form fields based on new document type
    if (docTypeConfig && docTypeConfig.fields) {
      const newFormData = { type: value, notes: prev.notes || '' };

      docTypeConfig.fields
        .filter(field => field.name !== 'documentType')
        .forEach(field => {
          if (field.type === 'boolean') {
            newFormData[field.name] = false;
          } else {
            newFormData[field.name] = '';
          }
        });

      setFormData(newFormData);
    }
  };

  // Helper function to render field based on type
  const renderField = (field) => {
    const value = formData[field.name] || '';

    const commonLabelProps = {
      htmlFor: field.name,
      className: "text-sm font-medium text-white"
    };

    const commonInputProps = {
      id: field.name,
      value: value,
      className: "rounded-[10px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
    };

    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="space-y-2">
            <Label {...commonLabelProps}>
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </Label>
            <Input
              {...commonInputProps}
              type="text"
              placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
              onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label {...commonLabelProps}>
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </Label>
            <Input
              {...commonInputProps}
              type="date"
              onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label {...commonLabelProps}>
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </Label>
            <Input
              {...commonInputProps}
              type="number"
              placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
              onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label {...commonLabelProps}>
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, [field.name]: val }))}
            >
              <SelectTrigger className="rounded-[10px] bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option} className="text-white hover:bg-slate-700">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multiline':
        return (
          <div key={field.name} className="space-y-2">
            <Label {...commonLabelProps}>
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </Label>
            <Textarea
              {...commonInputProps}
              placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
              className="rounded-[10px] min-h-[100px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              checked={!!value}
              onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.checked }))}
              className="rounded border-slate-700 bg-slate-800"
            />
            <Label htmlFor={field.name} className="text-sm font-medium text-white cursor-pointer">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentDocument) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-2/3 w-full h-[90vh] p-0 bg-slate-900 border-slate-700 text-white">
        <DialogHeader className="p-6 pb-4 border-b border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Enter Document Details ({currentIndex + 1} of {documents.length})
              </DialogTitle>
              <p className="mt-1 text-sm text-slate-400">
                Fill in the details for {currentDocument.fileName}
              </p>
            </div>
            {credits !== null && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-[10px]">
                <Coins className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">{credits} credits</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Image Viewer */}
          <div className="flex flex-col flex-1 p-6 border-r border-slate-700 bg-slate-900/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Document Preview</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="rounded-[10px] bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="w-12 text-sm text-center text-slate-300">{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="rounded-[10px] bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-auto bg-slate-800/50 rounded-[10px] border border-slate-700">
              {loadingImage ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  <p className="text-sm text-slate-400">Loading document...</p>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={currentDocument.fileName}
                  style={{ width: `${zoom}%`, height: 'auto' }}
                  className="object-contain"
                />
              ) : (
                <p className="text-sm text-slate-400">No preview available</p>
              )}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-[450px] p-6 flex flex-col">
            <div className="flex-1 space-y-6 overflow-auto">
              {/* AI Scan Button - Info state with violet/purple gradient */}
              <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-[10px] border border-violet-500/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      AI Document Scanner
                    </h4>
                    <p className="mt-1 text-xs text-slate-300">
                      Automatically extract document details using AI (1 credit)
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleAIScan}
                  disabled={scanning || credits === null || credits < 1}
                  className="w-full bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50 text-white rounded-[10px] border-0"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Scan with AI
                    </>
                  )}
                </Button>
              </div>

              {/* Document Type Selector */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-white">
                  Document Type <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={handleDocumentTypeChange}
                >
                  <SelectTrigger className="rounded-[10px] bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Fields Based on Document Type Configuration */}
              {selectedDocumentTypeConfig && selectedDocumentTypeConfig.fields && (
                <>
                  {selectedDocumentTypeConfig.fields
                    .filter(field => field.name !== 'documentType') // Skip the documentType field
                    .map(field => renderField(field))}
                </>
              )}

              {/* Notes Field - Always show */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-white">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Additional notes about this document..."
                  className="rounded-[10px] min-h-[100px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 mt-6 space-y-3 border-t border-slate-700">
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="rounded-[10px] bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <span className="text-sm text-slate-300">
                  {currentIndex + 1} / {documents.length}
                </span>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentIndex === documents.length - 1}
                  className="rounded-[10px] bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
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
                  className="flex-1 rounded-[10px] bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50 text-white rounded-[10px] border-0"
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
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailsModal;
