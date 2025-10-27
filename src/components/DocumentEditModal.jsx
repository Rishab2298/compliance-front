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

const DocumentEditModal = ({ isOpen, onClose, documents, documentTypes, onSave, initialDocumentId }) => {
  const { getToken } = useAuth();

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

  const [formData, setFormData] = useState({
    type: '',
    documentNumber: '',
    issuedDate: '',
    expiryDate: '',
    notes: '',
  });

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

  // Reset form when document changes
  useEffect(() => {
    if (currentDocument) {
      setFormData({
        type: currentDocument.type || '',
        documentNumber: currentDocument.documentNumber || '',
        issuedDate: currentDocument.issueDate
          ? new Date(currentDocument.issueDate).toISOString().split('T')[0]
          : '',
        expiryDate: currentDocument.expiryDate
          ? new Date(currentDocument.expiryDate).toISOString().split('T')[0]
          : '',
        notes: currentDocument.notes || '',
      });
      setZoom(100);
    }
  }, [currentDocument]);

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

    if (!formData.expiryDate) {
      toast.error('Please enter an expiry date');
      return;
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

  if (!currentDocument) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-2/3 w-full h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Edit Document Details ({currentIndex + 1} of {documents.length})
              </DialogTitle>
              <p className="mt-1 text-sm text-gray-500">
                Update details for {currentDocument.fileName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
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

            <div className="flex-1 flex items-center justify-center overflow-auto bg-white rounded-[10px] border border-gray-200">
              {loadingImage ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  <p className="text-sm text-gray-500">Loading document...</p>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={currentDocument.fileName}
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
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
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
                  value={formData.documentNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, documentNumber: e.target.value }))
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
                  value={formData.issuedDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, issuedDate: e.target.value }))
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
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
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
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
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
                  {currentIndex + 1} / {documents.length}
                </span>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentIndex === documents.length - 1}
                  className="rounded-[10px]"
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
                  className="flex-1 rounded-[10px]"
                >
                  Cancel
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
