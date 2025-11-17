const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get all reminders for the company
 * @param {string} token - Clerk auth token
 * @returns {Promise} - Reminders data
 */
export const getReminders = async (token) => {
  const response = await fetch(`${API_URL}/api/reminders`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch reminders');
  }

  return response.json();
};

/**
 * Send a manual reminder for a specific document
 * @param {string} documentId - Document ID
 * @param {string} channel - 'EMAIL' or 'SMS'
 * @param {string} token - Clerk auth token
 * @returns {Promise} - Response data
 */
export const sendManualReminder = async (documentId, channel, token) => {
  const response = await fetch(`${API_URL}/api/reminders/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documentId, channel }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send reminder');
  }

  return response.json();
};

/**
 * Get reminder history for a specific document
 * @param {string} documentId - Document ID
 * @param {string} token - Clerk auth token
 * @returns {Promise} - Reminder history data
 */
export const getReminderHistory = async (documentId, token) => {
  const response = await fetch(`${API_URL}/api/reminders/history/${documentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch reminder history');
  }

  return response.json();
};

/**
 * Create a custom reminder
 * @param {Object} reminderData - Reminder data
 * @param {string} token - Clerk auth token
 * @returns {Promise} - Created reminder data
 */
export const createCustomReminder = async (reminderData, token) => {
  const response = await fetch(`${API_URL}/api/reminders/custom`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reminderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create custom reminder');
  }

  return response.json();
};

/**
 * Get all custom reminders for the company
 * @param {string} token - Clerk auth token
 * @returns {Promise} - Custom reminders data
 */
export const getCustomReminders = async (token) => {
  const response = await fetch(`${API_URL}/api/reminders/custom`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch custom reminders');
  }

  return response.json();
};

/**
 * Delete a custom reminder
 * @param {string} reminderId - Reminder ID
 * @param {string} token - Clerk auth token
 * @returns {Promise} - Response data
 */
export const deleteCustomReminder = async (reminderId, token) => {
  const response = await fetch(`${API_URL}/api/reminders/custom/${reminderId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete custom reminder');
  }

  return response.json();
};

/**
 * Update a custom reminder
 * @param {string} reminderId - Reminder ID
 * @param {Object} reminderData - Updated reminder data
 * @param {string} token - Clerk auth token
 * @returns {Promise} - Updated reminder data
 */
export const updateCustomReminder = async (reminderId, reminderData, token) => {
  const response = await fetch(`${API_URL}/api/reminders/custom/${reminderId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reminderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update custom reminder');
  }

  return response.json();
};
