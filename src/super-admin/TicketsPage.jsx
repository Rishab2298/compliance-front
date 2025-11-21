import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAllTickets, useTicketStats } from '@/hooks/useTickets';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
import { TicketStatusBadge } from '@/client/ticketing/TicketStatusBadge';
import { TicketPriorityBadge } from '@/client/ticketing/TicketPriorityBadge';
import { TicketDetailAdminModal } from './TicketDetailAdminModal';
import {
  Search,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const TicketsPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    companyId: '',
    search: '',
  });
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const { data, isLoading, error } = useAllTickets(page, 50, filters);
  const { data: stats, isLoading: statsLoading } = useTicketStats();

  const tickets = data?.tickets || [];
  const pagination = data?.pagination || {};

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters({ ...filters, search: value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      companyId: '',
      search: '',
    });
    setPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (category) => {
    const labels = {
      BUG: 'Bug',
      FEATURE_REQUEST: 'Feature Request',
      SUPPORT: 'Support',
      DOCUMENTATION: 'Documentation',
      PERFORMANCE: 'Performance',
      OTHER: 'Other',
    };
    return labels[category] || category;
  };

  return (
    <div className={`flex flex-col w-full min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(isDarkMode)}`}>
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <div>
            <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
              Tickets Management
            </h1>
            <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
              View and manage all support tickets
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className={`rounded-[10px] ${getThemeClasses.bg.card(isDarkMode)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Total
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {statsLoading ? '-' : Object.values(stats?.byStatus || {}).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                    <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-[10px] ${getThemeClasses.bg.card(isDarkMode)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Open
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {statsLoading ? '-' : stats?.byStatus?.OPEN || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-500/20">
                    <XCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-[10px] ${getThemeClasses.bg.card(isDarkMode)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      In Progress
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {statsLoading ? '-' : stats?.byStatus?.IN_PROGRESS || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-[10px] ${getThemeClasses.bg.card(isDarkMode)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Critical
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {statsLoading ? '-' : stats?.byPriority?.CRITICAL || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-100 dark:bg-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-[10px] ${getThemeClasses.bg.card(isDarkMode)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Resolved Today
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {statsLoading ? '-' : stats?.today?.resolved || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-500/20">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className={`rounded-[10px] ${getThemeClasses.bg.card(isDarkMode)}`}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative md:col-span-2">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <Input
                    placeholder="Search tickets..."
                    value={filters.search}
                    onChange={handleSearch}
                    className={`pl-10 rounded-[10px] ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                {/* Status Filter */}
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger
                    className={`rounded-[10px] ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <SelectItem value=" " className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>
                      All Statuses
                    </SelectItem>
                    <SelectItem value="OPEN" className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>
                      Open
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS" className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>
                      In Progress
                    </SelectItem>
                    <SelectItem value="RESOLVED" className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>
                      Resolved
                    </SelectItem>
                    <SelectItem value="CLOSED" className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>
                      Closed
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Priority Filter */}
                <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                  <SelectTrigger
                    className={`rounded-[10px] ${
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                    <SelectItem value=" " className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>
                      All Priorities
                    </SelectItem>
                    <SelectItem value="CRITICAL" className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>
                      Critical
                    </SelectItem>
                    <SelectItem value="HIGH" className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>
                      High
                    </SelectItem>
                    <SelectItem value="MEDIUM" className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>
                      Medium
                    </SelectItem>
                    <SelectItem value="LOW" className={isDarkMode ? 'text-white hover:bg-gray-700' : ''}>
                      Low
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                <Button variant="outline" onClick={clearFilters} className="rounded-[10px]">
                  <Filter className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Table */}
          <Card className={`rounded-[10px] ${getThemeClasses.bg.card(isDarkMode)}`}>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton
                      key={i}
                      className={`h-16 rounded-[10px] ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <XCircle className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                  <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                    Failed to load tickets. Please try again.
                  </p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center">
                  <Ticket className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${getThemeClasses.text.primary(isDarkMode)}`}>
                    No tickets found
                  </h3>
                  <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    {filters.search || filters.status || filters.priority
                      ? 'Try adjusting your filters'
                      : 'No tickets have been created yet'}
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className={isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : ''}>
                        <TableHead className={getThemeClasses.text.secondary(isDarkMode)}>Ticket</TableHead>
                        <TableHead className={getThemeClasses.text.secondary(isDarkMode)}>Company</TableHead>
                        <TableHead className={getThemeClasses.text.secondary(isDarkMode)}>Reporter</TableHead>
                        <TableHead className={getThemeClasses.text.secondary(isDarkMode)}>Category</TableHead>
                        <TableHead className={getThemeClasses.text.secondary(isDarkMode)}>Priority</TableHead>
                        <TableHead className={getThemeClasses.text.secondary(isDarkMode)}>Status</TableHead>
                        <TableHead className={getThemeClasses.text.secondary(isDarkMode)}>Created</TableHead>
                        <TableHead className={getThemeClasses.text.secondary(isDarkMode)}>Comments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          className={`cursor-pointer ${
                            isDarkMode
                              ? 'border-gray-800 hover:bg-gray-800/50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedTicketId(ticket.id)}
                        >
                          <TableCell>
                            <div>
                              <p className={`font-medium text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                                {ticket.ticketNumber}
                              </p>
                              <p className={`text-xs truncate max-w-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                                {ticket.title}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {ticket.company?.name || 'N/A'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {ticket.reporterName}
                            </p>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-md text-xs ${
                                isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {getCategoryLabel(ticket.category)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <TicketPriorityBadge priority={ticket.priority} />
                          </TableCell>
                          <TableCell>
                            <TicketStatusBadge status={ticket.status} />
                          </TableCell>
                          <TableCell>
                            <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              {formatDate(ticket.createdAt)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-[6px]">
                              {ticket._count?.comments || 0}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className={`flex justify-center items-center gap-2 p-4 border-t ${
                      isDarkMode ? 'border-gray-800' : 'border-gray-200'
                    }`}>
                      <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="rounded-[10px]"
                      >
                        Previous
                      </Button>
                      <span className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="rounded-[10px]"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin Detail Modal */}
      {selectedTicketId && (
        <TicketDetailAdminModal
          ticketId={selectedTicketId}
          open={!!selectedTicketId}
          onOpenChange={(open) => !open && setSelectedTicketId(null)}
        />
      )}
    </div>
  );
};

export default TicketsPage;
