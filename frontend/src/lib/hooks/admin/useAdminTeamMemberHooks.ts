import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminTeamMembersApi } from '../../api/admin/team-members.api';
import { CreateTeamMemberPayload, UpdateTeamMemberPayload } from '../../types/team-member.types';

export const useAdminTeamMemberHooks = () => {
    const queryClient = useQueryClient();

    const useTeamMembersList = (params?: Record<string, any>) => useQuery({
        queryKey: ['admin', 'team-members', params],
        queryFn: () => adminTeamMembersApi.getAll(params),
    });

    const useTeamMember = (id: string) => useQuery({
        queryKey: ['admin', 'team-members', id],
        queryFn: () => adminTeamMembersApi.getOne(id),
        enabled: !!id,
    });

    const useCreateTeamMember = () => useMutation({
        mutationFn: (data: CreateTeamMemberPayload | FormData) => adminTeamMembersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'team-members'] });
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
        },
    });

    const useUpdateTeamMember = () => useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTeamMemberPayload | FormData }) =>
            adminTeamMembersApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'team-members'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'team-members', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
        },
    });

    const useDeleteTeamMember = () => useMutation({
        mutationFn: (id: string) => adminTeamMembersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'team-members'] });
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
        },
    });

    const useToggleActiveTeamMember = () => useMutation({
        mutationFn: (id: string) => adminTeamMembersApi.toggleActive(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'team-members'] });
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
        },
    });

    return {
        useTeamMembersList,
        useTeamMember,
        useCreateTeamMember,
        useUpdateTeamMember,
        useDeleteTeamMember,
        useToggleActiveTeamMember,
    };
};
