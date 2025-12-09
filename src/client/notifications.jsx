import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Trash2, Settings as SettingsIcon, Filter } from 'lucide-react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/api/notifications';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
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
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const Notifications = () => {
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch notifications from API
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const token = await getToken();
      return getNotifications(token);
    },
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unread || notifications.filter(n => !n.read).length;

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const token = await getToken();
      return markNotificationAsRead(token, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return markAllNotificationsAsRead(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      const token = await getToken();
      return deleteNotification(token, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'DOCUMENT_EXPIRING':
      case 'DOCUMENT_EXPIRED':
        return <Bell className={iconClass} />;
      case 'DOCUMENT_UPLOADED':
      case 'DOCUMENT_APPROVED':
        return <CheckCheck className={iconClass} />;
      case 'DRIVER_CREATED':
      case 'TEAM_MEMBER_INVITED':
      case 'TEAM_MEMBER_JOINED':
        return <Bell className={iconClass} />;
      case 'REMINDER_SENT':
        return <Bell className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'DOCUMENT_EXPIRING':
      case 'DOCUMENT_EXPIRED':
      case 'REMINDER_SENT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'DOCUMENT_UPLOADED':
      case 'DOCUMENT_APPROVED':
      case 'DRIVER_CREATED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'TEAM_MEMBER_INVITED':
      case 'TEAM_MEMBER_JOINED':
      case 'TEAM_ROLE_CHANGED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'PAYMENT_SUCCESS':
      case 'SUBSCRIPTION_RENEWED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PAYMENT_FAILED':
      case 'SUBSCRIPTION_EXPIRING':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'TICKET_CREATED':
      case 'TICKET_REPLIED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id) => {
    deleteNotificationMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'read') return n.read;
    return true;
  });

  return (
    <div className={`flex flex-col w-full min-h-screen relative ${getThemeClasses.bg.primary(isDarkMode)}`}>
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      <DashboardHeader title="Notifications">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className={`rounded-[10px] gap-2 hidden sm:flex ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-200'
                  : ''
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
          <Button
            variant="outline"
            className={`rounded-[10px] ${
              isDarkMode
                ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-200'
                : ''
            }`}
            size="icon"
          >
            <SettingsIcon className="w-4 h-4" />
          </Button>
        </div>
      </DashboardHeader>

      <main className="container px-6 py-8 mx-auto relative z-[1]">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className={isDarkMode ? 'bg-slate-900/50 border-slate-800' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className={`w-4 h-4 ${getThemeClasses.text.muted(isDarkMode)}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {notifications.length}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-slate-900/50 border-slate-800' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Bell className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {unreadCount}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-slate-900/50 border-slate-800' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Read</CardTitle>
              <CheckCheck className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {notifications.length - unreadCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card className={isDarkMode ? 'bg-slate-900/50 border-slate-800' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={getThemeClasses.text.primary(isDarkMode)}>
                  All Notifications
                </CardTitle>
                <CardDescription className={getThemeClasses.text.secondary(isDarkMode)}>
                  Stay updated with important events and changes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid w-full max-w-md grid-cols-3 ${
                isDarkMode ? 'bg-slate-800/50' : ''
              }`}>
                <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
                <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                <TabsTrigger value="read">Read ({notifications.length - unreadCount})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className={`w-12 h-12 mx-auto mb-4 ${getThemeClasses.text.muted(isDarkMode)}`} />
                    <h3 className={`text-lg font-medium mb-2 ${getThemeClasses.text.primary(isDarkMode)}`}>
                      No notifications
                    </h3>
                    <p className={getThemeClasses.text.secondary(isDarkMode)}>
                      {activeTab === 'unread'
                        ? "You're all caught up! No unread notifications."
                        : activeTab === 'read'
                        ? "No read notifications yet."
                        : "You don't have any notifications yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                          notification.read
                            ? isDarkMode
                              ? 'bg-slate-800/30 border-slate-800'
                              : 'bg-gray-50 border-gray-200'
                            : isDarkMode
                            ? 'bg-slate-800/50 border-slate-700'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-semibold text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                              {notification.title}
                              {!notification.read && (
                                <span className="inline-block w-2 h-2 ml-2 bg-blue-500 rounded-full"></span>
                              )}
                            </h4>
                            <span className={`text-xs whitespace-nowrap ${getThemeClasses.text.muted(isDarkMode)}`}>
                              {formatTimestamp(notification.createdAt)}
                            </span>
                          </div>
                          <p className={`text-sm mb-2 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            {notification.actionUrl && (
                              <Button
                                size="sm"
                                variant="link"
                                className="p-0 h-auto text-xs"
                                onClick={() => window.location.href = notification.actionUrl}
                              >
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-8 px-2"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(notification.id)}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Notifications;
