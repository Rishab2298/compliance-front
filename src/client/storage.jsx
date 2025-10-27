import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder, Search, FileText, User, AlertCircle } from 'lucide-react'
import { useDrivers } from '@/hooks/useDrivers'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'

const API_URL = import.meta.env.VITE_API_URL

const Storage = () => {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all drivers with React Query caching
  const { data: drivers = [], isLoading: driversLoading, error: driversError } = useDrivers()

  // Fetch document counts for all drivers (cached separately)
  const { data: documentCounts = {}, isLoading: countsLoading } = useQuery({
    queryKey: ['documentCounts'],
    queryFn: async () => {
      const token = await getToken()
      const response = await fetch(`${API_URL}/api/drivers/document-counts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch document counts')
      }

      const result = await response.json()
      return result.data || {}
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  // Calculate compliance status from driver documents
  const getComplianceStatus = (driver) => {
    const count = documentCounts[driver.id] || 0

    // If no documents, status is critical
    if (count === 0) {
      return 'No Documents'
    }

    // Check if driver has expiringDocumentsCount or expiredDocumentsCount
    if (driver.expiredDocumentsCount > 0) {
      return 'Critical'
    }

    if (driver.expiringDocumentsCount > 0) {
      return 'Warning'
    }

    return 'Compliant'
  }

  // Filter drivers based on search query (memoized for performance)
  const filteredDrivers = useMemo(() => {
    if (!drivers || drivers.length === 0) return []

    return drivers.filter(driver => {
      const fullName = `${driver.firstName} ${driver.lastName}`.toLowerCase()
      const employeeId = driver.employeeId?.toLowerCase() || ''
      const query = searchQuery.toLowerCase()

      return fullName.includes(query) || employeeId.includes(query)
    })
  }, [drivers, searchQuery])

  const handleFolderClick = (driverId) => {
    navigate(`/client/storage/driver/${driverId}`)
  }

  // Loading state with skeletons
  if (driversLoading || countsLoading) {
    return (
      <div className='flex flex-col w-full bg-gray-50 min-h-screen'>
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <h1 className="text-xl font-semibold text-gray-900">Document Storage</h1>
            <Button
              disabled
              className="bg-gray-200 text-gray-400 rounded-[10px]"
            >
              Send Reminders
            </Button>
          </div>
        </header>

        <div className="flex-1 py-8">
          <div className="container w-full px-6 mx-auto space-y-6">
            {/* Search Section Skeleton */}
            <section className="bg-white rounded-[10px] p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <div className="h-10 bg-gray-200 rounded-[10px] animate-pulse" />
                </div>
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </section>

            {/* Driver Folders Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {[...Array(12)].map((_, index) => (
                <Card
                  key={index}
                  className="border border-gray-200 rounded-[10px] bg-white"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="w-full space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-16 mx-auto bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="w-full pt-1.5 border-t border-gray-200">
                        <div className="h-3 w-12 mx-auto bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-16 bg-gray-200 rounded-[10px] animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (driversError) {
    return (
      <div className='flex flex-col w-full bg-gray-50 min-h-screen'>
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <h1 className="text-xl font-semibold text-gray-900">Document Storage</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-red-600">Failed to load drivers: {driversError.message}</p>
            <Button onClick={() => window.location.reload()} className="rounded-[10px]">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col w-full bg-gray-50 min-h-screen'>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">Document Storage</h1>
          <Button
            onClick={() => navigate('/client/reminder')}
            className="bg-gray-800 text-white hover:bg-gray-900 rounded-[10px]"
          >
            Send Reminders
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Search Section */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by driver name or employee ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-[10px]"
                />
              </div>
              <div className="text-sm font-medium text-gray-900">
                {filteredDrivers.length} {filteredDrivers.length === 1 ? 'folder' : 'folders'}
              </div>
            </div>
          </section>

          {/* Driver Folders Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {filteredDrivers.map((driver) => {
              const fullName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Unknown Driver'
              const docCount = documentCounts[driver.id] || 0
              const complianceStatus = getComplianceStatus(driver)

              return (
                <Card
                  key={driver.id}
                  className="hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-gray-900 group rounded-[10px] bg-white"
                  onClick={() => handleFolderClick(driver.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      {/* Folder Icon */}
                      <div className="relative">
                        <Folder className="w-12 h-12 text-gray-700 group-hover:text-gray-900 transition-colors" />
                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 border border-gray-200">
                          <User className="w-3 h-3 text-gray-600" />
                        </div>
                      </div>

                      {/* Driver Info */}
                      <div className="w-full">
                        <h3 className="text-xs font-semibold text-gray-900 truncate">
                          {fullName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {driver.employeeId}
                        </p>
                      </div>

                      {/* Document Count */}
                      <div className="flex items-center gap-1 text-xs text-gray-600 pt-1.5 border-t border-gray-200 w-full justify-center">
                        <FileText className="w-3 h-3" />
                        <span>{docCount} {docCount === 1 ? 'doc' : 'docs'}</span>
                      </div>

                      {/* Compliance Badge */}
                      <div className="w-full">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[10px] text-xs font-medium ${
                          complianceStatus === 'Compliant'
                            ? 'bg-green-100 text-green-800'
                            : complianceStatus === 'Warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : complianceStatus === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {complianceStatus}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* No Results */}
          {filteredDrivers.length === 0 && (
            <section className="bg-white rounded-[10px] p-12 border border-gray-200 text-center">
              <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No folders found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search query</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default Storage