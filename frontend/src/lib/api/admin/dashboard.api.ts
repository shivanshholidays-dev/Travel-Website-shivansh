import axiosInstance from '../axios';

export const adminDashboardApi = {
    summary: () =>
        axiosInstance.get('/admin/dashboard/summary').then(r => r.data),

    revenueChart: (period: 'daily' | 'monthly' | 'yearly') =>
        axiosInstance.get('/admin/dashboard/revenue-chart', { params: { period } }).then(r => r.data),

    topTours: () =>
        axiosInstance.get('/admin/dashboard/top-tours').then(r => r.data),

    recentBookings: (limit = 5) =>
        axiosInstance.get('/admin/dashboard/recent-bookings', { params: { limit } }).then(r => r.data),
};
