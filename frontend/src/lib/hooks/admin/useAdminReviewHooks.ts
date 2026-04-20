import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminReviewsApi } from '../../api/admin/reviews.api';

export const useAdminReviewHooks = () => {
    const queryClient = useQueryClient();

    const useReviewsList = (params?: Record<string, any>) => useQuery({
        queryKey: ['admin', 'reviews', params],
        queryFn: () => adminReviewsApi.getAll(params),
    });

    const useReviewById = (id: string) => useQuery({
        queryKey: ['admin', 'reviews', id],
        queryFn: () => adminReviewsApi.getById(id),
        enabled: !!id,
    });

    const useApproveReview = () => useMutation({
        mutationFn: (id: string) => adminReviewsApi.approve(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'reviews', id] });
            queryClient.invalidateQueries({ queryKey: ['tours'] }); // totalReviews averageRating changes
        }
    });

    const useRejectReview = () => useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => adminReviewsApi.reject(id, reason),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'reviews', variables.id] });
        }
    });

    return {
        useReviewsList,
        useReviewById,
        useApproveReview,
        useRejectReview
    };
};
