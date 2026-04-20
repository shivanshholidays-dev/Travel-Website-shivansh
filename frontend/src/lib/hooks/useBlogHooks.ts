import { useQuery } from '@tanstack/react-query';
import { blogsApi } from '../api/blogs.api';

export const useBlogHooks = () => {
    const useBlogsList = (params?: Record<string, any>) => useQuery({
        queryKey: ['blogs', params],
        queryFn: () => blogsApi.getAll(params),
    });

    const useBlogBySlug = (slug: string) => useQuery({
        queryKey: ['blogs', slug],
        queryFn: () => blogsApi.getBySlug(slug),
        enabled: !!slug,
    });

    return {
        useBlogsList,
        useBlogBySlug
    };
};
