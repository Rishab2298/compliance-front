import { DataTable } from '@/components/drivers-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { useDrivers, useDocumentTypes, useDeleteDriver } from '@/hooks/useDrivers'
import { toast } from 'sonner'

const Drivers = () => {
  const { user } = useUser()
  const companyId = user?.publicMetadata?.companyId

  // Use cached queries
  const { data: drivers = [], isLoading: driversLoading, error: driversError } = useDrivers()
  const { data: documentTypes = [], isLoading: docTypesLoading } = useDocumentTypes(companyId)
  const deleteDriverMutation = useDeleteDriver()

  // Combined loading state
  const loading = driversLoading || docTypesLoading
  const error = driversError?.message

  const handleDeleteDriver = async (driverId, driverName) => {
    try {
      await deleteDriverMutation.mutateAsync(driverId)
      toast.success(`${driverName} has been deleted successfully`)
    } catch (err) {
      console.error('Error deleting driver:', err)
      toast.error(err.message || 'Failed to delete driver')
    }
  }

  return (
    <div className='flex flex-col w-full min-h-screen bg-gray-50'>
      <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">Drivers Management</h1>
          <Button
            onClick={() => window.location.href = '/client/settings'}
            className="bg-gray-800 text-white hover:bg-gray-900 rounded-[10px]"
          >
            Settings
          </Button>
        </div>
      </header>
      <div className='flex-1 py-8'>
        {loading ? (
          <div className="container w-full px-6 mx-auto space-y-6">
            {/* Toolbar Skeleton */}
            <div className="bg-white rounded-[10px] p-4 border border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-64 rounded-[10px]" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-32 rounded-[10px]" />
                  <Skeleton className="h-10 w-32 rounded-[10px]" />
                </div>
              </div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-[10px] border border-gray-200">
              <div className="p-4 space-y-3">
                {/* Table Header */}
                <div className="flex items-center gap-4 pb-3 border-b border-gray-200">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 w-32 rounded-[10px]" />
                  <Skeleton className="h-4 w-24 rounded-[10px]" />
                  <Skeleton className="h-4 w-24 rounded-[10px]" />
                  <Skeleton className="h-4 w-32 rounded-[10px]" />
                  <Skeleton className="h-4 flex-1 rounded-[10px]" />
                </div>

                {/* Table Rows */}
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 w-32 rounded-[10px]" />
                    <Skeleton className="h-4 w-24 rounded-[10px]" />
                    <Skeleton className="h-4 w-24 rounded-[10px]" />
                    <Skeleton className="h-4 w-32 rounded-[10px]" />
                    <Skeleton className="h-4 flex-1 rounded-[10px]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48 rounded-[10px]" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-[10px]" />
                <Skeleton className="h-10 w-10 rounded-[10px]" />
                <Skeleton className="h-10 w-10 rounded-[10px]" />
                <Skeleton className="h-10 w-10 rounded-[10px]" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="container w-full px-6 mx-auto">
            <div className="p-6 text-center border border-red-200 rounded-[10px] bg-red-50">
              <p className="text-sm text-red-800">Error loading drivers: {error}</p>
            </div>
          </div>
        ) : (
          <DataTable
            data={drivers}
            documentTypes={documentTypes}
            onDeleteDriver={handleDeleteDriver}
          />
        )}
      </div>
    </div>
  )
}

export default Drivers
