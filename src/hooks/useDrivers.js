import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Hook to fetch all drivers with pagination
 * Caches the result with key: ['drivers', page, limit]
 */
export const useDrivers = (page = 1, limit = 50) => {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['drivers', page, limit],
    queryFn: async () => {
      const token = await getToken()
      console.log('🔍 Fetching drivers from API...')
      const response = await fetch(`${API_URL}/api/drivers?includeDocuments=true&page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Failed to fetch drivers:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to fetch drivers')
      }

      const result = await response.json()
      console.log('✅ Drivers fetched successfully:', result)
      console.log(`📊 Total drivers: ${result.drivers?.length || 0}`)

      if (result.drivers && result.drivers.length > 0) {
        console.log('First driver:', result.drivers[0])
      }

      return result
    },
  })
}

/**
 * Hook to fetch a single driver by ID
 * Caches with key: ['driver', driverId]
 */
export const useDriver = (driverId) => {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['driver', driverId],
    queryFn: async () => {
      const token = await getToken()
      const response = await fetch(`${API_URL}/api/drivers/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch driver details')
      }

      const result = await response.json()
      return result.driver
    },
    enabled: !!driverId, // Only run query if driverId exists
  })
}

/**
 * Hook to update a driver
 * Automatically invalidates the driver cache after update
 */
export const useUpdateDriver = (driverId) => {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (driverData) => {
      const token = await getToken()
      const response = await fetch(`${API_URL}/api/drivers/${driverId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update driver')
      }

      return response.json()
    },
    // After successful update, invalidate both driver and drivers caches
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['driver', driverId] })
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
  })
}

/**
 * Hook to delete a driver
 * Automatically invalidates the drivers cache after deletion
 */
export const useDeleteDriver = () => {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (driverId) => {
      const token = await getToken()
      const response = await fetch(`${API_URL}/api/drivers/${driverId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete driver')
      }

      return response.json()
    },
    // After successful deletion, invalidate the drivers cache to trigger refetch
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
  })
}

/**
 * Hook to request documents from a driver
 * Sends email notification to driver with upload link
 */
export const useRequestDocuments = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async ({ driverId, email, phone, requestedDocuments, sendEmail = true, sendSMS = false }) => {
      const token = await getToken()
      const response = await fetch(`${API_URL}/api/driver-invitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId,
          email,
          phone,
          requestedDocuments,
          sendEmail,
          sendSMS,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send document request')
      }

      return response.json()
    },
  })
}

/**
 * Hook to fetch document types for a company
 * Caches with key: ['documentTypes', companyId]
 * @param {string} companyId - The company ID
 * @param {boolean} includeFields - Whether to include field configurations (default: false for backward compatibility)
 */
export const useDocumentTypes = (companyId, includeFields = false) => {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['documentTypes', companyId, includeFields],
    queryFn: async () => {
      const token = await getToken()
      const queryParam = includeFields ? '?includeFields=true' : ''
      const response = await fetch(`${API_URL}/api/document-types/company/${companyId}${queryParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch document types')
      }

      const result = await response.json()
      return result.success ? result.data || [] : []
    },
    enabled: !!companyId, // Only run if companyId exists
  })
}

/**
 * Hook to fetch all documents for a driver
 * Caches with key: ['documents', driverId]
 */
export const useDriverDocuments = (driverId) => {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['documents', driverId],
    queryFn: async () => {
      const token = await getToken()
      const response = await fetch(`${API_URL}/api/documents/driver/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const result = await response.json()
      return result.data || []
    },
    enabled: !!driverId,
  })
}
