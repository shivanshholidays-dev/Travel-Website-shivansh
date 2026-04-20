import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminBookingsApi } from '../../api/admin/bookings.api';
import { adminPaymentsApi } from '../../api/admin/payments.api';

export const useAdminBookingHooks = () => {
    const queryClient = useQueryClient();

    const useBookingsList = (params?: Record<string, any>) => useQuery({
        queryKey: ['admin', 'bookings', params],
        queryFn: () => adminBookingsApi.getAll(params),
    });

    const useBookingById = (id: string) => useQuery({
        queryKey: ['admin', 'bookings', id],
        queryFn: () => adminBookingsApi.getById(id),
        enabled: !!id,
    });

    const useUpdateStatus = () => useMutation({
        mutationFn: ({ id, status, internalNotes }: { id: string; status: string; internalNotes?: string }) =>
            adminBookingsApi.updateStatus(id, status, internalNotes),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', variables.id] });
        }
    });

    const useConfirmBooking = () => useMutation({
        mutationFn: (id: string) => adminBookingsApi.confirm(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', id] });
        }
    });

    const useCancelBooking = () => useMutation({
        mutationFn: (id: string) => adminBookingsApi.cancel(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', id] });
        }
    });

    const useVerifyReceipt = () => useMutation({
        mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
            adminBookingsApi.verifyReceipt(id, approve),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', variables.id] });
        }
    });

    const useAddPayment = () => useMutation({
        mutationFn: (data: {
            bookingId: string;
            amount: number;
            paymentMethod: string;
            notes: string;
            receiptNumber?: string
        }) =>
            adminPaymentsApi.recordOffline(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', variables.bookingId] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'history', variables.bookingId] });
        }
    });

    const useBookingPaymentHistory = (bookingId: string) => useQuery({
        queryKey: ['admin', 'payments', 'history', bookingId],
        queryFn: () => adminPaymentsApi.getHistory(bookingId),
        enabled: !!bookingId,
    });

    return {
        useBookingsList,
        useBookingById,
        useUpdateStatus,
        useConfirmBooking,
        useCancelBooking,
        useVerifyReceipt,
        useAddPayment,
        useBookingPaymentHistory,
    };
};
