import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCustomToursApi } from '../../api/admin/custom-tours.api';

export const useAdminCustomTourHooks = () => {
    const queryClient = useQueryClient();

    const useStats = () =>
        useQuery({
            queryKey: ['admin', 'custom-tours', 'stats'],
            queryFn: () => adminCustomToursApi.getStats(),
        });

    const useRequestsList = (params?: Record<string, any>) =>
        useQuery({
            queryKey: ['admin', 'custom-tours', params],
            queryFn: () => adminCustomToursApi.getAll(params),
        });

    const useRequestById = (id: string) =>
        useQuery({
            queryKey: ['admin', 'custom-tours', id],
            queryFn: () => adminCustomToursApi.getById(id),
            enabled: !!id,
        });

    const useUpdateStatus = () =>
        useMutation({
            mutationFn: ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) =>
                adminCustomToursApi.updateStatus(id, status, adminNotes),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['admin', 'custom-tours'] });
            },
        });

    return { useStats, useRequestsList, useRequestById, useUpdateStatus };
};
