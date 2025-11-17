import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  TrendingUp,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
import { format } from 'date-fns';

const SystemLogsPage = () => {
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();

  // Fetch system metrics
  const { data: metricsData, isLoading, refetch } = useQuery({
    queryKey: ['systemMetrics'],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/super-admin/system-metrics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch system metrics');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const metrics = metricsData || {};
  const { server, performance, resources, database, errors, crashes, endpoints } = metrics;

  const getStatusColor = (status) => {
    return status === 'healthy' ? 'text-green-500' : 'text-yellow-500';
  };

  const getStatusIcon = (status) => {
    return status === 'healthy' ? (
      <CheckCircle className="w-6 h-6 text-green-500" />
    ) : (
      <AlertTriangle className="w-6 h-6 text-yellow-500" />
    );
  };

  return (
    <div className={`min-h-screen w-screen ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Header */}
      <div className={`border-b  ${getThemeClasses.border.primary(isDarkMode)}`}>
        <div className="w-full px-6 py-6 mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${getThemeClasses.text.primary(isDarkMode)} flex items-center gap-3`}>
                <Server className="w-8 h-8 text-violet-500" />
                System Health
              </h1>
              <p className={`mt-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                Real-time server performance and monitoring
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isLoading && metrics.status && (
                <div className="flex items-center gap-2">
                  {getStatusIcon(metrics.status)}
                  <span className={`font-semibold capitalize ${getStatusColor(metrics.status)}`}>
                    {metrics.status}
                  </span>
                </div>
              )}
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-6 mx-auto space-y-6">
        {/* Server Info Card */}
        <div className={`p-6 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}>
          <h2 className={`text-xl font-bold ${getThemeClasses.text.primary(isDarkMode)} flex items-center gap-2 mb-4`}>
            <Server className="w-5 h-5 text-violet-500" />
            Server Information
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Uptime</p>
              <p className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {isLoading ? <Skeleton className="w-20 h-6" /> : server?.uptimeFormatted || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Node Version</p>
              <p className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {isLoading ? <Skeleton className="w-16 h-6" /> : server?.nodeVersion || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Platform</p>
              <p className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {isLoading ? <Skeleton className="w-16 h-6" /> : server?.platform || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Environment</p>
              <p className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {isLoading ? <Skeleton className="w-24 h-6" /> : (
                  <Badge variant={server?.env === 'production' ? 'default' : 'secondary'}>
                    {server?.env || 'N/A'}
                  </Badge>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className={`p-6 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}>
          <h2 className={`text-xl font-bold ${getThemeClasses.text.primary(isDarkMode)} flex items-center gap-2 mb-4`}>
            <Activity className="w-5 h-5 text-blue-500" />
            Performance Metrics
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Avg Response Time</p>
              <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {isLoading ? <Skeleton className="w-16 h-8" /> : `${performance?.avgResponseTime || 0}ms`}
              </p>
            </div>
            <div>
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>P95 Response Time</p>
              <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {isLoading ? <Skeleton className="w-16 h-8" /> : `${performance?.p95ResponseTime || 0}ms`}
              </p>
            </div>
            <div>
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Requests/Min</p>
              <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {isLoading ? <Skeleton className="w-16 h-8" /> : (performance?.requestsPerMinute || 0)}
              </p>
            </div>
            <div>
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Error Rate</p>
              <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {isLoading ? <Skeleton className="w-16 h-8" /> : (performance?.errorRate || '0%')}
              </p>
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Memory */}
          <div className={`p-6 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}>
            <h3 className={`text-lg font-bold ${getThemeClasses.text.primary(isDarkMode)} flex items-center gap-2 mb-4`}>
              <HardDrive className="w-5 h-5 text-purple-500" />
              Memory Usage
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>System Memory</span>
                  <span className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {isLoading ? <Skeleton className="w-20 h-4" /> : `${resources?.memory?.usagePercent || 0}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div
                    className="bg-purple-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${resources?.memory?.usagePercent || 0}%` }}
                  ></div>
                </div>
                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)} mt-1`}>
                  {isLoading ? <Skeleton className="w-32 h-3" /> : `${resources?.memory?.systemUsed || 0} GB / ${resources?.memory?.systemTotal || 0} GB`}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Heap Used: {resources?.memory?.heapUsed || 0} MB</p>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Heap Total: {resources?.memory?.heapTotal || 0} MB</p>
              </div>
            </div>
          </div>

          {/* CPU */}
          <div className={`p-6 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}>
            <h3 className={`text-lg font-bold ${getThemeClasses.text.primary(isDarkMode)} flex items-center gap-2 mb-4`}>
              <Cpu className="w-5 h-5 text-green-500" />
              CPU Load
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Load Average (1min)</span>
                  <span className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {isLoading ? <Skeleton className="w-16 h-4" /> : `${resources?.cpu?.loadPercent || 0}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(parseFloat(resources?.cpu?.loadPercent || 0), 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Cores: {resources?.cpu?.cores || 0}</p>
                <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)} mt-1`}>
                  Load: {resources?.cpu?.loadAverage?.['1min'] || 0} (1m) | {resources?.cpu?.loadAverage?.['5min'] || 0} (5m) | {resources?.cpu?.loadAverage?.['15min'] || 0} (15m)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Errors & Database */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Errors */}
          <div className={`p-6 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}>
            <h3 className={`text-lg font-bold ${getThemeClasses.text.primary(isDarkMode)} flex items-center gap-2 mb-4`}>
              <AlertCircle className="w-5 h-5 text-red-500" />
              Errors & Crashes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Errors (1h)</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-12 h-8" /> : (errors?.last1h || 0)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Errors (24h)</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-12 h-8" /> : (errors?.last24h || 0)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Uncaught</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-12 h-8" /> : (errors?.uncaughtExceptions || 0)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Crashes</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-12 h-8" /> : (crashes?.total || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Database */}
          <div className={`p-6 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}>
            <h3 className={`text-lg font-bold ${getThemeClasses.text.primary(isDarkMode)} flex items-center gap-2 mb-4`}>
              <Database className="w-5 h-5 text-blue-500" />
              Database
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Pool Size</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-12 h-8" /> : (database?.poolSize || 0)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Active</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-12 h-8" /> : (database?.activeConnections || 0)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Tables</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-12 h-8" /> : (database?.tableCount || 0)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>Size</p>
                <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {isLoading ? <Skeleton className="w-12 h-8" /> : (database?.size || '0 GB')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoint Performance */}
        <div className={`p-6 rounded-lg border ${getThemeClasses.border.primary(isDarkMode)} ${getThemeClasses.bg.card(isDarkMode)}`}>
          <h3 className={`text-lg font-bold ${getThemeClasses.text.primary(isDarkMode)} flex items-center gap-2 mb-4`}>
            <Zap className="w-5 h-5 text-yellow-500" />
            Endpoint Performance
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Slowest Endpoints */}
            <div>
              <h4 className={`text-sm font-semibold ${getThemeClasses.text.secondary(isDarkMode)} mb-3`}>Slowest Endpoints</h4>
              <div className="space-y-2">
                {isLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="w-full h-12" />)
                ) : endpoints?.slowest?.length > 0 ? (
                  endpoints.slowest.map((ep, i) => (
                    <div key={i} className={`p-2 rounded border ${getThemeClasses.border.primary(isDarkMode)}`}>
                      <p className={`text-xs font-mono ${getThemeClasses.text.primary(isDarkMode)} truncate`}>{ep.endpoint}</p>
                      <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>{ep.avgTime}ms avg</p>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>No data yet</p>
                )}
              </div>
            </div>

            {/* Most Called */}
            <div>
              <h4 className={`text-sm font-semibold ${getThemeClasses.text.secondary(isDarkMode)} mb-3`}>Most Called</h4>
              <div className="space-y-2">
                {isLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="w-full h-12" />)
                ) : endpoints?.mostCalled?.length > 0 ? (
                  endpoints.mostCalled.map((ep, i) => (
                    <div key={i} className={`p-2 rounded border ${getThemeClasses.border.primary(isDarkMode)}`}>
                      <p className={`text-xs font-mono ${getThemeClasses.text.primary(isDarkMode)} truncate`}>{ep.endpoint}</p>
                      <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>{ep.requests} requests</p>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>No data yet</p>
                )}
              </div>
            </div>

            {/* Highest Error Rate */}
            <div>
              <h4 className={`text-sm font-semibold ${getThemeClasses.text.secondary(isDarkMode)} mb-3`}>Highest Error Rate</h4>
              <div className="space-y-2">
                {isLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="w-full h-12" />)
                ) : endpoints?.highestErrorRate?.length > 0 ? (
                  endpoints.highestErrorRate.map((ep, i) => (
                    <div key={i} className={`p-2 rounded border ${getThemeClasses.border.primary(isDarkMode)}`}>
                      <p className={`text-xs font-mono ${getThemeClasses.text.primary(isDarkMode)} truncate`}>{ep.endpoint}</p>
                      <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>{ep.errorRate} error rate</p>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>No errors</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogsPage;
