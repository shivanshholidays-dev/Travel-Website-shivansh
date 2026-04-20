import axiosInstance from './axios';
import { Booking, BookingTraveler } from '../types/booking.types';
import { PaginatedResponse } from '../types/api.types';

export interface PreviewBookingDto {
    tourDateId: string;
    pickupOptionIndex: number;
    travelerCount: number;
    couponCode?: string;
}

export interface BookingTravelerDto {
    fullName: string;
    age: number;
    gender: string;
    phone?: string;
    idNumber?: string;
}

export interface CreateBookingDto {
    tourDateId: string;
    pickupOptionIndex: number;
    travelers: BookingTravelerDto[];
    couponCode?: string;
    additionalRequests?: string;
    paymentType?: 'FULL' | 'PARTIAL';
    partialAmount?: number;
}

export const bookingsApi = {
    preview: (data: PreviewBookingDto) =>
        axiosInstance.post('/bookings/preview', data).then(r => r.data),

    create: (data: CreateBookingDto) =>
        axiosInstance.post<Booking>('/bookings/create', data).then(r => r.data),

    getMyBookings: (params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<Booking>>('/bookings/my-bookings', { params }).then(r => r.data),

    getById: (id: string) =>
        axiosInstance.get<Booking>(`/bookings/${id}`).then(r => r.data),

    cancel: (id: string, reason?: string) =>
        axiosInstance.delete(`/bookings/${id}/cancel`, { data: { reason } }).then(r => r.data),
};
