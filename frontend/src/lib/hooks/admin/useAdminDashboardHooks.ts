import { useQuery } from '@tanstack/react-query';
import { adminDashboardApi } from '../../api/admin/dashboard.api';

export const useAdminDashboardHooks = () => {
    const useSummary = () => useQuery({
        queryKey: ['admin', 'dashboard', 'summary'],
        queryFn: () => adminDashboardApi.summary(),
    });

    const useRevenueChart = (period: 'daily' | 'monthly' | 'yearly') => useQuery({
        queryKey: ['admin', 'dashboard', 'revenue', period],
        queryFn: () => adminDashboardApi.revenueChart(period),
    });

    const useTopTours = () => useQuery({
        queryKey: ['admin', 'dashboard', 'topTours'],
        queryFn: () => adminDashboardApi.topTours(),
    });

    return { useSummary, useRevenueChart, useTopTours };
};
