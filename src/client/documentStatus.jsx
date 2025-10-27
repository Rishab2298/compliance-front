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

const API_URL = import.meta.env.VITE_API_URL

const DocumentStatus = () => {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all') // all, expired, expiring, valid
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
  const statusCounts = data?.statusCounts || { all: 0, expired: 0, expiring: 0, valid: 0 }

  const getStatusBadge = (status) => {
    const variants = {
      expired: { className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Expired' },
      expiring: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Expiring Soon' },
      valid: { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Valid' },
    }

    const config = variants[status] || variants.valid
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
    { value: 'valid', label: 'Valid', icon: CheckCircle, count: statusCounts.valid },
  ]

  // Loading skeleton
  if (isLoading) {
    return (
      <div className='flex flex-col w-full bg-gray-50 min-h-screen'>
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <h1 className="text-xl font-semibold text-gray-900">Document Status</h1>
          </div>
        </header>

        <div className="flex-1 py-8">
          <div className="container w-full px-6 mx-auto space-y-6">
            {/* Status Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-[10px] p-4 border border-gray-200">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            {/* Search Skeleton */}
            <div className="h-10 bg-gray-200 rounded-[10px] animate-pulse max-w-md" />

            {/* Documents List Skeleton */}
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-[10px] p-4 border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-[10px] animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-64 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded-[10px] animate-pulse" />
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
      <div className='flex flex-col w-full bg-gray-50 min-h-screen'>
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <h1 className="text-xl font-semibold text-gray-900">Document Status</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-red-600">Failed to load documents: {error.message}</p>
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
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Document Status</h1>
            <p className="text-sm text-gray-500">{totalCount} total document{totalCount !== 1 ? 's' : ''}</p>
          </div>
          <Button
            onClick={() => navigate('/client/drivers')}
            className="bg-gray-800 text-white hover:bg-gray-900 rounded-[10px]"
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
                className={`cursor-pointer transition-all duration-200 rounded-[10px] ${
                  selectedStatus === filter.value
                    ? 'border-gray-900 shadow-md'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => {
                  setSelectedStatus(filter.value)
                  setCurrentPage(1)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{filter.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{filter.count}</p>
                    </div>
                    <div className={`p-3 rounded-[10px] ${
                      filter.value === 'expired' ? 'bg-red-100' :
                      filter.value === 'expiring' ? 'bg-yellow-100' :
                      filter.value === 'valid' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      <filter.icon className={`w-6 h-6 ${
                        filter.value === 'expired' ? 'text-red-600' :
                        filter.value === 'expiring' ? 'text-yellow-600' :
                        filter.value === 'valid' ? 'text-green-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Search Section */}
          <section className="bg-white rounded-[10px] p-4 border border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by driver name, document type..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 rounded-[10px]"
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
                  className="hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-900 rounded-[10px] bg-white"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Document Icon */}
                      <div className="bg-gray-100 rounded-[10px] p-2.5 shrink-0">
                        <FileText className="w-6 h-6 text-gray-700" />
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">{doc.type || 'Document'}</h3>
                          {getStatusBadge(doc.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
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
                                daysUntilExpiry < 0 ? 'text-red-600 font-medium' :
                                daysUntilExpiry <= 30 ? 'text-yellow-600 font-medium' :
                                'text-gray-500'
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
                          className="rounded-[10px]"
                        >
                          <User className="w-4 h-4 mr-2" />
                          View Driver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(doc)}
                          className="rounded-[10px]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc)}
                          className="rounded-[10px]"
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
            <section className="bg-white rounded-[10px] p-12 border border-gray-200 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No documents found</h3>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'No documents match the selected status filter'}
              </p>
            </section>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <section className="flex items-center justify-between bg-white rounded-[10px] p-4 border border-gray-200">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-[10px]"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-[10px]"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
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
