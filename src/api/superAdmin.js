const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get super admin dashboard stats
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Dashboard stats
 */
export const getDashboardStats = async (token) => {
  const response = await fetch(`${API_URL}/api/super-admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch dashboard stats');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get all companies
 * @param {string} token - Auth token
 * @param {Object} params - Query parameters (page, limit, search)
 * @returns {Promise<Object>} Companies data with pagination
 */
export const getAllCompanies = async (token, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/api/super-admin/companies?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch companies');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get all users
 * @param {string} token - Auth token
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} Users data with pagination
 */
export const getAllUsers = async (token, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/api/super-admin/users?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch users');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get recent activity
 * @param {string} token - Auth token
 * @param {number} limit - Number of items to fetch
 * @returns {Promise<Object>} Recent activity data
 */
export const getRecentActivity = async (token, limit = 20) => {
  const response = await fetch(`${API_URL}/api/super-admin/activity?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch activity');
  }

  const result = await response.json();
  return result.data;
};
