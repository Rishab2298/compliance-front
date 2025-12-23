/**
 * DSP Role Capabilities Matrix
 * Defines granular permissions for each DSP role
 *
 * This matches the backend implementation in:
 * backend/src/utils/dspCapabilities.js
 */

/**
 * DSP Role Capability Matrix
 * Each role has specific capabilities that determine what actions they can perform
 */
export const DSP_ROLE_CAPABILITIES = {
  // Admin: Full access to all features
  ADMIN: {
    manage_users: true,           // Can invite, update roles, remove team members
    manage_billing: true,          // Can view and manage billing/subscriptions
    view_audit_logs: true,         // Can view audit logs and security events
    create_edit_drivers: true,     // Can create and edit driver profiles
    upload_documents: true,        // Can upload and manage documents
    delete_documents: true,        // Can delete documents
    configure_reminders: true,     // Can configure reminder settings
    view_dashboard: true,          // Can view dashboard
    access_settings: true,         // Can access settings
  },

  // Compliance Manager: Full compliance access except user/billing management, audit logs, dashboard, and settings
  COMPLIANCE_MANAGER: {
    manage_users: false,
    manage_billing: false,
    view_audit_logs: false,
    create_edit_drivers: true,
    upload_documents: true,
    delete_documents: true,        // Can delete documents
    configure_reminders: true,
    view_dashboard: false,         // Cannot view dashboard
    access_settings: false,        // Cannot access settings
  },

  // HR Lead: Can manage drivers and documents but cannot delete, view audit logs, dashboard, or settings
  HR_LEAD: {
    manage_users: false,
    manage_billing: false,
    view_audit_logs: false,
    create_edit_drivers: true,
    upload_documents: true,
    delete_documents: false,       // Cannot delete documents
    configure_reminders: true,
    view_dashboard: false,         // Cannot view dashboard
    access_settings: false,        // Cannot access settings
  },

  // Viewer: Read-only access, no dashboard or settings
  VIEWER: {
    manage_users: false,
    manage_billing: false,
    view_audit_logs: false,
    create_edit_drivers: false,
    upload_documents: false,
    delete_documents: false,
    configure_reminders: false,
    view_dashboard: false,         // Cannot view dashboard
    access_settings: false,        // Cannot access settings
  },

  // Billing: Only billing access, no audit logs, dashboard, or settings
  BILLING: {
    manage_users: false,
    manage_billing: true,          // Full billing access
    view_audit_logs: false,
    create_edit_drivers: false,
    upload_documents: false,
    delete_documents: false,
    configure_reminders: false,
    view_dashboard: false,         // Cannot view dashboard
    access_settings: false,        // Cannot access settings
  },
};

/**
 * Get capabilities for a specific DSP role
 * @param {string} dspRole - The DSP role (ADMIN, COMPLIANCE_MANAGER, HR_LEAD, VIEWER, BILLING)
 * @returns {Object} - Object containing all capability flags
 */
export const getDSPCapabilities = (dspRole) => {
  if (!dspRole) {
    return {
      manage_users: false,
      manage_billing: false,
      view_audit_logs: false,
      create_edit_drivers: false,
      upload_documents: false,
      delete_documents: false,
      configure_reminders: false,
      view_dashboard: false,
      access_settings: false,
    };
  }

  return DSP_ROLE_CAPABILITIES[dspRole] || {
    manage_users: false,
    manage_billing: false,
    view_audit_logs: false,
    create_edit_drivers: false,
    upload_documents: false,
    delete_documents: false,
    configure_reminders: false,
    view_dashboard: false,
    access_settings: false,
  };
};

/**
 * Check if a user has a specific DSP capability
 * @param {Object} user - Clerk user object with publicMetadata
 * @param {string} capability - The capability to check (e.g., 'manage_users', 'upload_documents')
 * @returns {boolean} - True if user has the capability
 */
export const hasDSPCapability = (user, capability) => {
  if (!user) return false;

  // SUPER_ADMIN has all capabilities
  const role = user.publicMetadata?.role;
  if (role === 'SUPER_ADMIN') return true;

  // Get DSP role from metadata
  const dspRole = user.publicMetadata?.dspRole;
  if (!dspRole) return false;

  // Get capabilities for this role
  const capabilities = getDSPCapabilities(dspRole);
  return capabilities[capability] === true;
};

/**
 * Check if user can access a specific route/feature
 * @param {Object} user - Clerk user object
 * @param {string} feature - Feature name (team, billing, drivers, documents, audit_logs, reminders, dashboard, settings)
 * @returns {boolean}
 */
export const canAccessFeature = (user, feature) => {
  if (!user) return false;

  const role = user.publicMetadata?.role;
  if (role === 'SUPER_ADMIN') return true;

  const dspRole = user.publicMetadata?.dspRole;
  if (!dspRole) return false;

  switch (feature) {
    case 'team':
      return hasDSPCapability(user, 'manage_users');
    case 'billing':
      return hasDSPCapability(user, 'manage_billing');
    case 'drivers':
      return hasDSPCapability(user, 'create_edit_drivers');
    case 'documents':
      return hasDSPCapability(user, 'upload_documents');
    case 'audit_logs':
      return hasDSPCapability(user, 'view_audit_logs');
    case 'reminders':
      return hasDSPCapability(user, 'configure_reminders');
    case 'dashboard':
      return hasDSPCapability(user, 'view_dashboard');
    case 'settings':
      return hasDSPCapability(user, 'access_settings');
    default:
      return false;
  }
};

/**
 * Get user-friendly role display name
 * @param {string} dspRole - DSP role enum value
 * @returns {string} - Formatted display name
 */
export const getRoleDisplayName = (dspRole) => {
  const roleNames = {
    ADMIN: 'Admin',
    COMPLIANCE_MANAGER: 'Compliance Manager',
    HR_LEAD: 'HR Lead',
    VIEWER: 'Viewer',
    BILLING: 'Billing',
  };
  return roleNames[dspRole] || dspRole;
};

/**
 * Get all available DSP roles for dropdown/selection
 * NOTE: ADMIN role is excluded - only the company owner should be ADMIN
 * @returns {Array} - Array of role objects with value and label
 */
export const getAvailableDSPRoles = () => {
  return [
    { value: 'COMPLIANCE_MANAGER', label: 'Compliance Manager', description: 'Full access to employees & documents' },
    { value: 'HR_LEAD', label: 'HR Lead', description: 'Manage employees & upload documents' },
    { value: 'VIEWER', label: 'Viewer', description: 'Read-only access' },
    { value: 'BILLING', label: 'Billing', description: 'Billing & subscriptions only' },
  ];
};
