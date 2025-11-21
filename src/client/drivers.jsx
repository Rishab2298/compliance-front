import { DataTable } from '@/components/drivers-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import React, { useState } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useDrivers, useDocumentTypes, useDeleteDriver } from '@/hooks/useDrivers'
import { toast } from 'sonner'
import CSVUploadDialog from '@/components/CSVUploadDialog'
import { bulkImportDrivers } from '@/api/drivers'
import { useQueryClient } from '@tanstack/react-query'
import { Upload, AlertTriangle } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'
import { usePermissions } from '@/hooks/usePermissions'

const Drivers = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const { isDarkMode } = useTheme()
  const { hasCapability } = usePermissions()
  const companyId = user?.publicMetadata?.companyId
  const [csvDialogOpen, setCsvDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 20

  // Permission checks
  const canCreateDrivers = hasCapability('create_edit_drivers')
  const canDeleteDrivers = hasCapability('delete_documents')

  // Use cached queries with pagination
  const { data: driversData, isLoading: driversLoading, error: driversError } = useDrivers(currentPage, limit)
  const { data: documentTypes = [], isLoading: docTypesLoading } = useDocumentTypes(companyId)
  const deleteDriverMutation = useDeleteDriver()

  // Extract drivers and pagination from data
  const drivers = driversData?.drivers || []
  const pagination = driversData?.pagination || { currentPage: 1, totalPages: 1, totalCount: 0, limit: 20 }

  // Combined loading state
  const loading = driversLoading || docTypesLoading
  const error = driversError?.message

  const handleDeleteDriver = async (driverId, driverName) => {
    // Check permission before deleting
    if (!canDeleteDrivers) {
      toast.error('Permission denied', {
        description: 'You do not have permission to delete drivers.',
      })
      return
    }

    try {
      await deleteDriverMutation.mutateAsync(driverId)
      toast.success(`${driverName} has been deleted successfully`)
    } catch (err) {
      console.error('Error deleting driver:', err)
      toast.error(err.message || 'Failed to delete driver')
    }
  }

  const handleCSVUpload = async (driversData) => {
    // Check permission before uploading
    if (!canCreateDrivers) {
      toast.error('Permission denied', {
        description: 'You do not have permission to create drivers.',
      })
      return
    }

    try {
      const token = await getToken()
      const results = await bulkImportDrivers(driversData, token)

      // Refresh driver list if any were successful
      if (results.successful.length > 0) {
        await queryClient.invalidateQueries({ queryKey: ['drivers'] })
        toast.success(`Successfully imported ${results.successful.length} driver(s)`)
      }

      // Show limit warning if limit was reached
      if (results.limitReached) {
        toast.warning(`Driver limit reached!`, {
          description: `Successfully added ${results.successful.length} driver(s). ${results.failed.length} driver(s) could not be added. Please upgrade your plan to add more drivers.`,
          duration: 8000,
        })
      } else if (results.failed.length > 0) {
        // Show regular errors
        const failedDrivers = results.failed.slice(0, 3).map(f => `${f.firstName} ${f.lastName}: ${f.error}`).join('\n')
        const moreText = results.failed.length > 3 ? `\n...and ${results.failed.length - 3} more` : ''

        toast.error(`Failed to import ${results.failed.length} driver(s)`, {
          description: failedDrivers + moreText,
          duration: 6000,
        })
      }

      // If nothing succeeded and nothing failed, something is wrong
      if (results.successful.length === 0 && results.failed.length === 0) {
        toast.error('No drivers were imported. Please check your CSV file.')
      }
    } catch (error) {
      console.error('Error bulk uploading drivers:', error)
      throw error
    }
  }

  return (
    <div className={`flex flex-col w-full min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      <header className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(isDarkMode)}`}>
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Drivers Management</h1>
          <div className="flex items-center gap-3">
            {canCreateDrivers && (
              <Button
                onClick={() => setCsvDialogOpen(true)}
                variant="outline"
                className={`rounded-[10px] gap-2 ${getThemeClasses.button.secondary(isDarkMode)}`}
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </Button>
            )}
            <Button
              onClick={() => window.location.href = '/client/settings'}
              className={`rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}
            >
              Settings
            </Button>
          </div>
        </div>
      </header>
      <div className='flex-1 py-8'>
        {loading ? (
          <div className="container w-full px-6 mx-auto space-y-6">
            {/* Toolbar Skeleton */}
            <div className={`rounded-[10px] p-4 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-64 rounded-[10px]" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-32 rounded-[10px]" />
                  <Skeleton className="h-10 w-32 rounded-[10px]" />
                </div>
              </div>
            </div>

            {/* Table Skeleton */}
            <div className={`rounded-[10px] border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="p-4 space-y-3">
                {/* Table Header */}
                <div className={`flex items-center gap-4 pb-3 border-b ${getThemeClasses.border.primary(isDarkMode)}`}>
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
            <div className={`p-6 rounded-[10px] border ${getThemeClasses.alert.critical(isDarkMode)}`}>
              <div className="flex items-center justify-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Error loading drivers: {error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DataTable
              data={drivers}
              documentTypes={documentTypes}
              onDeleteDriver={handleDeleteDriver}
              canDelete={canDeleteDrivers}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="container w-full px-6 mx-auto mt-6">
                <div className={`rounded-[10px] border ${getThemeClasses.bg.card(isDarkMode)} p-4 flex items-center justify-between`}>
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} drivers
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={pagination.currentPage === 1}
                      className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                    >
                      Previous
                    </Button>
                    <span className={`text-sm px-3 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CSVUploadDialog
        isOpen={csvDialogOpen}
        onClose={() => setCsvDialogOpen(false)}
        onUpload={handleCSVUpload}
      />
    </div>
  )
}

export default Drivers
