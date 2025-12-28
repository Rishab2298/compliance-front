import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, UserPlus, Pencil, Trash2, Mail, Shield, Eye } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
import { usePermissions } from '@/hooks/usePermissions';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getTeamMembers,
  getTeamInvitations,
  inviteTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
} from '@/api/team';
import { getRoleDisplayName } from '@/utils/dspCapabilities';

const TeamManagement = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme();
  const { hasCapability, availableRoles, dspRole: currentUserRole } = usePermissions();
  const { t } = useTranslation();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [editRole, setEditRole] = useState('');

  // Check permission
  if (!hasCapability('manage_users')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-8">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('teamManagement.accessDenied.title')}</h2>
        <p className="text-gray-600">
          {t('teamManagement.accessDenied.description')}
          <br />
          {t('teamManagement.accessDenied.subdescription')}
        </p>
      </div>
    );
  }

  // Fetch team members
  const { data: teamData, isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const token = await getToken();
      return getTeamMembers(token);
    },
  });

  const teamMembers = teamData?.teamMembers || [];

  // Fetch team invitations
  const { data: invitationsData, isLoading: invitationsLoading } = useQuery({
    queryKey: ['teamInvitations'],
    queryFn: async () => {
      const token = await getToken();
      return getTeamInvitations(token);
    },
  });

  const invitations = invitationsData?.invitations || [];

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      const token = await getToken();
      return inviteTeamMember(data, token);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      queryClient.invalidateQueries({ queryKey: ['teamInvitations'] });
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteFirstName('');
      setInviteLastName('');
      setInviteRole('');

      if (data.emailError) {
        toast.warning(t('teamManagement.toasts.emailWarning'), {
          description: data.emailError,
        });
      } else {
        toast.success(t('teamManagement.toasts.inviteSuccess'), {
          description: data.message || t('teamManagement.toasts.inviteSuccessDesc'),
        });
      }
    },
    onError: (error) => {
      toast.error(t('teamManagement.toasts.inviteFailed'), {
        description: error.message,
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, dspRole }) => {
      const token = await getToken();
      return updateTeamMemberRole(userId, { dspRole }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      setEditDialogOpen(false);
      setSelectedMember(null);
      setEditRole('');
      toast.success(t('teamManagement.toasts.updateSuccess'));
    },
    onError: (error) => {
      toast.error(t('teamManagement.toasts.updateFailed'), {
        description: error.message,
      });
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: async (userId) => {
      const token = await getToken();
      return removeTeamMember(userId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      setRemoveDialogOpen(false);
      setSelectedMember(null);
      toast.success(t('teamManagement.toasts.removeSuccess'));
    },
    onError: (error) => {
      toast.error(t('teamManagement.toasts.removeFailed'), {
        description: error.message,
      });
    },
  });

  const handleInvite = () => {
    // Validate all fields
    if (!inviteEmail || !inviteFirstName || !inviteLastName || !inviteRole) {
      toast.error(t('teamManagement.toasts.fillAllFields'));
      return;
    }

    // Check 5 member limit
    if (teamMembers.length >= 5) {
      toast.error(t('teamManagement.toasts.limitReached'), {
        description: t('teamManagement.toasts.limitReachedDesc'),
      });
      return;
    }

    inviteMutation.mutate({
      email: inviteEmail,
      firstName: inviteFirstName,
      lastName: inviteLastName,
      dspRole: inviteRole
    });
  };

  const handleUpdateRole = () => {
    if (!editRole) {
      toast.error(t('teamManagement.toasts.selectRole'));
      return;
    }
    updateRoleMutation.mutate({ userId: selectedMember.id, dspRole: editRole });
  };

  const handleRemove = () => {
    removeMutation.mutate(selectedMember.id);
  };

  const openEditDialog = (member) => {
    setSelectedMember(member);
    setEditRole(member.dspRole);
    setEditDialogOpen(true);
  };

  const openRemoveDialog = (member) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      COMPLIANCE_MANAGER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      HR_LEAD: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      VIEWER: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      BILLING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

      <DashboardHeader title={t('teamManagement.title')}>
        <Button
          onClick={() => setInviteDialogOpen(true)}
          disabled={teamMembers.length >= 5}
          className={`rounded-[10px] gap-2 hidden sm:flex ${getThemeClasses.button.primary(isDarkMode)}`}
        >
          <UserPlus className="w-4 h-4" />
          {t('teamManagement.inviteButton')} {teamMembers.length >= 5 && `(${t('teamManagement.limitReached')})`}
        </Button>
        <Button
          onClick={() => setInviteDialogOpen(true)}
          disabled={teamMembers.length >= 5}
          className={`rounded-[10px] sm:hidden ${getThemeClasses.button.primary(isDarkMode)}`}
          size="icon"
        >
          <UserPlus className="w-4 h-4" />
        </Button>
      </DashboardHeader>

      <main className="container px-6 py-8 mx-auto relative z-[1]">
        <Card className={isDarkMode ? 'bg-slate-900/50 border-slate-800' : ''}>
          <CardHeader>
            <CardTitle className={getThemeClasses.text.primary(isDarkMode)}>
              {t('teamManagement.teamMembers.title')} ({teamMembers.length})
            </CardTitle>
            <CardDescription className={getThemeClasses.text.secondary(isDarkMode)}>
              {t('teamManagement.teamMembers.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className={`w-12 h-12 mx-auto mb-4 ${getThemeClasses.text.muted(isDarkMode)}`} />
                <h3 className={`text-lg font-medium mb-2 ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {t('teamManagement.teamMembers.noMembers')}
                </h3>
                <p className={`mb-4 ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  {t('teamManagement.teamMembers.noMembersDesc')}
                </p>
                <Button onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('teamManagement.inviteButton')}
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.teamMembers.tableHeaders.name')}</TableHead>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.teamMembers.tableHeaders.email')}</TableHead>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.teamMembers.tableHeaders.role')}</TableHead>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.teamMembers.tableHeaders.mfa')}</TableHead>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.teamMembers.tableHeaders.joined')}</TableHead>
                    <TableHead className="text-right">{t('teamManagement.teamMembers.tableHeaders.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className={getThemeClasses.text.primary(isDarkMode)}>
                        {member.firstName || member.lastName
                          ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                          : <span className={getThemeClasses.text.muted(isDarkMode)}>—</span>}
                      </TableCell>
                      <TableCell className={getThemeClasses.text.secondary(isDarkMode)}>
                        {member.email}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(member.dspRole)}>
                          {getRoleDisplayName(member.dspRole)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.mfaEnabled ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            {t('teamManagement.teamMembers.mfaEnabled')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className={getThemeClasses.text.muted(isDarkMode)}>
                            {t('teamManagement.teamMembers.mfaDisabled')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={getThemeClasses.text.secondary(isDarkMode)}>
                        {new Date(member.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(member)}
                            className="h-8 px-2"
                            disabled={member.dspRole === 'ADMIN'}
                            title={member.dspRole === 'ADMIN' ? t('teamManagement.teamMembers.cannotEditAdmin') : t('teamManagement.teamMembers.editMember')}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRemoveDialog(member)}
                            disabled={member.dspRole === 'ADMIN'}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={member.dspRole === 'ADMIN' ? t('teamManagement.teamMembers.cannotRemoveAdmin') : t('teamManagement.teamMembers.removeMember')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Invitation History */}
        <Card className={`mt-8 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : ''}`}>
          <CardHeader>
            <CardTitle className={getThemeClasses.text.primary(isDarkMode)}>
              {t('teamManagement.invitationHistory.title')} ({invitations.length})
            </CardTitle>
            <CardDescription className={getThemeClasses.text.secondary(isDarkMode)}>
              {t('teamManagement.invitationHistory.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-8">
                <Mail className={`w-10 h-10 mx-auto mb-3 ${getThemeClasses.text.muted(isDarkMode)}`} />
                <p className={`text-sm ${getThemeClasses.text.secondary(isDarkMode)}`}>
                  {t('teamManagement.invitationHistory.noInvitations')}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.invitationHistory.tableHeaders.name')}</TableHead>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.invitationHistory.tableHeaders.email')}</TableHead>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.invitationHistory.tableHeaders.role')}</TableHead>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.invitationHistory.tableHeaders.status')}</TableHead>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.invitationHistory.tableHeaders.invitedOn')}</TableHead>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.invitationHistory.tableHeaders.emailSent')}</TableHead>
                    <TableHead className={getThemeClasses.text.primary(isDarkMode)}>{t('teamManagement.invitationHistory.tableHeaders.joined')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className={getThemeClasses.text.primary(isDarkMode)}>
                        {invitation.firstName || invitation.lastName
                          ? `${invitation.firstName || ''} ${invitation.lastName || ''}`.trim()
                          : <span className={getThemeClasses.text.muted(isDarkMode)}>—</span>}
                      </TableCell>
                      <TableCell className={getThemeClasses.text.secondary(isDarkMode)}>
                        <div className="flex flex-col">
                          <span>{invitation.email}</span>
                          {invitation.errorMessage && (
                            <span className="text-xs text-red-500 dark:text-red-400 mt-1">
                              {t('teamManagement.invitationHistory.error')}: {invitation.errorMessage}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(invitation.dspRole)}>
                          {getRoleDisplayName(invitation.dspRole)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(invitation.status)}>
                          {invitation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={getThemeClasses.text.secondary(isDarkMode)}>
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className={getThemeClasses.text.secondary(isDarkMode)}>
                        {invitation.emailSentAt ? (
                          new Date(invitation.emailSentAt).toLocaleDateString()
                        ) : (
                          <span className={getThemeClasses.text.muted(isDarkMode)}>—</span>
                        )}
                      </TableCell>
                      <TableCell className={getThemeClasses.text.secondary(isDarkMode)}>
                        {invitation.acceptedAt ? (
                          new Date(invitation.acceptedAt).toLocaleDateString()
                        ) : (
                          <span className={getThemeClasses.text.muted(isDarkMode)}>—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className={`max-w-lg ${isDarkMode ? 'bg-slate-900 border-slate-800' : ''}`}>
          <DialogHeader>
            <DialogTitle className={getThemeClasses.text.primary(isDarkMode)}>
              {t('teamManagement.inviteDialog.title')}
            </DialogTitle>
            <DialogDescription className={getThemeClasses.text.secondary(isDarkMode)}>
              {t('teamManagement.inviteDialog.description')}
              {teamMembers.length >= 5 && (
                <span className="block mt-2 text-red-500 font-medium">
                  {t('teamManagement.inviteDialog.limitWarning')}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {t('teamManagement.inviteDialog.firstName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder={t('teamManagement.inviteDialog.firstNamePlaceholder')}
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  className={`h-10 ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                  {t('teamManagement.inviteDialog.lastName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder={t('teamManagement.inviteDialog.lastNamePlaceholder')}
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                  className={`h-10 ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                {t('teamManagement.inviteDialog.email')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('teamManagement.inviteDialog.emailPlaceholder')}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={`h-10 ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className={`text-sm font-medium ${getThemeClasses.text.primary(isDarkMode)}`}>
                {t('teamManagement.inviteDialog.role')} <span className="text-red-500">*</span>
              </Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className={`h-10 ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <SelectValue placeholder={t('teamManagement.inviteDialog.selectRole')} />
                </SelectTrigger>
                <SelectContent
                  className={isDarkMode ? 'bg-slate-900 border-slate-800' : ''}
                >
                  {availableRoles.map((role) => (
                    <SelectItem
                      key={role.value}
                      value={role.value}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 py-1.5 max-w-[280px]">
                        <span className="font-medium text-sm">{t(`teamManagement.roles.${role.value}.label`)}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                          {t(`teamManagement.roles.${role.value}.description`)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              disabled={inviteMutation.isPending}
            >
              {t('teamManagement.inviteDialog.cancel')}
            </Button>
            <Button
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
              className={getThemeClasses.button.primary(isDarkMode)}
            >
              {inviteMutation.isPending ? t('teamManagement.inviteDialog.sending') : t('teamManagement.inviteDialog.sendInvitation')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className={isDarkMode ? 'bg-slate-900 border-slate-800' : ''}>
          <DialogHeader>
            <DialogTitle className={getThemeClasses.text.primary(isDarkMode)}>
              {t('teamManagement.editDialog.title')}
            </DialogTitle>
            <DialogDescription className={getThemeClasses.text.secondary(isDarkMode)}>
              {t('teamManagement.editDialog.description')} {selectedMember?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role" className={getThemeClasses.text.primary(isDarkMode)}>
                {t('teamManagement.editDialog.newRole')}
              </Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className={`h-10 ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={isDarkMode ? 'bg-slate-900 border-slate-800' : ''}
                >
                  {availableRoles.map((role) => (
                    <SelectItem
                      key={role.value}
                      value={role.value}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 py-1.5 max-w-[280px]">
                        <span className="font-medium text-sm">{t(`teamManagement.roles.${role.value}.label`)}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                          {t(`teamManagement.roles.${role.value}.description`)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={updateRoleMutation.isPending}
            >
              {t('teamManagement.editDialog.cancel')}
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updateRoleMutation.isPending}
              className={getThemeClasses.button.primary(isDarkMode)}
            >
              {updateRoleMutation.isPending ? t('teamManagement.editDialog.updating') : t('teamManagement.editDialog.updateRole')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent className={isDarkMode ? 'bg-slate-900 border-slate-800' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className={getThemeClasses.text.primary(isDarkMode)}>
              {t('teamManagement.removeDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className={getThemeClasses.text.secondary(isDarkMode)}>
              {t('teamManagement.removeDialog.description')} <strong>{selectedMember?.email}</strong> {t('teamManagement.removeDialog.fromTeam')}
              <br />
              <br />
              {t('teamManagement.removeDialog.warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending}>
              {t('teamManagement.removeDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removeMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeMutation.isPending ? t('teamManagement.removeDialog.removing') : t('teamManagement.removeDialog.removeMember')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamManagement;
