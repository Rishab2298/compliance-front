/**
 * Policies API Client
 * Handles all policy-related API calls
 */

const API_URL = import.meta.env.VITE_API_URL;

// ============================================
// PUBLIC ENDPOINTS (no auth required)
// ============================================

/**
 * Get all latest published policies (for onboarding)
 */
export const getAllLatestPublishedPolicies = async () => {
  const response = await fetch(`${API_URL}/api/policies/public/latest`);

  if (!response.ok) {
    throw new Error("Failed to get published policies");
  }

  return response.json();
};

/**
 * Get latest published policy by type (for onboarding)
 * @param {string} type - Policy type (TERMS_OF_SERVICE, PRIVACY_POLICY, etc.)
 */
export const getLatestPublishedPolicy = async (type) => {
  const response = await fetch(`${API_URL}/api/policies/public/latest/${type}`);

  if (!response.ok) {
    throw new Error("Failed to get policy");
  }

  return response.json();
};

// ============================================
// TEAM MEMBER ENDPOINTS (for policy acceptance after MFA)
// ============================================

/**
 * Accept policies (team members only)
 * @param {string} token - Auth token
 * @param {string[]} policyIds - Array of policy IDs to accept
 */
export const acceptPolicies = async (token, policyIds) => {
  const response = await fetch(`${API_URL}/api/policies/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ policyIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to accept policies");
  }

  return response.json();
};

/**
 * Get acceptance status (check if user needs to accept policies)
 * @param {string} token - Auth token
 */
export const getAcceptanceStatus = async (token) => {
  const response = await fetch(`${API_URL}/api/policies/acceptance-status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get acceptance status");
  }

  return response.json();
};

// ============================================
// PROTECTED ENDPOINTS (SUPER_ADMIN only)
// ============================================

/**
 * Get policy status overview
 * @param {string} token - Auth token
 */
export const getPolicyStatus = async (token) => {
  const response = await fetch(`${API_URL}/api/policies/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get policy status");
  }

  return response.json();
};

/**
 * Create a new policy version
 * @param {string} token - Auth token
 * @param {Object} data - Policy data
 */
export const createPolicy = async (token, data) => {
  const response = await fetch(`${API_URL}/api/policies`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create policy");
  }

  return response.json();
};

/**
 * Update a policy (creates new version)
 * @param {string} token - Auth token
 * @param {string} type - Policy type
 * @param {Object} data - Update data
 */
export const updatePolicy = async (token, type, data) => {
  const response = await fetch(`${API_URL}/api/policies/${type}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update policy");
  }

  return response.json();
};

/**
 * Publish a policy version
 * @param {string} token - Auth token
 * @param {string} policyId - Policy ID to publish
 */
export const publishPolicy = async (token, policyId) => {
  const response = await fetch(`${API_URL}/api/policies/${policyId}/publish`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to publish policy");
  }

  return response.json();
};

/**
 * Unpublish a policy version
 * @param {string} token - Auth token
 * @param {string} policyId - Policy ID to unpublish
 */
export const unpublishPolicy = async (token, policyId) => {
  const response = await fetch(`${API_URL}/api/policies/${policyId}/unpublish`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to unpublish policy");
  }

  return response.json();
};

/**
 * Get policy history (all versions)
 * @param {string} token - Auth token
 * @param {string} type - Policy type
 */
export const getPolicyHistory = async (token, type) => {
  const response = await fetch(`${API_URL}/api/policies/history/${type}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get policy history");
  }

  return response.json();
};

/**
 * Get a specific policy by ID
 * @param {string} token - Auth token
 * @param {string} policyId - Policy ID
 */
export const getPolicyById = async (token, policyId) => {
  const response = await fetch(`${API_URL}/api/policies/${policyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get policy");
  }

  return response.json();
};

/**
 * Delete a policy version (only if not published)
 * @param {string} token - Auth token
 * @param {string} policyId - Policy ID to delete
 */
export const deletePolicy = async (token, policyId) => {
  const response = await fetch(`${API_URL}/api/policies/${policyId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete policy");
  }

  return response.json();
};

/**
 * Generate presigned upload URL for policy PDF
 * @param {string} token - Auth token
 * @param {Object} data - Upload data
 * @param {string} data.policyType - Policy type
 * @param {string} data.version - Policy version
 * @param {string} data.filename - PDF filename
 */
export const generatePdfUploadUrl = async (token, data) => {
  const response = await fetch(`${API_URL}/api/policies/upload-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate upload URL");
  }

  return response.json();
};

/**
 * Upload PDF file to S3 using presigned URL
 * @param {string} uploadUrl - Presigned upload URL
 * @param {File} file - PDF file to upload
 */
export const uploadPdfToS3 = async (uploadUrl, file) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/pdf",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Failed to upload PDF to S3");
  }

  return true;
};

export default {
  getAllLatestPublishedPolicies,
  getLatestPublishedPolicy,
  acceptPolicies,
  getAcceptanceStatus,
  getPolicyStatus,
  createPolicy,
  updatePolicy,
  publishPolicy,
  unpublishPolicy,
  getPolicyHistory,
  getPolicyById,
  deletePolicy,
  generatePdfUploadUrl,
  uploadPdfToS3,
};
