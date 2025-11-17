import { useUser } from '@clerk/clerk-react';
import { useMemo } from 'react';
import {
  getDSPCapabilities,
  hasDSPCapability,
  canAccessFeature,
  getRoleDisplayName,
  getAvailableDSPRoles,
} from '@/utils/dspCapabilities';

/**
 * usePermissions Hook
 * Provides role-based permission checking for DSP users
 *
 * Usage:
 * ```jsx
 * import { usePermissions } from '@/hooks/usePermissions';
 *
 * function TeamManagementPage() {
 *   const { hasCapability, canAccess, capabilities, dspRole, isSuperAdmin } = usePermissions();
 *
 *   // Check specific capability
 *   if (!hasCapability('manage_users')) {
 *     return <div>Access Denied</div>;
 *   }
 *
 *   // Check feature access
 *   const canViewBilling = canAccess('billing');
 *
 *   // Use capabilities object
 *   return (
 *     <div>
 *       {capabilities.upload_documents && <UploadButton />}
 *       {capabilities.delete_documents && <DeleteButton />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {Object} Permission utilities and user role information
 */
export const usePermissions = () => {
  const { isLoaded, user } = useUser();

  // Memoize permission calculations
  const permissions = useMemo(() => {
    if (!isLoaded || !user) {
      return {
        isLoaded: false,
        user: null,
        role: null,
        dspRole: null,
        companyId: null,
        isSuperAdmin: false,
        capabilities: {
          manage_users: false,
          manage_billing: false,
          view_audit_logs: false,
          create_edit_drivers: false,
          upload_documents: false,
          delete_documents: false,
          configure_reminders: false,
        },
        hasCapability: () => false,
        canAccess: () => false,
        getRoleDisplay: () => '',
        availableRoles: [],
      };
    }

    const role = user.publicMetadata?.role;
    const dspRole = user.publicMetadata?.dspRole;
    const companyId = user.publicMetadata?.companyId;
    const isSuperAdmin = role === 'SUPER_ADMIN';

    // Get capabilities for current DSP role
    const capabilities = getDSPCapabilities(dspRole);

    return {
      isLoaded: true,
      user,
      role,
      dspRole,
      companyId,
      isSuperAdmin,
      capabilities,

      /**
       * Check if user has a specific capability
       * @param {string} capability - Capability name (e.g., 'manage_users')
       * @returns {boolean}
       */
      hasCapability: (capability) => hasDSPCapability(user, capability),

      /**
       * Check if user can access a feature
       * @param {string} feature - Feature name (team, billing, drivers, etc.)
       * @returns {boolean}
       */
      canAccess: (feature) => canAccessFeature(user, feature),

      /**
       * Get formatted display name for current DSP role
       * @returns {string}
       */
      getRoleDisplay: () => getRoleDisplayName(dspRole),

      /**
       * Get list of available DSP roles (for admin use)
       * @returns {Array}
       */
      availableRoles: getAvailableDSPRoles(),
    };
  }, [isLoaded, user]);

  return permissions;
};

/**
 * Higher-order component to protect routes by capability
 *
 * Usage:
 * ```jsx
 * import { withCapability } from '@/hooks/usePermissions';
 *
 * const TeamManagementPage = withCapability('manage_users', () => {
 *   return <div>Team Management Content</div>;
 * });
 * ```
 */
export const withCapability = (requiredCapability, Component) => {
  return function ProtectedComponent(props) {
    const { hasCapability, isLoaded } = usePermissions();

    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!hasCapability(requiredCapability)) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-8">
          <svg
            className="w-16 h-16 text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access this feature.
            <br />
            Required capability: <code className="bg-gray-100 px-2 py-1 rounded">{requiredCapability}</code>
          </p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

/**
 * Hook to check if user can perform an action
 * Returns a function that shows permission denied message if not allowed
 *
 * Usage:
 * ```jsx
 * const { checkPermission } = usePermissionGuard();
 *
 * const handleDelete = () => {
 *   if (!checkPermission('delete_documents')) return;
 *   // Proceed with deletion
 * };
 * ```
 */
export const usePermissionGuard = () => {
  const { hasCapability } = usePermissions();

  return {
    checkPermission: (capability, customMessage = null) => {
      const hasPermission = hasCapability(capability);
      if (!hasPermission) {
        const message = customMessage || `You don't have permission to perform this action. Required: ${capability}`;
        console.warn('Permission denied:', message);
        // You can integrate with toast notification here
        alert(message); // Replace with proper toast notification
      }
      return hasPermission;
    },
  };
};

export default usePermissions;
