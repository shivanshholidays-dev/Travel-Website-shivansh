import axiosInstance from '../axios';
import { Blog, CreateBlogPayload, UpdateBlogPayload } from '../../types/blog.types';
import { PaginatedResponse } from '../../types/api.types';

export const adminBlogsApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<Blog>>('/admin/blogs', { params }).then(r => r.data),

    create: (data: CreateBlogPayload | FormData) =>
        axiosInstance.post<Blog>('/admin/blogs', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined).then(r => r.data),

    update: (id: string, data: UpdateBlogPayload | FormData) =>
        axiosInstance.patch<Blog>(`/admin/blogs/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined).then(r => r.data),

    delete: (id: string) =>
        axiosInstance.delete(`/admin/blogs/${id}`).then(r => r.data),

    publish: (id: string) =>
        axiosInstance.patch(`/admin/blogs/${id}/publish`).then(r => r.data),

    unpublish: (id: string) =>
        axiosInstance.patch(`/admin/blogs/${id}/unpublish`).then(r => r.data),
};
