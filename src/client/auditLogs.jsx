import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Filter,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Calendar,
  Eye,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
import { usePermissions } from '@/hooks/usePermissions';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getAuditLogs,
  verifyLogIntegrity,
  exportAuditLogs,
  downloadFile,
} from '@/api/auditLogs';

const AuditLogs = () => {
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const { hasCapability, dspRole, isSuperAdmin } = usePermissions();

  // Filter states
  const [filters, setFilters] = useState({
    action: 'all',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 20,
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Check permission
  if (!hasCapability('view_audit_logs')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-8">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">
          You don't have permission to view audit logs.
        </p>
      </div>
    );
  }

  // Fetch audit logs
  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: async () => {
      const token = await getToken();
      return getAuditLogs(filters, token);
    },
  });

  const logs = logsData?.logs || [];
  const totalLogs = logsData?.total || 0;
  const totalPages = Math.ceil(totalLogs / filters.limit);

  // Verify integrity mutation
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return verifyLogIntegrity(null, 'audit', token);
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast.success('Audit logs verified successfully!', {
          description: 'No tampering detected. Logs are authentic.',
          icon: <ShieldCheck className="w-5 h-5" />,
        });
      } else {
        toast.error('Integrity check failed!', {
          description: data.error || 'Possible tampering detected.',
          icon: <ShieldAlert className="w-5 h-5" />,
        });
      }
    },
    onError: (error) => {
      toast.error('Verification failed', {
        description: error.message,
      });
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (format) => {
      const token = await getToken();
      return exportAuditLogs(filters, format, token);
    },
    onSuccess: (blob, format) => {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `audit-logs-${timestamp}.${format}`;
      downloadFile(blob, filename);
      toast.success(`Audit logs exported as ${format.toUpperCase()}`);
    },
    onError: (error) => {
      toast.error('Export failed', {
        description: error.message,
      });
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      action: 'all',
      startDate: '',
      endDate: '',
      search: '',
      page: 1,
      limit: 20,
    });
  };

  const setDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    setFilters((prev) => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const openDetailsDialog = (log) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBadge = (category) => {
    const colors = {
      AUTHENTICATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      AUTHORIZATION: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      DOCUMENT_MANAGEMENT: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      DRIVER_MANAGEMENT: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      USER_MANAGEMENT: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      BILLING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      SYSTEM: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // BILLING role sees only billing logs
  const isBillingRole = dspRole === 'BILLING';

  return (
    <div className={`flex flex-col w-full min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      <DashboardHeader title="Audit Logs">
        <div className="flex items-center gap-2">
          {/* Verify - hide on mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending}
            className="gap-2 hidden md:flex"
          >
            <Shield className="w-4 h-4" />
            Verify Integrity
          </Button>

          {/* Export CSV - hide text on mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMutation.mutate('csv')}
            disabled={exportMutation.isPending}
            className="gap-2 hidden sm:flex"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>

          {/* Export JSON - hide on small screens */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMutation.mutate('json')}
            disabled={exportMutation.isPending}
            className="gap-2 hidden lg:flex"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </Button>

          {/* Refresh - always visible */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </DashboardHeader>

      <main className="container px-6 py-8 mx-auto relative z-[1]">
        {/* Filters */}
        <Card className={`mb-6 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : ''}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${getThemeClasses.text.primary(isDarkMode)}`}>
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className={getThemeClasses.text.primary(isDarkMode)}>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className={`pl-10 ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className={getThemeClasses.text.primary(isDarkMode)}>Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label className={getThemeClasses.text.primary(isDarkMode)}>End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className={isDarkMode ? 'bg-slate-800 border-slate-700' : ''}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(90)}
                  className={isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : ''}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Last 90 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(180)}
                  className={isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : ''}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Last 180 Days
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className={isDarkMode ? 'bg-slate-900/50 border-slate-800' : ''}>
          <CardHeader>
            <CardTitle className={getThemeClasses.text.primary(isDarkMode)}>
              Audit Logs ({totalLogs})
            </CardTitle>
            <CardDescription className={getThemeClasses.text.secondary(isDarkMode)}>
              {isBillingRole
                ? 'Viewing billing-related audit logs only'
                : 'Complete audit trail of all system activities'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className={`w-12 h-12 mx-auto mb-4 ${getThemeClasses.text.muted(isDarkMode)}`} />
                <h3 className={`text-lg font-medium mb-2 ${getThemeClasses.text.primary(isDarkMode)}`}>
                  No audit logs found
                </h3>
                <p className={getThemeClasses.text.secondary(isDarkMode)}>
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={getThemeClasses.text.primary(isDarkMode)}>Timestamp</TableHead>
                        <TableHead className={getThemeClasses.text.primary(isDarkMode)}>User</TableHead>
                        <TableHead className={getThemeClasses.text.primary(isDarkMode)}>Action</TableHead>
                        <TableHead className={getThemeClasses.text.primary(isDarkMode)}>Category</TableHead>
                        <TableHead className={getThemeClasses.text.primary(isDarkMode)}>Severity</TableHead>
                        <TableHead className={getThemeClasses.text.primary(isDarkMode)}>IP Address</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className={getThemeClasses.text.secondary(isDarkMode)}>
                            {formatDate(log.timestamp)}
                          </TableCell>
                          <TableCell className={getThemeClasses.text.primary(isDarkMode)}>
                            {log.userEmail || <span className={getThemeClasses.text.muted(isDarkMode)}>System</span>}
                          </TableCell>
                          <TableCell className={getThemeClasses.text.primary(isDarkMode)}>
                            {log.action.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryBadge(log.category)}>
                              {log.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSeverityBadge(log.severity)}>
                              {log.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className={getThemeClasses.text.secondary(isDarkMode)}>
                            {log.ipAddress === '***REDACTED***' ? (
                              <span className="text-gray-400 italic">Redacted</span>
                            ) : (
                              log.ipAddress || '—'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailsDialog(log)}
                              className="h-8 px-2"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className={getThemeClasses.text.secondary(isDarkMode)}>
                      Page {filters.page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className={`max-w-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : ''}`}>
          <DialogHeader>
            <DialogTitle className={getThemeClasses.text.primary(isDarkMode)}>
              Audit Log Details
            </DialogTitle>
            <DialogDescription className={getThemeClasses.text.secondary(isDarkMode)}>
              Complete information for this audit entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className={getThemeClasses.text.secondary(isDarkMode)}>Timestamp</Label>
                  <p className={getThemeClasses.text.primary(isDarkMode)}>{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <Label className={getThemeClasses.text.secondary(isDarkMode)}>User</Label>
                  <p className={getThemeClasses.text.primary(isDarkMode)}>{selectedLog.userEmail || 'System'}</p>
                </div>
                <div>
                  <Label className={getThemeClasses.text.secondary(isDarkMode)}>Action</Label>
                  <p className={getThemeClasses.text.primary(isDarkMode)}>{selectedLog.action}</p>
                </div>
                <div>
                  <Label className={getThemeClasses.text.secondary(isDarkMode)}>Category</Label>
                  <Badge className={getCategoryBadge(selectedLog.category)}>{selectedLog.category}</Badge>
                </div>
                <div>
                  <Label className={getThemeClasses.text.secondary(isDarkMode)}>Severity</Label>
                  <Badge className={getSeverityBadge(selectedLog.severity)}>{selectedLog.severity}</Badge>
                </div>
                <div>
                  <Label className={getThemeClasses.text.secondary(isDarkMode)}>IP Address</Label>
                  <p className={getThemeClasses.text.primary(isDarkMode)}>
                    {selectedLog.ipAddress === '***REDACTED***' ? (
                      <span className="text-gray-400 italic">Redacted</span>
                    ) : (
                      selectedLog.ipAddress || '—'
                    )}
                  </p>
                </div>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <Label className={getThemeClasses.text.secondary(isDarkMode)}>Metadata</Label>
                  <pre className={`mt-2 p-4 rounded-lg text-sm overflow-x-auto ${
                    isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.hash && (
                <div>
                  <Label className={getThemeClasses.text.secondary(isDarkMode)}>Hash (Immutability)</Label>
                  <p className={`mt-1 font-mono text-xs break-all ${getThemeClasses.text.muted(isDarkMode)}`}>
                    {selectedLog.hash}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogs;
