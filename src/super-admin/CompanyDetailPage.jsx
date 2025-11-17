import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Users,
  Mail,
  Calendar,
  ArrowLeft,
  CreditCard,
  MapPin,
  Briefcase,
  Phone,
  DollarSign,
  FileText,
  TrendingUp,
  User,
  Shield,
  Globe
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'

const CompanyDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

  // Fetch company details
  const { data: company, isLoading } = useQuery({
    queryKey: ['superAdminCompanyDetail', id],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/companies/${id}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch company details')
      const result = await res.json()
      return result.data
    },
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPlanBadge = (plan) => {
    const planColors = {
      Free: isDarkMode ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' : 'bg-slate-50 text-slate-700 border-slate-200',
      Starter: isDarkMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200',
      Professional: isDarkMode ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-violet-50 text-violet-700 border-violet-200',
      Enterprise: isDarkMode ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200',
    }
    return planColors[plan] || planColors.Free
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      ACTIVE: isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200',
      PAST_DUE: isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
      CANCELED: isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200',
      INCOMPLETE: isDarkMode ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200',
    }
    return statusColors[status] || statusColors.ACTIVE
  }

  const getInvoiceStatusBadge = (status) => {
    const statusColors = {
      PAID: isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200',
      PENDING: isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
      FAILED: isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200',
    }
    return statusColors[status] || statusColors.PENDING
  }

  const getDriverStatusBadge = (status) => {
    const statusColors = {
      ACTIVE: isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200',
      INACTIVE: isDarkMode ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' : 'bg-slate-50 text-slate-700 border-slate-200',
      PENDING: isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
    }
    return statusColors[status] || statusColors.PENDING
  }

  const InfoItem = ({ icon: Icon, label, value, iconColor }) => (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
        <Icon className={`w-4 h-4 ${iconColor || (isDarkMode ? 'text-violet-400' : 'text-gray-700')}`} />
      </div>
      <div className="flex-1">
        <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>{label}</p>
        <p className={`text-sm font-medium mt-0.5 ${getThemeClasses.text.primary(isDarkMode)}`}>
          {value || 'N/A'}
        </p>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className={`flex flex-col w-screen min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
        <header className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(isDarkMode)}`}>
          <div className="container flex items-center gap-4 w-full px-6 mx-auto">
            <Skeleton className="h-9 w-24 rounded-[10px]" />
            <Skeleton className="h-7 w-48 rounded-[10px]" />
          </div>
        </header>
        <div className="flex-1 py-8">
          <div className="container w-full px-6 mx-auto space-y-6">
            <Skeleton className="h-40 w-full rounded-[10px]" />
            <Skeleton className="h-60 w-full rounded-[10px]" />
            <Skeleton className="h-60 w-full rounded-[10px]" />
          </div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className={`flex flex-col w-screen min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
        <header className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(isDarkMode)}`}>
          <div className="container flex items-center gap-4 w-full px-6 mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/super-admin/companies')}
              className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className={`text-lg font-semibold mb-2 ${getThemeClasses.text.primary(isDarkMode)}`}>
              Company Not Found
            </h3>
            <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
              The requested company could not be found.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col w-screen min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 rounded-full pointer-events-none left-1/4 w-96 h-96 bg-violet-500/5 blur-3xl"></div>
          <div className="fixed bottom-0 rounded-full pointer-events-none right-1/4 w-96 h-96 bg-purple-500/5 blur-3xl"></div>
        </>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(isDarkMode)}`}>
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/super-admin/companies')}
              className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
              {company.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`rounded-[10px] text-xs ${getPlanBadge(company.plan)}`}>
              {company.plan}
            </Badge>
            <Badge className={`rounded-[10px] text-xs ${getStatusBadge(company.subscriptionStatus)}`}>
              {company.subscriptionStatus}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Overview Section */}
          <div className={`rounded-[10px] border p-6 ${getThemeClasses.bg.card(isDarkMode)}`}>
            <h2 className={`text-lg font-semibold mb-4 ${getThemeClasses.text.primary(isDarkMode)}`}>
              Company Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem
                icon={Building2}
                label="Company Name"
                value={company.name}
              />
              <InfoItem
                icon={Mail}
                label="Admin Email"
                value={company.adminEmail}
              />
              <InfoItem
                icon={Phone}
                label="Admin Phone"
                value={company.adminPhone}
              />
              <InfoItem
                icon={Calendar}
                label="Joined Date"
                value={formatDate(company.createdAt)}
              />
            </div>
          </div>

          {/* Admin User Details */}
          {company.adminUser && (
            <div className={`rounded-[10px] border p-6 ${getThemeClasses.bg.card(isDarkMode)}`}>
              <h2 className={`text-lg font-semibold mb-4 ${getThemeClasses.text.primary(isDarkMode)}`}>
                Admin User Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoItem
                  icon={User}
                  label="Full Name"
                  value={`${company.adminUser.firstName || ''} ${company.adminUser.lastName || ''}`.trim() || 'N/A'}
                />
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={company.adminUser.email}
                />
                <InfoItem
                  icon={Shield}
                  label="Role"
                  value={company.adminUser.role}
                />
              </div>
            </div>
          )}

          {/* Team Members */}
          {company.User && company.User.length > 0 && (
            <div className={`rounded-[10px] border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="p-6 border-b">
                <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  Team Members ({company.User.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Name
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Email
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        DSP Role
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        MFA Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                    {company.User.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4">
                          <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                            {`${member.firstName || ''} ${member.lastName || ''}`.trim() || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {member.email}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {member.dspRole ? (
                            <Badge className={`text-xs rounded-[6px] ${
                              member.dspRole === 'ADMIN'
                                ? (isDarkMode ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-violet-50 text-violet-700 border-violet-200')
                                : member.dspRole === 'COMPLIANCE_MANAGER'
                                ? (isDarkMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200')
                                : member.dspRole === 'HR_LEAD'
                                ? (isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200')
                                : member.dspRole === 'BILLING'
                                ? (isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200')
                                : (isDarkMode ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' : 'bg-slate-50 text-slate-700 border-slate-200')
                            }`}>
                              {member.dspRole.replace(/_/g, ' ')}
                            </Badge>
                          ) : (
                            <span className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`text-xs rounded-[6px] ${
                            member.mfaEnabled
                              ? (isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200')
                              : (isDarkMode ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' : 'bg-slate-50 text-slate-700 border-slate-200')
                          }`}>
                            {member.mfaEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {formatDate(member.createdAt)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Company Details */}
          <div className={`rounded-[10px] border p-6 ${getThemeClasses.bg.card(isDarkMode)}`}>
            <h2 className={`text-lg font-semibold mb-4 ${getThemeClasses.text.primary(isDarkMode)}`}>
              Company Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem
                icon={Building2}
                label="Legal Company Name"
                value={company.legalCompanyName}
              />
              <InfoItem
                icon={Building2}
                label="Operating Name"
                value={company.operatingName}
              />
              <InfoItem
                icon={MapPin}
                label="Country"
                value={company.country}
              />
              <InfoItem
                icon={FileText}
                label="Entity Type"
                value={company.entityType}
              />
              <InfoItem
                icon={FileText}
                label="Business Registration #"
                value={company.businessRegistrationNumber}
              />
              <InfoItem
                icon={Globe}
                label="Company Website"
                value={company.companyWebsite}
              />
              <InfoItem
                icon={Users}
                label="Company Size"
                value={company.companySize}
              />
              <InfoItem
                icon={MapPin}
                label="Operating Region"
                value={company.operatingRegion}
              />
              <InfoItem
                icon={Globe}
                label="States/Provinces"
                value={company.statesProvinces?.join(', ')}
              />
              <InfoItem
                icon={Briefcase}
                label="Industry Type"
                value={company.industryType}
              />
            </div>

            {/* Registered Address */}
            {company.registeredAddress && (
              <div className="mt-6">
                <h3 className={`text-sm font-medium mb-3 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Registered Address
                </h3>
                <div className={`p-4 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {company.registeredAddress.street && `${company.registeredAddress.street}, `}
                    {company.registeredAddress.city && `${company.registeredAddress.city}, `}
                    {company.registeredAddress.state && `${company.registeredAddress.state} `}
                    {company.registeredAddress.postalCode && company.registeredAddress.postalCode}
                    {company.registeredAddress.country && `, ${company.registeredAddress.country}`}
                  </p>
                </div>
              </div>
            )}

            {/* Operating Addresses */}
            {company.operatingAddresses && company.operatingAddresses.length > 0 && (
              <div className="mt-6">
                <h3 className={`text-sm font-medium mb-3 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Operating Addresses
                </h3>
                <div className="space-y-2">
                  {company.operatingAddresses.map((address, index) => (
                    <div key={index} className={`p-4 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                        {address.street && `${address.street}, `}
                        {address.city && `${address.city}, `}
                        {address.state && `${address.state} `}
                        {address.postalCode && address.postalCode}
                        {address.country && `, ${address.country}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DSP Information */}
          {company.isAmazonDSP && (
            <div className={`rounded-[10px] border p-6 ${getThemeClasses.bg.card(isDarkMode)}`}>
              <h2 className={`text-lg font-semibold mb-4 ${getThemeClasses.text.primary(isDarkMode)}`}>
                Amazon DSP Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoItem
                  icon={Building2}
                  label="DSP Company Name"
                  value={company.dspCompanyName}
                />
                <InfoItem
                  icon={User}
                  label="DSP Owner Name"
                  value={company.dspOwnerName}
                />
                <InfoItem
                  icon={User}
                  label="Operations Manager"
                  value={company.opsManagerName}
                />
                <InfoItem
                  icon={FileText}
                  label="DSP ID"
                  value={company.dspId}
                />
                <InfoItem
                  icon={MapPin}
                  label="Station Codes"
                  value={company.stationCodes?.join(', ')}
                />
              </div>
            </div>
          )}

          {/* Billing & Subscription */}
          <div className={`rounded-[10px] border p-6 ${getThemeClasses.bg.card(isDarkMode)}`}>
            <h2 className={`text-lg font-semibold mb-4 ${getThemeClasses.text.primary(isDarkMode)}`}>
              Billing & Subscription
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem
                icon={CreditCard}
                label="Plan"
                value={company.plan}
              />
              <InfoItem
                icon={TrendingUp}
                label="Billing Cycle"
                value={company.billingCycle || 'N/A'}
              />
              <InfoItem
                icon={DollarSign}
                label="AI Credits"
                value={company.aiCredits?.toString()}
                iconColor={isDarkMode ? 'text-green-400' : 'text-green-600'}
              />
              <InfoItem
                icon={Calendar}
                label="Next Billing Date"
                value={formatDate(company.nextBillingDate)}
              />
              <InfoItem
                icon={FileText}
                label="Stripe Customer ID"
                value={company.stripeCustomerId}
              />
              <InfoItem
                icon={Calendar}
                label="Plan Start Date"
                value={formatDate(company.planStartDate)}
              />
              <InfoItem
                icon={Users}
                label="Total Drivers"
                value={company._count?.drivers?.toString() || '0'}
              />
              <InfoItem
                icon={FileText}
                label="Reminder Days"
                value={company.reminderDays?.join(', ') || 'N/A'}
              />
              <InfoItem
                icon={CreditCard}
                label="Payment Method"
                value={company.paymentMethod}
              />
              <InfoItem
                icon={User}
                label="Billing Contact Name"
                value={company.billingContactName}
              />
              <InfoItem
                icon={Mail}
                label="Billing Contact Email"
                value={company.billingContactEmail}
              />
            </div>

            {/* Billing Address */}
            {company.billingAddress && (
              <div className="mt-6">
                <h3 className={`text-sm font-medium mb-3 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Billing Address
                </h3>
                <div className={`p-4 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {company.billingAddress.street && `${company.billingAddress.street}, `}
                    {company.billingAddress.city && `${company.billingAddress.city}, `}
                    {company.billingAddress.state && `${company.billingAddress.state} `}
                    {company.billingAddress.postalCode && company.billingAddress.postalCode}
                    {company.billingAddress.country && `, ${company.billingAddress.country}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Drivers List */}
          {company.drivers && company.drivers.length > 0 && (
            <div className={`rounded-[10px] border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="p-6 border-b">
                <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  Drivers ({company.drivers.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Driver
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Email
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                    {company.drivers.map((driver) => (
                      <tr key={driver.id}>
                        <td className="px-6 py-4">
                          <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                            {driver.firstName} {driver.lastName}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {driver.email || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`text-xs rounded-[6px] ${getDriverStatusBadge(driver.status)}`}>
                            {driver.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {formatDate(driver.createdAt)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Billing History */}
          {company.billingHistory && company.billingHistory.length > 0 && (
            <div className={`rounded-[10px] border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="p-6 border-b">
                <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  Recent Billing History
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Invoice
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Amount
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                    {company.billingHistory.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4">
                          <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                            {invoice.invoiceNumber || invoice.id.slice(0, 8)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                            ${invoice.amount?.toFixed(2) || '0.00'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`text-xs rounded-[6px] ${getInvoiceStatusBadge(invoice.status)}`}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {formatDateTime(invoice.paidAt || invoice.createdAt)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Credit Transactions */}
          {company.creditTransactions && company.creditTransactions.length > 0 && (
            <div className={`rounded-[10px] border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="p-6 border-b">
                <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  Recent Credit Transactions
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Type
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Amount
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Balance After
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Description
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                    {company.creditTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4">
                          <Badge className={`text-xs rounded-[6px] ${
                            transaction.type === 'CREDIT'
                              ? (isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200')
                              : (isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200')
                          }`}>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm font-medium ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'CREDIT' ? '+' : '-'}{transaction.amount}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                            {transaction.balanceAfter}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {transaction.description || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {formatDateTime(transaction.createdAt)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default CompanyDetailPage
