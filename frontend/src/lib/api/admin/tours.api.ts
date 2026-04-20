import axiosInstance from '../axios';
import { Tour, CreateTourPayload, UpdateTourPayload } from '../../types/tour.types';
import { PaginatedResponse } from '../../types/api.types';

export const adminToursApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<Tour>>('/admin/tours', { params }).then(r => r.data),

    getById: (id: string) =>
        axiosInstance.get<Tour>(`/admin/tours/${id}`).then(r => r.data),

    create: (data: CreateTourPayload | FormData) =>
        axiosInstance.post<Tour>('/admin/tours', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined).then(r => r.data),

    update: (id: string, data: UpdateTourPayload | FormData) =>
        axiosInstance.patch<Tour>(`/admin/tours/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined).then(r => r.data),

    delete: (id: string) =>
        axiosInstance.delete(`/admin/tours/${id}`).then(r => r.data),

    toggleStatus: (id: string) =>
        axiosInstance.patch(`/admin/tours/${id}/status`).then(r => r.data),

    toggleFeatured: (id: string) =>
        axiosInstance.patch(`/admin/tours/${id}/featured`).then(r => r.data),

    uploadImages: (id: string, formData: FormData) =>
        axiosInstance.post(`/admin/tours/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),

    deleteImage: (id: string, imageUrl: string) =>
        axiosInstance.delete(`/admin/tours/${id}/images`, { data: { imageUrl } }).then(r => r.data),
};
