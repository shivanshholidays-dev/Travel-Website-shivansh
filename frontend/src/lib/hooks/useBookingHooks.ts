import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, CreateBookingDto, PreviewBookingDto } from '../api/bookings.api';
import { paymentsApi } from '../api/payments.api';

export const usePreviewBooking = () => useMutation({
    mutationFn: (data: PreviewBookingDto) => bookingsApi.preview(data)
});

export const useCreateBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateBookingDto) => bookingsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'myBookings'] });
        }
    });
};

export const useMyBookings = (params?: Record<string, any>) => useQuery({
    queryKey: ['users', 'myBookings', params],
    queryFn: () => bookingsApi.getMyBookings(params),
});

export const useBookingById = (id: string) => useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
});

export const useCancelBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => bookingsApi.cancel(id, reason),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['users', 'myBookings'] });
        }
    });
};

export const useBookingPaymentHistory = (bookingId: string) => useQuery({
    queryKey: ['bookings', bookingId, 'paymentHistory'],
    queryFn: () => paymentsApi.getHistory(bookingId),
    enabled: !!bookingId,
});
