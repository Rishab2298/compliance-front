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
import { ChevronLeft, ChevronRight, Save, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';
import { updateDocumentDetails, getDocumentDownloadUrl } from '@/api/documents';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';

const DocumentEditModal = ({ isOpen, onClose, documents, documentTypes, documentTypeConfigs = [], onSave, initialDocumentId }) => {
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();

  // Find initial index based on initialDocumentId
  const initialIndex = initialDocumentId
    ? documents.findIndex(doc => doc.id === initialDocumentId)
    : 0;

  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [zoom, setZoom] = useState(100);

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

  // Reset to initial index when modal opens
  useEffect(() => {
    if (isOpen && initialDocumentId) {
      const index = documents.findIndex(doc => doc.id === initialDocumentId);
      if (index >= 0) {
        setCurrentIndex(index);
      }
    }
  }, [isOpen, initialDocumentId, documents]);

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
      toast.success('Document details updated successfully');

      // Call onSave callback (don't await - let it run in background)
      if (onSave) {
        onSave();
      }

      // Move to next document if available, otherwise close
      if (currentIndex < documents.length - 1) {
        handleNext();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error(error.message || 'Failed to update document details');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
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
      className: `text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`
    };

    const commonInputProps = {
      id: field.name,
      value: value,
      className: `rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`
    };

    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="space-y-2">
            <Label {...commonLabelProps}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
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
              {field.label} {field.required && <span className="text-red-500">*</span>}
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
              {field.label} {field.required && <span className="text-red-500">*</span>}
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
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, [field.name]: val }))}
            >
              <SelectTrigger className={`rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
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
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              {...commonInputProps}
              placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
              className={`rounded-[10px] min-h-[100px] ${getThemeClasses.input.default(isDarkMode)}`}
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
              className={`rounded ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-300 bg-white'}`}
            />
            <Label htmlFor={field.name} className={`text-sm font-medium cursor-pointer ${getThemeClasses.text.primary(isDarkMode)}`}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
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
      <DialogContent className={`!max-w-2/3 w-full h-[90vh] p-0 ${isDarkMode ? 'bg-slate-900 border-slate-700' : ''}`}>
        <DialogHeader className={`p-6 pb-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                Edit Document Details ({currentIndex + 1} of {documents.length})
              </DialogTitle>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Update details for {currentDocument.fileName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Image Viewer */}
          <div className={`flex flex-col flex-1 p-6 border-r ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Document Preview</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className={`w-12 text-sm text-center ${getThemeClasses.text.secondary(isDarkMode)}`}>{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={`flex-1 flex items-center justify-center overflow-auto rounded-[10px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-gray-200'}`}>
              {loadingImage ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Loading document...</p>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={currentDocument.fileName}
                  style={{ width: `${zoom}%`, height: 'auto' }}
                  className="object-contain"
                />
              ) : (
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>No preview available</p>
              )}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-[450px] p-6 flex flex-col">
            <div className="flex-1 space-y-6 overflow-auto">
              {/* Document Type Selector */}
              <div className="space-y-2">
                <Label htmlFor="type" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                  Document Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={handleDocumentTypeChange}
                >
                  <SelectTrigger className={`rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
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
                <Label htmlFor="notes" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Additional notes about this document..."
                  className={`rounded-[10px] min-h-[100px] ${getThemeClasses.input.default(isDarkMode)}`}
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
                  className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <span className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  {currentIndex + 1} / {documents.length}
                </span>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentIndex === documents.length - 1}
                  className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  className={`flex-1 rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex-1 rounded-[10px] ${isDarkMode ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
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

export default DocumentEditModal;
