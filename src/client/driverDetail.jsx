import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Mail, Phone, Calendar, FileText, Download, Eye, Upload, Save, Loader2, Edit2, X, Send, ChevronDown, ChevronUp, FileEdit, Trash2, Pencil, Bell, Clock, CheckCircle2 } from 'lucide-react'
import { useDriver, useUpdateDriver, useRequestDocuments, useDocumentTypes, useDriverDocuments } from '@/hooks/useDrivers'
import { useReminderHistory } from '@/hooks/useReminders'
import { useCurrentPlan } from '@/hooks/useBilling'
import { useUser, useAuth } from '@clerk/clerk-react'
import { toast } from 'sonner'
import DocumentUpload from '@/components/DocumentUpload'
import DocumentDetailsModal from '@/components/DocumentDetailsModal'
import DocumentEditModal from '@/components/DocumentEditModal'
import { useQueryClient } from '@tanstack/react-query'
import { getDocumentDownloadUrl, deleteDocument } from '@/api/documents'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Reminder History Section Component
const ReminderHistorySection = ({ documentId, isDarkMode }) => {
  const { data: reminderHistory, isLoading, error } = useReminderHistory(documentId)

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status) => {
    const configs = {
      SENT: {
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2,
        label: 'Sent',
      },
      FAILED: {
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: X,
        label: 'Failed',
      },
      PENDING: {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pending',
      },
    }

    const config = configs[status] || configs.PENDING
    const Icon = config.icon

    return (
      <Badge className={`${config.className} border rounded-[10px] flex items-center gap-1 text-xs`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getChannelBadge = (channel) => {
    const configs = {
      EMAIL: {
        className: 'bg-blue-100 text-blue-800',
        label: 'Email',
      },
      SMS: {
        className: 'bg-purple-100 text-purple-800',
        label: 'SMS',
      },
    }

    const config = configs[channel] || configs.EMAIL

    return (
      <Badge className={`${config.className} rounded-[10px] text-xs`}>
        {config.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className={`px-6 pb-6 border-t ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.primary(isDarkMode)}`}>
        <div className="flex items-center gap-2 py-4">
          <Loader2 className={`w-4 h-4 animate-spin ${getThemeClasses.text.muted(isDarkMode)}`} />
          <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Loading reminder history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 pb-6 border-t border-gray-200 bg-red-50">
        <div className="flex items-center gap-2 py-4">
          <X className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600">Failed to load reminder history</p>
        </div>
      </div>
    )
  }

  const history = reminderHistory || []

  return (
    <div className={`px-6 pb-6 border-t ${getThemeClasses.border.primary(isDarkMode)} bg-blue-50`}>
      <div className="py-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-blue-900">Reminder History</h4>
          <Badge className="bg-blue-100 text-blue-800 rounded-[10px] text-xs">
            {history.length} reminder{history.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {history.length === 0 ? (
          <div className={`${getThemeClasses.bg.card(isDarkMode)} rounded-[10px] p-6 text-center border border-blue-200`}>
            <Bell className={`w-8 h-8 mx-auto mb-2 ${getThemeClasses.text.muted(isDarkMode)}`} />
            <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>No reminders sent yet</p>
            <p className={`text-xs ${getThemeClasses.text.muted(isDarkMode)} mt-1`}>
              Reminders will appear here when sent
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((reminder) => (
              <div
                key={reminder.id}
                className={`${getThemeClasses.bg.card(isDarkMode)} rounded-[10px] p-4 border border-blue-200`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(reminder.status)}
                      {getChannelBadge(reminder.channel)}
                      <span className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        {reminder.daysBeforeExpiry} day{reminder.daysBeforeExpiry !== 1 ? 's' : ''} before expiry
                      </span>
                    </div>
                    <p className={`text-xs ${getThemeClasses.text.primary(isDarkMode)} mb-2 line-clamp-2`}>
                      {reminder.message || 'Reminder sent to driver'}
                    </p>
                    <div className={`flex items-center gap-4 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Sent: {formatDateTime(reminder.sentAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const DriverDetail = () => {
  const { driverId } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const { getToken } = useAuth()
  const companyId = user?.publicMetadata?.companyId
  const queryClient = useQueryClient()
  const { isDarkMode } = useTheme()

  // Use cached query
  const { data: driver, isLoading: loading, error } = useDriver(driverId)
  const updateDriverMutation = useUpdateDriver(driverId)
  const { data: currentPlanData } = useCurrentPlan()
  const requestDocumentsMutation = useRequestDocuments()
  const { data: documentTypes = [] } = useDocumentTypes(companyId)
  const { data: allDocuments = [] } = useDriverDocuments(driverId)

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)

  // Upload section state
  const [showUpload, setShowUpload] = useState(false)

  // Document details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Document edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState(null)

  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)

  // Loading states for document actions
  const [viewingDocumentId, setViewingDocumentId] = useState(null)
  const [downloadingDocumentId, setDownloadingDocumentId] = useState(null)
  const [sendingEmailForDocId, setSendingEmailForDocId] = useState(null)
  const [deletingDocumentId, setDeletingDocumentId] = useState(null)

  // Reminder history state
  const [expandedReminderDocId, setExpandedReminderDocId] = useState(null)

  // Get pending documents (need manual entry)
  const pendingDocuments = allDocuments.filter(doc => doc.status === 'PENDING')

  // Store a snapshot of pending documents when modal opens
  const [pendingDocumentsSnapshot, setPendingDocumentsSnapshot] = useState([])

  // Get editable documents (those with expiry date)
  const editableDocuments = allDocuments.filter(doc => doc.expiryDate)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  // Store original data for cancel
  const [originalData, setOriginalData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  // Populate form when driver data loads
  useEffect(() => {
    if (driver) {
      const data = {
        name: driver.name || '',
        email: driver.email || '',
        phone: driver.phone || '',
      }
      setFormData(data)
      setOriginalData(data)
    }
  }, [driver])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      await updateDriverMutation.mutateAsync(formData)
      toast.success('Driver information updated successfully')
      setOriginalData(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating driver:', error)
      toast.error(error.message || 'Failed to update driver information')
    }
  }

  const handleRequestDocuments = async () => {
    if (!driver?.email) {
      toast.error('Driver email is required to send document request')
      return
    }

    if (!documentTypes || documentTypes.length === 0) {
      toast.error('No document types configured. Please add document types in settings.')
      return
    }

    try {
      // documentTypes is already an array of strings ["Driver's License", "Insurance", etc.]
      await requestDocumentsMutation.mutateAsync({
        driverId: driver.id,
        email: driver.email,
        phone: driver.phone,
        requestedDocuments: documentTypes,
        sendEmail: true,
        sendSMS: false,
      })

      toast.success('Document request sent successfully to ' + driver.email)
    } catch (error) {
      console.error('Error sending document request:', error)
      toast.error(error.message || 'Failed to send document request')
    }
  }

  const handleUploadComplete = async () => {
    console.log('📤 Documents uploaded, refreshing data...')

    // Invalidate queries first
    await queryClient.invalidateQueries({ queryKey: ['driver', driverId] })
    await queryClient.invalidateQueries({ queryKey: ['documents', driverId] })

    // Add small delay to ensure backend has processed everything
    await new Promise(resolve => setTimeout(resolve, 500))

    // Force immediate refetch of drivers list to update table
    await queryClient.refetchQueries({ queryKey: ['drivers'] })

    console.log('✅ Upload complete, all data refreshed')

    // Show notification about pending documents
    if (documentTypes.length > 0) {
      toast.info('Documents uploaded! Click "Enter Details" to add document information.');
    }
  }

  const handleDocumentDetailsSaved = () => {
    console.log('🔄 Document details saved, marking queries as stale...')

    // Just mark queries as stale, don't refetch yet
    // This allows the modal to continue working without the documents array changing
    queryClient.invalidateQueries({ queryKey: ['driver', driverId] })
    queryClient.invalidateQueries({ queryKey: ['documents', driverId] })
    queryClient.invalidateQueries({ queryKey: ['drivers'] })

    console.log('✅ Queries marked as stale, will refetch when modal closes')
  }

  const handleDetailsModalClose = async () => {
    console.log('🔄 Details modal closing, refreshing all data...')

    setShowDetailsModal(false)

    // Now do the full refresh after modal is closed
    await queryClient.invalidateQueries({ queryKey: ['driver', driverId] })
    await queryClient.invalidateQueries({ queryKey: ['documents', driverId] })

    // Add small delay to ensure backend has fully updated document status
    await new Promise(resolve => setTimeout(resolve, 500))

    // Force immediate refetch of drivers list to update compliance score in table
    await queryClient.refetchQueries({ queryKey: ['drivers'] })

    console.log('✅ All data refreshed after modal closed')
  }

  const handleEditDocument = (docId) => {
    setSelectedDocumentId(docId)
    setShowEditModal(true)
  }

  const handleEditModalClose = async () => {
    console.log('🔄 Edit modal closing, refreshing all data...')

    setShowEditModal(false)
    setSelectedDocumentId(null)

    // Now do the full refresh after modal is closed
    await queryClient.invalidateQueries({ queryKey: ['driver', driverId] })
    await queryClient.invalidateQueries({ queryKey: ['documents', driverId] })

    // Add small delay to ensure backend has fully updated document status
    await new Promise(resolve => setTimeout(resolve, 500))

    // Force immediate refetch of drivers list to update compliance score in table
    await queryClient.refetchQueries({ queryKey: ['drivers'] })

    console.log('✅ All data refreshed after edit modal closed')
  }

  const handleViewDocument = async (docId) => {
    setViewingDocumentId(docId)
    try {
      const token = await getToken()
      const url = await getDocumentDownloadUrl(docId, token)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error viewing document:', error)
      toast.error(`Failed to view document: ${error.message}`)
    } finally {
      setViewingDocumentId(null)
    }
  }

  const handleDownloadDocument = async (docId, filename) => {
    setDownloadingDocumentId(docId)
    try {
      const token = await getToken()
      const url = await getDocumentDownloadUrl(docId, token)

      // Fetch the file as a blob to ensure proper download
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch document')
      }

      const blob = await response.blob()

      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename || `document-${docId}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl)

      toast.success('Download completed')
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error(`Failed to download document: ${error.message}`)
    } finally {
      setDownloadingDocumentId(null)
    }
  }

  const handleDeleteDocument = (doc) => {
    setDocumentToDelete(doc)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return

    // Set loading state for the delete button
    setDeletingDocumentId(documentToDelete.id)

    try {
      const token = await getToken()
      await deleteDocument(documentToDelete.id, token)

      toast.success('Document deleted successfully')

      console.log('🗑️ Document deleted, refreshing data...')

      // Invalidate queries to refetch
      await queryClient.invalidateQueries({ queryKey: ['driver', driverId] })
      await queryClient.invalidateQueries({ queryKey: ['documents', driverId] })

      // Add small delay to ensure backend has processed everything
      await new Promise(resolve => setTimeout(resolve, 500))

      // Force immediate refetch of drivers list to update compliance score
      await queryClient.refetchQueries({ queryKey: ['drivers'] })

      console.log('✅ Data refreshed after deletion')

      setShowDeleteDialog(false)
      setDocumentToDelete(null)
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error(`Failed to delete document: ${error.message}`)
    } finally {
      // Clear loading state
      setDeletingDocumentId(null)
    }
  }

  const handleRequestDocumentUpdate = async (doc) => {
    if (!driver?.email) {
      toast.error('Driver email is required to send document request')
      return
    }

    setSendingEmailForDocId(doc.id)
    try {
      await requestDocumentsMutation.mutateAsync({
        driverId: driver.id,
        email: driver.email,
        phone: driver.phone,
        requestedDocuments: [doc.type], // Only request this specific document type
        sendEmail: true,
        sendSMS: false,
      })

      toast.success(`Document update request sent to ${driver.email}`, {
        description: `Driver will be asked to upload a fresh copy of ${doc.type}`,
      })
    } catch (error) {
      console.error('Error sending document update request:', error)
      toast.error(error.message || 'Failed to send document request')
    } finally {
      setSendingEmailForDocId(null)
    }
  }

  const saving = updateDriverMutation.isPending
  const sendingRequest = requestDocumentsMutation.isPending

  const getStatusBadge = (status) => {
    const variants = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'EXPIRING_SOON': 'bg-yellow-100 text-yellow-800',
      'EXPIRED': 'bg-red-100 text-red-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'PENDING': 'bg-gray-100 text-gray-800',
    }

    const labels = {
      'ACTIVE': 'Verified',
      'EXPIRING_SOON': 'Expiring Soon',
      'EXPIRED': 'Expired',
      'PROCESSING': 'Processing',
      'PENDING': 'Pending',
    }

    return (
      <Badge className={`${variants[status] || variants.PENDING} rounded-[10px] border-0`}>
        {labels[status] || status}
      </Badge>
    )
  }

  const calculateComplianceScore = () => {
    // If no document types configured, return 0
    if (!documentTypes || documentTypes.length === 0) {
      console.log('⚠️ No document types configured')
      return 0
    }

    // If no documents uploaded, return 0
    if (!driver?.documents || driver.documents.length === 0) {
      console.log('⚠️ No documents uploaded')
      return 0
    }

    console.log('📊 Calculating compliance score:')
    console.log('  Required document types:', documentTypes)
    console.log('  Driver documents:', driver.documents)

    // Count how many required document types have at least one ACTIVE document
    const verifiedDocumentTypes = documentTypes.filter(docType => {
      const hasActive = driver.documents.some(doc =>
        doc.type === docType && doc.status === 'ACTIVE'
      )
      console.log(`  ${docType}: ${hasActive ? '✅ ACTIVE' : '❌ Not active'}`)
      return hasActive
    })

    // Calculate percentage
    const score = (verifiedDocumentTypes.length / documentTypes.length) * 100
    console.log(`  Final score: ${verifiedDocumentTypes.length}/${documentTypes.length} = ${Math.round(score)}%`)
    return Math.round(score)
  }

  const getComplianceScoreBadge = (score) => {
    let bgColor, textColor, borderColor

    if (score >= 81) {
      // Green for 81-100%
      bgColor = 'bg-green-100'
      textColor = 'text-green-800'
      borderColor = 'border-green-200'
    } else if (score >= 51) {
      // Yellow for 51-80%
      bgColor = 'bg-yellow-100'
      textColor = 'text-yellow-800'
      borderColor = 'border-yellow-200'
    } else {
      // Red for 0-50%
      bgColor = 'bg-red-100'
      textColor = 'text-red-800'
      borderColor = 'border-red-200'
    }

    return (
      <div className="flex items-center gap-2">
        <Badge className={`${bgColor} ${textColor} ${borderColor} border rounded-[10px] px-3 py-1`}>
          <span className="text-base font-semibold">{score}%</span>
        </Badge>
        <span className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>Compliant</span>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className={`flex flex-col w-full min-h-screen ${getThemeClasses.bg.primary(isDarkMode)}`}>
        <header className={`sticky top-0 z-10 flex items-center h-16 ${getThemeClasses.bg.header(isDarkMode)} ${getThemeClasses.border.primary(isDarkMode)} border-b shrink-0`}>
          <div className="container flex items-center w-full gap-4 px-6 mx-auto">
            <Skeleton className="h-10 w-20 rounded-[10px]" />
            <Skeleton className="h-6 w-48 rounded-[10px]" />
          </div>
        </header>
        <div className="flex-1 py-8">
          <div className="container w-full px-6 mx-auto space-y-6">
            <Skeleton className="h-32 w-full rounded-[10px]" />
            <Skeleton className="h-64 w-full rounded-[10px]" />
          </div>
        </div>
      </div>
    )
  }

  if ((error || !driver) && !loading) {
    return (
      <div className={`flex flex-col w-full min-h-screen ${getThemeClasses.bg.primary(isDarkMode)}`}>
        <header className={`sticky top-0 z-10 flex items-center h-16 ${getThemeClasses.bg.header(isDarkMode)} ${getThemeClasses.border.primary(isDarkMode)} border-b shrink-0`}>
          <div className="container flex items-center w-full gap-4 px-6 mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/client/drivers')}
              className="rounded-[10px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </header>
        <div className="flex-1 py-8">
          <div className="container w-full px-6 mx-auto">
            <div className="p-6 text-center border border-red-200 rounded-[10px] bg-red-50">
              <p className="text-sm text-red-800">Driver not found</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const complianceScore = calculateComplianceScore()
  const initials = driver.name.split(' ').map(n => n[0]).join('').substring(0, 2)

  return (
    <div className={`relative flex flex-col w-full min-h-screen ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-10 flex items-center h-16 ${getThemeClasses.bg.header(isDarkMode)} ${getThemeClasses.border.primary(isDarkMode)} border-b shrink-0`}>
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/client/drivers')}
              className="rounded-[10px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Driver Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRequestDocuments}
              disabled={sendingRequest}
              className="rounded-[10px]"
            >
              {sendingRequest ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mailing
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Request Documents
                </>
              )}
            </Button>

            {!isEditing ? (
              <Button
                onClick={handleEdit}
                className="bg-gray-800 text-white hover:bg-gray-900 rounded-[10px]"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-[10px]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gray-800 text-white hover:bg-gray-900 rounded-[10px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Driver Profile Section */}
          <section className={`${getThemeClasses.bg.card(isDarkMode)} ${getThemeClasses.border.primary(isDarkMode)} rounded-[10px] p-6 border`}>
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex items-center justify-center w-20 h-20 text-2xl font-semibold text-white bg-gray-700 rounded-full shrink-0">
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="max-w-md">
                        <Label className={`text-xs font-medium tracking-wider ${getThemeClasses.text.secondary(isDarkMode)} uppercase`}>Driver Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-2 rounded-[10px]"
                          placeholder="Enter driver name"
                        />
                      </div>
                    ) : (
                      <div>
                        <h2 className={`text-2xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>{formData.name}</h2>
                        <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>{driver.contact || 'No employee ID'}</p>
                      </div>
                    )}
                  </div>
                  {getComplianceScoreBadge(complianceScore)}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Email */}
                  <div>
                    {isEditing ? (
                      <>
                        <Label htmlFor="email" className={`flex items-center gap-2 text-xs font-medium tracking-wider ${getThemeClasses.text.secondary(isDarkMode)} uppercase`}>
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-2 rounded-[10px]"
                          placeholder="Enter email address"
                        />
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-[10px] ${getThemeClasses.iconBg.primary(isDarkMode)} flex items-center justify-center shrink-0`}>
                          <Mail className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase`}>Email</p>
                          <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>{formData.email || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    {isEditing ? (
                      <>
                        <Label htmlFor="phone" className={`flex items-center gap-2 text-xs font-medium tracking-wider ${getThemeClasses.text.secondary(isDarkMode)} uppercase`}>
                          <Phone className="w-4 h-4" />
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="mt-2 rounded-[10px]"
                          placeholder="Enter phone number"
                        />
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-[10px] ${getThemeClasses.iconBg.primary(isDarkMode)} flex items-center justify-center shrink-0`}>
                          <Phone className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase`}>Phone</p>
                          <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>{formData.phone || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Added On - Always read-only */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-[10px] ${getThemeClasses.iconBg.primary(isDarkMode)} flex items-center justify-center shrink-0`}>
                      <Calendar className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase`}>Added On</p>
                      <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>{formatDate(driver.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pending Documents Alert */}
          {pendingDocuments.length > 0 && (
            <section className="bg-yellow-50 rounded-[10px] border border-yellow-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileEdit className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-900">
                      {pendingDocuments.length} Document{pendingDocuments.length > 1 ? 's' : ''} Need Details
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Enter document information to activate these documents
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    // Capture snapshot of pending documents when opening modal
                    setPendingDocumentsSnapshot([...pendingDocuments])
                    setShowDetailsModal(true)
                  }}
                  className="bg-yellow-600 text-white hover:bg-yellow-700 rounded-[10px]"
                >
                  <FileEdit className="w-4 h-4 mr-2" />
                  Enter Details
                </Button>
              </div>
            </section>
          )}

          {/* Upload Documents Section */}
          <section className={`${getThemeClasses.bg.card(isDarkMode)} ${getThemeClasses.border.primary(isDarkMode)} rounded-[10px] border`}>
            <div
              className={`flex items-center justify-between p-6 transition-colors cursor-pointer ${getThemeClasses.bg.hover(isDarkMode)}`}
              onClick={() => setShowUpload(!showUpload)}
            >
              <div>
                <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Upload Documents</h2>
                <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Add new documents for this driver
                </p>
              </div>
              {showUpload ? (
                <ChevronUp className={`w-5 h-5 ${getThemeClasses.text.muted(isDarkMode)}`} />
              ) : (
                <ChevronDown className={`w-5 h-5 ${getThemeClasses.text.muted(isDarkMode)}`} />
              )}
            </div>

            {showUpload && (
              <div className={`p-6 border-t ${getThemeClasses.border.primary(isDarkMode)}`}>
                <DocumentUpload
                  driverId={driverId}
                  onUploadComplete={handleUploadComplete}
                  planData={currentPlanData}
                  existingDocCount={allDocuments.length}
                  documentTypes={documentTypes}
                />
              </div>
            )}
          </section>

          {/* Documents Overview */}
          <section className={`${getThemeClasses.bg.card(isDarkMode)} ${getThemeClasses.border.primary(isDarkMode)} rounded-[10px] border`}>
            <div className={`p-6 border-b ${getThemeClasses.border.primary(isDarkMode)}`}>
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Documents Overview</h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                {driver.documents?.length || 0} document(s) on file
              </p>
            </div>

            {driver.documents && driver.documents.length > 0 ? (
              <div className={`divide-y ${getThemeClasses.border.secondary(isDarkMode)}`}>
                {driver.documents.map((doc) => (
                  <div key={doc.id} className={`transition-colors ${getThemeClasses.bg.hover(isDarkMode)}`}>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 gap-4">
                          <div className={`${getThemeClasses.iconBg.primary(isDarkMode)} rounded-[10px] p-2.5`}>
                            <FileText className="w-5 h-5 text-gray-700" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>{doc.type}</h3>
                              {getStatusBadge(doc.status)}
                            </div>
                            <div className={`flex items-center gap-4 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              <span>Expires: {formatDate(doc.expiryDate)}</span>
                              <span>•</span>
                              <span>Uploaded: {formatDate(doc.uploadedAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Reminder History button - only show if document has expiry date */}
                            {doc.expiryDate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`rounded-[10px] ${
                                  expandedReminderDocId === doc.id
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    : 'hover:text-blue-700'
                                }`}
                                onClick={() => setExpandedReminderDocId(
                                  expandedReminderDocId === doc.id ? null : doc.id
                                )}
                                title="View reminder history"
                              >
                                <Bell className="w-4 h-4" />
                              </Button>
                            )}
                            {/* Request Update button - only show for expired or expiring soon documents */}
                            {(doc.status === 'EXPIRED' || doc.status === 'EXPIRING_SOON') && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-[10px] border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                                onClick={() => handleRequestDocumentUpdate(doc)}
                                disabled={sendingEmailForDocId === doc.id}
                                title="Request driver to upload fresh document"
                              >
                                {sendingEmailForDocId === doc.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Request Update
                                  </>
                                )}
                              </Button>
                            )}
                            {/* Edit button - only show if document has expiry date */}
                            {doc.expiryDate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-[10px]"
                                onClick={() => handleEditDocument(doc.id)}
                                title="Edit document"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-[10px]"
                              onClick={() => handleViewDocument(doc.id)}
                              disabled={viewingDocumentId === doc.id}
                              title="View document"
                            >
                              {viewingDocumentId === doc.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-[10px]"
                              onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                              disabled={downloadingDocumentId === doc.id}
                              title="Download document"
                            >
                              {downloadingDocumentId === doc.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-[10px] text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteDocument(doc)}
                              disabled={deletingDocumentId === doc.id}
                              title="Delete document"
                            >
                              {deletingDocumentId === doc.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reminder History Section */}
                    {expandedReminderDocId === doc.id && (
                      <ReminderHistorySection documentId={doc.id} isDarkMode={isDarkMode} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className={`w-12 h-12 mx-auto mb-3 ${getThemeClasses.text.muted(isDarkMode)}`} />
                <h3 className={`mb-1 text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>No documents yet</h3>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Upload documents using the section above to get started</p>
              </div>
            )}
          </section>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className={`${getThemeClasses.bg.card(isDarkMode)} ${getThemeClasses.border.primary(isDarkMode)} rounded-[10px] p-4 border`}>
              <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase`}>Compliance Score</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className={`text-2xl font-semibold ${
                  complianceScore >= 81 ? 'text-green-700' :
                  complianceScore >= 51 ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  {complianceScore}%
                </p>
                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  ({driver.documents?.filter(d => d.status === 'ACTIVE').length || 0}/{documentTypes.length})
                </p>
              </div>
            </div>
            <div className={`${getThemeClasses.bg.card(isDarkMode)} ${getThemeClasses.border.primary(isDarkMode)} rounded-[10px] p-4 border`}>
              <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase`}>Total Documents</p>
              <p className={`mt-2 text-2xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>{driver.documents?.length || 0}</p>
            </div>
            <div className={`${getThemeClasses.bg.card(isDarkMode)} ${getThemeClasses.border.primary(isDarkMode)} rounded-[10px] p-4 border`}>
              <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase`}>Verified</p>
              <p className="mt-2 text-2xl font-semibold text-green-700">
                {driver.documents?.filter(d => d.status === 'ACTIVE').length || 0}
              </p>
            </div>
            <div className={`${getThemeClasses.bg.card(isDarkMode)} ${getThemeClasses.border.primary(isDarkMode)} rounded-[10px] p-4 border`}>
              <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase`}>Expiring Soon</p>
              <p className="mt-2 text-2xl font-semibold text-yellow-700">
                {driver.documents?.filter(d => d.status === 'EXPIRING_SOON').length || 0}
              </p>
            </div>
            <div className={`${getThemeClasses.bg.card(isDarkMode)} ${getThemeClasses.border.primary(isDarkMode)} rounded-[10px] p-4 border`}>
              <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase`}>Expired</p>
              <p className="mt-2 text-2xl font-semibold text-red-700">
                {driver.documents?.filter(d => d.status === 'EXPIRED').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Details Modal (for pending documents) */}
      <DocumentDetailsModal
        isOpen={showDetailsModal}
        onClose={handleDetailsModalClose}
        documents={pendingDocumentsSnapshot}
        documentTypes={documentTypes}
        onSave={handleDocumentDetailsSaved}
      />

      {/* Document Edit Modal (for documents with expiry date) */}
      {editableDocuments.length > 0 && (
        <DocumentEditModal
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          documents={editableDocuments}
          documentTypes={documentTypes}
          onSave={handleDocumentDetailsSaved}
          initialDocumentId={selectedDocumentId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[10px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
              {documentToDelete && (
                <div className={`mt-3 p-3 ${getThemeClasses.bg.primary(isDarkMode)} rounded-[10px]`}>
                  <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>{documentToDelete.type}</p>
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>{documentToDelete.fileName}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-[10px]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DriverDetail
