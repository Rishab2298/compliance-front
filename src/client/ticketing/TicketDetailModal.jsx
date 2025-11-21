import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useTicket, useAddComment, useReopenTicket } from '@/hooks/useTickets';
import { useTheme } from '@/contexts/ThemeContext';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import {
  Calendar,
  User,
  MessageSquare,
  Send,
  Loader2,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const TicketDetailModal = ({ ticketId, open, onOpenChange }) => {
  const { isDarkMode } = useTheme();
  const { data: ticket, isLoading, error } = useTicket(ticketId);
  const addComment = useAddComment();
  const reopenTicket = useReopenTicket();

  const [comment, setComment] = useState('');
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
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

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await addComment.mutateAsync({
        ticketId,
        comment: comment.trim(),
        attachments: [],
        isInternal: false,
      });

      toast.success('Comment added successfully');
      setComment('');
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const handleReopen = async () => {
    if (!reopenReason.trim()) {
      toast.error('Please provide a reason for reopening');
      return;
    }

    try {
      await reopenTicket.mutateAsync({
        ticketId,
        reason: reopenReason.trim(),
      });

      toast.success('Ticket reopened successfully');
      setShowReopenDialog(false);
      setReopenReason('');
    } catch (error) {
      toast.error(error.message || 'Failed to reopen ticket');
    }
  };

  const canReopen = ticket && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-4xl max-h-[90vh] overflow-y-auto ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
        }`}
      >
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Failed to load ticket details
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {ticket.ticketNumber}
                    </span>
                    <TicketPriorityBadge priority={ticket.priority} />
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                  <DialogTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {ticket.title}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Category
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getCategoryLabel(ticket.category)}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Created
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Reporter
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {ticket.reporterName}
                  </p>
                </div>
                {ticket.assignedTo && (
                  <div>
                    <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Assigned To
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                    </p>
                  </div>
                )}
              </div>

              <Separator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />

              {/* Description */}
              <div>
                <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Description
                </p>
                <p className={`text-sm whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {ticket.description}
                </p>
              </div>

              {/* Resolution Notes (if resolved) */}
              {ticket.resolutionNotes && (
                <>
                  <Separator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
                  <div
                    className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
                    }`}
                  >
                    <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                      Resolution
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                      {ticket.resolutionNotes}
                    </p>
                    {ticket.resolvedAt && (
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Resolved on {formatDate(ticket.resolvedAt)}
                        {ticket.resolvedBy &&
                          ` by ${ticket.resolvedBy.firstName} ${ticket.resolvedBy.lastName}`}
                      </p>
                    )}
                  </div>
                </>
              )}

              <Separator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />

              {/* Comments Section */}
              <div>
                <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <MessageSquare className="w-4 h-4" />
                  Comments ({ticket.comments?.length || 0})
                </h3>

                {/* Comments List */}
                <div className="space-y-4 mb-4">
                  {ticket.comments && ticket.comments.length > 0 ? (
                    ticket.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-4 rounded-lg ${
                          comment.userRole === 'SUPER_ADMIN'
                            ? isDarkMode
                              ? 'bg-blue-500/10 border border-blue-500/30'
                              : 'bg-blue-50 border border-blue-200'
                            : isDarkMode
                            ? 'bg-gray-700'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className={`text-sm font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {comment.userName}
                            </span>
                            {comment.userRole === 'SUPER_ADMIN' && (
                              <span className="px-2 py-0.5 text-xs rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                Admin
                              </span>
                            )}
                          </div>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className={`text-sm whitespace-pre-wrap ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {comment.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm text-center py-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No comments yet
                    </p>
                  )}
                </div>

                {/* Add Comment Form */}
                {ticket.status !== 'CLOSED' && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className={`rounded-[10px] ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        disabled={addComment.isPending || !comment.trim()}
                        className="rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {addComment.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Add Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reopen Ticket */}
              {canReopen && !showReopenDialog && (
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    onClick={() => setShowReopenDialog(true)}
                    className="rounded-[10px]"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reopen Ticket
                  </Button>
                </div>
              )}

              {/* Reopen Dialog */}
              {showReopenDialog && (
                <div
                  className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Why are you reopening this ticket?
                  </p>
                  <Textarea
                    placeholder="Please provide a reason..."
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    rows={3}
                    className={`mb-3 rounded-[10px] ${
                      isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReopenDialog(false);
                        setReopenReason('');
                      }}
                      className="rounded-[10px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReopen}
                      disabled={reopenTicket.isPending || !reopenReason.trim()}
                      className="rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {reopenTicket.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Reopening...
                        </>
                      ) : (
                        'Reopen Ticket'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
