import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminPaymentsApi } from '../../api/admin/payments.api';

export const useAdminPaymentHooks = () => {
    const queryClient = useQueryClient();

    const usePendingPayments = (params?: Record<string, any>) => useQuery({
        queryKey: ['admin', 'payments', 'pending', params],
        queryFn: () => adminPaymentsApi.getPending(params),
    });

    const usePaymentById = (id: string) => useQuery({
        queryKey: ['admin', 'payments', id],
        queryFn: () => adminPaymentsApi.getById(id),
        enabled: !!id,
    });

    const useVerifyPayment = () => useMutation({
        mutationFn: (id: string) => adminPaymentsApi.verify(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'payments', id] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
        }
    });

    const useRejectPayment = () => useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => adminPaymentsApi.reject(id, reason),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'payments', variables.id] });
        }
    });

    const useRecordOfflinePayment = () => useMutation({
        mutationFn: (data: { bookingId: string; amount: number; paymentMethod: string }) => adminPaymentsApi.recordOffline(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
        }
    });

    return {
        usePendingPayments,
        usePaymentById,
        useVerifyPayment,
        useRejectPayment,
        useRecordOfflinePayment
    };
};
