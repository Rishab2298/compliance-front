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
} from 'lucide-react'
import { useDrivers } from '@/hooks/useDrivers'
import { useCompany } from '@/hooks/useCompany'
import { useReminders } from '@/hooks/useReminders'

const ClientDashboard = () => {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { user } = useUser()
  const companyId = user?.publicMetadata?.companyId

  // Fetch data using existing hooks
  const { data: drivers = [], isLoading: driversLoading } = useDrivers()
  const { data: company, isLoading: companyLoading } = useCompany(companyId)
  const { data: remindersData, isLoading: remindersLoading } = useReminders()

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

  // Count documents by status
  const countDocumentsByStatus = () => {
    const counts = {
      expired: 0,
      expiringSoon: 0,
      active: 0,
      pending: 0,
    }

    drivers.forEach(driver => {
      const docs = driver.documents || []
      docs.forEach(doc => {
        if (doc.status === 'EXPIRED') counts.expired++
        else if (doc.status === 'EXPIRING_SOON') counts.expiringSoon++
        else if (doc.status === 'ACTIVE') counts.active++
        else if (doc.status === 'PENDING') counts.pending++
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

  const loading = driversLoading || companyLoading || remindersLoading

  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <Skeleton className="h-7 w-32 rounded-[10px]" />
            <Skeleton className="h-10 w-32 rounded-[10px]" />
          </div>
        </header>
        <div className="flex-1 py-8">
          <div className="container w-full px-6 mx-auto space-y-6">
            <Skeleton className="h-48 w-full rounded-[10px]" />
            <Skeleton className="h-64 w-full rounded-[10px]" />
            <Skeleton className="h-56 w-full rounded-[10px]" />
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
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <Button
            onClick={() => navigate('/client/add-a-driver')}
            className="bg-gray-800 text-white hover:bg-gray-900 rounded-[10px]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Critical Alerts */}
          {(docCounts.expired > 0 || stats.critical > 0) && (
            <section className="bg-red-50 rounded-[10px] border border-red-200 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 mb-1">
                    Critical Compliance Issues
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-red-700">
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
                  className="rounded-[10px] border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => navigate('/client/reminders')}
                >
                  View Details
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </section>
          )}

          {/* Overview Stats */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
              <p className="mt-1 text-sm text-gray-500">Key metrics for your fleet compliance</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="cursor-pointer" onClick={() => navigate('/client/drivers')}>
                <Label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Total Drivers</Label>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalDrivers}</p>
                <p className="mt-1 text-xs text-gray-500">Active in system</p>
              </div>

              <div className="cursor-pointer" onClick={() => navigate('/client/drivers')}>
                <Label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Compliance Rate</Label>
                <p className="mt-2 text-3xl font-bold text-gray-900">{complianceRate}%</p>
                <p className="mt-1 text-xs text-gray-500">
                  {complianceRate >= 90 ? 'Excellent' : complianceRate >= 70 ? 'Good' : 'Needs attention'}
                </p>
              </div>

              <div className="cursor-pointer" onClick={() => navigate('/client/reminders')}>
                <Label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Expiring Soon</Label>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {stats.critical} critical • {stats.warning} warning
                </p>
              </div>

              <div className="cursor-pointer" onClick={() => navigate('/client/document-status')}>
                <Label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Pending Review</Label>
                <p className="mt-2 text-3xl font-bold text-gray-900">{docCounts.pending}</p>
                <p className="mt-1 text-xs text-gray-500">Awaiting verification</p>
              </div>
            </div>
          </section>

          {/* Credits Usage */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Credits & Usage</h2>
                <p className="mt-1 text-sm text-gray-500">Current plan: {company?.plan || 'Professional'}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-[10px]"
                onClick={() => navigate('/client/billing')}
              >
                Manage Plan
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label className="text-xs font-medium tracking-wider text-gray-500 uppercase">AI Credits Remaining</Label>
                <p className="mt-2 text-3xl font-bold text-gray-900">{company?.aiCredits || 0}</p>
                <p className="mt-1 text-xs text-gray-500">Used for document scanning and processing</p>
              </div>

              <div>
                <Label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Active Drivers</Label>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalDrivers}</p>
                <p className="mt-1 text-xs text-gray-500">Unlimited on current plan</p>
              </div>
            </div>

            {company?.aiCredits < 5 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-[10px]">
                <p className="text-sm text-yellow-900">
                  <span className="font-semibold">⚠️ Low Credits:</span> You have less than 5 AI credits remaining. Consider upgrading your plan or purchasing additional credits.
                </p>
              </div>
            )}
          </section>

          {/* Document Status */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Document Status</h2>
                <p className="mt-1 text-sm text-gray-500">Overview of all documents by status</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-[10px]"
                onClick={() => navigate('/client/document-status')}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-900">{docCounts.active}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-500">Up to date</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-900">{docCounts.expiringSoon}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Expiring Soon</p>
                <p className="text-xs text-gray-500">Action needed</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-900">{docCounts.expired}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Expired</p>
                <p className="text-xs text-gray-500">Urgent</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-900">{docCounts.pending}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Pending</p>
                <p className="text-xs text-gray-500">Under review</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Drivers with Issues */}
            <section className="bg-white rounded-[10px] p-6 border border-gray-200">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Drivers Requiring Attention</h2>
                <p className="mt-1 text-sm text-gray-500">Non-compliant drivers with missing, expired, expiring, or pending documents</p>
              </div>

              {driversWithIssues.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 mb-1">All Clear!</p>
                  <p className="text-sm text-gray-500">All drivers are fully compliant</p>
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
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px] border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/client/driver/${driver.id}`)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium text-sm shrink-0">
                            {driver.name?.charAt(0) || 'D'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{driver.name}</p>
                            <p className="text-xs text-gray-500">
                              {issues.join(' • ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getComplianceBadge(compliance)}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Recent Drivers */}
            <section className="bg-white rounded-[10px] p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recently Added</h2>
                  <p className="mt-1 text-sm text-gray-500">Latest drivers in the system</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-[10px]"
                  onClick={() => navigate('/client/drivers')}
                >
                  View All
                </Button>
              </div>

              {recentDrivers.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900 mb-1">No Drivers Yet</p>
                  <p className="text-sm text-gray-500 mb-3">Add your first driver to get started</p>
                  <Button
                    size="sm"
                    className="bg-gray-800 text-white hover:bg-gray-900 rounded-[10px]"
                    onClick={() => navigate('/client/add-a-driver')}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Driver
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentDrivers.map(driver => {
                    const compliance = getDriverCompliance(driver)

                    return (
                      <div
                        key={driver.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px] border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/client/driver/${driver.id}`)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium text-sm shrink-0">
                            {driver.name?.charAt(0) || 'D'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{driver.name}</p>
                            <p className="text-xs text-gray-500">
                              Added {formatDate(driver.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getComplianceBadge(compliance)}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Quick Actions */}
          <section className="bg-white rounded-[10px] p-6 border border-gray-200">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <p className="mt-1 text-sm text-gray-500">Common tasks and shortcuts</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Button
                variant="outline"
                className="justify-start rounded-[10px] h-auto py-3"
                onClick={() => navigate('/client/add-a-driver')}
              >
                <UserPlus className="w-4 h-4 mr-2 shrink-0" />
                <span className="text-sm">Add New Driver</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start rounded-[10px] h-auto py-3"
                onClick={() => navigate('/client/reminders')}
              >
                <Bell className="w-4 h-4 mr-2 shrink-0" />
                <span className="text-sm">View Reminders</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start rounded-[10px] h-auto py-3"
                onClick={() => navigate('/client/settings')}
              >
                <Settings className="w-4 h-4 mr-2 shrink-0" />
                <span className="text-sm">Configure Settings</span>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard
