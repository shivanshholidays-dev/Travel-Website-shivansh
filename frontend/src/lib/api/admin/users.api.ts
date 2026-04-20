import axiosInstance from '../axios';
import { User } from '../../types/user.types';
import { PaginatedResponse } from '../../types/api.types';

export const adminUsersApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<User>>('/admin/users', { params }).then(r => r.data),

    getById: (id: string) =>
        axiosInstance.get<User>(`/admin/users/${id}`).then(r => r.data),

    block: (id: string, reason?: string) =>
        axiosInstance.patch(`/admin/users/${id}/block`, { reason }).then(r => r.data),

    unblock: (id: string) =>
        axiosInstance.patch(`/admin/users/${id}/unblock`).then(r => r.data),

    addNote: (id: string, note: string) =>
        axiosInstance.post(`/admin/users/${id}/notes`, { note }).then(r => r.data),
};
