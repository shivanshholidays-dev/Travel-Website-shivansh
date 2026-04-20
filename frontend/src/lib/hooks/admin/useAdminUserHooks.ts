import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminUsersApi } from '../../api/admin/users.api';

export const useAdminUserHooks = () => {
    const queryClient = useQueryClient();

    const useUsersList = (params?: Record<string, any>) => useQuery({
        queryKey: ['admin', 'users', params],
        queryFn: () => adminUsersApi.getAll(params),
    });

    const useUserById = (id: string) => useQuery({
        queryKey: ['admin', 'users', id],
        queryFn: () => adminUsersApi.getById(id),
        enabled: !!id,
    });

    const useBlockUser = () => useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminUsersApi.block(id, reason),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.id] });
        }
    });

    const useUnblockUser = () => useMutation({
        mutationFn: (id: string) => adminUsersApi.unblock(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
        }
    });

    const useAddNote = () => useMutation({
        mutationFn: ({ id, note }: { id: string; note: string }) => adminUsersApi.addNote(id, note),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.id] });
        }
    });

    return {
        useUsersList,
        useUserById,
        useBlockUser,
        useUnblockUser,
        useAddNote
    };
};
