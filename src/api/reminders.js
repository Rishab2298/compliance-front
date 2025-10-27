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
