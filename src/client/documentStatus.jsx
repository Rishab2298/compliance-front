import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, User, AlertCircle, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, Eye, Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { getDocumentDownloadUrl } from '@/api/documents'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'

const API_URL = import.meta.env.VITE_API_URL

const DocumentStatus = () => {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { isDarkMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all') // all, expired, expiring, verified
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Fetch documents with pagination and status filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['documentStatus', selectedStatus, currentPage, searchQuery],
    queryFn: async () => {
      const token = await getToken()
      const params = new URLSearchParams({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: selectedStatus,
        search: searchQuery,
      })

      const response = await fetch(`${API_URL}/api/documents/document-status?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch document status')
      }

      const result = await response.json()
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  })

  const documents = data?.documents || []
  const totalPages = data?.totalPages || 1
  const totalCount = data?.totalCount || 0
  const statusCounts = data?.statusCounts || { all: 0, expired: 0, expiring: 0, verified: 0 }

  const getStatusBadge = (status) => {
    const lightVariants = {
      expired: { className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Expired' },
      expiring: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Expiring Soon' },
      verified: { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Verified' },
      pending: { className: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock, label: 'Pending' },
      valid: { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Verified' }, // Fallback for old data
    }

    const darkVariants = {
      expired: { className: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Expired' },
      expiring: { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'Expiring Soon' },
      verified: { className: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Verified' },
      pending: { className: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Clock, label: 'Pending' },
      valid: { className: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Verified' }, // Fallback for old data
    }

    const variants = isDarkMode ? darkVariants : lightVariants
    const config = variants[status] || variants.verified
    const Icon = config.icon

    return (
      <Badge className={`${config.className} border rounded-[10px] flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleViewDocument = async (doc) => {
    try {
      const token = await getToken()
      const url = await getDocumentDownloadUrl(doc.id, token)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error viewing document:', error)
      alert(`Failed to view document: ${error.message}`)
    }
  }

  const handleDownloadDocument = async (doc) => {
    try {
      const token = await getToken()
      const url = await getDocumentDownloadUrl(doc.id, token)

      const link = document.createElement('a')
      link.href = url
      link.download = doc.filename || `document-${doc.id}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading document:', error)
      alert(`Failed to download document: ${error.message}`)
    }
  }

  const statusFilters = [
    { value: 'all', label: 'All Documents', icon: FileText, count: statusCounts.all },
    { value: 'expired', label: 'Expired', icon: XCircle, count: statusCounts.expired },
    { value: 'expiring', label: 'Expiring Soon', icon: Clock, count: statusCounts.expiring },
    { value: 'verified', label: 'Verified', icon: CheckCircle, count: statusCounts.verified },
  ]

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`flex flex-col w-full min-h-screen ${getThemeClasses.bg.primary(isDarkMode)}`}>
        <header className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(isDarkMode)}`}>
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Document Status</h1>
          </div>
        </header>

        <div className="flex-1 py-8">
          <div className="container w-full px-6 mx-auto space-y-6">
            {/* Status Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`rounded-[10px] p-4 border ${getThemeClasses.bg.card(isDarkMode)}`}>
                  <div className="space-y-2">
                    <div className={`h-4 w-24 rounded animate-pulse ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
                    <div className={`h-8 w-16 rounded animate-pulse ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Search Skeleton */}
            <div className={`h-10 rounded-[10px] animate-pulse max-w-md ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'}`} />

            {/* Documents List Skeleton */}
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`rounded-[10px] p-4 border ${getThemeClasses.bg.card(isDarkMode)}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-[10px] animate-pulse ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
                    <div className="flex-1 space-y-2">
                      <div className={`h-4 w-48 rounded animate-pulse ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
                      <div className={`h-3 w-64 rounded animate-pulse ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
                    </div>
                    <div className={`h-6 w-20 rounded-[10px] animate-pulse ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col w-full min-h-screen ${getThemeClasses.bg.primary(isDarkMode)}`}>
        <header className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(isDarkMode)}`}>
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Document Status</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
            <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Failed to load documents: {error.message}</p>
            <Button onClick={() => window.location.reload()} className={`rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
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

      {/* Header */}
      <header className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(isDarkMode)}`}>
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <div>
            <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Document Status</h1>
            <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>{totalCount} total document{totalCount !== 1 ? 's' : ''}</p>
          </div>
          <Button
            onClick={() => navigate('/client/drivers')}
            className={`rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}
          >
            View All Drivers
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Status Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusFilters.map((filter) => (
              <Card
                key={filter.value}
                className={`cursor-pointer transition-all duration-200 rounded-[10px] border ${
                  selectedStatus === filter.value
                    ? isDarkMode
                      ? 'border-violet-500 shadow-lg shadow-violet-500/20 bg-slate-800/50'
                      : 'border-gray-900 shadow-md bg-white'
                    : isDarkMode
                      ? 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                      : 'border-gray-200 hover:border-gray-400 bg-white'
                }`}
                onClick={() => {
                  setSelectedStatus(filter.value)
                  setCurrentPage(1)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{filter.label}</p>
                      <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{filter.count}</p>
                    </div>
                    <div className={`p-3 rounded-[10px] ${
                      filter.value === 'expired'
                        ? isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                        : filter.value === 'expiring'
                        ? isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'
                        : filter.value === 'valid'
                        ? isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
                        : isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                    }`}>
                      <filter.icon className={`w-6 h-6 ${
                        filter.value === 'expired'
                          ? isDarkMode ? 'text-red-400' : 'text-red-600'
                          : filter.value === 'expiring'
                          ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                          : filter.value === 'valid'
                          ? isDarkMode ? 'text-green-400' : 'text-green-600'
                          : isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Search Section */}
          <section className={`rounded-[10px] p-4 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="relative max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
              <Input
                type="text"
                placeholder="Search by driver name, document type..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className={`pl-10 rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}
              />
            </div>
          </section>

          {/* Documents List */}
          <section className="space-y-3">
            {documents.map((doc) => {
              const fullName = `${doc.driver.firstName || ''} ${doc.driver.lastName || ''}`.trim() || 'Unknown Driver'
              const daysUntilExpiry = getDaysUntilExpiry(doc.expiryDate)

              return (
                <Card
                  key={doc.id}
                  className={`transition-all duration-200 border rounded-[10px] ${
                    isDarkMode
                      ? 'bg-slate-900/50 border-slate-700 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10'
                      : 'bg-white border-gray-200 hover:border-gray-900 hover:shadow-md'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Document Icon - Color-coded by status */}
                      <div className={`rounded-[10px] p-2.5 shrink-0 ${
                        doc.status === 'expired'
                          ? isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                          : doc.status === 'expiring'
                          ? isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'
                          : doc.status === 'pending'
                          ? isDarkMode ? 'bg-gray-500/20' : 'bg-gray-100'
                          : isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
                      }`}>
                        <FileText className={`w-6 h-6 ${
                          doc.status === 'expired'
                            ? isDarkMode ? 'text-red-400' : 'text-red-600'
                            : doc.status === 'expiring'
                            ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                            : doc.status === 'pending'
                            ? isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            : isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`} />
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>{doc.type || 'Document'}</h3>
                          {getStatusBadge(doc.status)}
                        </div>
                        <div className={`flex items-center gap-4 text-xs flex-wrap ${getThemeClasses.text.secondary(isDarkMode)}`}>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {fullName}
                          </span>
                          <span>•</span>
                          <span>Employee ID: {doc.driver.employeeId}</span>
                          <span>•</span>
                          <span>Expires: {formatDate(doc.expiryDate)}</span>
                          {daysUntilExpiry !== null && (
                            <>
                              <span>•</span>
                              <span className={
                                daysUntilExpiry < 0
                                  ? isDarkMode ? 'text-red-400 font-medium' : 'text-red-600 font-medium'
                                  : daysUntilExpiry <= 30
                                  ? isDarkMode ? 'text-yellow-400 font-medium' : 'text-yellow-600 font-medium'
                                  : getThemeClasses.text.secondary(isDarkMode)
                              }>
                                {daysUntilExpiry < 0
                                  ? `${Math.abs(daysUntilExpiry)} days overdue`
                                  : `${daysUntilExpiry} days remaining`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/client/driver/${doc.driver.id}`)}
                          className={`rounded-[10px] ${isDarkMode ? 'hover:bg-slate-700 hover:text-violet-400' : ''}`}
                        >
                          <User className="w-4 h-4 mr-2" />
                          View Driver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(doc)}
                          className={`rounded-[10px] ${isDarkMode ? 'hover:bg-slate-700 hover:text-violet-400' : ''}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc)}
                          className={`rounded-[10px] ${isDarkMode ? 'hover:bg-slate-700 hover:text-violet-400' : ''}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </section>

          {/* Empty State */}
          {documents.length === 0 && (
            <section className={`rounded-[10px] p-12 border text-center ${getThemeClasses.bg.card(isDarkMode)}`}>
              <FileText className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-700' : 'text-gray-300'}`} />
              <h3 className={`text-sm font-semibold mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>No documents found</h3>
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'No documents match the selected status filter'}
              </p>
            </section>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <section className={`flex items-center justify-between rounded-[10px] p-4 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} documents
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className={`text-sm px-3 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentStatus
