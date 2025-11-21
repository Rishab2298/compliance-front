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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAdminTicket,
  useAddComment,
  useUpdateTicketStatus,
  useUpdateTicketPriority,
  useDeleteTicket,
} from '@/hooks/useTickets';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
import { TicketStatusBadge } from '@/client/ticketing/TicketStatusBadge';
import { TicketPriorityBadge } from '@/client/ticketing/TicketPriorityBadge';
import {
  Calendar,
  User,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  Trash2,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

export const TicketDetailAdminModal = ({ ticketId, open, onOpenChange }) => {
  const { isDarkMode } = useTheme();
  const { data: ticket, isLoading, error } = useAdminTicket(ticketId);
  const addComment = useAddComment();
  const updateStatus = useUpdateTicketStatus();
  const updatePriority = useUpdateTicketPriority();
  const deleteTicket = useDeleteTicket();

  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        isInternal,
      });

      toast.success('Comment added successfully');
      setComment('');
      setIsInternal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus.mutateAsync({
        ticketId,
        status: newStatus,
      });

      toast.success('Status updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await updatePriority.mutateAsync({
        ticketId,
        priority: newPriority,
      });

      toast.success('Priority updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update priority');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTicket.mutateAsync(ticketId);
      toast.success('Ticket deleted successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || 'Failed to delete ticket');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`!max-w-[70vw] w-full max-h-[90vh] overflow-y-auto rounded-[10px] ${
          isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
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
            <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
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
                      className={`text-xs font-mono ${getThemeClasses.text.secondary(isDarkMode)}`}
                    >
                      {ticket.ticketNumber}
                    </span>
                  </div>
                  <DialogTitle className={`text-xl ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {ticket.title}
                  </DialogTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-6 mt-4">
              {/* Left Column - Ticket Details */}
              <div className="col-span-2 space-y-6">
                {/* Ticket Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs font-medium mb-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Company
                    </p>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <p className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                        {ticket.company?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Category
                    </p>
                    <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {getCategoryLabel(ticket.category)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Reporter
                    </p>
                    <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {ticket.reporterName}
                    </p>
                    <p className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      {ticket.reporterEmail}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Created
                    </p>
                    <p className={`text-sm ${getThemeClasses.text.primary(isDarkMode)}`}>
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                </div>

                <Separator className={isDarkMode ? 'bg-slate-800' : 'bg-gray-200'} />

                {/* Description */}
                <div>
                  <p className={`text-xs font-medium mb-2 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                    Description
                  </p>
                  <p className={`text-sm whitespace-pre-wrap ${getThemeClasses.text.primary(isDarkMode)}`}>
                    {ticket.description}
                  </p>
                </div>

                {/* Resolution Notes */}
                {ticket.resolutionNotes && (
                  <>
                    <Separator className={isDarkMode ? 'bg-slate-800' : 'bg-gray-200'} />
                    <div
                      className={`p-4 rounded-lg ${
                        isDarkMode
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-green-50 border border-green-200'
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

                <Separator className={isDarkMode ? 'bg-slate-800' : 'bg-gray-200'} />

                {/* Comments Section */}
                <div>
                  <h3
                    className={`text-sm font-semibold mb-4 flex items-center gap-2 ${getThemeClasses.text.primary(isDarkMode)}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Comments ({ticket.comments?.length || 0})
                  </h3>

                  {/* Comments List */}
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {ticket.comments && ticket.comments.length > 0 ? (
                      ticket.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-lg ${
                            comment.isInternal
                              ? isDarkMode
                                ? 'bg-yellow-500/10 border border-yellow-500/30'
                                : 'bg-yellow-50 border border-yellow-200'
                              : comment.userRole === 'SUPER_ADMIN'
                              ? isDarkMode
                                ? 'bg-blue-500/10 border border-blue-500/30'
                                : 'bg-blue-50 border border-blue-200'
                              : isDarkMode
                              ? 'bg-slate-800'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                                {comment.userName}
                              </span>
                              {comment.userRole === 'SUPER_ADMIN' && (
                                <span className="px-2 py-0.5 text-xs rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                  Admin
                                </span>
                              )}
                              {comment.isInternal && (
                                <span className="px-2 py-0.5 text-xs rounded-md bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">
                                  Internal
                                </span>
                              )}
                            </div>
                            <span className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className={`text-sm whitespace-pre-wrap ${getThemeClasses.text.primary(isDarkMode)}`}>
                            {comment.comment}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p
                        className={`text-sm text-center py-4 ${getThemeClasses.text.secondary(isDarkMode)}`}
                      >
                        No comments yet
                      </p>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className={`rounded-[10px] ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded"
                        />
                        <span className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                          Internal comment (only visible to admins)
                        </span>
                      </label>
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
                </div>
              </div>

              {/* Right Column - Admin Controls */}
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-[10px] border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`text-sm font-semibold mb-4 ${getThemeClasses.text.primary(isDarkMode)}`}>
                    Admin Controls
                  </h3>

                  {/* Status */}
                  <div className="mb-4">
                    <label className={`text-xs font-medium mb-2 block ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Status
                    </label>
                    <Select value={ticket.status} onValueChange={handleStatusChange}>
                      <SelectTrigger
                        className={`rounded-[10px] ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300'
                        }`}
                        disabled={updateStatus.isPending}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
                        <SelectItem value="OPEN" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                          Open
                        </SelectItem>
                        <SelectItem value="IN_PROGRESS" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                          In Progress
                        </SelectItem>
                        <SelectItem
                          value="WAITING_FOR_RESPONSE"
                          className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}
                        >
                          Waiting for Response
                        </SelectItem>
                        <SelectItem value="RESOLVED" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                          Resolved
                        </SelectItem>
                        <SelectItem value="CLOSED" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                          Closed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="mb-4">
                    <label className={`text-xs font-medium mb-2 block ${getThemeClasses.text.secondary(isDarkMode)}`}>
                      Priority
                    </label>
                    <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                      <SelectTrigger
                        className={`rounded-[10px] ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300'
                        }`}
                        disabled={updatePriority.isPending}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
                        <SelectItem value="LOW" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                          Low
                        </SelectItem>
                        <SelectItem value="MEDIUM" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                          Medium
                        </SelectItem>
                        <SelectItem value="HIGH" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                          High
                        </SelectItem>
                        <SelectItem value="CRITICAL" className={isDarkMode ? 'text-white hover:bg-slate-700' : ''}>
                          Critical
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className={isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} />

                  {/* Current Status Display */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>Current Status:</span>
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${getThemeClasses.text.secondary(isDarkMode)}`}>
                        Current Priority:
                      </span>
                      <TicketPriorityBadge priority={ticket.priority} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div
                className={`mt-6 p-4 rounded-lg border ${
                  isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                }`}
              >
                <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
                  Are you sure you want to delete this ticket? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-[10px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={deleteTicket.isPending}
                    className="rounded-[10px] bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteTicket.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Ticket'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
