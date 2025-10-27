import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import {
  getPlans,
  getCurrentPlan,
  purchaseCredits,
  upgradePlan,
  downgradePlan,
  cancelDowngrade,
  getBillingHistory,
  getCreditTransactions,
  getBillingPortal,
} from '@/api/billing';

/**
 * Hook to fetch all available plans
 */
export const usePlans = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: async () => {
      const token = await getToken();
      return getPlans(token);
    },
  });
};

/**
 * Hook to fetch current plan and usage
 */
export const useCurrentPlan = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['billing', 'current'],
    queryFn: async () => {
      const token = await getToken();
      return getCurrentPlan(token);
    },
  });
};

/**
 * Hook to purchase AI credits
 */
export const usePurchaseCredits = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount) => {
      const token = await getToken();
      return purchaseCredits(amount, token);
    },
    onSuccess: () => {
      // Invalidate billing and company data
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
    },
  });
};

/**
 * Hook to upgrade plan
 */
export const useUpgradePlan = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetPlan, billingCycle = 'monthly' }) => {
      const token = await getToken();
      return upgradePlan(targetPlan, billingCycle, token);
    },
    onSuccess: () => {
      // Invalidate billing and company data
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
    },
  });
};

/**
 * Hook to downgrade plan
 */
export const useDowngradePlan = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPlan) => {
      const token = await getToken();
      return downgradePlan(targetPlan, token);
    },
    onSuccess: () => {
      // Invalidate current plan data
      queryClient.invalidateQueries({ queryKey: ['billing', 'current'] });
    },
  });
};

/**
 * Hook to cancel pending downgrade
 */
export const useCancelDowngrade = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return cancelDowngrade(token);
    },
    onSuccess: () => {
      // Invalidate current plan data
      queryClient.invalidateQueries({ queryKey: ['billing', 'current'] });
    },
  });
};

/**
 * Hook to fetch billing history
 */
export const useBillingHistory = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['billing', 'history'],
    queryFn: async () => {
      const token = await getToken();
      return getBillingHistory(token);
    },
  });
};

/**
 * Hook to fetch credit transactions
 */
export const useCreditTransactions = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['billing', 'transactions'],
    queryFn: async () => {
      const token = await getToken();
      return getCreditTransactions(token);
    },
  });
};

/**
 * Hook to get billing portal URL
 */
export const useGetBillingPortal = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return getBillingPortal(token);
    },
  });
};
