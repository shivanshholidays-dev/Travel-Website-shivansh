import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import useAuthStore from '../../store/useAuthStore';

export const useNotificationHooks = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const useNotifications = (params?: { page?: number; limit?: number }) =>
        useQuery({
            queryKey: ['notifications', params],
            queryFn: () => notificationsApi.getAll(params),
            enabled: isAuthenticated,
        });

    const useInfiniteNotifications = (limit: number = 10) =>
        useInfiniteQuery({
            queryKey: ['notifications', 'infinite', { limit }],
            queryFn: ({ pageParam = 1 }: { pageParam: unknown }) => notificationsApi.getAll({ page: pageParam as number, limit }),
            getNextPageParam: (lastPage: any) => {
                const meta = lastPage?.meta || lastPage;
                const totalPages = meta?.totalPages;
                const currentPage = meta?.page;
                return (currentPage && totalPages && currentPage < totalPages) ? currentPage + 1 : undefined;
            },
            initialPageParam: 1,
            enabled: isAuthenticated,
        });

    const useUnreadCount = () =>
        useQuery({
            queryKey: ['notifications', 'unreadCount'],
            queryFn: () => notificationsApi.getUnreadCount(),
            enabled: isAuthenticated,
            refetchInterval: 60_000, // poll every 60s
        });

    const useMarkRead = () =>
        useMutation({
            mutationFn: (id: string) => notificationsApi.markRead(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            },
        });

    const useMarkAllRead = () =>
        useMutation({
            mutationFn: () => notificationsApi.markAllRead(),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            },
        });

    return { useNotifications, useInfiniteNotifications, useUnreadCount, useMarkRead, useMarkAllRead };
};
