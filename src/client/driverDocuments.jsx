import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Download, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useDriver, useDriverDocuments } from '@/hooks/useDrivers'
import { getDocumentDownloadUrl } from '@/api/documents'
import { useAuth } from '@clerk/clerk-react'
import { calculateDocumentStatus, calculateDriverComplianceStatus } from '@/utils/documentStatusUtils'

const DriverDocuments = () => {
  const { driverId } = useParams()
  const navigate = useNavigate()
  const { getToken } = useAuth()

  // Fetch driver data with caching
  const { data: driver, isLoading: driverLoading, error: driverError } = useDriver(driverId)

  // Fetch driver documents with caching
  const { data: documents = [], isLoading: documentsLoading, error: documentsError } = useDriverDocuments(driverId)

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'valid':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'expiring soon':
      case 'expiring':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'pending':
      case 'processing':
        return <AlertCircle className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    if (!status) status = 'Pending'

    const variants = {
      'verified': 'bg-green-100 text-green-800 border-green-200',
      'valid': 'bg-green-100 text-green-800 border-green-200',
      'active': 'bg-green-100 text-green-800 border-green-200',
      'expired': 'bg-red-100 text-red-800 border-red-200',
      'expiring soon': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'expiring': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pending': 'bg-gray-100 text-gray-800 border-gray-200',
      'processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'compliant': 'bg-green-100 text-green-800 border-green-200',
      'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'critical': 'bg-red-100 text-red-800 border-red-200',
    }

    const variant = variants[status.toLowerCase()] || variants.pending

    return (
      <Badge className={`${variant} border rounded-[10px]`} variant="outline">
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Use shared utility for consistent status calculation across the app
  const getDocumentStatus = (doc) => {
    const status = calculateDocumentStatus(doc)
    // Capitalize first letter for display
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Use shared utility for consistent compliance calculation across the app
  const getComplianceStatus = () => {
    return calculateDriverComplianceStatus(documents, documents?.length || 0)
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

      // Create a temporary link to trigger download
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

  // Loading state with skeletons
  if (driverLoading || documentsLoading) {
    return (
      <div className='flex flex-col w-full bg-gray-50 min-h-screen'>
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center gap-4 w-full px-6 mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/client/storage')}
              className="rounded-[10px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="ml-auto flex items-center gap-3">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 rounded-[10px] animate-pulse" />
            </div>
          </div>
        </header>

        <div className={`flex-1 py-8 ${getThemeClasses.bg.primary(isDarkMode)}`}>
          <div className="container w-full px-6 mx-auto space-y-6">
            {/* Driver Info Section Skeleton */}
            <section className="bg-white rounded-[10px] p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </section>

            {/* Documents List Skeleton */}
            <section className="bg-white rounded-[10px] border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="divide-y divide-gray-200">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-[10px] animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-64 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-20 bg-gray-200 rounded-[10px] animate-pulse" />
                        <div className="h-8 w-10 bg-gray-200 rounded-[10px] animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (driverError || documentsError) {
    return (
      <div className='flex flex-col w-full bg-gray-50 min-h-screen'>
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center gap-4 w-full px-6 mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/client/storage')}
              className="rounded-[10px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Error</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-red-600">
              {driverError?.message || documentsError?.message || 'Failed to load data'}
            </p>
            <Button onClick={() => navigate('/client/storage')} className="rounded-[10px]">
              Back to Storage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Driver not found
  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Employee not found</h2>
        <Button onClick={() => navigate('/client/storage')}>Back to Storage</Button>
      </div>
    )
  }

  const fullName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Unknown Employee'
  const complianceStatus = getComplianceStatus()

  return (
    <div className='flex flex-col w-full bg-gray-50 min-h-screen'>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
        <div className="container flex items-center gap-4 w-full px-6 mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/client/storage')}
            className="rounded-[10px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">
            {fullName}'s Documents
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-sm text-gray-900">
              Employee ID: <span className="font-semibold">{driver.employeeId}</span>
            </div>
            {getStatusBadge(complianceStatus)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`flex-1 py-8 ${getThemeClasses.bg.primary(isDarkMode)}`}>
        <div className="container w-full px-6 mx-auto space-y-6">
          {/* Driver Info Section */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{driver.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{driver.phone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                <div className="mt-1">
                  {getStatusBadge(complianceStatus)}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Documents</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{documents.length} {documents.length === 1 ? 'file' : 'files'}</p>
              </div>
            </div>
          </section>

          {/* Documents List */}
          <section className="bg-white rounded-[10px] border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => {
                const status = getDocumentStatus(doc)
                return (
                  <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Document Icon */}
                        <div className="bg-gray-100 rounded-[10px] p-2.5">
                          <FileText className="w-5 h-5 text-gray-700" />
                        </div>

                        {/* Document Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900">{doc.type || 'Document'}</h3>
                            {getStatusBadge(status)}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{doc.filename}</span>
                            {doc.expiryDate && (
                              <>
                                <span>•</span>
                                <span>Expires: {formatDate(doc.expiryDate)}</span>
                              </>
                            )}
                            {doc.createdAt && (
                              <>
                                <span>•</span>
                                <span>Uploaded: {formatDate(doc.createdAt)}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-[10px]"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-[10px]"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Empty State */}
          {documents.length === 0 && (
            <section className="bg-white rounded-[10px] p-12 border border-gray-200 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No documents found</h3>
              <p className="text-sm text-gray-500">This employee has no documents uploaded yet</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default DriverDocuments
