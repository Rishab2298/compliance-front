import React, { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Upload, X, Check, AlertCircle, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  getPresignedUrls,
  uploadToS3,
  createDocumentRecord,
} from '@/api/documents';
import { validateFile, canUploadMoreDocuments } from '@/lib/utils';

const DocumentUpload = ({ driverId, onUploadComplete, planData, existingDocCount = 0, documentTypes = [] }) => {
  const { getToken } = useAuth();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    addFiles(selectedFiles);
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  // Add files to state with preview and status
  const addFiles = (newFiles) => {
    // Validate each file before processing
    const validFiles = [];
    const invalidFiles = [];

    for (const file of newFiles) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, errors: validation.errors });
      }
    }

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      invalidFiles.forEach(({ file, errors }) => {
        toast.error(`${file.name} validation failed`, {
          description: errors.join('. '),
        });
      });
    }

    // If no valid files, return early
    if (validFiles.length === 0) {
      return;
    }

    // Check document limit before adding files
    const currentDocCount = existingDocCount + files.filter(f => f.status === 'success').length;
    const uploadCheck = canUploadMoreDocuments(
      currentDocCount + validFiles.length,
      planData,
      documentTypes.length
    );

    if (!uploadCheck.canUpload) {
      const errorTitle = uploadCheck.reason === 'plan-limit'
        ? "Plan limit reached"
        : "Document types needed";

      toast.error(errorTitle, {
        description: uploadCheck.message,
      });
      return;
    }

    const processedFiles = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      progress: 0,
      status: 'pending', // pending, uploading, success, error
      error: null,
    }));

    setFiles((prev) => [...prev, ...processedFiles]);
  };

  // Remove file from list
  const removeFile = (fileId) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  // Update file progress
  const updateFileProgress = (fileId, progress) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
    );
  };

  // Update file status
  const updateFileStatus = (fileId, status, error = null) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status, error } : f))
    );
  };

  // Upload all files
  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsUploading(true);

    try {
      const token = await getToken();

      // Step 1: Get presigned URLs for all files
      const fileData = files.map((f) => ({
        filename: f.file.name,
        contentType: f.file.type,
      }));

      toast.info('Preparing upload...');
      const presignedData = await getPresignedUrls(driverId, fileData, token);

      // Step 2: Upload each file to S3
      const uploadPromises = files.map(async (fileItem, index) => {
        const presigned = presignedData[index];

        try {
          updateFileStatus(fileItem.id, 'uploading');

          // Debug: Log presigned URL details
          console.log('Uploading file:', {
            filename: fileItem.file.name,
            contentType: fileItem.file.type,
            size: fileItem.file.size,
            s3Key: presigned.key,
            presignedUrlHost: new URL(presigned.uploadUrl).host,
            presignedUrlPath: new URL(presigned.uploadUrl).pathname,
          });

          // Upload to S3 with progress tracking
          await uploadToS3(presigned.uploadUrl, fileItem.file, (progress) => {
            updateFileProgress(fileItem.id, progress);
          });

          // Step 3: Create document record in database
          await createDocumentRecord(
            driverId,
            {
              key: presigned.key,
              filename: fileItem.file.name,
              contentType: fileItem.file.type,
              size: fileItem.file.size,
            },
            token
          );

          updateFileStatus(fileItem.id, 'success');
          return { success: true, fileId: fileItem.id };
        } catch (error) {
          console.error(`Upload failed for ${fileItem.file.name}:`, error);
          updateFileStatus(fileItem.id, 'error', error.message);
          return { success: false, fileId: fileItem.id, error };
        }
      });

      const results = await Promise.allSettled(uploadPromises);

      // Check results
      const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`${successful} file(s) uploaded successfully!`);
        if (onUploadComplete) {
          onUploadComplete();
        }
      }

      if (failed > 0) {
        toast.error(`${failed} file(s) failed to upload`);
      }

      // Remove successful uploads from list
      setFiles((prev) => prev.filter((f) => f.status !== 'success'));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-[10px] p-8 text-center transition-colors ${
          isDragging
            ? 'border-gray-800 bg-gray-50'
            : 'border-gray-200 hover:border-gray-400'
        }`}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Upload Documents
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Drag and drop files here, or click to browse
        </p>
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px]"
            disabled={isUploading}
            onClick={() => document.getElementById('file-upload').click()}
          >
            Select Files
          </Button>
        </label>
        <p className="mt-2 text-xs text-gray-400">
          Supported: JPG, JPEG, PNG only (Max 10MB per file)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              Selected Files ({files.length})
            </h4>
            <Button
              onClick={handleUpload}
              disabled={isUploading || files.every((f) => f.status === 'success')}
              className="bg-gray-800 text-white hover:bg-gray-900 rounded-[10px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload All
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-[10px]"
              >
                {/* Preview */}
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-[10px] shrink-0">
                  {fileItem.preview ? (
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="object-cover w-full h-full rounded-[10px]"
                    />
                  ) : (
                    <FileText className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* Progress Bar */}
                  {fileItem.status === 'uploading' && (
                    <div className="mt-2">
                      <Progress value={fileItem.progress} className="h-1" />
                      <p className="mt-1 text-xs text-gray-500">
                        {fileItem.progress}%
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {fileItem.status === 'error' && (
                    <p className="mt-1 text-xs text-red-600">
                      {fileItem.error}
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="shrink-0">
                  {fileItem.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileItem.id)}
                      disabled={isUploading}
                      className="rounded-[10px]"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </Button>
                  )}
                  {fileItem.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-gray-800 animate-spin" />
                  )}
                  {fileItem.status === 'success' && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                  {fileItem.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
