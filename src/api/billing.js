const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get all available billing plans
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Array of plans
 */
export const getPlans = async (token) => {
  const response = await fetch(`${API_URL}/api/billing/plans`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch plans');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get current plan and usage
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Current plan data
 */
export const getCurrentPlan = async (token) => {
  const response = await fetch(`${API_URL}/api/billing/current`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch current plan');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Purchase AI credits
 * @param {number} amount - Dollar amount
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Checkout session data
 */
export const purchaseCredits = async (amount, token) => {
  const response = await fetch(`${API_URL}/api/billing/purchase-credits`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create credit purchase');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Upgrade to a higher plan
 * @param {string} targetPlan - Plan name to upgrade to
 * @param {string} billingCycle - 'monthly' or 'yearly'
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Checkout session data
 */
export const upgradePlan = async (targetPlan, billingCycle, token) => {
  const response = await fetch(`${API_URL}/api/billing/upgrade`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetPlan, billingCycle }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create upgrade checkout');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Downgrade to a lower plan
 * @param {string} targetPlan - Plan name to downgrade to
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Downgrade schedule data
 */
export const downgradePlan = async (targetPlan, token) => {
  const response = await fetch(`${API_URL}/api/billing/downgrade`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetPlan }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to schedule downgrade');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Cancel pending downgrade
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Success message
 */
export const cancelDowngrade = async (token) => {
  const response = await fetch(`${API_URL}/api/billing/cancel-downgrade`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel downgrade');
  }

  const result = await response.json();
  return result;
};

/**
 * Get billing history
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Array of billing records
 */
export const getBillingHistory = async (token) => {
  const response = await fetch(`${API_URL}/api/billing/history`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch billing history');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get credit transaction history
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Array of credit transactions
 */
export const getCreditTransactions = async (token) => {
  const response = await fetch(`${API_URL}/api/billing/credit-transactions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch credit transactions');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Get billing portal URL
 * @param {string} token - Auth token
 * @returns {Promise<string>} Billing portal URL
 */
export const getBillingPortal = async (token) => {
  const response = await fetch(`${API_URL}/api/billing/portal`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get billing portal');
  }

  const result = await response.json();
  return result.data.portalUrl;
};
