import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Search,
  User,
  AlertCircle,
  Clock,
  CheckCircle,
  Bell,
  Eye,
  Send,
  Loader2,
  Plus,
  List,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  useReminders,
  useSendManualReminder,
  useCustomReminders,
  useCreateCustomReminder,
  useDeleteCustomReminder
} from '@/hooks/useReminders';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
import { useCompany } from '@/hooks/useCompany';
import { useUser } from '@clerk/clerk-react';
import CreateReminderDialog from '@/components/CreateReminderDialog';
import CalendarView from '@/components/CalendarView';

const Reminders = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user } = useUser();
  const companyId = user?.publicMetadata?.companyId;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, critical, warning, info
  const [viewMode, setViewMode] = useState('list'); // list or calendar
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch data
  const { data, isLoading, error } = useReminders();
  const { data: customRemindersData, isLoading: customRemindersLoading } = useCustomReminders();
  const { data: companyData } = useCompany(companyId);

  // Mutations
  const sendReminderMutation = useSendManualReminder();
  const createReminderMutation = useCreateCustomReminder();
  const deleteReminderMutation = useDeleteCustomReminder();

  const reminders = data?.reminders || [];
  const stats = data?.stats || { total: 0, critical: 0, warning: 0, info: 0 };
  const reminderSettings = data?.reminderSettings || [];
  const customReminders = customRemindersData?.reminders || [];

  // Handler functions
  const handleCreateReminder = async (reminderData) => {
    try {
      await createReminderMutation.mutateAsync(reminderData);
      toast.success('Custom reminder created successfully');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error(error.message || 'Failed to create reminder');
      throw error;
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await deleteReminderMutation.mutateAsync(reminderId);
      toast.success('Reminder deleted successfully');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error(error.message || 'Failed to delete reminder');
    }
  };

  // Filter reminders based on selected filter and search query
  const filteredReminders = reminders.filter((reminder) => {
    // Filter by urgency
    if (selectedFilter !== 'all' && reminder.urgency !== selectedFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        reminder.documentType?.toLowerCase().includes(query) ||
        reminder.driver?.name?.toLowerCase().includes(query) ||
        reminder.driver?.employeeId?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleSendReminder = async (documentId, driverName) => {
    try {
      await sendReminderMutation.mutateAsync({
        documentId,
        channel: 'EMAIL',
      });
      toast.success(`Reminder sent to ${driverName}`);
    } catch (error) {
      toast.error(`Failed to send reminder: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUrgencyBadge = (urgency) => {
    const lightConfigs = {
      critical: {
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle,
        label: 'Critical',
      },
      warning: {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Warning',
      },
      info: {
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        label: 'Info',
      },
    };

    const darkConfigs = {
      critical: {
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: AlertCircle,
        label: 'Critical',
      },
      warning: {
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: Clock,
        label: 'Warning',
      },
      info: {
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: CheckCircle,
        label: 'Info',
      },
    };

    const configs = isDarkMode ? darkConfigs : lightConfigs;
    const config = configs[urgency] || configs.info;
    const Icon = config.icon;

    return (
      <Badge
        className={`${config.className} border rounded-[10px] flex items-center gap-1`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filterOptions = [
    {
      value: 'all',
      label: 'All Reminders',
      icon: FileText,
      count: stats.total,
    },
    {
      value: 'critical',
      label: 'Critical',
      icon: AlertCircle,
      count: stats.critical,
    },
    {
      value: 'warning',
      label: 'Warning',
      icon: Clock,
      count: stats.warning,
    },
    { value: 'info', label: 'Info', icon: CheckCircle, count: stats.info },
  ];

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
      <header className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(isDarkMode)}`}>
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <div>
            <h1 className={`text-xl font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>Reminders</h1>
            {isLoading ? (
              <Skeleton className="h-4 w-48 mt-1 rounded-[10px]" />
            ) : (
              <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                {stats.total} document{stats.total !== 1 ? 's' : ''} requiring attention
                {customReminders.length > 0 && ` • ${customReminders.length} custom reminder${customReminders.length !== 1 ? 's' : ''}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-[10px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-[8px] ${
                  viewMode === 'list'
                    ? getThemeClasses.button.primary(isDarkMode)
                    : isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={`rounded-[8px] ${
                  viewMode === 'calendar'
                    ? getThemeClasses.button.primary(isDarkMode)
                    : isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className={`rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Reminder
            </Button>

            <Button
              onClick={() => navigate('/client/settings')}
              variant="outline"
              className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
            >
              <Bell className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">
          {/* Reminder Settings Info */}
          {reminderSettings.length > 0 && (
            <section className={`rounded-[10px] border p-4 ${getThemeClasses.alert.info(isDarkMode)}`}>
              <div className="flex items-center gap-3">
                <Bell className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    Active Reminder Intervals
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    You'll receive reminders {reminderSettings.join(', ')} before
                    document expiry
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Filter Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filterOptions.map((filter) => (
              <Card
                key={filter.value}
                className={`cursor-pointer transition-all duration-200 rounded-[10px] border ${
                  selectedFilter === filter.value
                    ? isDarkMode
                      ? 'border-violet-500 shadow-lg shadow-violet-500/20 bg-slate-800/50'
                      : 'border-gray-900 shadow-md bg-white'
                    : isDarkMode
                      ? 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                      : 'border-gray-200 hover:border-gray-400 bg-white'
                }`}
                onClick={() => setSelectedFilter(filter.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        {filter.label}
                      </p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-12 rounded-[10px]" />
                      ) : (
                        <p className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                          {filter.count}
                        </p>
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-[10px] ${
                        filter.value === 'critical'
                          ? isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                          : filter.value === 'warning'
                          ? isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'
                          : filter.value === 'info'
                          ? isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                          : isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                      }`}
                    >
                      <filter.icon
                        className={`w-6 h-6 ${
                          filter.value === 'critical'
                            ? isDarkMode ? 'text-red-400' : 'text-red-600'
                            : filter.value === 'warning'
                            ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                            : filter.value === 'info'
                            ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            : isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Search Section */}
          <section className={`rounded-[10px] p-4 border ${getThemeClasses.bg.card(isDarkMode)}`}>
            <div className="relative max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
              <Input
                type="text"
                placeholder="Search by driver name, document type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 rounded-[10px] ${getThemeClasses.input.default(isDarkMode)}`}
              />
            </div>
          </section>

          {/* View Content - Toggle between List and Calendar */}
          {viewMode === 'calendar' ? (
            /* Calendar View */
            <CalendarView
              reminders={reminders}
              customReminders={customReminders}
              isDarkMode={isDarkMode}
              onDeleteReminder={handleDeleteReminder}
            />
          ) : (
            /* List View */
            <section className="space-y-3">
            {isLoading ? (
              // Loading skeletons for reminder cards
              [...Array(5)].map((_, i) => (
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
                      <div className="flex items-center gap-2 shrink-0">
                        <Skeleton className="h-8 w-8 rounded-[10px]" />
                        <Skeleton className="h-8 w-8 rounded-[10px]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              // Error state
              <div className={`rounded-[10px] p-12 border text-center ${isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                <h3 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-red-300' : 'text-red-900'}`}>
                  Failed to load reminders
                </h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {error.message}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className={`rounded-[10px] ${getThemeClasses.button.primary(isDarkMode)}`}
                >
                  Retry
                </Button>
              </div>
            ) : filteredReminders.length === 0 ? (
              <div className={`rounded-[10px] p-12 border text-center ${getThemeClasses.bg.card(isDarkMode)}`}>
                <FileText className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                <h3 className={`text-sm font-semibold mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                  No reminders found
                </h3>
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : selectedFilter !== 'all'
                    ? `No ${selectedFilter} reminders at this time`
                    : 'All documents are up to date!'}
                </p>
              </div>
            ) : (
              filteredReminders.map((reminder) => (
                <Card
                  key={reminder.id}
                  className={`transition-all duration-200 border rounded-[10px] ${
                    isDarkMode
                      ? 'bg-slate-900/50 border-slate-700 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10'
                      : 'bg-white border-gray-200 hover:border-gray-900 hover:shadow-md'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Document Icon */}
                      <div className={`rounded-[10px] p-2.5 shrink-0 ${
                        reminder.urgency === 'critical'
                          ? isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                          : reminder.urgency === 'warning'
                          ? isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'
                          : isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <FileText className={`w-6 h-6 ${
                          reminder.urgency === 'critical'
                            ? isDarkMode ? 'text-red-400' : 'text-red-600'
                            : reminder.urgency === 'warning'
                            ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                            : isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                            {reminder.documentType}
                          </h3>
                          {getUrgencyBadge(reminder.urgency)}
                          <span
                            className={`text-xs font-medium ${
                              reminder.daysUntilExpiry < 0
                                ? isDarkMode ? 'text-red-400' : 'text-red-600'
                                : reminder.daysUntilExpiry <= 7
                                ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                                : isDarkMode ? 'text-slate-400' : 'text-gray-600'
                            }`}
                          >
                            {reminder.daysUntilExpiry < 0
                              ? `${Math.abs(reminder.daysUntilExpiry)} days overdue`
                              : `${reminder.daysUntilExpiry} days remaining`}
                          </span>
                        </div>
                        <div className={`flex items-center gap-4 text-xs flex-wrap ${getThemeClasses.text.secondary(isDarkMode)}`}>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {reminder.driver?.name || 'Unknown Driver'}
                          </span>
                          {reminder.driver?.employeeId && (
                            <>
                              <span>•</span>
                              <span>ID: {reminder.driver.employeeId}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Expires: {formatDate(reminder.expiryDate)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/client/driver/${reminder.driver?.id}`)
                          }
                          className={`rounded-[10px] ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                          title="View Driver"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleSendReminder(
                              reminder.documentId,
                              reminder.driver?.name
                            )
                          }
                          disabled={sendReminderMutation.isPending}
                          className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
                          title="Send Reminder Now"
                        >
                          {sendReminderMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </section>
          )}

          {/* Create Reminder Dialog */}
          <CreateReminderDialog
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            isDarkMode={isDarkMode}
            settings={companyData}
            onCreateReminder={handleCreateReminder}
            isCreating={createReminderMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default Reminders;
