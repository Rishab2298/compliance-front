const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const createDriverInvitation = async (invitationData, token) => {
  const response = await fetch(`${API_URL}/api/driver-invitations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(invitationData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create driver invitation');
  }

  return response.json();
};

export const getDriverInvitationByToken = async (token) => {
  const response = await fetch(`${API_URL}/api/driver-invitations/${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch driver invitation');
  }

  return response.json();
};

export const completeDriverInvitation = async (token) => {
  const response = await fetch(`${API_URL}/api/driver-invitations/${token}/complete`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to complete driver invitation');
  }

  return response.json();
};

/**
 * Get presigned URLs for driver document uploads (token-based, no auth required)
 * @param {string} invitationToken - Driver invitation token
 * @param {Array} files - Array of {filename, contentType, documentType}
 * @returns {Promise<Array>} Array of {filename, key, uploadUrl, documentType}
 */
export const getDriverUploadPresignedUrls = async (invitationToken, files) => {
  const response = await fetch(`${API_URL}/api/driver-invitations/${invitationToken}/presigned-urls`, {
    method: 'POST',
    headers: {
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
 * Create document records after driver uploads (token-based, no auth required)
 * @param {string} invitationToken - Driver invitation token
 * @param {Array} documents - Array of {key, filename, contentType, size, documentType}
 * @returns {Promise<Object>} Result with created documents
 */
export const createDriverDocuments = async (invitationToken, documents) => {
  const response = await fetch(`${API_URL}/api/driver-invitations/${invitationToken}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documents }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create document records');
  }

  const result = await response.json();
  return result.data;
};
