import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import React, { useState, useEffect } from 'react'
import { Plus, FileText, Trash2, Loader2 } from 'lucide-react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { toast } from 'sonner'

const DocumentTypes = () => {
  const [documentTypes, setDocumentTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newDocumentTypeName, setNewDocumentTypeName] = useState('')

  const { getToken } = useAuth()
  const { user } = useUser()
  const API_URL = import.meta.env.VITE_API_URL

  // Get company ID from user metadata
  const companyId = user?.publicMetadata?.companyId

  useEffect(() => {
    if (companyId) {
      fetchDocumentTypes()
    }
  }, [companyId])

  const fetchDocumentTypes = async () => {
    if (!companyId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const token = await getToken()

      const response = await fetch(`${API_URL}/api/document-types/company/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch document types')
      }

      const result = await response.json()

      if (result.success) {
        setDocumentTypes(result.data || [])
      } else {
        toast.error('Failed to load document types')
      }
    } catch (error) {
      console.error('Error fetching document types:', error)
      toast.error('Failed to load document types')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!companyId) {
      toast.error('Company ID not found')
      return
    }

    if (!newDocumentTypeName.trim()) {
      toast.error('Document type name is required')
      return
    }

    try {
      setSubmitting(true)
      const token = await getToken()

      const response = await fetch(`${API_URL}/api/document-types/company/${companyId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newDocumentTypeName.trim() }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(result.message || 'Document type added successfully')
        setIsDialogOpen(false)
        setNewDocumentTypeName('')
        fetchDocumentTypes()
      } else {
        toast.error(result.message || 'Failed to add document type')
      }
    } catch (error) {
      console.error('Error adding document type:', error)
      toast.error('An error occurred while adding document type')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const token = await getToken()

      const response = await fetch(`${API_URL}/api/document-types/company/${companyId}/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(result.message || 'Document type deleted successfully')
        fetchDocumentTypes()
      } else {
        toast.error(result.message || 'Failed to delete document type')
      }
    } catch (error) {
      console.error('Error deleting document type:', error)
      toast.error('An error occurred while deleting')
    }
  }

  return (
    <div className='flex flex-col w-full min-h-screen bg-gray-50'>
      {/* Header */}
      <header className="flex items-center h-16 gap-2 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center w-full gap-1 px-4 lg:gap-2 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">Document Types</h1>
          <div className="flex items-center gap-3 ml-auto">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Document Type
              </Button>

              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add New Document Type</DialogTitle>
                    <DialogDescription>
                      Add a new document type to track for your company.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Document Type Name *
                      </label>
                      <Input
                        id="name"
                        value={newDocumentTypeName}
                        onChange={(e) => setNewDocumentTypeName(e.target.value)}
                        placeholder="e.g., Medical Certificate"
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        setNewDocumentTypeName('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Document Type'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Stats */}
          <div className="grid gap-4 mb-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Document Types</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documentTypes.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active document types being tracked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>
                  Manage the types of documents your company tracks for drivers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Document Types List */}
          <Card>
            <CardHeader>
              <CardTitle>Document Types</CardTitle>
              <CardDescription>
                These document types apply globally to all drivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : documentTypes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No document types yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by adding your first document type
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Document Type
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {documentTypes.map((docType, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{docType}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(docType)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DocumentTypes
