import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, SubmitProofDto } from '../api/payments.api';

export const usePaymentHooks = () => {
    const queryClient = useQueryClient();

    const useSubmitProof = () => useMutation({
        mutationFn: (data: SubmitProofDto) => paymentsApi.submitProof(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bookings', variables.bookingId] });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        }
    });

    const useMyPayments = () => useQuery({
        queryKey: ['users', 'myPayments'],
        queryFn: () => paymentsApi.getMyPayments(),
    });

    const usePaymentById = (id: string) => useQuery({
        queryKey: ['payments', id],
        queryFn: () => paymentsApi.getById(id),
        enabled: !!id,
    });

    return {
        useSubmitProof,
        useMyPayments,
        usePaymentById,
    };
};
