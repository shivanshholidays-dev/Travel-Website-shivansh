import { useMutation } from '@tanstack/react-query';
import { adminReportsApi } from '../../api/admin/reports.api';

export const useAdminReportHooks = () => {
    const useRevenueCsv = () => useMutation({
        mutationFn: (params?: Record<string, any>) => adminReportsApi.revenueCsv(params),
    });

    const useRevenuePdf = () => useMutation({
        mutationFn: (params?: Record<string, any>) => adminReportsApi.revenuePdf(params),
    });

    const useBookingsCsv = () => useMutation({
        mutationFn: (params?: Record<string, any>) => adminReportsApi.bookingsCsv(params),
    });

    return {
        useRevenueCsv,
        useRevenuePdf,
        useBookingsCsv
    };
};
