const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Team Management API Client
 * Handles all team member operations (invite, update, remove, list)
 */

/**
 * Get all team members for the current company
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Team members data
 */
export const getTeamMembers = async (token) => {
  const response = await fetch(`${API_URL}/api/team`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch team members');
  }

  return response.json();
};

/**
 * Invite a new team member or update existing user's role
 * @param {Object} inviteData - Invitation data
 * @param {string} inviteData.email - User email
 * @param {string} inviteData.dspRole - DSP role (ADMIN, COMPLIANCE_MANAGER, HR_LEAD, VIEWER, BILLING)
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Created/updated user data
 */
export const inviteTeamMember = async (inviteData, token) => {
  const response = await fetch(`${API_URL}/api/team/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(inviteData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to invite team member');
  }

  return response.json();
};

/**
 * Update a team member's DSP role
 * @param {string} userId - User ID to update
 * @param {Object} updateData - Update data
 * @param {string} updateData.dspRole - New DSP role
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Updated user data
 */
export const updateTeamMemberRole = async (userId, updateData, token) => {
  const response = await fetch(`${API_URL}/api/team/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update team member role');
  }

  return response.json();
};

/**
 * Remove a team member from the company
 * @param {string} userId - User ID to remove
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Success message
 */
export const removeTeamMember = async (userId, token) => {
  const response = await fetch(`${API_URL}/api/team/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove team member');
  }

  return response.json();
};

/**
 * Get team invitation history for the current company
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Team invitations data
 */
export const getTeamInvitations = async (token) => {
  const response = await fetch(`${API_URL}/api/team/invitations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch team invitations');
  }

  return response.json();
};

/**
 * Resend invitation email to a team member
 * (Optional - if backend implements this endpoint)
 * @param {string} userId - User ID
 * @param {string} token - Clerk authentication token
 * @returns {Promise<Object>} - Success message
 */
export const resendInvitation = async (userId, token) => {
  const response = await fetch(`${API_URL}/api/team/${userId}/resend-invitation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to resend invitation');
  }

  return response.json();
};
