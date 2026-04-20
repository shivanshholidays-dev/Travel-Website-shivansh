import axiosInstance from './axios';
import { PaginatedResponse } from '../types/api.types';
import { Tour, TourDate } from '../types/tour.types';

export const toursApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get<{ data: PaginatedResponse<Tour> }>('/tours', { params }).then(r => r.data.data),

    getFilterOptions: () =>
        axiosInstance.get<{ data: any }>('/tours/filter-options').then(r => r.data.data),

    getByState: (state: string) =>
        axiosInstance.get<{ data: PaginatedResponse<Tour> }>(`/tours/state/${state}`).then(r => r.data.data),

    getBySlug: (slug: string) =>
        axiosInstance.get<{ data: Tour }>(`/tours/${slug}`).then(r => r.data.data),

    getDates: (tourId: string) =>
        axiosInstance.get<{ data: TourDate[] }>(`/tours/${tourId}/dates`).then(r => r.data.data),
};
