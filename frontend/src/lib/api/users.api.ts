import axiosInstance from './axios';
import { User, SavedTraveler } from '../types/user.types';
import { Booking } from '../types/booking.types';
import { Review } from '../types/review.types';

export const usersApi = {
    getProfile: () =>
        axiosInstance.get<{ data: User }>('/users/profile').then(r => r.data?.data ?? r.data as any),

    updateProfile: (data: Partial<User> | FormData) => {
        const isFormData = data instanceof FormData;
        return axiosInstance.patch<{ data: User }>('/users/profile', data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        }).then(r => r.data?.data ?? r.data as any);
    },

    changePassword: (data: any) =>
        axiosInstance.patch('/users/change-password', data).then(r => r.data),

    getSavedTravelers: () =>
        axiosInstance.get<SavedTraveler[]>('/users/travelers').then(r => r.data),

    addTraveler: (data: Omit<SavedTraveler, '_id'>) =>
        axiosInstance.post<SavedTraveler>('/users/travelers', data).then(r => r.data),

    removeTraveler: (travelerId: string) =>
        axiosInstance.delete(`/users/travelers/${travelerId}`).then(r => r.data),

    getMyBookings: (params?: Record<string, any>) =>
        axiosInstance.get<{ data: Booking[], meta: any }>('/users/my-bookings', { params }).then(r => r.data),

    getMyReviews: () =>
        axiosInstance.get<Review[]>('/users/my-reviews').then(r => r.data),

    getDashboardSummary: () =>
        axiosInstance.get<any>('/users/dashboard-summary').then(r => r.data?.data ?? r.data),
};
