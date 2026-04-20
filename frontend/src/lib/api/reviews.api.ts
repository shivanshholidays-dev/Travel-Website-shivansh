import axiosInstance from './axios';
import { Review } from '../types/review.types';
import { PaginatedResponse } from '../types/api.types';

export interface CreateReviewDto {
    tourId: string;
    bookingId: string;
    rating: number;
    title?: string;
    comment: string;
}

export const reviewsApi = {
    create: ({ tourId, title, ...data }: CreateReviewDto) =>
        axiosInstance.post<Review>('/reviews', data).then(r => r.data),

    getByTour: (tourId: string, params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<Review>>(`/tours/${tourId}/reviews`, { params }).then(r => r.data),

    getMyReviews: () =>
        axiosInstance.get<Review[]>('/users/my-reviews').then(r => r.data),
};
