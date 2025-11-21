import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Building2,
  User,
  Calendar,
  TrendingUp,
  Download,
  Filter,
  Search,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
import { format } from 'date-fns';

const AIUsagePage = () => {
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, today, week, month
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  // Fetch AI usage data
  const { data: aiUsageData, isLoading } = useQuery({
    queryKey: ['aiUsage', filterPeriod],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/ai-usage?period=${filterPeriod}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch AI usage data');
      return response.json();
    },
  });

  const stats = aiUsageData?.stats || {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    activeCompanies: 0,
    topFeature: 'Document Analysis',
  };

  const usageRecords = aiUsageData?.records || [];

  // Filter records by search term
  const filteredRecords = usageRecords.filter((record) =>
    record.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPeriod]);

  return (
    <div className={`flex flex-col w-full min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-violet-500/10' : 'bg-violet-100'}`}>
              <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Usage Tracking
              </h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Monitor AI feature usage across all companies and users
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Requests */}
          <div className={`p-6 rounded-xl border ${
            isDarkMode
              ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Requests
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalRequests.toLocaleString()}
              </p>
            )}
          </div>

          {/* Total Tokens */}
          <div className={`p-6 rounded-xl border ${
            isDarkMode
              ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-violet-500/10' : 'bg-violet-100'}`}>
                <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
              </div>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Tokens Used
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {(stats.totalTokens / 1000).toFixed(1)}K
              </p>
            )}
          </div>

          {/* Total Cost */}
          <div className={`p-6 rounded-xl border ${
            isDarkMode
              ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-500/10' : 'bg-green-100'}`}>
                <span className={`text-xl ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>$</span>
              </div>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Estimated Cost
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${stats.totalCost.toFixed(2)}
              </p>
            )}
          </div>

          {/* Active Companies */}
          <div className={`p-6 rounded-xl border ${
            isDarkMode
              ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-100'}`}>
                <Building2 className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Active Companies
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.activeCompanies}
              </p>
            )}
          </div>

          {/* Top Feature */}
          <div className={`p-6 rounded-xl border ${
            isDarkMode
              ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Top Feature
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-32 mt-1" />
            ) : (
              <p className={`text-lg font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.topFeature}
              </p>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`p-6 rounded-xl border mb-6 ${
          isDarkMode
            ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search by company, user, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-violet-500`}
              />
            </div>

            {/* Period Filter */}
            <div className="flex gap-2">
              <Button
                variant={filterPeriod === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterPeriod('all')}
                size="sm"
              >
                All Time
              </Button>
              <Button
                variant={filterPeriod === 'today' ? 'default' : 'outline'}
                onClick={() => setFilterPeriod('today')}
                size="sm"
              >
                Today
              </Button>
              <Button
                variant={filterPeriod === 'week' ? 'default' : 'outline'}
                onClick={() => setFilterPeriod('week')}
                size="sm"
              >
                This Week
              </Button>
              <Button
                variant={filterPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => setFilterPeriod('month')}
                size="sm"
              >
                This Month
              </Button>
            </div>

            {/* Export Button */}
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Usage Records Table */}
        <div className={`rounded-xl border overflow-hidden ${
          isDarkMode
            ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
            : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Timestamp
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Company
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    User
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Feature
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Action
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Provider / Model
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Tokens
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Total Cost
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                {isLoading ? (
                  // Loading skeletons
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    </tr>
                  ))
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Sparkles className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          No AI usage records found
                        </p>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Usage data will appear here when AI features are used
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record, index) => (
                    <tr key={index} className={isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {record.createdAt ? format(new Date(record.createdAt), 'MMM dd, yyyy HH:mm') : '-'}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {record.companyName || 'Unknown'}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {record.userName || 'Unknown'}
                          </div>
                          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {record.userEmail}
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <Badge variant="outline" className={isDarkMode ? 'border-violet-500/30 text-violet-400' : 'border-violet-500 text-violet-700'}>
                          {record.feature || 'Unknown'}
                        </Badge>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {record.action || '-'}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div>
                          <div className="capitalize font-medium">{record.provider || 'N/A'}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {record.model || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div>
                          <div className="font-medium">{record.tokensUsed?.toLocaleString() || 0}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {record.inputTokens || 0} in / {record.outputTokens || 0} out
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        <div>
                          <div>${record.cost?.toFixed(4) || '0.0000'}</div>
                          <div className={`text-xs font-normal ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            incl. $0.09 Lambda
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={record.status === 'SUCCESS' ? 'success' : 'destructive'}>
                          {record.status || 'unknown'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredRecords.length > recordsPerPage && (
            <div className={`flex items-center justify-between px-6 py-4 border-t ${
              isDarkMode ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg"
                >
                  Previous
                </Button>
                <span className={`text-sm px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIUsagePage;
