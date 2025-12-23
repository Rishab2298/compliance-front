import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Shield,
  ChevronRight,
  Clock,
  UserPlus,
  Bell,
  Settings,
  XCircle,
  AlertCircle,
  Eye,
  Zap,
  Ticket,
} from 'lucide-react'
import { useDrivers } from '@/hooks/useDrivers'
import { useCompany } from '@/hooks/useCompany'
import { useReminders } from '@/hooks/useReminders'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'
import { calculateDocumentStatus } from '@/utils/documentStatusUtils'
import { CreateTicketModal } from './ticketing/CreateTicketModal'
import { DashboardHeader } from '@/components/DashboardHeader'

const ClientDashboard = () => {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { user } = useUser()
  const { isDarkMode } = useTheme()
  const companyId = user?.publicMetadata?.companyId

  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false)

  // Fetch data using existing hooks
  const { data: driversData, isLoading: driversLoading } = useDrivers(1, 1000) // Fetch all drivers for dashboard
  const { data: company, isLoading: companyLoading } = useCompany(companyId)
  const { data: remindersData, isLoading: remindersLoading } = useReminders()

  const drivers = driversData?.drivers || []
  const reminders = remindersData?.reminders || []
  const stats = remindersData?.stats || { total: 0, critical: 0, warning: 0, info: 0 }

  // Get and log the user's token
  useEffect(() => {
    const logToken = async () => {
      const token = await getToken()
      console.log('🔑 User Token:', token)
    }
    logToken()
  }, [getToken])

  // Calculate metrics from real data
  const totalDrivers = drivers.length
  const documentTypes = company?.documentTypes || []

  // Calculate compliance
  const calculateCompliance = () => {
    if (drivers.length === 0 || documentTypes.length === 0) return 0

    let totalDocs = 0
    let activeDocs = 0

    drivers.forEach(driver => {
      const driverDocs = driver.documents || []
      totalDocs += documentTypes.length
      activeDocs += driverDocs.filter(doc => doc.status === 'ACTIVE').length
    })

    return totalDocs > 0 ? Math.round((activeDocs / totalDocs) * 100) : 0
  }

  const complianceRate = calculateCompliance()

  // Count documents by status using shared utility for consistency
  const countDocumentsByStatus = () => {
    const counts = {
      expired: 0,
      expiringSoon: 0,
      verified: 0,
      pending: 0,
    }

    drivers.forEach(driver => {
      const docs = driver.documents || []
      docs.forEach(doc => {
        // Use shared utility to calculate display status
        const displayStatus = calculateDocumentStatus(doc)

        if (displayStatus === 'expired') counts.expired++
        else if (displayStatus === 'expiring') counts.expiringSoon++
        else if (displayStatus === 'verified') counts.verified++
        else if (displayStatus === 'pending') counts.pending++
      })
    })

    return counts
  }

  const docCounts = countDocumentsByStatus()

  // Get recent drivers (last 5 added)
  const recentDrivers = [...drivers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Get drivers with issues (non-compliant drivers)
  const driversWithIssues = drivers.filter(driver => {
    const docs = driver.documents || []

    // Check if driver has all required documents
    const hasAllDocuments = docs.length >= documentTypes.length

    // Check if any documents are expired, expiring soon, or pending
    const hasExpired = docs.some(doc => doc.status === 'EXPIRED')
    const hasExpiringSoon = docs.some(doc => doc.status === 'EXPIRING_SOON')
    const hasPending = docs.some(doc => doc.status === 'PENDING')

    // Driver requires attention if:
    // 1. Missing required documents
    // 2. Has expired documents
    // 3. Has expiring soon documents
    // 4. Has pending/unverified documents
    return !hasAllDocuments || hasExpired || hasExpiringSoon || hasPending
  }).slice(0, 5)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDriverCompliance = (driver) => {
    const docs = driver.documents || []
    if (documentTypes.length === 0) return 0
    const activeDocs = docs.filter(doc => doc.status === 'ACTIVE').length
    return Math.round((activeDocs / documentTypes.length) * 100)
  }

  const getComplianceBadge = (percentage) => {
    if (percentage >= 100) {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200 rounded-[10px] text-xs">100%</Badge>
    } else if (percentage >= 75) {
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200 rounded-[10px] text-xs">{percentage}%</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200 rounded-[10px] text-xs">{percentage}%</Badge>
    }
  }

  // Get driver limit text based on plan
  const getDriverLimitText = (planName) => {
    const planLimits = {
      'Free': 5,
      'Starter': 25,
      'Professional': 100,
      'Enterprise': -1, // Unlimited
    }

    const limit = planLimits[planName]

    if (limit === -1) {
      return 'Unlimited on current plan'
    } else if (limit) {
      return `Up to ${limit} employees on ${planName} plan`
    } else {
      return 'Based on current plan'
    }
  }

  return (
    <div className={`flex flex-col w-full min-h-screen ${getThemeClasses.bg.primary(isDarkMode)} relative`}>
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 rounded-full pointer-events-none left-1/4 w-96 h-96 bg-violet-500/5 blur-3xl"></div>
          <div className="fixed bottom-0 rounded-full pointer-events-none right-1/4 w-96 h-96 bg-purple-500/5 blur-3xl"></div>
        </>
      )}

      {/* Header */}
      <DashboardHeader title="Dashboard">
        <Button
          onClick={() => navigate('/client/add-a-driver')}
          className={`${getThemeClasses.button.primary(isDarkMode)} rounded-[10px] hidden sm:flex`}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
        <Button
          onClick={() => navigate('/client/add-a-driver')}
          className={`${getThemeClasses.button.primary(isDarkMode)} rounded-[10px] sm:hidden`}
          size="icon"
        >
          <UserPlus className="w-4 h-4" />
        </Button>
      </DashboardHeader>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Critical Alerts */}
          {(docCounts.expired > 0 || stats.critical > 0) && (
            <section className={`rounded-[10px] border p-4 ${getThemeClasses.alert.critical(isDarkMode)}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-red-300' : 'text-red-900'}`}>
                    Critical Compliance Issues
                  </h3>
                  <div className={`flex flex-wrap gap-4 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                    {docCounts.expired > 0 && (
                      <span>
                        {docCounts.expired} expired document{docCounts.expired !== 1 ? 's' : ''}
                      </span>
                    )}
                    {stats.critical > 0 && (
                      <span>
                        {stats.critical} expiring in &lt;7 days
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-[10px] ${isDarkMode ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-300 text-red-700 hover:bg-red-100'}`}
                  onClick={() => navigate('/client/document-status')}
                >
                  View Details
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </section>
          )}

          {/* Overview Stats */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Overview</h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Key metrics and compliance overview</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="cursor-pointer" onClick={() => navigate('/client/drivers')}>
                <Label className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>Total Employees</Label>
                {driversLoading ? (
                  <Skeleton className="h-9 w-16 mt-2 rounded-[10px]" />
                ) : (
                  <p className={`mt-2 text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{totalDrivers}</p>
                )}
                <p className={`mt-1 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>Active in system</p>
              </div>

              <div className="cursor-pointer" onClick={() => navigate('/client/drivers')}>
                <Label className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>Compliance Rate</Label>
                {driversLoading || companyLoading ? (
                  <Skeleton className="h-9 w-20 mt-2 rounded-[10px]" />
                ) : (
                  <p className={`mt-2 text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{complianceRate}%</p>
                )}
                <p className={`mt-1 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  {driversLoading || companyLoading ? ' ' : complianceRate >= 90 ? 'Excellent' : complianceRate >= 70 ? 'Good' : 'Needs attention'}
                </p>
              </div>

              <div className="cursor-pointer" onClick={() => navigate('/client/reminders')}>
                <Label className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>Expiring Soon</Label>
                {remindersLoading ? (
                  <Skeleton className="h-9 w-16 mt-2 rounded-[10px]" />
                ) : (
                  <p className={`mt-2 text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{stats.total}</p>
                )}
                <p className={`mt-1 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  {remindersLoading ? ' ' : `${stats.critical} critical • ${stats.warning} warning`}
                </p>
              </div>

              <div className="cursor-pointer" onClick={() => navigate('/client/document-status')}>
                <Label className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>Pending Review</Label>
                {driversLoading ? (
                  <Skeleton className="h-9 w-16 mt-2 rounded-[10px]" />
                ) : (
                  <p className={`mt-2 text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{docCounts.pending}</p>
                )}
                <p className={`mt-1 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>Awaiting verification</p>
              </div>
            </div>
          </section>

          {/* Credits Usage */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Credits & Usage</h2>
                <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Current plan: {company?.plan || 'Professional'}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                onClick={() => navigate('/client/billing')}
              >
                Manage Plan
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>AI Credits Remaining</Label>
                <p className={`mt-2 text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{company?.aiCredits || 0}</p>
                <p className={`mt-1 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>Used for document scanning and processing</p>
              </div>

              <div>
                <Label className={`text-xs font-medium tracking-wider uppercase ${getThemeClasses.text.secondary(isDarkMode)}`}>Active Employees</Label>
                <p className={`mt-2 text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{totalDrivers}</p>
                <p className={`mt-1 text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>{getDriverLimitText(company?.plan || 'Professional')}</p>
              </div>
            </div>

            {company?.aiCredits < 5 && (
              <div className={`mt-6 p-4 rounded-[10px] ${isDarkMode ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-900'}`}>
                  <span className="font-semibold">⚠️ Low Credits:</span> You have less than 5 AI credits remaining. Consider upgrading your plan or purchasing additional credits.
                </p>
              </div>
            )}
          </section>

          {/* Document Status */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Document Status</h2>
                <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Overview of all documents by status</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                onClick={() => navigate('/client/document-status')}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className={`p-4 rounded-[10px] border transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-green-500/30' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <span className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{docCounts.verified}</span>
                </div>
                <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Verified</p>
                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>Up to date</p>
              </div>

              <div className={`p-4 rounded-[10px] border transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-yellow-500/30' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                    <Clock className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  </div>
                  <span className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{docCounts.expiringSoon}</span>
                </div>
                <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Expiring Soon</p>
                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>Action needed</p>
              </div>

              <div className={`p-4 rounded-[10px] border transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-red-500/30' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                    <XCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <span className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{docCounts.expired}</span>
                </div>
                <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Expired</p>
                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>Urgent</p>
              </div>

              <div className={`p-4 rounded-[10px] border transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500/30' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                    <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <span className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>{docCounts.pending}</span>
                </div>
                <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>Pending</p>
                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>Under review</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Drivers with Issues */}
            <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="mb-6">
                <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Employees Requiring Attention</h2>
                <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Non-compliant employees with missing, expired, expiring, or pending documents</p>
              </div>

              {driversWithIssues.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>All Clear!</p>
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>All employees are fully compliant</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {driversWithIssues.map(driver => {
                    const compliance = getDriverCompliance(driver)
                    const docs = driver.documents || []
                    const expiredDocs = docs.filter(d => d.status === 'EXPIRED').length
                    const expiringSoon = docs.filter(d => d.status === 'EXPIRING_SOON').length
                    const pendingDocs = docs.filter(d => d.status === 'PENDING').length
                    const missingDocs = Math.max(0, documentTypes.length - docs.length)

                    // Build issue description
                    const issues = []
                    if (missingDocs > 0) issues.push(`${missingDocs} missing`)
                    if (expiredDocs > 0) issues.push(`${expiredDocs} expired`)
                    if (expiringSoon > 0) issues.push(`${expiringSoon} expiring soon`)
                    if (pendingDocs > 0) issues.push(`${pendingDocs} pending`)

                    return (
                      <div
                        key={driver.id}
                        className={`flex items-center justify-between p-3 rounded-[10px] border transition-colors cursor-pointer ${getThemeClasses.bg.hover(isDarkMode)} ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}
                        onClick={() => navigate(`/client/driver/${driver.id}`)}
                      >
                        <div className="flex items-center flex-1 min-w-0 gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {driver.name?.charAt(0) || 'D'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${getThemeClasses.text.primary(isDarkMode)}`}>{driver.name}</p>
                            <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              {issues.join(' • ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getComplianceBadge(compliance)}
                          <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Recent Drivers */}
            <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Recently Added</h2>
                  <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Latest employees in the system</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                  onClick={() => navigate('/client/drivers')}
                >
                  View All
                </Button>
              </div>

              {recentDrivers.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={`text-sm font-medium mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>No Employees Yet</p>
                  <p className={`text-sm mb-3 ${getThemeClasses.text.secondary(isDarkMode)}`}>Add your first employee to get started</p>
                  <Button
                    size="sm"
                    className={`rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}
                    onClick={() => navigate('/client/add-a-driver')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentDrivers.map(driver => {
                    const compliance = getDriverCompliance(driver)

                    return (
                      <div
                        key={driver.id}
                        className={`flex items-center justify-between p-3 rounded-[10px] border transition-colors cursor-pointer ${getThemeClasses.bg.hover(isDarkMode)} ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}
                        onClick={() => navigate(`/client/driver/${driver.id}`)}
                      >
                        <div className="flex items-center flex-1 min-w-0 gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {driver.name?.charAt(0) || 'D'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${getThemeClasses.text.primary(isDarkMode)}`}>{driver.name}</p>
                            <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              Added {formatDate(driver.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getComplianceBadge(compliance)}
                          <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Quick Actions */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="mb-4">
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Quick Actions</h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Common tasks and shortcuts</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className={`justify-start rounded-[10px] h-auto py-3 ${getThemeClasses.button.secondary(isDarkMode)}`}
                onClick={() => navigate('/client/add-a-driver')}
              >
                <UserPlus className="w-4 h-4 mr-2 shrink-0" />
                <span className="text-sm">Add New Employee</span>
              </Button>
              <Button
                variant="outline"
                className={`justify-start rounded-[10px] h-auto py-3 ${getThemeClasses.button.secondary(isDarkMode)}`}
                onClick={() => navigate('/client/reminders')}
              >
                <Bell className="w-4 h-4 mr-2 shrink-0" />
                <span className="text-sm">View Reminders</span>
              </Button>
              <Button
                variant="outline"
                className={`justify-start rounded-[10px] h-auto py-3 ${getThemeClasses.button.secondary(isDarkMode)}`}
                onClick={() => navigate('/client/settings')}
              >
                <Settings className="w-4 h-4 mr-2 shrink-0" />
                <span className="text-sm">Configure Settings</span>
              </Button>
              <Button
                variant="outline"
                className={`justify-start rounded-[10px] h-auto py-3 ${getThemeClasses.button.secondary(isDarkMode)}`}
                onClick={() => setShowCreateTicketModal(true)}
              >
                <Ticket className="w-4 h-4 mr-2 shrink-0" />
                <span className="text-sm">Report an Issue</span>
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal open={showCreateTicketModal} onOpenChange={setShowCreateTicketModal} />
    </div>
  )
}

export default ClientDashboard
