import { DataTable } from '@/components/drivers-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import React, { useState } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { useDrivers, useDocumentTypes, useDeleteDriver } from '@/hooks/useDrivers'
import { toast } from 'sonner'
import CSVUploadDialog from '@/components/CSVUploadDialog'
import { bulkImportDrivers } from '@/api/drivers'
import { useQueryClient } from '@tanstack/react-query'
import { Upload, AlertTriangle } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'
import { usePermissions } from '@/hooks/usePermissions'
import { DashboardHeader } from '@/components/DashboardHeader'

const Drivers = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const { isDarkMode } = useTheme()
  const { hasCapability } = usePermissions()
  const { t } = useTranslation()
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
      toast.error(t('drivers.toasts.permissionDenied'), {
        description: t('drivers.toasts.noPermissionDelete'),
      })
      return
    }

    try {
      await deleteDriverMutation.mutateAsync(driverId)
      toast.success(`${driverName} ${t('drivers.toasts.deletedSuccess')}`)
    } catch (err) {
      console.error('Error deleting driver:', err)
      toast.error(err.message || t('drivers.toasts.deleteError'))
    }
  }

  const handleCSVUpload = async (driversData) => {
    // Check permission before uploading
    if (!canCreateDrivers) {
      toast.error(t('drivers.toasts.permissionDenied'), {
        description: t('drivers.toasts.noPermissionCreate'),
      })
      return
    }

    try {
      const token = await getToken()
      const results = await bulkImportDrivers(driversData, token)

      // Refresh driver list if any were successful
      if (results.successful.length > 0) {
        await queryClient.invalidateQueries({ queryKey: ['drivers'] })
        toast.success(`${t('drivers.toasts.importSuccess')} ${results.successful.length} ${t('drivers.toasts.importSuccessPlural')}`)
      }

      // Show limit warning if limit was reached
      if (results.limitReached) {
        toast.warning(t('drivers.toasts.limitReached'), {
          description: `${t('drivers.toasts.limitReachedDesc')} ${results.successful.length} ${t('drivers.toasts.importSuccessPlural')}. ${results.failed.length} ${t('drivers.toasts.limitReachedDescEnd')}`,
          duration: 8000,
        })
      } else if (results.failed.length > 0) {
        // Show regular errors
        const failedDrivers = results.failed.slice(0, 3).map(f => `${f.firstName} ${f.lastName}: ${f.error}`).join('\n')
        const moreText = results.failed.length > 3 ? `\n...and ${results.failed.length - 3} more` : ''

        toast.error(`${t('drivers.toasts.importFailed')} ${results.failed.length} ${t('drivers.toasts.importFailedSuffix')}`, {
          description: failedDrivers + moreText,
          duration: 6000,
        })
      }

      // If nothing succeeded and nothing failed, something is wrong
      if (results.successful.length === 0 && results.failed.length === 0) {
        toast.error(t('drivers.toasts.noEmployeesImported'))
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

      <DashboardHeader title={t('drivers.title')}>
        <div className="flex items-center gap-2">
          {canCreateDrivers && (
            <>
              <Button
                onClick={() => setCsvDialogOpen(true)}
                variant="outline"
                className={`rounded-[10px] gap-2 hidden sm:flex ${getThemeClasses.button.secondary(isDarkMode)}`}
              >
                <Upload className="w-4 h-4" />
                {t('drivers.importCSV')}
              </Button>
              <Button
                onClick={() => setCsvDialogOpen(true)}
                variant="outline"
                className={`rounded-[10px] sm:hidden ${getThemeClasses.button.secondary(isDarkMode)}`}
                size="icon"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button
            onClick={() => window.location.href = '/client/settings'}
            className={`rounded-[10px] hidden sm:flex ${getThemeClasses.button.primary(isDarkMode)}`}
          >
            {t('drivers.settings')}
          </Button>
        </div>
      </DashboardHeader>
      <div className={`flex-1 py-8 ${getThemeClasses.bg.primary(isDarkMode)}`}>
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
                <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{t('drivers.errorLoading')} {error}</p>
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
                    {t('drivers.pagination.showing')} {((pagination.currentPage - 1) * pagination.limit) + 1} {t('drivers.pagination.to')} {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} {t('drivers.pagination.of')} {pagination.totalCount} {t('drivers.pagination.employees')}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={pagination.currentPage === 1}
                      className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                    >
                      {t('drivers.pagination.previous')}
                    </Button>
                    <span className={`text-sm px-3 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      {t('drivers.pagination.page')} {pagination.currentPage} {t('drivers.pagination.of')} {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                    >
                      {t('drivers.pagination.next')}
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
