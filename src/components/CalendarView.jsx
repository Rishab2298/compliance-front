import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Bell, Trash2, Mail, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import { getThemeClasses } from '@/utils/themeClasses';
import { useTranslation } from 'react-i18next';

const CalendarView = ({ reminders = [], customReminders = [], isDarkMode, onDeleteReminder }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Get all days in current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Get reminders for a specific date
  const getRemindersForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Document expiry reminders
    const expiryReminders = reminders.filter(r => {
      if (!r.expiryDate) return false;
      // Normalize dates to YYYY-MM-DD format for comparison
      const expiryDate = new Date(r.expiryDate);
      const expiryDateStr = `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, '0')}-${String(expiryDate.getDate()).padStart(2, '0')}`;
      return expiryDateStr === dateStr;
    });

    // Custom reminders - match by date only (ignore time)
    const custom = customReminders.filter(r => {
      if (!r.triggerDate) return false;
      // Normalize dates to YYYY-MM-DD format for comparison
      const triggerDate = new Date(r.triggerDate);
      const triggerDateStr = `${triggerDate.getFullYear()}-${String(triggerDate.getMonth() + 1).padStart(2, '0')}-${String(triggerDate.getDate()).padStart(2, '0')}`;
      return triggerDateStr === dateStr;
    });

    return { expiryReminders, customReminders: custom };
  };

  // Check if date has any reminders
  const hasReminders = (day) => {
    const { expiryReminders, customReminders: custom } = getRemindersForDate(day);
    return expiryReminders.length > 0 || custom.length > 0;
  };

  // Get selected date's reminders
  const selectedDateReminders = useMemo(() => {
    if (!selectedDate) return { expiryReminders: [], customReminders: [] };
    return getRemindersForDate(selectedDate);
  }, [selectedDate, reminders, customReminders]);

  const monthNames = [
    t('calendar.months.january'),
    t('calendar.months.february'),
    t('calendar.months.march'),
    t('calendar.months.april'),
    t('calendar.months.may'),
    t('calendar.months.june'),
    t('calendar.months.july'),
    t('calendar.months.august'),
    t('calendar.months.september'),
    t('calendar.months.october'),
    t('calendar.months.november'),
    t('calendar.months.december')
  ];

  const dayNames = [
    t('calendar.days.sun'),
    t('calendar.days.mon'),
    t('calendar.days.tue'),
    t('calendar.days.wed'),
    t('calendar.days.thu'),
    t('calendar.days.fri'),
    t('calendar.days.sat')
  ];

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
           month === today.getMonth() &&
           year === today.getFullYear();
  };

  const isSelectedDate = (day) => {
    return selectedDate === day;
  };

  // Check if a date is in the future
  const isFutureDate = (day) => {
    const checkDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return isDarkMode ? 'text-red-400' : 'text-red-600';
    if (priority === 'low') return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
  };

  const getUrgencyColor = (urgency) => {
    if (urgency === 'critical') return isDarkMode ? 'text-red-400' : 'text-red-600';
    if (urgency === 'warning') return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    return isDarkMode ? 'text-blue-400' : 'text-blue-600';
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Get all upcoming custom reminders (next 30 days)
  const getUpcomingReminders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return customReminders
      .filter(r => {
        const triggerDate = new Date(r.triggerDate);
        triggerDate.setHours(0, 0, 0, 0);
        return triggerDate >= today && triggerDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.triggerDate) - new Date(b.triggerDate))
      .slice(0, 5); // Show top 5
  };

  const upcomingReminders = getUpcomingReminders();

  return (
    <div className="space-y-6">
      {/* Upcoming Reminders Summary */}
      {upcomingReminders.length > 0 && (
        <Card className={`rounded-[10px] border ${getThemeClasses.bg.card(isDarkMode)}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {t('calendar.upcomingReminders.title')}
              </h3>
              <Badge className={`rounded-[10px] ${isDarkMode ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700'}`}>
                {t('calendar.upcomingReminders.next30Days')}
              </Badge>
            </div>
            <div className="space-y-2">
              {upcomingReminders.map((reminder, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-[10px] border ${
                    isDarkMode
                      ? 'bg-slate-800/50 border-slate-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className={`w-4 h-4 ${
                      reminder.priority === 'HIGH'
                        ? 'text-red-400'
                        : reminder.priority === 'LOW'
                        ? 'text-blue-400'
                        : 'text-yellow-400'
                    }`} />
                    <div>
                      <p className={`text-sm font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                        {reminder.title}
                      </p>
                      <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        {new Date(reminder.triggerDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} at {formatTime(reminder.triggerDate)}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-xs rounded-[6px] ${
                    reminder.priority === 'HIGH'
                      ? isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800'
                      : reminder.priority === 'LOW'
                      ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                      : isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reminder.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Header */}
      <Card className={`rounded-[10px] border ${getThemeClasses.bg.card(isDarkMode)}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
              >
                {t('calendar.buttons.today')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className={`rounded-[10px] ${getThemeClasses.button.secondary(isDarkMode)}`}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className={`flex items-center gap-4 mb-4 p-3 rounded-[10px] text-xs ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
            <span className={getThemeClasses.text.secondary(isDarkMode)}>{t('calendar.legend.title')}:</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-violet-400' : 'bg-violet-600'}`}></div>
              <span className={getThemeClasses.text.secondary(isDarkMode)}>{t('calendar.legend.upcoming')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'}`}></div>
              <span className={getThemeClasses.text.secondary(isDarkMode)}>{t('calendar.buttons.today')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-slate-500' : 'bg-gray-400'}`}></div>
              <span className={getThemeClasses.text.secondary(isDarkMode)}>{t('calendar.legend.past')}</span>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div
                key={day}
                className={`text-center text-xs font-semibold py-2 ${getThemeClasses.text.secondary(isDarkMode)}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {[...Array(startingDayOfWeek)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const hasRems = hasReminders(day);
              const isCurrentDay = isToday(day);
              const isSelected = isSelectedDate(day);
              const isFuture = isFutureDate(day);

              // Determine dot color based on date status
              const dotColor = isSelected
                ? 'bg-white'
                : isFuture
                ? isDarkMode
                  ? 'bg-violet-400'
                  : 'bg-violet-600'
                : isCurrentDay
                ? isDarkMode
                  ? 'bg-yellow-400'
                  : 'bg-yellow-600'
                : isDarkMode
                ? 'bg-slate-500'
                : 'bg-gray-400';

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square rounded-[10px] p-2 text-sm font-medium transition-all relative
                    ${isSelected
                      ? isDarkMode
                        ? 'bg-violet-500 text-white'
                        : 'bg-gray-900 text-white'
                      : isCurrentDay
                      ? isDarkMode
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                        : 'bg-gray-100 text-gray-900 border border-gray-300'
                      : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-gray-900 hover:bg-gray-50'
                    }
                    ${hasRems && !isSelected && isFuture ? (isDarkMode ? 'ring-1 ring-violet-500/50' : 'ring-1 ring-violet-400') : ''}
                  `}
                >
                  <span className="block">{day}</span>
                  {hasRems && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {[...Array(Math.min(3, getRemindersForDate(day).expiryReminders.length + getRemindersForDate(day).customReminders.length))].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${dotColor}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className={`rounded-[10px] border ${getThemeClasses.bg.card(isDarkMode)}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${getThemeClasses.text.primary(isDarkMode)}`}>
                {monthNames[month]} {selectedDate}, {year}
              </h3>
              <Badge className={`rounded-[10px] ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>
                {selectedDateReminders.expiryReminders.length + selectedDateReminders.customReminders.length} reminder(s)
              </Badge>
            </div>

            {selectedDateReminders.expiryReminders.length === 0 && selectedDateReminders.customReminders.length === 0 ? (
              <div className={`text-center py-8 rounded-[10px] ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                <Calendar className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  No reminders scheduled for this date
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Document Expiry Reminders */}
                {selectedDateReminders.expiryReminders.map((reminder, i) => (
                  <div
                    key={`expiry-${i}`}
                    className={`p-4 rounded-[10px] border ${
                      isDarkMode
                        ? 'bg-slate-800/50 border-slate-700'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-[10px] ${
                          reminder.urgency === 'critical'
                            ? isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                            : reminder.urgency === 'warning'
                            ? isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'
                            : isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                        }`}>
                          <AlertCircle className={`w-4 h-4 ${getUrgencyColor(reminder.urgency)}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                            {reminder.documentType} - Document Expiry
                          </p>
                          <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                            Driver: {reminder.driver?.name || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`text-xs rounded-[6px] ${
                              reminder.urgency === 'critical'
                                ? isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800'
                                : reminder.urgency === 'warning'
                                ? isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                                : isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {reminder.daysUntilExpiry < 0 ? 'Expired' : `${reminder.daysUntilExpiry} days`}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Custom Reminders */}
                {selectedDateReminders.customReminders.map((reminder, i) => (
                  <div
                    key={`custom-${i}`}
                    className={`p-4 rounded-[10px] border ${
                      isDarkMode
                        ? 'bg-slate-800/50 border-slate-700'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-[10px] ${isDarkMode ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                          <Bell className={`w-4 h-4 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold mb-1 ${getThemeClasses.text.primary(isDarkMode)}`}>
                            {reminder.title}
                          </p>
                          {reminder.description && (
                            <p className={`text-xs mb-2 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-xs rounded-[6px] ${
                              reminder.priority === 'high'
                                ? isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800'
                                : reminder.priority === 'low'
                                ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                                : isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reminder.priority}
                            </Badge>
                            <span className={`text-xs flex items-center gap-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              <Clock className="w-3 h-3" />
                              {formatTime(reminder.triggerDate)}
                            </span>
                            <span className={`text-xs flex items-center gap-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              {reminder.notificationType === 'email' && <Mail className="w-3 h-3" />}
                              {reminder.notificationType === 'sms' && <MessageSquare className="w-3 h-3" />}
                              {reminder.notificationType === 'both' && (
                                <>
                                  <Mail className="w-3 h-3" />
                                  <MessageSquare className="w-3 h-3" />
                                </>
                              )}
                              {reminder.frequency !== 'once' && reminder.frequency}
                            </span>
                          </div>
                        </div>
                      </div>
                      {onDeleteReminder && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteReminder(reminder.id)}
                          className={`rounded-[10px] ${isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarView;
