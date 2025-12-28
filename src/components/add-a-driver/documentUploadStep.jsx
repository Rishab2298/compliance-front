import React, { useState, useCallback, useEffect } from "react";
import { Upload, X, Check, AlertCircle, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getPresignedUrls, uploadToS3, createDocumentRecord } from "@/api/documents";
import { validateFile, canUploadMoreDocuments, formatFileSize, ALLOWED_FILE_EXTENSIONS } from "@/lib/utils";

const DocumentUploadStep = ({
  formData,
  updateFormData,
  errors,
  documentTypes = [],
  driverId, // Will be passed after driver is created
  planData // Plan data for checking document limits
}) => {
  const { getToken } = useAuth();
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  if (documentTypes.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('addEmployee.step3.title')}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('addEmployee.step3.noDocTypesTitle')}
          </p>
        </div>
        <div className="p-8 text-center border-2 border-gray-200 border-dashed rounded-[10px]">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            {t('addEmployee.step3.noDocTypesTitle')}
          </h3>
          <p className="text-sm text-gray-500">
            {t('addEmployee.step3.noDocTypesDesc')}
          </p>
        </div>
      </div>
    );
  }

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

  // Add files and start upload
  const addFiles = async (newFiles) => {
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
        toast.error(`${file.name} ${t('addEmployee.step3.toasts.validationFailed')}`, {
          description: errors.join('. '),
        });
      });
    }

    // If no valid files, return early
    if (validFiles.length === 0) {
      return;
    }

    // Check document limit before uploading
    const currentDocCount = files.filter(f => f.status === 'uploaded').length;
    const uploadCheck = canUploadMoreDocuments(
      currentDocCount + validFiles.length,
      planData,
      documentTypes.length
    );

    if (!uploadCheck.canUpload) {
      const errorTitle = uploadCheck.reason === 'plan-limit'
        ? t('addEmployee.step3.toasts.planLimitReached')
        : t('addEmployee.step3.toasts.documentTypesNeeded');

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
      status: 'pending', // pending, uploading, uploaded, error
      s3Key: null,
      documentId: null,
    }));

    setFiles((prev) => [...prev, ...processedFiles]);

    // Start uploading each file
    for (const fileItem of processedFiles) {
      await uploadFile(fileItem);
    }
  };

  // Upload a single file to S3
  const uploadFile = async (fileItem) => {
    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'uploading' } : f))
      );

      const token = await getToken();

      // Step 1: Get presigned URL
      const presignedData = await getPresignedUrls(
        driverId,
        [
          {
            filename: fileItem.file.name,
            contentType: fileItem.file.type,
          },
        ],
        token
      );

      const { key, uploadUrl } = presignedData[0];

      // Step 2: Upload to S3 with progress tracking
      await uploadToS3(uploadUrl, fileItem.file, (progress) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileItem.id ? { ...f, progress } : f))
        );
      });

      // Step 3: Create document record in database
      const document = await createDocumentRecord(
        driverId,
        {
          key,
          filename: fileItem.file.name,
          contentType: fileItem.file.type,
          size: fileItem.file.size,
        },
        token
      );

      // Update status to uploaded
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: 'uploaded', s3Key: key, documentId: document.id, progress: 100 }
            : f
        )
      );

      toast.success(`${fileItem.file.name} ${t('addEmployee.step3.toasts.uploadedSuccess')}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      setFiles((prev) =>
        prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'error', progress: 0 } : f))
      );
      toast.error(`${t('addEmployee.step3.toasts.uploadFailed')} ${fileItem.file.name}: ${error.message}`);
    }
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

  // Save document IDs to formData
  useEffect(() => {
    const uploadedDocs = files.filter((f) => f.status === 'uploaded');
    updateFormData({
      uploadedDocuments: uploadedDocs.map((f) => ({
        id: f.documentId,
        s3Key: f.s3Key,
        filename: f.file.name,
      })),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const allFilesUploaded = files.length > 0 && files.every((f) => f.status === 'uploaded');
  const hasErrors = files.some((f) => f.status === 'error');
  const isUploading = files.some((f) => f.status === 'uploading');

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('addEmployee.step3.title')}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {t('addEmployee.step3.subtitle')}
        </p>
      </div>

      {/* Required Documents List */}
      {documentTypes.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-[10px]">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                {t('addEmployee.step3.requiredDocuments')} ({documentTypes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {documentTypes.map((type, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-blue-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    <span>{type}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-blue-700">
                {t('addEmployee.step3.pleaseUploadAll')}
              </p>
            </div>
          </div>
        </div>
      )}

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
        <h3 className="mb-2 text-sm font-semibold text-gray-900">
          {t('addEmployee.step3.title')}
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          {t('addEmployee.step3.dragAndDrop')}
        </p>
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            variant="outline"
            className="rounded-[10px]"
            onClick={() => document.getElementById('file-upload').click()}
          >
            {t('addEmployee.step3.selectFiles')}
          </Button>
        </label>
        <p className="mt-2 text-xs text-gray-400">
          {t('addEmployee.step3.supportedFormats')}
        </p>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              {t('addEmployee.step3.uploadedFiles')} ({files.length})
            </h4>
            <p className="text-sm text-gray-500">
              {files.length} {t('addEmployee.step3.of')} {documentTypes.length} {t('addEmployee.step3.documentsUploaded')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="p-4 bg-white border border-gray-200 rounded-[10px] hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-16 h-16 bg-gray-50 border border-gray-200 rounded-[10px] shrink-0">
                    {fileItem.preview ? (
                      <img
                        src={fileItem.preview}
                        alt={fileItem.file.name}
                        className="object-cover w-full h-full rounded-[10px]"
                      />
                    ) : (
                      <FileText className="w-8 h-8 text-gray-400" />
                    )}

                    {/* Upload Progress Overlay */}
                    {fileItem.status === 'uploading' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[10px]">
                        <div className="text-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mb-1" />
                          <span className="text-xs text-white font-medium">{fileItem.progress}%</span>
                        </div>
                      </div>
                    )}

                    {/* Uploaded Check */}
                    {fileItem.status === 'uploaded' && (
                      <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Error Icon */}
                    {fileItem.status === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/80 rounded-[10px]">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} {t('addEmployee.step3.mb')}
                    </p>

                    {/* Status */}
                    <div className="flex items-center gap-1 mt-1">
                      {fileItem.status === 'pending' && (
                        <span className="text-xs text-gray-500">{t('addEmployee.step3.status.pending')}</span>
                      )}
                      {fileItem.status === 'uploading' && (
                        <>
                          <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                          <span className="text-xs text-blue-600">{t('addEmployee.step3.status.uploading')} {fileItem.progress}%</span>
                        </>
                      )}
                      {fileItem.status === 'uploaded' && (
                        <>
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">{t('addEmployee.step3.status.uploaded')}</span>
                        </>
                      )}
                      {fileItem.status === 'error' && (
                        <>
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          <span className="text-xs text-red-600">{t('addEmployee.step3.status.failed')}</span>
                        </>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {fileItem.status === 'uploading' && (
                      <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileItem.id)}
                    disabled={fileItem.status === 'uploading'}
                    className="rounded-[10px] shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Status Messages */}
          {isUploading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-[10px]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-blue-900">
                  {t('addEmployee.step3.uploadingToStorage')}
                </p>
              </div>
            </div>
          )}

          {hasErrors && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-[10px]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm font-medium text-red-900">
                  {t('addEmployee.step3.someFilesFailed')}
                </p>
              </div>
            </div>
          )}

          {allFilesUploaded && files.length >= documentTypes.length && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-[10px]">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  {t('addEmployee.step3.allUploaded')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message display */}
      {errors?.documents && (
        <div className="p-4 border-l-4 border-red-500 rounded-r-[10px] bg-red-50">
          <p className="text-sm font-medium text-red-800">{errors.documents}</p>
        </div>
      )}

      {/* Tip */}
      <div className="p-4 bg-gray-100 border border-gray-200 rounded-[10px]">
        <p className="text-sm text-gray-900">
          {t('addEmployee.step3.tip')}
        </p>
      </div>
    </div>
  );
};

export default DocumentUploadStep;
