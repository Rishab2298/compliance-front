import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Hook to fetch company settings
 * Caches with key: ['company', companyId]
 */
export const useCompany = (companyId) => {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const token = await getToken()
      const response = await fetch(`${API_URL}/api/company/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch company settings')
      }

      return response.json()
    },
    enabled: !!companyId, // Only run if companyId exists
  })
}

/**
 * Hook to update company settings
 * Automatically updates the cache after successful update
 */
export const useUpdateCompany = (companyId) => {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData) => {
      const token = await getToken()
      const response = await fetch(`${API_URL}/api/company/${companyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      return response.json()
    },
    // After successful update, invalidate the cache to trigger refetch
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId] })
      // Also clear sessionStorage cache
      sessionStorage.removeItem(`company_${companyId}`)
    },
  })
}
