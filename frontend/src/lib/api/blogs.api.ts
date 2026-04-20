import axiosInstance from './axios';
import { Blog } from '../types/blog.types';
import { PaginatedResponse } from '../types/api.types';

export const blogsApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get<{ data: PaginatedResponse<Blog> }>('/blogs', { params }).then(r => r.data.data),

    getBySlug: (slug: string) =>
        axiosInstance.get<{ data: Blog }>(`/blogs/${slug}`).then(r => r.data.data),
};
