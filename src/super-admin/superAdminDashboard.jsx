import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  ChevronRight,
  Shield,
  Activity,
  DollarSign,
  UserCheck,
  Calendar,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'
import { DashboardHeader } from '@/components/DashboardHeader'
import { useDashboardStats, useRecentActivity } from '@/hooks/useSuperAdmin'

const SuperAdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { isDarkMode } = useTheme()

  // Fetch real data
  const { data: statsData, isLoading: statsLoading } = useDashboardStats()
  const { data: activityData, isLoading: activityLoading } = useRecentActivity(10)

  const stats = statsData || {
    totalCompanies: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    recentSignups: 0,
  }

  const loading = statsLoading

  return (
    <div className={`flex flex-col w-full min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      {/* Header */}
      <DashboardHeader title="Super Admin Dashboard">
        <Badge className={`rounded-[10px] text-xs ${getThemeClasses.badge.success(isDarkMode)}`}>
          <Shield className="w-3.5 h-3.5 mr-1.5" />
          Super Admin
        </Badge>
      </DashboardHeader>

      {/* Welcome subtitle */}
      <div className={`px-4 md:px-6 py-2 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
        <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
          Welcome back, {user?.firstName || 'Admin'}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Overview Stats */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Companies */}
            <div className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <Building2 className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
                </div>
                <Badge variant="outline" className={`rounded-[6px] text-xs ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-gray-300 text-gray-600'}`}>
                  +12%
                </Badge>
              </div>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2 rounded-[10px]" />
                  <Skeleton className="h-4 w-32 rounded-[10px]" />
                </>
              ) : (
                <>
                  <p className={`text-3xl font-bold mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {stats.totalCompanies}
                  </p>
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    Total Companies
                  </p>
                </>
              )}
            </div>

            {/* Active Users */}
            <div className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <Users className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
                </div>
                <Badge variant="outline" className={`rounded-[6px] text-xs ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-gray-300 text-gray-600'}`}>
                  +8%
                </Badge>
              </div>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2 rounded-[10px]" />
                  <Skeleton className="h-4 w-32 rounded-[10px]" />
                </>
              ) : (
                <>
                  <p className={`text-3xl font-bold mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {stats.totalUsers.toLocaleString()}
                  </p>
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    Total Users
                  </p>
                </>
              )}
            </div>

            {/* Total Revenue */}
            <div className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <DollarSign className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
                </div>
                <Badge variant="outline" className={`rounded-[6px] text-xs ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-gray-300 text-gray-600'}`}>
                  +24%
                </Badge>
              </div>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2 rounded-[10px]" />
                  <Skeleton className="h-4 w-32 rounded-[10px]" />
                </>
              ) : (
                <>
                  <p className={`text-3xl font-bold mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                    ${Math.round(stats.monthlyRevenue).toLocaleString()}
                  </p>
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    Monthly Revenue
                  </p>
                </>
              )}
            </div>

            {/* Active Subscriptions */}
            <div className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <CreditCard className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
                </div>
                <Badge variant="outline" className={`rounded-[6px] text-xs ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-gray-300 text-gray-600'}`}>
                  +6%
                </Badge>
              </div>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2 rounded-[10px]" />
                  <Skeleton className="h-4 w-32 rounded-[10px]" />
                </>
              ) : (
                <>
                  <p className={`text-3xl font-bold mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {stats.activeSubscriptions}
                  </p>
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    Active Subscriptions
                  </p>
                </>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                Quick Actions
              </h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Manage your platform efficiently
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button
                onClick={() => navigate('/super-admin/companies')}
                variant="outline"
                className={`h-auto p-4 justify-start rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
              >
                <Building2 className="w-5 h-5 mr-3" />
                <div className="flex-1 text-left">
                  <p className={`font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                    Manage Companies
                  </p>
                  <p className={`text-xs mt-0.5 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    View and manage all companies
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                onClick={() => navigate('/super-admin/users')}
                variant="outline"
                className={`h-auto p-4 justify-start rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
              >
                <Users className="w-5 h-5 mr-3" />
                <div className="flex-1 text-left">
                  <p className={`font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                    Manage Users
                  </p>
                  <p className={`text-xs mt-0.5 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    View and manage all users
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                onClick={() => navigate('/super-admin/analytics')}
                variant="outline"
                className={`h-auto p-4 justify-start rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
              >
                <Activity className="w-5 h-5 mr-3" />
                <div className="flex-1 text-left">
                  <p className={`font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                    View Analytics
                  </p>
                  <p className={`text-xs mt-0.5 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    Platform insights and metrics
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </section>

          {/* Recent Activity */}
          <section className={`rounded-[10px] p-6 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                Recent Activity
              </h2>
              <p className={`mt-1 text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Latest platform activities
              </p>
            </div>

            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`p-4 rounded-[10px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                    <Skeleton className="h-4 w-3/4 mb-2 rounded-[10px]" />
                    <Skeleton className="h-3 w-1/2 rounded-[10px]" />
                  </div>
                ))}
              </div>
            ) : activityData?.recentCompanies?.length > 0 ? (
              <div className="space-y-3">
                {/* Recent Companies */}
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${getThemeClasses.text.primary(isDarkMode)}`}>
                    Recently Joined Companies
                  </h3>
                  <div className="space-y-2">
                    {activityData.recentCompanies.slice(0, 5).map((company) => (
                      <div
                        key={company.id}
                        className={`flex items-center justify-between p-3 rounded-[10px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                            <Building2 className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {company.name}
                            </p>
                            <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              {company.plan} Plan
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-3 h-3 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                          <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {new Date(company.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Billing */}
                {activityData?.recentBilling?.length > 0 && (
                  <div className="mt-6">
                    <h3 className={`text-sm font-semibold mb-3 ${getThemeClasses.text.primary(isDarkMode)}`}>
                      Recent Transactions
                    </h3>
                    <div className="space-y-2">
                      {activityData.recentBilling.slice(0, 5).map((transaction) => (
                        <div
                          key={transaction.id}
                          className={`flex items-center justify-between p-3 rounded-[10px] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                              <DollarSign className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                                {transaction.company?.name || 'Unknown Company'}
                              </p>
                              <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                                {transaction.plan || 'Credit Purchase'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                              ${transaction.amount.toFixed(2)}
                            </p>
                            <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className={`p-4 rounded-[10px] mb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <Activity className={`w-8 h-8 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`} />
                </div>
                <p className={`text-sm font-medium mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                  No Recent Activity
                </p>
                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Activity will appear here as users join and make transactions
                </p>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
