import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { useCompany, useUpdateCompany } from '@/hooks/useCompany'
import { useCurrentPlan } from '@/hooks/useBilling'
import { toast } from 'sonner'

const Settings = () => {
  const { user } = useUser()
  const companyId = user?.publicMetadata?.companyId

  // Use cached queries
  const { data: companyData, isLoading: loading } = useCompany(companyId)
  const updateCompanyMutation = useUpdateCompany(companyId)
  const { data: currentPlanData, isLoading: planLoading } = useCurrentPlan()

  const [formData, setFormData] = useState({
    documentTypes: [],
    reminderDays: [],
    notificationMethod: 'both',
    notificationRecipients: [],
    adminEmail: '',
    adminPhone: '',
  })
  const [newDocumentType, setNewDocumentType] = useState('')

  // Update form data when company data is loaded
  useEffect(() => {
    if (companyData) {
      setFormData({
        documentTypes: companyData.documentTypes || [],
        reminderDays: companyData.reminderDays || [],
        notificationMethod: companyData.notificationMethod || 'both',
        notificationRecipients: companyData.notificationRecipients || [],
        adminEmail: companyData.adminEmail || '',
        adminPhone: companyData.adminPhone || '',
      })
    }
  }, [companyData])

  const handleSaveSettings = async () => {
    try {
      await updateCompanyMutation.mutateAsync(formData)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    }
  }

  const saving = updateCompanyMutation.isPending

  const toggleReminderDay = (day) => {
    setFormData(prev => {
      const isSelected = prev.reminderDays.includes(day)
      const isMaxSelected = prev.reminderDays.length >= 3 && !isSelected

      // If max is already selected and trying to add more, show error
      if (isMaxSelected) {
        toast.error('Maximum of 3 reminder intervals allowed')
        return prev
      }

      return {
        ...prev,
        reminderDays: isSelected
          ? prev.reminderDays.filter(d => d !== day)
          : [...prev.reminderDays, day]
      }
    })
  }

  const addDocumentType = () => {
    if (!newDocumentType.trim()) {
      toast.error('Please enter a document type name')
      return
    }

    if (formData.documentTypes.includes(newDocumentType.trim())) {
      toast.error('This document type already exists')
      return
    }

    // Check plan-based document type limits
    if (currentPlanData) {
      const maxDocTypes = currentPlanData.currentPlan?.maxDocumentsPerDriver || 1
      const currentCount = formData.documentTypes.length

      // Free plan: only 1 document type allowed
      // -1 means unlimited
      if (maxDocTypes !== -1 && currentCount >= maxDocTypes) {
        toast.error("Document type limit reached", {
          description: `Your plan allows tracking ${maxDocTypes} document type${maxDocTypes !== 1 ? 's' : ''} per driver. Please upgrade to add more.`,
        })
        return
      }
    }

    setFormData(prev => ({
      ...prev,
      documentTypes: [...prev.documentTypes, newDocumentType.trim()]
    }))
    setNewDocumentType('')
  }

  const removeDocumentType = (docType) => {
    setFormData(prev => ({
      ...prev,
      documentTypes: prev.documentTypes.filter(d => d !== docType)
    }))
  }

  const toggleNotificationRecipient = (recipient) => {
    setFormData(prev => ({
      ...prev,
      notificationRecipients: prev.notificationRecipients.includes(recipient)
        ? prev.notificationRecipients.filter(r => r !== recipient)
        : [...prev.notificationRecipients, recipient]
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <Skeleton className="h-7 w-32 rounded-[10px]" />
            <Skeleton className="h-10 w-24 rounded-[10px]" />
          </div>
        </header>
        <div className="flex-1 py-8">
          <div className="container w-full px-6 mx-auto space-y-6">
            <Skeleton className="h-48 w-full rounded-[10px]" />
            <Skeleton className="h-64 w-full rounded-[10px]" />
            <Skeleton className="h-56 w-full rounded-[10px]" />
            <Skeleton className="h-72 w-full rounded-[10px]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          <Button
            onClick={handleSaveSettings}
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
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Company Info */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
              <p className="mt-1 text-sm text-gray-500">View your company details</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Company Name</Label>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {companyData?.name || 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Company Size</Label>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {companyData?.companySize || 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Operating Region</Label>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {companyData?.operatingRegion || 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Plan</Label>
                <p className="mt-2 text-sm font-medium text-gray-900">{companyData?.plan || 'Free'}</p>
              </div>
            </div>

            {/* Tip */}
            <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-[10px]">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">💡 Tip:</span> Need to update your company information? Contact support to make changes to these details.
              </p>
            </div>
          </section>

          {/* Document Types */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Document Types</h2>
              <p className="mt-1 text-sm text-gray-500">Manage the types of documents you track for drivers</p>
            </div>

            <div className="flex gap-3 mb-4">
              <Input
                placeholder="Add new document type..."
                value={newDocumentType}
                onChange={(e) => setNewDocumentType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDocumentType()}
                className="max-w-md rounded-[10px]"
              />
              <Button
                onClick={addDocumentType}
                className="bg-gray-800 text-white hover:bg-gray-900 rounded-[10px] shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Type
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {formData.documentTypes.length === 0 ? (
                <div className="py-8 text-center col-span-full">
                  <p className="text-sm text-gray-500">No document types added yet</p>
                </div>
              ) : (
                formData.documentTypes.map((docType, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-[10px] border border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-900">{docType}</span>
                    <button
                      onClick={() => removeDocumentType(docType)}
                      className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Tip and Plan Info */}
            <div className="mt-6 space-y-3">
              <div className="p-4 bg-gray-100 border border-gray-200 rounded-[10px]">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">💡 Tip:</span> Common document types include Driver's License, CDL, Medical Certificate, Insurance Card, and Vehicle Registration.
                </p>
              </div>
              {currentPlanData && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-[10px]">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">📋 Plan Limits:</span> Your{' '}
                    {currentPlanData.currentPlan?.name || 'Free'} plan allows tracking{' '}
                    {currentPlanData.currentPlan?.maxDocumentsPerDriver === -1
                      ? 'unlimited'
                      : currentPlanData.currentPlan?.maxDocumentsPerDriver}{' '}
                    document type{currentPlanData.currentPlan?.maxDocumentsPerDriver !== 1 ? 's' : ''} per driver.{' '}
                    {currentPlanData.currentPlan?.maxDocumentsPerDriver === 1 && (
                      <span>Upgrade to track more document types.</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Reminder Settings */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Reminder Settings</h2>
              <p className="mt-1 text-sm text-gray-500">Choose up to 3 reminder intervals before document expiration</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {['1d', '7d', '14d', '15d', '30d', '45d', '60d', '90d'].map((days) => {
                const isSelected = formData.reminderDays.includes(days)
                const isMaxSelected = formData.reminderDays.length >= 3 && !isSelected

                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => toggleReminderDay(days)}
                    disabled={isMaxSelected}
                    className={`px-5 py-2.5 rounded-[10px] text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-gray-800 text-white'
                        : isMaxSelected
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {days}
                  </button>
                )
              })}
            </div>

            {formData.reminderDays.length >= 3 && (
              <p className="mt-3 text-sm text-yellow-600">
                Maximum of 3 reminder intervals selected
              </p>
            )}

            {formData.reminderDays.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-[10px]">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Selected ({formData.reminderDays.length}/3):</span> {formData.reminderDays.join(', ')}
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-[10px]">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">⏰ Automatic Reminders:</span> Your reminder notifications are sent automatically every day at <span className="font-semibold">8:00 AM Eastern Time</span> (New York/Toronto timezone). You don't need to do anything - we'll notify you when documents are approaching their expiration dates!
                </p>
              </div>
              <div className="p-4 bg-gray-100 border border-gray-200 rounded-[10px]">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">💡 Tip:</span> We recommend setting reminders at 30, 15, and 7 days to ensure you never miss a document expiration.
                </p>
              </div>
            </div>
          </section>

          {/* Notification Preferences */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              <p className="mt-1 text-sm text-gray-500">Configure how you receive compliance alerts</p>
            </div>

            <div className="max-w-2xl space-y-6">
              {/* Admin Email */}
              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="text-sm font-medium text-gray-900">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, adminEmail: e.target.value }))
                  }
                  placeholder="admin@company.com"
                  className="rounded-[10px]"
                />
              </div>

              {/* Admin Phone */}
              <div className="space-y-2">
                <Label htmlFor="adminPhone" className="text-sm font-medium text-gray-900">Admin Phone Number</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  value={formData.adminPhone}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, adminPhone: e.target.value }))
                  }
                  placeholder="+1 (555) 000-0000"
                  className="rounded-[10px]"
                />
              </div>

              {/* Notification Method */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">Notification Method</Label>
                <Select
                  value={formData.notificationMethod}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, notificationMethod: value }))
                  }
                >
                  <SelectTrigger className="rounded-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="sms">SMS Only</SelectItem>
                    <SelectItem value="both">Email & SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notification Recipients */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">Notification Recipients</Label>
                <div className="space-y-2">
                  {['admin', 'drivers'].map((recipient) => (
                    <div
                      key={recipient}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-[10px] border border-gray-200"
                    >
                      <Label
                        className="text-sm font-medium text-gray-900 capitalize cursor-pointer"
                        htmlFor={`recipient-${recipient}`}
                      >
                        {recipient}
                      </Label>
                      <Switch
                        id={`recipient-${recipient}`}
                        checked={formData.notificationRecipients.includes(recipient)}
                        onCheckedChange={() => toggleNotificationRecipient(recipient)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-[10px]">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">💡 Tip:</span> Enable driver notifications to keep your team informed about their document expiration dates automatically.
              </p>
            </div>
          </section>

          {/* Bottom Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-gray-800 text-white hover:bg-gray-900 rounded-[10px] px-8"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
