const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Send welcome email after policy acceptance
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Success response
 */
export const sendWelcomeEmail = async (token) => {
  const response = await fetch(`${API_URL}/api/onboarding/send-welcome-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send welcome email');
  }

  return response.json();
};
