import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  OPEN: {
    label: 'Open',
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
  },
  WAITING_FOR_RESPONSE: {
    label: 'Waiting',
    className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30'
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30'
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30'
  },
  REOPENED: {
    label: 'Reopened',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30'
  }
};

export const TicketStatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.OPEN;

  return (
    <Badge className={`${config.className} rounded-[10px] text-xs font-medium border`}>
      {config.label}
    </Badge>
  );
};
