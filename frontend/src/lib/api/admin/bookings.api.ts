import axiosInstance from '../axios';
import { Booking } from '../../types/booking.types';
import { PaginatedResponse } from '../../types/api.types';

export const adminBookingsApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get('/admin/bookings', { params }).then(r => r.data),

    getById: (id: string) =>
        axiosInstance.get<Booking>(`/admin/bookings/${id}`).then(r => r.data),

    updateStatus: (id: string, status: string, internalNotes?: string) =>
        axiosInstance.patch<Booking>(`/admin/bookings/${id}/status`, { status, internalNotes }).then(r => r.data),

    confirm: (id: string) =>
        axiosInstance.patch<Booking>(`/admin/bookings/${id}/confirm`).then(r => r.data),

    cancel: (id: string) =>
        axiosInstance.patch<Booking>(`/admin/bookings/${id}/cancel`).then(r => r.data),

    verifyReceipt: (id: string, approve: boolean) =>
        axiosInstance.patch<Booking>(`/admin/bookings/${id}/verify-receipt`, { approve }).then(r => r.data),

    addPayment: (id: string, amount: number) =>
        axiosInstance.patch<Booking>(`/admin/bookings/${id}/add-payment`, { amount }).then(r => r.data),
};
