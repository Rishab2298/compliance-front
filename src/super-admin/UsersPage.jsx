import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Users,
  Mail,
  Calendar,
  Search,
  Shield,
  Building2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/utils/themeClasses';
import { format } from 'date-fns';

const UsersPage = () => {
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch users data
  const { data, isLoading } = useQuery({
    queryKey: ['superAdminUsers', page, searchTerm],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
      });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const result = await res.json();
      return result.data;
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      SUPER_ADMIN: isDarkMode
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : 'bg-red-50 text-red-700 border-red-200',
      ADMIN: isDarkMode
        ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
        : 'bg-violet-50 text-violet-700 border-violet-200',
    };
    return roleColors[role] || (isDarkMode
      ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      : 'bg-slate-50 text-slate-700 border-slate-200');
  };

  const getDSPRoleBadge = (dspRole) => {
    const dspRoleColors = {
      ADMIN: isDarkMode
        ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
        : 'bg-violet-50 text-violet-700 border-violet-200',
      MANAGER: isDarkMode
        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        : 'bg-blue-50 text-blue-700 border-blue-200',
      VIEWER: isDarkMode
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return dspRoleColors[dspRole] || '';
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div
      className={`flex flex-col w-full min-h-screen relative ${getThemeClasses.bg.primary(
        isDarkMode
      )}`}
    >
      {/* Decorative elements for dark mode */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 rounded-full pointer-events-none left-1/4 w-96 h-96 bg-violet-500/5 blur-3xl"></div>
          <div className="fixed bottom-0 rounded-full pointer-events-none right-1/4 w-96 h-96 bg-purple-500/5 blur-3xl"></div>
        </>
      )}

      {/* Header */}
      <header
        className={`sticky top-0 z-10 flex items-center h-16 border-b shrink-0 ${getThemeClasses.bg.header(
          isDarkMode
        )}`}
      >
        <div className="container flex items-center justify-between w-full px-6 mx-auto">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-[10px] ${
                isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
              }`}
            >
              <Users
                className={`w-5 h-5 ${
                  isDarkMode ? 'text-violet-400' : 'text-gray-700'
                }`}
              />
            </div>
            <h1
              className={`text-xl font-semibold ${getThemeClasses.text.primary(
                isDarkMode
              )}`}
            >
              Users Management
            </h1>
          </div>
          {!isLoading && data && (
            <Badge
              className={`rounded-[10px] text-xs ${getThemeClasses.badge.success(
                isDarkMode
              )}`}
            >
              {data.pagination.total} Total Users
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container w-full px-6 mx-auto space-y-6">
          {/* Search Bar */}
          <div
            className={`rounded-[10px] p-4 border ${getThemeClasses.bg.card(
              isDarkMode
            )}`}
          >
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-400'
                }`}
              />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearch}
                className={`pl-10 rounded-[10px] ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400'
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Users Table */}
          <div
            className={`rounded-[10px] border ${getThemeClasses.bg.card(
              isDarkMode
            )}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${
                      isDarkMode ? 'border-slate-700' : 'border-gray-200'
                    }`}
                  >
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(
                        isDarkMode
                      )}`}
                    >
                      User
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(
                        isDarkMode
                      )}`}
                    >
                      Team Role
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(
                        isDarkMode
                      )}`}
                    >
                      Company
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(
                        isDarkMode
                      )}`}
                    >
                      MFA
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(
                        isDarkMode
                      )}`}
                    >
                      Policies
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses.text.secondary(
                        isDarkMode
                      )}`}
                    >
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDarkMode ? 'divide-slate-700' : 'divide-gray-200'
                  }`}
                >
                  {isLoading ? (
                    [...Array(10)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-[10px]" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32 rounded-[10px]" />
                              <Skeleton className="h-3 w-48 rounded-[10px]" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-16 rounded-[6px]" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-32 rounded-[10px]" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-8 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-8 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24 rounded-[10px]" />
                        </td>
                      </tr>
                    ))
                  ) : data?.users && data.users.length > 0 ? (
                    data.users.map((user) => (
                      <tr
                        key={user.id}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* User Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-[10px] ${
                                isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
                              }`}
                            >
                              {user.role === 'SUPER_ADMIN' ? (
                                <Shield
                                  className="w-5 h-5 text-red-500"
                                />
                              ) : (
                                <User
                                  className={`w-5 h-5 ${
                                    isDarkMode ? 'text-violet-400' : 'text-gray-700'
                                  }`}
                                />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm font-medium ${getThemeClasses.text.primary(
                                    isDarkMode
                                  )}`}
                                >
                                  {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : 'No name'}
                                </p>
                                {user.role === 'SUPER_ADMIN' && (
                                  <Badge
                                    className={`text-xs rounded-[6px] ${getRoleBadge(
                                      user.role
                                    )}`}
                                  >
                                    SUPER ADMIN
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Mail
                                  className={`w-3 h-3 ${
                                    isDarkMode ? 'text-slate-500' : 'text-gray-400'
                                  }`}
                                />
                                <p
                                  className={`text-xs ${getThemeClasses.text.secondary(
                                    isDarkMode
                                  )}`}
                                >
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Team Role (DSP Role) */}
                        <td className="px-6 py-4">
                          {user.dspRole ? (
                            <Badge
                              className={`text-xs rounded-[6px] font-medium ${getDSPRoleBadge(
                                user.dspRole
                              )}`}
                            >
                              {user.dspRole}
                            </Badge>
                          ) : user.role === 'SUPER_ADMIN' ? (
                            <Badge
                              className={`text-xs rounded-[6px] font-medium ${
                                isDarkMode
                                  ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              System Admin
                            </Badge>
                          ) : (
                            <span
                              className={`text-xs ${getThemeClasses.text.secondary(
                                isDarkMode
                              )}`}
                            >
                              -
                            </span>
                          )}
                        </td>

                        {/* Company */}
                        <td className="px-6 py-4">
                          {user.company ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Building2
                                  className={`w-4 h-4 ${
                                    isDarkMode ? 'text-slate-400' : 'text-gray-400'
                                  }`}
                                />
                                <span
                                  className={`text-sm ${getThemeClasses.text.primary(
                                    isDarkMode
                                  )}`}
                                >
                                  {user.company.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs rounded-[6px]"
                                >
                                  {user.company.plan}
                                </Badge>
                                {user.isCompanyAdmin && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs rounded-[6px]"
                                  >
                                    Owner
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span
                              className={`text-xs ${getThemeClasses.text.secondary(
                                isDarkMode
                              )}`}
                            >
                              No company
                            </span>
                          )}
                        </td>

                        {/* MFA Status */}
                        <td className="px-6 py-4">
                          {user.mfaEnabled ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle
                              className={`w-5 h-5 ${
                                isDarkMode ? 'text-slate-600' : 'text-gray-400'
                              }`}
                            />
                          )}
                        </td>

                        {/* Policies Accepted */}
                        <td className="px-6 py-4">
                          {user.policiesAccepted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle
                              className={`w-5 h-5 ${
                                isDarkMode ? 'text-slate-600' : 'text-gray-400'
                              }`}
                            />
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar
                              className={`w-4 h-4 ${
                                isDarkMode ? 'text-slate-400' : 'text-gray-400'
                              }`}
                            />
                            <span
                              className={`text-sm ${getThemeClasses.text.secondary(
                                isDarkMode
                              )}`}
                            >
                              {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div
                            className={`p-4 rounded-[10px] mb-4 ${
                              isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
                            }`}
                          >
                            <Users
                              className={`w-8 h-8 ${
                                isDarkMode ? 'text-slate-600' : 'text-gray-400'
                              }`}
                            />
                          </div>
                          <h3
                            className={`text-lg font-semibold mb-2 ${getThemeClasses.text.primary(
                              isDarkMode
                            )}`}
                          >
                            No users found
                          </h3>
                          <p
                            className={`text-sm ${getThemeClasses.text.secondary(
                              isDarkMode
                            )}`}
                          >
                            {searchTerm
                              ? 'Try adjusting your search terms'
                              : 'Users will appear here once they sign up'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && data && data.pagination.totalPages > 1 && (
              <div
                className={`flex items-center justify-between px-6 py-4 border-t ${
                  isDarkMode ? 'border-slate-700' : 'border-gray-200'
                }`}
              >
                <p
                  className={`text-sm ${getThemeClasses.text.secondary(
                    isDarkMode
                  )}`}
                >
                  Showing {(page - 1) * limit + 1} to{' '}
                  {Math.min(page * limit, data.pagination.total)} of{' '}
                  {data.pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`rounded-[10px] ${getThemeClasses.button.secondary(
                      isDarkMode
                    )}`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span
                    className={`text-sm px-3 ${getThemeClasses.text.secondary(
                      isDarkMode
                    )}`}
                  >
                    {page} / {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.totalPages}
                    className={`rounded-[10px] ${getThemeClasses.button.secondary(
                      isDarkMode
                    )}`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
