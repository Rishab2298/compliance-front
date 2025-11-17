import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Users,
  Mail,
  Calendar,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/utils/themeClasses'
import { useNavigate } from 'react-router-dom'

const CompaniesPage = () => {
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const limit = 15

  // Fetch companies data
  const { data, isLoading } = useQuery({
    queryKey: ['superAdminCompanies', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
      })
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/companies?${params}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch companies')
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
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
          <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Companies</h1>
          {!isLoading && data && (
            <Badge className={`rounded-[10px] text-xs ${getThemeClasses.badge.success(isDarkMode)}`}>
              {data.pagination.total} Total
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Search Bar */}
          <div className={`rounded-[10px] p-4 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
              <Input
                type="text"
                placeholder="Search by company name or admin email..."
                value={searchTerm}
                onChange={handleSearch}
                className={`pl-10 rounded-[10px] ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400'
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Companies Table */}
          <div className={`rounded-[10px] border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Company
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Plan
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Drivers
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Team
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Joined
                    </th>
                    <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                  {isLoading ? (
                    [...Array(10)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-[10px]" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32 rounded-[10px]" />
                              <Skeleton className="h-3 w-24 rounded-[10px]" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-[6px]" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-[6px]" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-8 rounded-[10px]" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-8 rounded-[10px]" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-20 rounded-[10px]" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-8 w-20 rounded-[10px] ml-auto" /></td>
                      </tr>
                    ))
                  ) : data?.companies && data.companies.length > 0 ? (
                    data.companies.map((company) => (
                      <tr
                        key={company.id}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                              <Building2 className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-gray-700'}`} />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                                {company.name}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Mail className={`w-3 h-3 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                                  {company.adminEmail || 'No email'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`text-xs rounded-[6px] ${getPlanBadge(company.plan)}`}>
                            {company.plan}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`text-xs rounded-[6px] ${getStatusBadge(company.subscriptionStatus)}`}>
                            {company.subscriptionStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Users className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                            <span className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {company._count?.drivers || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Users className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                            <span className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {company._count?.User || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                            <span className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              {formatDate(company.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/super-admin/companies/${company.id}`)}
                              className={`rounded-[10px] ${
                                isDarkMode
                                  ? 'hover:bg-slate-700 text-violet-400 hover:text-violet-300'
                                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                              }`}
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className={`p-4 rounded-[10px] mb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                            <Building2 className={`w-8 h-8 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`} />
                          </div>
                          <h3 className={`text-lg font-semibold mb-2 ${getThemeClasses.text.primary(isDarkMode)}`}>
                            No companies found
                          </h3>
                          <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {searchTerm ? 'Try adjusting your search terms' : 'Companies will appear here once they sign up'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && data && data.pagination.totalPages > 1 && (
              <div className={`flex items-center justify-between px-6 py-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.pagination.total)} of {data.pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className={`text-sm px-3 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    {page} / {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.totalPages}
                    className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default CompaniesPage
