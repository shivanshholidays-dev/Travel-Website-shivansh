import axiosInstance from '../axios';

export const adminReportsApi = {
    revenueCsv: (params?: Record<string, any>) =>
        axiosInstance.get('/admin/reports/revenue/csv', { params, responseType: 'blob' }).then(r => r.data),

    revenuePdf: (params?: Record<string, any>) =>
        axiosInstance.get('/admin/reports/revenue/pdf', { params, responseType: 'blob' }).then(r => r.data),

    bookingsCsv: (params?: Record<string, any>) =>
        axiosInstance.get('/admin/reports/bookings/csv', { params, responseType: 'blob' }).then(r => r.data),
};
