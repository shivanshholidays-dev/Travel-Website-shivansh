import { useQuery } from '@tanstack/react-query';
import { teamMembersApi } from '../api/team-members.api';

export const useTeamHooks = () => {
    const useTeamMembers = () => useQuery({
        queryKey: ['team-members'],
        queryFn: () => teamMembersApi.getAll(),
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });

    const useTeamMember = (id: string) => useQuery({
        queryKey: ['team-members', id],
        queryFn: () => teamMembersApi.getOne(id),
        enabled: !!id,
    });

    return { useTeamMembers, useTeamMember };
};
