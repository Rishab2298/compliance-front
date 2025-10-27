import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * File upload validation constants and utilities
 */

// Allowed file types for document uploads
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

// Maximum file size in bytes (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file type
 * @param {File} file - File object to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateFileType(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

  if (!ALLOWED_FILE_TYPES.includes(fileType) && !ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPG, JPEG, and PNG images are allowed.'
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate file size
 * @param {File} file - File object to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateFileSize(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMB}MB) exceeds the maximum limit of 10MB.`
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate file for upload (combines type and size validation)
 * @param {File} file - File object to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateFile(file) {
  const errors = [];

  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    errors.push(typeValidation.error);
  }

  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if user can upload more documents based on plan limits and configured document types
 * @param {number} newDocCount - Total document count AFTER upload (current + new files)
 * @param {object} planData - Plan data with limits
 * @param {number} configuredDocTypesCount - Number of document types configured in settings
 * @returns {object} { canUpload: boolean, message: string, reason: string, limit: number }
 */
export function canUploadMoreDocuments(newDocCount, planData, configuredDocTypesCount = 0) {
  if (!planData) {
    console.warn('canUploadMoreDocuments: No planData provided');
    return {
      canUpload: true, // Allow if we can't verify
      message: '',
      reason: 'no-data',
      limit: -1
    };
  }

  // Get plan limit from usage or currentPlan
  let planLimit = planData.usage?.documents?.limit;

  // Fallback to currentPlan if usage limit is not set
  if (planLimit === undefined || planLimit === null) {
    planLimit = planData.currentPlan?.maxDocumentsPerDriver;
  }

  // If still no limit, default to unlimited
  if (planLimit === undefined || planLimit === null) {
    planLimit = -1;
  }

  const isUnlimited = planLimit === -1;

  console.log('Document upload check:', {
    newDocCount,
    planLimit,
    configuredDocTypesCount,
    isUnlimited
  });

  // First, check plan limits (per driver limit)
  if (!isUnlimited && newDocCount > planLimit) {
    return {
      canUpload: false,
      message: `Your plan allows only ${planLimit} document${planLimit !== 1 ? 's' : ''} per driver. Please upgrade to be able to manage more documents.`,
      reason: 'plan-limit',
      limit: planLimit
    };
  }

  // Then, check if user has configured enough document types
  if (configuredDocTypesCount > 0 && newDocCount > configuredDocTypesCount) {
    return {
      canUpload: false,
      message: `You have only configured ${configuredDocTypesCount} document type${configuredDocTypesCount !== 1 ? 's' : ''} in settings. Please add more document types in Settings to upload more documents.`,
      reason: 'document-types',
      limit: configuredDocTypesCount
    };
  }

  return {
    canUpload: true,
    message: '',
    reason: 'success',
    limit: isUnlimited ? -1 : planLimit
  };
}
