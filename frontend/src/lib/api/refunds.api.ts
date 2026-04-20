import axiosInstance from './axios';
import { Booking } from '../types/booking.types';

export interface RequestRefundDto {
    bookingId: string;
    reason: string;
}

export const refundsApi = {
    request: (data: RequestRefundDto) =>
        axiosInstance.post('/refunds/request', data).then(r => r.data),
};
