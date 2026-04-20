import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsApi, CreateReviewDto } from '../api/reviews.api';

export const useReviewHooks = () => {
    const queryClient = useQueryClient();

    const useCreateReview = () => useMutation({
        mutationFn: (data: CreateReviewDto) => reviewsApi.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'myReviews'] });
            queryClient.invalidateQueries({ queryKey: ['tours', variables.tourId, 'reviews'] });
        }
    });

    const useReviewsByTour = (tourId: string, params?: Record<string, any>) => useQuery({
        queryKey: ['tours', tourId, 'reviews', params],
        queryFn: () => reviewsApi.getByTour(tourId, params),
        enabled: !!tourId,
    });

    const useMyReviews = () => useQuery({
        queryKey: ['users', 'myReviews'],
        queryFn: () => reviewsApi.getMyReviews(),
    });

    return {
        useCreateReview,
        useReviewsByTour,
        useMyReviews
    };
};
