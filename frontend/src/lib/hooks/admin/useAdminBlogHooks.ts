import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminBlogsApi } from '../../api/admin/blogs.api';
import { CreateBlogPayload, UpdateBlogPayload } from '../../types/blog.types';

export const useAdminBlogHooks = () => {
    const queryClient = useQueryClient();

    const useBlogsList = (params?: Record<string, any>) => useQuery({
        queryKey: ['admin', 'blogs', params],
        queryFn: () => adminBlogsApi.getAll(params),
    });

    const useCreateBlog = () => useMutation({
        mutationFn: (data: CreateBlogPayload | FormData) => adminBlogsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });
            queryClient.invalidateQueries({ queryKey: ['home', 'blogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        }
    });

    const useUpdateBlog = () => useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBlogPayload | FormData }) => adminBlogsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });
            queryClient.invalidateQueries({ queryKey: ['home', 'blogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs', variables.id] });
        }
    });

    const useDeleteBlog = () => useMutation({
        mutationFn: (id: string) => adminBlogsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });
            queryClient.invalidateQueries({ queryKey: ['home', 'blogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        }
    });

    const usePublishBlog = () => useMutation({
        mutationFn: (id: string) => adminBlogsApi.publish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });
            queryClient.invalidateQueries({ queryKey: ['home', 'blogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs', id] });
        }
    });

    const useUnpublishBlog = () => useMutation({
        mutationFn: (id: string) => adminBlogsApi.unpublish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });
            queryClient.invalidateQueries({ queryKey: ['home', 'blogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs', id] });
        }
    });

    return {
        useBlogsList,
        useCreateBlog,
        useUpdateBlog,
        useDeleteBlog,
        usePublishBlog,
        useUnpublishBlog
    };
};
