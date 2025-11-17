import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import {
  getDashboardStats,
  getAllCompanies,
  getAllUsers,
  getRecentActivity
} from '@/api/superAdmin';

/**
 * Hook to fetch super admin dashboard stats
 */
export const useDashboardStats = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['superAdminStats'],
    queryFn: async () => {
      const token = await getToken();
      return getDashboardStats(token);
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch all companies
 */
export const useAllCompanies = (params = {}) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['superAdminCompanies', params],
    queryFn: async () => {
      const token = await getToken();
      return getAllCompanies(token, params);
    },
    staleTime: 30000,
  });
};

/**
 * Hook to fetch all users
 */
export const useAllUsers = (params = {}) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['superAdminUsers', params],
    queryFn: async () => {
      const token = await getToken();
      return getAllUsers(token, params);
    },
    staleTime: 30000,
  });
};

/**
 * Hook to fetch recent activity
 */
export const useRecentActivity = (limit = 20) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['superAdminActivity', limit],
    queryFn: async () => {
      const token = await getToken();
      return getRecentActivity(token, limit);
    },
    staleTime: 30000,
    refetchInterval: 60000, // Refetch every minute
  });
};
