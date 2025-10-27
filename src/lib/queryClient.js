import { QueryClient } from '@tanstack/react-query'

// Create a shared query client with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 10 minutes - longer stale time means less refetching
      staleTime: 10 * 60 * 1000,
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
      // Don't refetch on mount if we have cached data
      refetchOnMount: false,
      // Retry failed requests once
      retry: 1,
      // Use cached data while refetching in background
      refetchOnReconnect: false,
      // Network mode - always try to fetch even if offline
      networkMode: 'online',
    },
  },
})

/**
 * Prefetch only essential data (company info for sidebar)
 * This reduces server load while keeping the app responsive
 */
export const prefetchEssentialData = async (getToken, companyId) => {
  const API_URL = import.meta.env.VITE_API_URL

  if (!companyId) return

  try {
    const token = await getToken()

    // Only prefetch company data (needed for sidebar immediately)
    await queryClient.prefetchQuery({
      queryKey: ['company', companyId],
      queryFn: async () => {
        const response = await fetch(`${API_URL}/api/company/${companyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) throw new Error('Failed to fetch company')
        return response.json()
      },
    })

    console.log('✅ Prefetched essential data')
  } catch (error) {
    console.error('❌ Prefetch error:', error)
  }
}

/**
 * Prefetch drivers data on-demand (when user hovers over Drivers link)
 * This provides instant load without hammering server on login
 */
export const prefetchDriversData = async (getToken, companyId) => {
  const API_URL = import.meta.env.VITE_API_URL

  try {
    const token = await getToken()

    // Check if already cached
    const cachedDrivers = queryClient.getQueryData(['drivers'])
    if (cachedDrivers) {
      console.log('⚡ Drivers already cached, skipping prefetch')
      return
    }

    // Prefetch drivers and document types in parallel
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ['drivers'],
        queryFn: async () => {
          const response = await fetch(`${API_URL}/api/drivers`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          if (!response.ok) throw new Error('Failed to fetch drivers')
          const result = await response.json()
          return result.drivers || []
        },
      }),

      companyId && queryClient.prefetchQuery({
        queryKey: ['documentTypes', companyId],
        queryFn: async () => {
          const response = await fetch(`${API_URL}/api/document-types/company/${companyId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          if (!response.ok) throw new Error('Failed to fetch document types')
          const result = await response.json()
          return result.success ? result.data || [] : []
        },
      }),
    ])

    console.log('✅ Prefetched drivers data')
  } catch (error) {
    console.error('❌ Prefetch error:', error)
  }
}
