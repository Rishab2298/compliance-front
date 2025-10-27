const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get presigned URLs for uploading multiple files
 * @param {string} driverId - Driver ID
 * @param {Array} files - Array of {filename, contentType}
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Array of {filename, key, uploadUrl}
 */
export const getPresignedUrls = async (driverId, files, token) => {
  const response = await fetch(`${API_URL}/api/documents/presigned-urls/${driverId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ files }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get presigned URLs');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Upload file directly to S3 using presigned URL
 * @param {string} url - Presigned upload URL
 * @param {File} file - File object
 * @param {Function} onProgress - Progress callback (percentage)
 * @returns {Promise<void>}
 */
export const uploadToS3 = async (url, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        console.error('S3 Upload Error:', {
          status: xhr.status,
          statusText: xhr.statusText,
          response: xhr.responseText,
        });
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', (event) => {
      console.error('S3 Upload Network Error:', {
        event,
        readyState: xhr.readyState,
        status: xhr.status,
        statusText: xhr.statusText,
      });
      reject(new Error('Network error during upload. This is likely a CORS issue. Check your S3 bucket CORS configuration.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('PUT', url);
    // Only set Content-Type if file has a type
    if (file.type) {
      xhr.setRequestHeader('Content-Type', file.type);
    }
    xhr.send(file);
  });
};

/**
 * Create document record after successful S3 upload
 * @param {string} driverId - Driver ID
 * @param {Object} documentData - {key, filename, contentType, size}
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Created document
 */
export const createDocumentRecord = async (driverId, documentData, token) => {
  const response = await fetch(`${API_URL}/api/documents/${driverId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(documentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create document record');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Update document details (manual entry or AI scan)
 * @param {string} documentId - Document ID
 * @param {Object} details - {type, documentNumber, issuedDate, expiryDate, notes}
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Updated document
 */
export const updateDocumentDetails = async (documentId, details, token) => {
  const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(details),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update document');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get all documents for a driver
 * @param {string} driverId - Driver ID
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Array of documents
 */
export const getDriverDocuments = async (driverId, token) => {
  const response = await fetch(`${API_URL}/api/documents/driver/${driverId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch documents');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Delete a document
 * @param {string} documentId - Document ID
 * @param {string} token - Auth token
 * @returns {Promise<void>}
 */
export const deleteDocument = async (documentId, token) => {
  const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete document');
  }

  return response.json();
};

/**
 * Get presigned download URL for a document
 * @param {string} documentId - Document ID
 * @param {string} token - Auth token
 * @returns {Promise<string>} Download URL
 */
export const getDocumentDownloadUrl = async (documentId, token) => {
  const response = await fetch(`${API_URL}/api/documents/${documentId}/download-url`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get download URL');
  }

  const result = await response.json();
  return result.data.downloadUrl;
};

/**
 * Get company AI credits balance
 * @param {string} token - Auth token
 * @returns {Promise<number>} Credits balance
 */
export const getCreditsBalance = async (token) => {
  const response = await fetch(`${API_URL}/api/documents/credits`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get credits balance');
  }

  const result = await response.json();
  return result.data.credits;
};

/**
 * Scan document with AI (AWS Textract + OpenAI)
 * @param {string} documentId - Document ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} {extractedData, rawTextractData, creditsUsed, creditsRemaining}
 */
export const scanDocumentWithAI = async (documentId, token) => {
  const response = await fetch(`${API_URL}/api/documents/${documentId}/ai-scan`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to scan document');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Bulk scan multiple documents with AI
 * @param {Array<string>} documentIds - Array of document IDs
 * @param {string} token - Auth token
 * @returns {Promise<Object>} {results: Array, totalCreditsUsed, creditsRemaining}
 */
export const bulkScanDocumentsWithAI = async (documentIds, token) => {
  const response = await fetch(`${API_URL}/api/documents/bulk-ai-scan`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documentIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to scan documents');
  }

  const result = await response.json();
  return result.data;
};
