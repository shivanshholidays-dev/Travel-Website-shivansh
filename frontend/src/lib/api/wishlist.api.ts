import axiosInstance from './axios';
import { Tour } from '../types/tour.types';

export const wishlistApi = {
    get: () =>
        axiosInstance.get<Tour[]>('/wishlist').then(r => r.data),

    add: (tourId: string) =>
        axiosInstance.post(`/wishlist/${tourId}`).then(r => r.data),

    remove: (tourId: string) =>
        axiosInstance.delete(`/wishlist/${tourId}`).then(r => r.data),

    toggle: (tourId: string) =>
        axiosInstance.post(`/wishlist/${tourId}/toggle`).then(r => r.data),
};
