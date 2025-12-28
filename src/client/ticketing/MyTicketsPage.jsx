import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useTickets } from '@/hooks/useTickets';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
import { DashboardHeader } from '@/components/DashboardHeader';
import { CreateTicketModal } from './CreateTicketModal';
import { TicketDetailModal } from './TicketDetailModal';
import { TicketCard } from './TicketCard';
import {
  Plus,
  Search,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';

export const MyTicketsPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const { data, isLoading, error } = useTickets(page, 20, filters);

  const tickets = data?.tickets || [];
  const pagination = data?.pagination || {};

  // Calculate stats from tickets
  const stats = {
    total: pagination.totalCount || 0,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1); // Reset to first page when filters change
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
      search: '',
    });
    setPage(1);
  };

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
      <DashboardHeader title={t('tickets.title')}>
        <Button
          onClick={() => setShowCreateModal(true)}
          className={`rounded-[10px] hidden sm:flex ${getThemeClasses.button.primary(isDarkMode)}`}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('tickets.reportIssue')}
        </Button>
        <Button
          onClick={() => setShowCreateModal(true)}
          className={`rounded-[10px] sm:hidden ${getThemeClasses.button.primary(isDarkMode)}`}
          size="icon"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </DashboardHeader>

      {/* Subtitle */}
      <div className={`px-4 md:px-6 py-2 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
        {isLoading ? (
          <Skeleton className="h-4 w-48 rounded-[10px]" />
        ) : (
          <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
            {stats.total} {stats.total !== 1 ? t('tickets.subtitlePlural') : t('tickets.subtitle')} • {t('tickets.trackManage')}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 py-8 ${getThemeClasses.bg.primary(isDarkMode)}`}>
        <div className="container w-full px-6 mx-auto space-y-6">

          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`rounded-[10px] border ${
              isDarkMode
                ? 'border-slate-700 bg-slate-900/50'
                : 'border-gray-200 bg-white'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {t('tickets.stats.totalTickets')}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12 rounded-[10px]" />
                    ) : (
                      <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                        {stats.total}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-[10px] ${isDarkMode ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                    <Ticket className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-[10px] border ${
              isDarkMode
                ? 'border-slate-700 bg-slate-900/50'
                : 'border-gray-200 bg-white'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {t('tickets.stats.open')}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12 rounded-[10px]" />
                    ) : (
                      <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                        {stats.open}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-[10px] ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                    <XCircle className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-[10px] border ${
              isDarkMode
                ? 'border-slate-700 bg-slate-900/50'
                : 'border-gray-200 bg-white'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {t('tickets.stats.inProgress')}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12 rounded-[10px]" />
                    ) : (
                      <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                        {stats.inProgress}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-[10px] ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <Clock className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`rounded-[10px] border ${
              isDarkMode
                ? 'border-slate-700 bg-slate-900/50'
                : 'border-gray-200 bg-white'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {t('tickets.stats.resolved')}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12 rounded-[10px]" />
                    ) : (
                      <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                        {stats.resolved}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-[10px] ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <CheckCircle2 className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Filters */}
          <section className={`rounded-[10px] p-4 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                <Input
                  placeholder={t('tickets.filters.searchPlaceholder')}
                  value={filters.search}
                  onChange={handleSearch}
                  className={`pl-10 rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}
                />
              </div>

              {/* Status Filter */}
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className={`rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}>
                  <SelectValue placeholder={t('tickets.filters.allStatuses')} />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
                  <SelectItem value=" " className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                    {t('tickets.filters.allStatuses')}
                  </SelectItem>
                  <SelectItem value="OPEN" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                    {t('tickets.status.open')}
                  </SelectItem>
                  <SelectItem value="IN_PROGRESS" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                    {t('tickets.status.inProgress')}
                  </SelectItem>
                  <SelectItem value="RESOLVED" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                    {t('tickets.status.resolved')}
                  </SelectItem>
                  <SelectItem value="CLOSED" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                    {t('tickets.status.closed')}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger className={`rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}>
                  <SelectValue placeholder={t('tickets.filters.allPriorities')} />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
                  <SelectItem value=" " className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                    {t('tickets.filters.allPriorities')}
                  </SelectItem>
                  <SelectItem value="LOW" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                    {t('tickets.priority.low')}
                  </SelectItem>
                  <SelectItem value="MEDIUM" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                    {t('tickets.priority.medium')}
                  </SelectItem>
                  <SelectItem value="HIGH" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                    {t('tickets.priority.high')}
                  </SelectItem>
                  <SelectItem value="CRITICAL" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                    {t('tickets.priority.critical')}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {t('tickets.filters.clearFilters')}
              </Button>
            </div>
          </section>

          {/* Tickets List */}
          <section className="space-y-3">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className={`rounded-[10px] border ${
                      isDarkMode
                        ? 'bg-slate-900/50 border-slate-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-11 h-11 rounded-[10px]" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-48 rounded-[10px]" />
                          <Skeleton className="h-4 w-64 rounded-[10px]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : error ? (
              <div className={`rounded-[10px] p-12 border text-center ${isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                <XCircle className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                <h3 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-red-300' : 'text-red-900'}`}>
                  {t('tickets.error.failedToLoad')}
                </h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {error.message || t('tickets.error.pleaseTryAgain')}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className={`rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}
                >
                  {t('tickets.error.retry')}
                </Button>
              </div>
            ) : tickets.length === 0 ? (
              <div className={`rounded-[10px] p-12 border text-center ${getThemeClasses.bg.card(isDarkMode)}`}>
                <Ticket className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                <h3 className={`text-sm font-semibold mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {t('tickets.emptyState.noTicketsFound')}
                </h3>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  {filters.search || filters.status || filters.priority
                    ? t('tickets.emptyState.tryAdjustingFilters')
                    : t('tickets.emptyState.createFirstTicket')}
                </p>
                {!filters.search && !filters.status && !filters.priority && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className={`rounded-[10px] mt-4 ${getThemeClasses.button.primary(isDarkMode)}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('tickets.emptyState.createTicket')}
                  </Button>
                )}
              </div>
            ) : (
            <>
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => setSelectedTicketId(ticket.id)}
                />
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                  >
                    {t('tickets.pagination.previous')}
                  </Button>
                  <span className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    {t('tickets.pagination.page')} {pagination.currentPage} {t('tickets.pagination.of')} {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                    className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                  >
                    {t('tickets.pagination.next')}
                  </Button>
                </div>
              )}
            </>
          )}
          </section>
        </div>
      </div>

      {/* Modals */}
      <CreateTicketModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          open={!!selectedTicketId}
          onOpenChange={(open) => !open && setSelectedTicketId(null)}
        />
      )}
    </div>
  );
};
