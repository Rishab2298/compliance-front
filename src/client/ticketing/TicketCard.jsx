import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { MessageSquare, Calendar, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';

export const TicketCard = ({ ticket, onClick }) => {
  const { isDarkMode } = useTheme();

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
      OTHER: 'Other'
    };
    return labels[category] || category;
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 border rounded-[10px] ${
        isDarkMode
          ? 'bg-slate-900/50 border-slate-700 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10'
          : 'bg-white border-gray-200 hover:border-gray-900 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-mono ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                {ticket.ticketNumber}
              </span>
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
            <h3 className={`text-sm font-semibold mb-1 truncate ${getThemeClasses.text.primary(isDarkMode)}`}>
              {ticket.title}
            </h3>
            <p className={`text-xs line-clamp-2 ${getThemeClasses.text.secondary(isDarkMode)}`}>
              {ticket.description}
            </p>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
              <Calendar className="w-3 h-3" />
              {formatDate(ticket.createdAt)}
            </span>
            {ticket._count?.comments > 0 && (
              <span className={`inline-flex items-center gap-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                <MessageSquare className="w-3 h-3" />
                {ticket._count.comments}
              </span>
            )}
          </div>
          <span className={`px-2 py-1 rounded-[8px] text-xs ${
            isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'
          }`}>
            {getCategoryLabel(ticket.category)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
