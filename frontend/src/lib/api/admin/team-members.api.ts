import axiosInstance from '../axios';
import { TeamMember, CreateTeamMemberPayload, UpdateTeamMemberPayload } from '../../types/team-member.types';
import { PaginatedResponse } from '../../types/api.types';

export const adminTeamMembersApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<TeamMember>>('/admin/team-members', { params }).then(r => r.data),

    getOne: (id: string) =>
        axiosInstance.get<TeamMember>(`/admin/team-members/${id}`).then(r => r.data),

    create: (data: CreateTeamMemberPayload | FormData) =>
        axiosInstance.post<TeamMember>(
            '/admin/team-members',
            data,
            data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined,
        ).then(r => r.data),

    update: (id: string, data: UpdateTeamMemberPayload | FormData) =>
        axiosInstance.patch<TeamMember>(
            `/admin/team-members/${id}`,
            data,
            data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined,
        ).then(r => r.data),

    delete: (id: string) =>
        axiosInstance.delete(`/admin/team-members/${id}`).then(r => r.data),

    toggleActive: (id: string) =>
        axiosInstance.patch<TeamMember>(`/admin/team-members/${id}/toggle-active`).then(r => r.data),
};
