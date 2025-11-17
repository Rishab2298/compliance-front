const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Audit Logs API Client
 * Handles all audit log operations (view, filter, verify integrity, export)
 */

/**
 * Get audit logs with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.companyId - Company ID (for SUPER_ADMIN)
 * @param {boolean} params.allCompanies - View all companies (SUPER_ADMIN only)
 * @param {string} params.category - Filter by category (BILLING, USER_MANAGEMENT, etc.)
 * @param {string} params.action - Filter by action (USER_LOGIN, TEAM_MEMBER_INVITED, etc.)
 * @param {string} params.userId - Filter by user ID
 * @param {string} params.severity - Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
 * @param {string} params.startDate - Start date filter (ISO string)
 * @param {string} params.endDate - End date filter (ISO string)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Results per page
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Audit logs data
 */
export const getAuditLogs = async (params = {}, token) => {
  const queryParams = new URLSearchParams();

  // Add all non-null parameters to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });

  const response = await fetch(`${API_URL}/api/audit-logs?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch audit logs');
  }

  return response.json();
};

/**
 * Get security events with optional filters
 * @param {Object} params - Query parameters (same as getAuditLogs)
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Security events data
 */
export const getSecurityEvents = async (params = {}, token) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });

  const response = await fetch(`${API_URL}/api/audit-logs/security-events?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch security events');
  }

  return response.json();
};

/**
 * Get data access logs (for sensitive data viewing)
 * @param {Object} params - Query parameters (same as getAuditLogs)
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Data access logs
 */
export const getDataAccessLogs = async (params = {}, token) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });

  const response = await fetch(`${API_URL}/api/audit-logs/data-access?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch data access logs');
  }

  return response.json();
};

/**
 * Verify audit log integrity (check for tampering)
 * @param {string} companyId - Company ID (optional for SUPER_ADMIN)
 * @param {string} logType - Log type ('audit', 'security', 'data_access')
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Integrity verification result
 */
export const verifyLogIntegrity = async (companyId = null, logType = 'audit', token) => {
  const queryParams = new URLSearchParams({ logType });
  if (companyId) {
    queryParams.append('companyId', companyId);
  }

  const response = await fetch(`${API_URL}/api/audit-logs/verify-integrity?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to verify log integrity');
  }

  return response.json();
};

/**
 * Export audit logs as CSV or JSON
 * @param {Object} params - Query parameters (same as getAuditLogs)
 * @param {string} format - Export format ('csv' or 'json')
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Blob>} - File blob for download
 */
export const exportAuditLogs = async (params = {}, format = 'csv', token) => {
  const queryParams = new URLSearchParams({ ...params, format });

  const response = await fetch(`${API_URL}/api/audit-logs/export?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to export audit logs');
  }

  // Return blob for file download
  return response.blob();
};

/**
 * Get audit log statistics/summary
 * @param {Object} params - Query parameters
 * @param {string} params.companyId - Company ID (for SUPER_ADMIN)
 * @param {string} params.startDate - Start date filter
 * @param {string} params.endDate - End date filter
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Audit log statistics
 */
export const getAuditLogStats = async (params = {}, token) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });

  const response = await fetch(`${API_URL}/api/audit-logs/stats?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch audit log statistics');
  }

  return response.json();
};

/**
 * Get available filter options (categories, actions, severities)
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Filter options
 */
export const getFilterOptions = async (token) => {
  const response = await fetch(`${API_URL}/api/audit-logs/filters`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch filter options');
  }

  return response.json();
};

/**
 * Helper function to download exported file
 * @param {Blob} blob - File blob
 * @param {string} filename - Desired filename
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
