import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileCheck,
  User,
  Calendar,
  MapPin,
  Hash,
  Mail,
  Download,
  Search,
  Filter,
  Shield,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
import { format } from 'date-fns';

const ConsentLogsPage = () => {
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPolicyType, setFilterPolicyType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch consent logs data
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['consentLogs', currentPage, filterPolicyType, searchTerm],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams({
        page: currentPage,
        limit: 50,
      });

      if (filterPolicyType !== 'all') {
        params.append('policyType', filterPolicyType);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/super-admin/consent-logs?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch consent logs');
      return response.json();
    },
  });

  const stats = logsData?.data?.stats || {
    total: 0,
    byPolicyType: {},
    last30Days: 0,
  };

  const logs = logsData?.data?.logs || [];
  const pagination = logsData?.data?.pagination || {
    total: 0,
    page: 1,
    totalPages: 1,
  };

  const policyTypeLabels = {
    TERMS_OF_SERVICE: 'Terms of Service',
    PRIVACY_POLICY: 'Privacy Policy',
    DATA_PROCESSING_AGREEMENT: 'DPA',
    SMS_CONSENT: 'SMS Consent',
    COOKIE_PREFERENCES: 'Cookies',
    SUPPORT_ACCESS: 'Support Access',
    AI_FAIR_USE_POLICY: 'AI Fair Use',
    GDPR_DATA_PROCESSING_ADDENDUM: 'GDPR Addendum',
    COMPLAINTS_POLICY: 'Complaints',
  };

  const exportToCSV = () => {
    const headers = ['User Email', 'Policy Type', 'Version', 'Accepted At', 'IP Address', 'Region', 'Content Hash'];
    const csvData = logs.map(log => [
      log.userEmail || log.user?.email || 'N/A',
      policyTypeLabels[log.policyType] || log.policyType,
      log.policyVersion,
      format(new Date(log.acceptedAt), 'yyyy-MM-dd HH:mm:ss'),
      log.ipAddress || 'N/A',
      log.region || 'Unknown',
      log.contentHash?.substring(0, 16) + '...' || 'N/A',
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className={`min-h-screen w-screen ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Header */}
      <div className={`border-b ${getThemeClasses.border.primary(isDarkMode)}`}>
        <div className="w-full px-6 py-6 mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)} flex items-center gap-3`}>
                <FileCheck className="w-8 h-8 text-violet-500" />
                Consent Logs
              </h1>
              <p className={`mt-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Policy acceptance records with 24-36 month retention
              </p>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full px-6 py-6 mx-auto">
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
          <div className={`p-4 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Total Consents</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-16 h-8" /> : stats.total.toLocaleString()}
                </p>
              </div>
              <Shield className="w-8 h-8 text-violet-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Last 30 Days</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-16 h-8" /> : stats.last30Days.toLocaleString()}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Terms of Service</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-16 h-8" /> : (stats.byPolicyType.TERMS_OF_SERVICE || 0).toLocaleString()}
                </p>
              </div>
              <FileCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Privacy Policy</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-16 h-8" /> : (stats.byPolicyType.PRIVACY_POLICY || 0).toLocaleString()}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)} mb-6`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${getThemeClasses.text.secondary(isDarkMode)}`} />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-md border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.input(isDarkMode)} ${getThemeClasses.text.primary(isDarkMode)} focus:outline-none focus:ring-2 focus:ring-violet-500`}
                />
              </div>
            </div>

            <select
              value={filterPolicyType}
              onChange={(e) => setFilterPolicyType(e.target.value)}
              className={`px-4 py-2 rounded-md border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.input(isDarkMode)} ${getThemeClasses.text.primary(isDarkMode)}`}
            >
              <option value="all">All Policy Types</option>
              <option value="TERMS_OF_SERVICE">Terms of Service</option>
              <option value="PRIVACY_POLICY">Privacy Policy</option>
              <option value="DATA_PROCESSING_AGREEMENT">DPA</option>
              <option value="SMS_CONSENT">SMS Consent</option>
              <option value="COOKIE_PREFERENCES">Cookies</option>
              <option value="SUPPORT_ACCESS">Support Access</option>
              <option value="AI_FAIR_USE_POLICY">AI Fair Use</option>
              <option value="GDPR_DATA_PROCESSING_ADDENDUM">GDPR Addendum</option>
              <option value="COMPLAINTS_POLICY">Complaints</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className={`rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${getThemeClasses.border.primary(isDarkMode)}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}>
                    User Email
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}>
                    Policy Type
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}>
                    Version
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}>
                    Accepted At
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}>
                    IP Address
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}>
                    Region
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}>
                    Content Hash
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${getThemeClasses.border.primary(isDarkMode)}`}>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="w-full h-4" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-full h-4" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-full h-4" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-full h-4" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-full h-4" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-full h-4" /></td>
                      <td className="px-6 py-4"><Skeleton className="w-full h-4" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileCheck className={`w-12 h-12 mb-2 ${getThemeClasses.text.secondary(isDarkMode)}`} />
                        <p className={getThemeClasses.text.secondary(isDarkMode)}>No consent logs found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {log.userEmail || log.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline">
                          {policyTypeLabels[log.policyType] || log.policyType}
                        </Badge>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        v{log.policyVersion}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(log.acceptedAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        {log.ipAddress || 'N/A'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {log.region || 'Unknown'}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-xs font-mono ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          {log.contentHash ? `${log.contentHash.substring(0, 16)}...` : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={`px-6 py-4 border-t ${getThemeClasses.border.primary(isDarkMode)} flex items-center justify-between`}>
              <div className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page === pagination.totalPages}
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

export default ConsentLogsPage;
