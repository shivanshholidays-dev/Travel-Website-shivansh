import axiosInstance from '../axios';
import { Review } from '../../types/review.types';
import { PaginatedResponse } from '../../types/api.types';

export const adminReviewsApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<Review>>('/admin/reviews', { params }).then(r => r.data),

    getById: (id: string) =>
        axiosInstance.get<Review>(`/admin/reviews/${id}`).then(r => r.data),

    approve: (id: string) =>
        axiosInstance.patch<Review>(`/admin/reviews/${id}/approve`).then(r => r.data),

    reject: (id: string, reason?: string) =>
        axiosInstance.patch<Review>(`/admin/reviews/${id}/reject`, { reason }).then(r => r.data),
};
