import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import { useReminders, useSendManualReminder } from '@/hooks/useReminders';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Reminders = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, critical, warning, info

  // Fetch reminders
  const { data, isLoading, error } = useReminders();
  const sendReminderMutation = useSendManualReminder();

  const reminders = data?.reminders || [];
  const stats = data?.stats || { total: 0, critical: 0, warning: 0, info: 0 };
  const reminderSettings = data?.reminderSettings || [];

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
    const configs = {
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col w-full bg-gray-50 min-h-screen">
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <h1 className="text-xl font-semibold text-gray-900">Reminders</h1>
          </div>
        </header>

        <div className="flex-1 py-8">
          <div className="container w-full px-6 mx-auto space-y-6">
            {/* Loading skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[10px] p-4 border border-gray-200"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            <div className="h-10 bg-gray-200 rounded-[10px] animate-pulse max-w-md" />

            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[10px] p-4 border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-[10px] animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-64 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col w-full bg-gray-50 min-h-screen">
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
          <div className="container flex items-center justify-between w-full px-6 mx-auto">
            <h1 className="text-xl font-semibold text-gray-900">Reminders</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-red-600">
              Failed to load reminders: {error.message}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="rounded-[10px]"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b shrink-0">
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Reminders</h1>
            <p className="text-sm text-gray-500">
              {stats.total} document{stats.total !== 1 ? 's' : ''} requiring
              attention
            </p>
          </div>
          <Button
            onClick={() => navigate('/client/settings')}
            variant="outline"
            className="rounded-[10px]"
          >
            <Bell className="w-4 h-4 mr-2" />
            Reminder Settings
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">
          {/* Reminder Settings Info */}
          {reminderSettings.length > 0 && (
            <section className="bg-blue-50 rounded-[10px] border border-blue-200 p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Active Reminder Intervals
                  </p>
                  <p className="text-sm text-blue-700">
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
                className={`cursor-pointer transition-all duration-200 rounded-[10px] ${
                  selectedFilter === filter.value
                    ? 'border-gray-900 shadow-md'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => setSelectedFilter(filter.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {filter.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {filter.count}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-[10px] ${
                        filter.value === 'critical'
                          ? 'bg-red-100'
                          : filter.value === 'warning'
                          ? 'bg-yellow-100'
                          : filter.value === 'info'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <filter.icon
                        className={`w-6 h-6 ${
                          filter.value === 'critical'
                            ? 'text-red-600'
                            : filter.value === 'warning'
                            ? 'text-yellow-600'
                            : filter.value === 'info'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Search Section */}
          <section className="bg-white rounded-[10px] p-4 border border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by driver name, document type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-[10px]"
              />
            </div>
          </section>

          {/* Reminders List */}
          <section className="space-y-3">
            {filteredReminders.length === 0 ? (
              <div className="bg-white rounded-[10px] p-12 border border-gray-200 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  No reminders found
                </h3>
                <p className="text-sm text-gray-500">
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
                  className="hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-900 rounded-[10px] bg-white"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Document Icon */}
                      <div className="bg-gray-100 rounded-[10px] p-2.5 shrink-0">
                        <FileText className="w-6 h-6 text-gray-700" />
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {reminder.documentType}
                          </h3>
                          {getUrgencyBadge(reminder.urgency)}
                          <span
                            className={`text-xs font-medium ${
                              reminder.daysUntilExpiry < 0
                                ? 'text-red-600'
                                : reminder.daysUntilExpiry <= 7
                                ? 'text-orange-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {reminder.daysUntilExpiry < 0
                              ? `${Math.abs(reminder.daysUntilExpiry)} days overdue`
                              : `${reminder.daysUntilExpiry} days remaining`}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
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
                          className="rounded-[10px]"
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
                          className="rounded-[10px]"
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
        </div>
      </div>
    </div>
  );
};

export default Reminders;
