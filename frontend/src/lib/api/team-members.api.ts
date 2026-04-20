import axiosInstance from './axios';
import { TeamMember } from '../types/team-member.types';

export const teamMembersApi = {
    getAll: () =>
        axiosInstance.get<TeamMember[]>('/team-members').then(r => r.data),

    getOne: (id: string) =>
        axiosInstance.get<TeamMember>(`/team-members/${id}`).then(r => r.data),
};
