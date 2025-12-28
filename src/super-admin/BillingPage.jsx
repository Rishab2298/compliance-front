import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'

const BillingPage = () => {
  const { isDarkMode } = useTheme()
  const [expandedCompany, setExpandedCompany] = useState(null)

  // Fetch billing data
  const { data, isLoading } = useQuery({
    queryKey: ['superAdminBilling'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/billing`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch billing data')
      const result = await res.json()
      console.log('🔍 Billing API Response:', result)
      console.log('📊 Companies:', result.data?.companies?.length)
      console.log('💳 Billing History:', result.data?.billingHistory?.length)
      console.log('💰 Credit Transactions:', result.data?.creditTransactions?.length)
      return result.data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      ACTIVE: isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200',
      PAST_DUE: isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
      CANCELED: isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200',
      PAID: isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200',
      PENDING: isDarkMode ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' : 'bg-slate-50 text-slate-700 border-slate-200',
    }
    return statusColors[status] || statusColors.PENDING
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
      <header className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(isDarkMode)}`}>
        <div className="flex items-center justify-between w-full px-6 mx-auto">
          <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Billing & Revenue</h1>
          {!isLoading && data && (
            <Badge className={`rounded-[10px] text-xs ${getThemeClasses.badge.success(isDarkMode)}`}>
              {data.stats.totalCompanies} Companies
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="w-full px-6 space-y-6">

          {/* Revenue Stats */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <div className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-green-500/20' : 'bg-green-50'}`}>
                  <DollarSign className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <ArrowUpRight className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2 rounded-[10px]" />
                  <Skeleton className="h-4 w-32 rounded-[10px]" />
                </>
              ) : (
                <>
                  <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {formatCurrency(data?.stats.totalRevenue)}
                  </p>
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    Total Revenue ({data?.stats.totalTransactions} transactions)
                  </p>
                </>
              )}
            </div>

            {/* Monthly Revenue */}
            <div className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                  <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2 rounded-[10px]" />
                  <Skeleton className="h-4 w-32 rounded-[10px]" />
                </>
              ) : (
                <>
                  <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {formatCurrency(data?.stats.monthlyRevenue)}
                  </p>
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    This Month ({data?.stats.monthlyTransactions} transactions)
                  </p>
                </>
              )}
            </div>

            {/* Active Subscriptions */}
            <div className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-violet-500/20' : 'bg-violet-50'}`}>
                  <Users className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                </div>
                <Building2 className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
              </div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2 rounded-[10px]" />
                  <Skeleton className="h-4 w-32 rounded-[10px]" />
                </>
              ) : (
                <>
                  <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {data?.stats.subscriptionBreakdown?.find(s => s.status === 'ACTIVE')?.count || 0}
                  </p>
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    Active Subscriptions
                  </p>
                </>
              )}
            </div>

            {/* Plan Distribution */}
            <div className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
                  <CreditCard className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
              </div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2 rounded-[10px]" />
                  <Skeleton className="h-4 w-32 rounded-[10px]" />
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    {data?.stats.planDistribution?.map((plan) => (
                      <div key={plan.plan} className="flex items-center justify-between">
                        <span className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>{plan.plan}:</span>
                        <span className={`text-xs font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>{plan.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Companies & Plans */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Companies & Plans</h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                All registered companies and their subscription details
              </p>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className={`p-4 rounded-[10px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                    <Skeleton className="h-5 w-48 mb-2 rounded-[10px]" />
                    <Skeleton className="h-4 w-32 rounded-[10px]" />
                  </div>
                ))
              ) : data?.companies.length === 0 ? (
                <div className="py-8 text-center">
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>No companies found</p>
                </div>
              ) : (
                data?.companies.map((company) => (
                  <div
                    key={company.id}
                    className={`rounded-[10px] border transition-colors ${
                      isDarkMode
                        ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
                    >
                      <div className="flex items-center flex-1 gap-4">
                        <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                          <Building2 className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {company.name}
                            </p>
                            <Badge className={`text-xs rounded-[6px] ${getPlanBadge(company.plan)}`}>
                              {company.plan}
                            </Badge>
                            <Badge className={`text-xs rounded-[6px] ${getStatusBadge(company.subscriptionStatus)}`}>
                              {company.subscriptionStatus}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              {company.adminEmail}
                            </p>
                            <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>•</span>
                            <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              {company._count.drivers} drivers
                            </p>
                            <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>•</span>
                            <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              {company.aiCredits} AI credits
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {company._count.billingHistory} invoices
                          </p>
                          <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {company._count.creditTransactions} credits
                          </p>
                        </div>
                        {expandedCompany === company.id ? (
                          <ChevronUp className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
                        ) : (
                          <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedCompany === company.id && (
                      <div className={`px-4 pb-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">
                          <div>
                            <p className={`text-xs font-medium mb-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              Billing Cycle
                            </p>
                            <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {company.billingCycle || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs font-medium mb-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              Plan Start Date
                            </p>
                            <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {formatDate(company.planStartDate)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs font-medium mb-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              Next Billing
                            </p>
                            <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {formatDate(company.nextBillingDate)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs font-medium mb-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              Joined
                            </p>
                            <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {formatDate(company.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Transaction Logs (Billing) */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Billing Transactions</h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                All subscription and plan billing transactions across all companies
              </p>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-[10px] border ${
                      isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-[10px]" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 rounded-[10px]" />
                        <Skeleton className="h-3 w-24 rounded-[10px]" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16 rounded-[10px]" />
                  </div>
                ))
              ) : (
                <>
                  {/* Billing History */}
                  {data?.billingHistory && data.billingHistory.length > 0 ? (
                    <>
                      {data.billingHistory.map((invoice) => (
                        <div
                          key={invoice.id}
                          className={`flex items-center justify-between p-3 rounded-[10px] border transition-colors ${
                            isDarkMode
                              ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                              <FileText className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                                  {invoice.invoiceNumber}
                                </p>
                                <Badge className={`text-xs rounded-[6px] ${getStatusBadge(invoice.status)}`}>
                                  {invoice.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                                  {invoice.company.name}
                                </p>
                                <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>•</span>
                                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                                  {formatDate(invoice.paidAt || invoice.createdAt)}
                                </p>
                                {invoice.plan && (
                                  <>
                                    <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>•</span>
                                    <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                                      {invoice.plan} Plan
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                            {formatCurrency(invoice.amount)}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className={`p-3 rounded-[10px] mb-3 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                        <FileText className={`w-6 h-6 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`} />
                      </div>
                      <p className={`mb-1 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                        No billing transactions found
                      </p>
                      <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Billing transactions will appear here once companies subscribe to plans
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Credit Logs */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Credit Logs</h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                All AI credit transactions including purchases, usage, and refills
              </p>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-[10px] border ${
                      isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-[10px]" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 rounded-[10px]" />
                        <Skeleton className="h-3 w-24 rounded-[10px]" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16 rounded-[10px]" />
                  </div>
                ))
              ) : (
                <>
                  {data?.creditTransactions && data.creditTransactions.length > 0 ? (
                    <>
                      {data.creditTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className={`flex items-center justify-between p-3 rounded-[10px] border transition-colors ${
                            isDarkMode
                              ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                              <CreditCard className={`w-4 h-4 ${
                                transaction.type === 'USED'
                                  ? isDarkMode ? 'text-red-400' : 'text-red-600'
                                  : isDarkMode ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                                  {transaction.type}
                                </p>
                                <Badge className={`text-xs rounded-[6px] ${
                                  transaction.type === 'USED'
                                    ? isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'
                                    : isDarkMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {transaction.amount} credits
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                                  {transaction.company.name}
                                </p>
                                <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>•</span>
                                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                                  {formatDate(transaction.createdAt)}
                                </p>
                                {transaction.reason && (
                                  <>
                                    <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>•</span>
                                    <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                                      {transaction.reason}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${
                              transaction.type === 'USED'
                                ? isDarkMode ? 'text-red-400' : 'text-red-600'
                                : isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              {transaction.type === 'USED' ? '-' : '+'}{transaction.amount}
                            </p>
                            <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              Balance: {transaction.balanceAfter}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className={`p-3 rounded-[10px] mb-3 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                        <CreditCard className={`w-6 h-6 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`} />
                      </div>
                      <p className={`mb-1 text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                        No credit transactions found
                      </p>
                      <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Credit transactions will appear here once companies use AI features
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

export default BillingPage
