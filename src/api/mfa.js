/**
 * MFA API Client
 * Handles all MFA-related API calls
 */

const API_URL = import.meta.env.VITE_API_URL;

// Get MFA status
export const getMFAStatus = async (token) => {
  const response = await fetch(`${API_URL}/api/mfa/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get MFA status");
  }

  return response.json();
};

// Setup TOTP (get QR code)
export const setupTOTP = async (token) => {
  const response = await fetch(`${API_URL}/api/mfa/setup/totp`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to setup TOTP");
  }

  return response.json();
};

// Verify TOTP and enable MFA
export const verifyAndEnableTOTP = async (token, code) => {
  const response = await fetch(`${API_URL}/api/mfa/verify/totp`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to verify TOTP");
  }

  return response.json();
};

// Verify MFA during login
export const verifyMFA = async (token, code, useBackupCode = false) => {
  const response = await fetch(`${API_URL}/api/mfa/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, useBackupCode }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to verify MFA");
  }

  return response.json();
};

// Regenerate backup codes
export const regenerateBackupCodes = async (token, code) => {
  const response = await fetch(`${API_URL}/api/mfa/backup-codes/regenerate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to regenerate backup codes");
  }

  return response.json();
};

// Disable MFA
export const disableMFA = async (token, code) => {
  const response = await fetch(`${API_URL}/api/mfa/disable`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to disable MFA");
  }

  return response.json();
};
