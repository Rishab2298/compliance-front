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
import { Save, Loader2 } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { useCompany, useUpdateCompany } from '@/hooks/useCompany'
import { toast } from 'sonner'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'
import DocumentTypeManager from '@/components/DocumentTypeManager'
import { DashboardHeader } from '@/components/DashboardHeader'

const Settings = () => {
  const { user } = useUser()
  const { isDarkMode } = useTheme()
  const companyId = user?.publicMetadata?.companyId

  // Use cached queries
  const { data: companyData, isLoading: loading } = useCompany(companyId)
  const updateCompanyMutation = useUpdateCompany(companyId)

  const [formData, setFormData] = useState({
    reminderDays: [],
    notificationMethod: 'both',
    notificationRecipients: [],
    adminEmail: '',
    adminPhone: '',
  })

  // Update form data when company data is loaded
  useEffect(() => {
    if (companyData) {
      setFormData({
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

  const toggleNotificationRecipient = (recipient) => {
    setFormData(prev => ({
      ...prev,
      notificationRecipients: prev.notificationRecipients.includes(recipient)
        ? prev.notificationRecipients.filter(r => r !== recipient)
        : [...prev.notificationRecipients, recipient]
    }))
  }


  return (
    <div className={`flex flex-col w-full min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 rounded-full pointer-events-none left-1/4 w-96 h-96 bg-violet-500/5 blur-3xl"></div>
          <div className="fixed bottom-0 rounded-full pointer-events-none right-1/4 w-96 h-96 bg-purple-500/5 blur-3xl"></div>
        </>
      )}

      {/* Header */}
      <DashboardHeader title="Settings">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className={`rounded-[10px] hidden sm:flex ${getThemeClasses.button.primary(isDarkMode)}`}
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
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className={`rounded-[10px] sm:hidden ${getThemeClasses.button.primary(isDarkMode)}`}
          size="icon"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
        </Button>
      </DashboardHeader>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Company Info */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Company Information</h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>View your company details</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>Company Name</Label>
                {loading ? (
                  <Skeleton className="h-5 w-32 mt-2 rounded-[10px]" />
                ) : (
                  <p className={`mt-2 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {companyData?.name || 'N/A'}
                  </p>
                )}
              </div>
              <div>
                <Label className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>Company Size</Label>
                {loading ? (
                  <Skeleton className="h-5 w-24 mt-2 rounded-[10px]" />
                ) : (
                  <p className={`mt-2 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {companyData?.companySize || 'N/A'}
                  </p>
                )}
              </div>
              <div>
                <Label className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>Operating Region</Label>
                {loading ? (
                  <Skeleton className="h-5 w-28 mt-2 rounded-[10px]" />
                ) : (
                  <p className={`mt-2 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {companyData?.operatingRegion || 'N/A'}
                  </p>
                )}
              </div>
              <div>
                <Label className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>Plan</Label>
                {loading ? (
                  <Skeleton className="h-5 w-20 mt-2 rounded-[10px]" />
                ) : (
                  <p className={`mt-2 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>{companyData?.plan || 'Free'}</p>
                )}
              </div>
            </div>

            {/* Tip */}
            <div className={`mt-6 p-4 border rounded-[10px] ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
              <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                <span className="font-semibold">💡 Tip:</span> Need to update your company information? Contact support to make changes to these details.
              </p>
            </div>
          </section>

          {/* Document Types */}
          <DocumentTypeManager />

          {/* Reminder Settings */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Reminder Settings</h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Choose up to 3 reminder intervals before document expiration</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {loading ? (
                // Show skeleton buttons while loading
                [...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-16 rounded-[10px]" />
                ))
              ) : (
                ['1d', '7d', '14d', '15d', '30d', '45d', '60d', '90d'].map((days) => {
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
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                            : 'bg-gray-800 text-white'
                          : isMaxSelected
                          ? isDarkMode
                            ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                          : isDarkMode
                          ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {days}
                    </button>
                  )
                })
              )}
            </div>

            {formData.reminderDays.length >= 3 && (
              <p className={`mt-3 text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                Maximum of 3 reminder intervals selected
              </p>
            )}

{!loading && formData.reminderDays.length > 0 && (
              <div className={`mt-4 p-4 rounded-[10px] ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  <span className="font-semibold">Selected ({formData.reminderDays.length}/3):</span> {formData.reminderDays.join(', ')}
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 space-y-3">
              <div className={`p-4 border rounded-[10px] ${isDarkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
                  <span className="font-semibold"> Automatic Reminders:</span> Your reminder notifications are sent automatically every day at <span className="font-semibold">8:00 AM Eastern Time</span> (New York/Toronto timezone). You don't need to do anything - we'll notify you when documents are approaching their expiration dates!
                </p>
              </div>
              <div className={`p-4 border rounded-[10px] ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
                <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                  <span className="font-semibold">💡 Tip:</span> We recommend setting reminders at 30, 15, and 7 days to ensure you never miss a document expiration.
                </p>
              </div>
            </div>
          </section>

          {/* Notification Preferences */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Notification Preferences</h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Configure how you receive compliance alerts</p>
            </div>

            <div className="max-w-2xl space-y-6">
              {/* Admin Email */}
              <div className="space-y-2">
                <Label htmlFor="adminEmail" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Admin Email</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full rounded-[10px]" />
                ) : (
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, adminEmail: e.target.value }))
                    }
                    placeholder="admin@company.com"
                    className={`rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}
                  />
                )}
              </div>

              {/* Admin Phone */}
              <div className="space-y-2">
                <Label htmlFor="adminPhone" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Admin Phone Number</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full rounded-[10px]" />
                ) : (
                  <Input
                    id="adminPhone"
                    type="tel"
                    value={formData.adminPhone}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, adminPhone: e.target.value }))
                    }
                    placeholder="+1 (555) 000-0000"
                    className={`rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}
                  />
                )}
              </div>

              {/* Notification Method */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Notification Method</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full rounded-[10px]" />
                ) : (
                  <Select
                    value={formData.notificationMethod}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, notificationMethod: value }))
                    }
                  >
                    <SelectTrigger className={`rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="sms">SMS Only</SelectItem>
                      <SelectItem value="both">Email & SMS</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Notification Recipients */}
              <div className="space-y-3">
                <Label className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Notification Recipients</Label>
                <div className="space-y-2">
                  {loading ? (
                    [...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-4 rounded-[10px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <Skeleton className="h-5 w-20 rounded-[10px]" />
                        <Skeleton className="h-6 rounded-full w-11" />
                      </div>
                    ))
                  ) : (
                    ['admin', 'drivers'].map((recipient) => (
                      <div
                        key={recipient}
                        className={`flex items-center justify-between p-4 rounded-[10px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <Label
                          className={`text-sm font-medium capitalize cursor-pointer ${getThemeClasses.text.primary(isDarkMode)}`}
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
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className={`mt-6 p-4 border rounded-[10px] ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
              <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                <span className="font-semibold">💡 Tip:</span> Enable driver notifications to keep your team informed about their document expiration dates automatically.
              </p>
            </div>
          </section>

          {/* Bottom Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className={`rounded-[10px] px-8 ${getThemeClasses.button.primary(isDarkMode)}`}
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
