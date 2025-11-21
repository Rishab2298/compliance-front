import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Hook to fetch document type configurations for settings management
 */
export const useDocumentTypeConfigs = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['documentTypeConfigs'],
    queryFn: async () => {
      const token = await getToken();
      console.log('Fetching document types from:', `${API_URL}/api/settings/document-types`);
      console.log('Token exists:', !!token);

      const response = await fetch(`${API_URL}/api/settings/document-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Failed to fetch document type configurations (${response.status})`);
      }

      const result = await response.json();
      console.log('Full API response:', result);
      // Backend returns { success, data: { documentTypes, totalCount, defaultCount, customCount } }
      return result.data?.documentTypes || [];
    },
  });
};

/**
 * Hook to fetch available field types
 */
export const useFieldTypes = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['fieldTypes'],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/settings/field-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch field types');
      }

      const result = await response.json();
      return result.data || [];
    },
  });
};

/**
 * Hook to create a new custom document type
 */
export const useCreateDocumentType = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentTypeData) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/settings/document-types`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentTypeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create document type');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both settings query and document types query used in driver details
      queryClient.invalidateQueries({ queryKey: ['documentTypeConfigs'] });
      queryClient.invalidateQueries({ queryKey: ['documentTypes'] });
    },
  });
};

/**
 * Hook to update a document type configuration
 */
export const useUpdateDocumentType = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, config }) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/settings/document-types/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update document type');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTypeConfigs'] });
      queryClient.invalidateQueries({ queryKey: ['documentTypes'] });
    },
  });
};

/**
 * Hook to delete a custom document type
 */
export const useDeleteDocumentType = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentTypeName) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/settings/document-types/${encodeURIComponent(documentTypeName)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete document type');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTypeConfigs'] });
      queryClient.invalidateQueries({ queryKey: ['documentTypes'] });
    },
  });
};

/**
 * Hook to toggle active/inactive status of a document type
 */
export const useToggleDocumentTypeActive = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, isActive }) => {
      const token = await getToken();
      const url = `${API_URL}/api/settings/document-types/${encodeURIComponent(name)}/toggle-active`;

      console.log('🔄 Toggling document type:', { name, isActive, url });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        console.error('❌ Toggle failed:', error);
        throw new Error(error.message || 'Failed to toggle document type active status');
      }

      const result = await response.json();
      console.log('✅ Toggle successful:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTypeConfigs'] });
      queryClient.invalidateQueries({ queryKey: ['documentTypes'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] }); // Update compliance scores
    },
  });
};
