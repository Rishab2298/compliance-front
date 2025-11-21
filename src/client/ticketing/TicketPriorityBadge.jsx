import React from 'react';
import { Badge } from '@/components/ui/badge';

const priorityConfig = {
  LOW: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
  },
  HIGH: {
    label: 'High',
    className: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
  },
  CRITICAL: {
    label: 'Critical',
    className: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 animate-pulse'
  }
};

export const TicketPriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;

  return (
    <Badge className={`${config.className} rounded-[10px] text-xs font-medium`}>
      {config.label}
    </Badge>
  );
};
