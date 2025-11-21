import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  AlertTriangle,
  AlertOctagon,
  Info,
  Calendar,
  MapPin,
  Monitor,
  Download,
  Search,
  Filter,
  User,
  Lock,
  Activity,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
import { format } from 'date-fns';

const SecurityLogsPage = () => {
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterEventType, setFilterEventType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch security logs data
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['securityLogs', currentPage, filterSeverity, filterEventType, searchTerm],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams({
        page: currentPage,
        limit: 50,
      });

      if (filterSeverity !== 'all') {
        params.append('severity', filterSeverity);
      }
      if (filterEventType !== 'all') {
        params.append('eventType', filterEventType);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/security-logs?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch security logs');
      return response.json();
    },
  });

  // Fetch security stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['securityStats'],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/security-logs/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch security stats');
      return response.json();
    },
  });

  const stats = statsData?.data || {
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    byTimeRange: { last24Hours: 0, last7Days: 0, last30Days: 0 },
    blockedEvents: 0,
  };

  const events = logsData?.data?.events || [];
  const pagination = logsData?.data?.pagination || {
    total: 0,
    page: 1,
    totalPages: 1,
  };

  const eventTypeLabels = {
    FAILED_LOGIN: 'Failed Login',
    MULTIPLE_FAILED_LOGINS: 'Multiple Failed Logins',
    MULTIPLE_FAILED_MFA: 'Multiple Failed MFA',
    ACCOUNT_LOCKED: 'Account Locked',
    UNAUTHORIZED_ACCESS_ATTEMPT: 'Unauthorized Access',
    SUSPICIOUS_ACTIVITY: 'Suspicious Activity',
    RATE_LIMIT_EXCEEDED: 'Rate Limit Exceeded',
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-500';
      case 'HIGH':
        return 'text-orange-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      case 'LOW':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertOctagon className="w-4 h-4" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-4 h-4" />;
      case 'LOW':
        return <Info className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getSeverityBadgeVariant = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'default';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Timestamp',
      'Event Type',
      'Severity',
      'User Email',
      'IP Address',
      'Location',
      'Description',
      'Blocked',
      'Action Taken',
    ];
    const csvData = events.map((event) => [
      format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      eventTypeLabels[event.eventType] || event.eventType,
      event.severity,
      event.userEmail || 'N/A',
      event.ipAddress || 'N/A',
      event.location || 'Unknown',
      event.description.replace(/"/g, '""'),
      event.blocked ? 'Yes' : 'No',
      event.actionTaken || 'None',
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className={`min-h-screen w-screen ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Header */}
      <div className={`border-b ${getThemeClasses.border.primary(isDarkMode)}`}>
        <div className="w-full px-6 py-6 mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)} flex items-center gap-3`}
              >
                <Shield className="w-8 h-8 text-red-500" />
                Security Logs
              </h1>
              <p className={`mt-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Monitor security events and potential threats across the platform
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
          <div
            className={`p-4 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Critical Events (24h)
                </p>
                <p
                  className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}
                >
                  {statsLoading ? (
                    <Skeleton className="w-16 h-8" />
                  ) : (
                    stats.bySeverity.critical.toLocaleString()
                  )}
                </p>
              </div>
              <AlertOctagon className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  High Severity (24h)
                </p>
                <p
                  className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}
                >
                  {statsLoading ? (
                    <Skeleton className="w-16 h-8" />
                  ) : (
                    stats.bySeverity.high.toLocaleString()
                  )}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Last 30 Days
                </p>
                <p
                  className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}
                >
                  {statsLoading ? (
                    <Skeleton className="w-16 h-8" />
                  ) : (
                    stats.byTimeRange.last30Days.toLocaleString()
                  )}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  Blocked Events (24h)
                </p>
                <p
                  className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}
                >
                  {statsLoading ? (
                    <Skeleton className="w-16 h-8" />
                  ) : (
                    stats.blockedEvents.toLocaleString()
                  )}
                </p>
              </div>
              <Lock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`p-4 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)} mb-6`}
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${getThemeClasses.text.secondary(isDarkMode)}`}
                />
                <input
                  type="text"
                  placeholder="Search by email, IP, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-md border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.input(isDarkMode)} ${getThemeClasses.text.primary(isDarkMode)} focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className={`px-4 py-2 rounded-md border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.input(isDarkMode)} ${getThemeClasses.text.primary(isDarkMode)}`}
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className={`px-4 py-2 rounded-md border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.input(isDarkMode)} ${getThemeClasses.text.primary(isDarkMode)}`}
            >
              <option value="all">All Event Types</option>
              <option value="FAILED_LOGIN">Failed Login</option>
              <option value="MULTIPLE_FAILED_LOGINS">Multiple Failed Logins</option>
              <option value="MULTIPLE_FAILED_MFA">Multiple Failed MFA</option>
              <option value="ACCOUNT_LOCKED">Account Locked</option>
              <option value="UNAUTHORIZED_ACCESS_ATTEMPT">Unauthorized Access</option>
              <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
              <option value="RATE_LIMIT_EXCEEDED">Rate Limit Exceeded</option>
            </select>
          </div>
        </div>

        {/* Security Events Table */}
        <div
          className={`rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)} overflow-hidden`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${getThemeClasses.border.primary(isDarkMode)}`}>
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}
                  >
                    Timestamp
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}
                  >
                    Severity
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}
                  >
                    Event Type
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}
                  >
                    User
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}
                  >
                    IP Address
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}
                  >
                    Description
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)} uppercase tracking-wider`}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${getThemeClasses.border.primary(isDarkMode)}`}>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="w-full h-4" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="w-full h-4" />
                      </td>
                    </tr>
                  ))
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Shield
                          className={`w-12 h-12 mb-2 ${getThemeClasses.text.secondary(isDarkMode)}`}
                        />
                        <p className={getThemeClasses.text.secondary(isDarkMode)}>
                          No security events found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={getSeverityBadgeVariant(event.severity)}
                          className={`flex items-center gap-1 w-fit ${getSeverityColor(event.severity)}`}
                        >
                          {getSeverityIcon(event.severity)}
                          {event.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline">
                          {eventTypeLabels[event.eventType] || event.eventType}
                        </Badge>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${getThemeClasses.text.primary(isDarkMode)}`}
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {event.userEmail || 'N/A'}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${getThemeClasses.text.secondary(isDarkMode)}`}
                      >
                        {event.ipAddress || 'N/A'}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${getThemeClasses.text.secondary(isDarkMode)} max-w-md truncate`}
                      >
                        {event.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.blocked ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <Lock className="w-3 h-3" />
                            Blocked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Activity className="w-3 h-3" />
                            Logged
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              className={`px-6 py-4 border-t ${getThemeClasses.border.primary(isDarkMode)} flex items-center justify-between`}
            >
              <div className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
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

export default SecurityLogsPage;
