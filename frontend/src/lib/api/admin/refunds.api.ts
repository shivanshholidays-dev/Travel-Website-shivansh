import axiosInstance from '../axios';
import { Booking } from '../../types/booking.types';
import { PaginatedResponse } from '../../types/api.types';

export interface ApproveRefundDto {
    refundAmount: number;
    refundAdminNote: string;
}

export interface RejectRefundDto {
    reason: string;
}

export const adminRefundsApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<Booking>>('/admin/refunds', { params }).then(r => r.data),

    approve: (id: string, data: ApproveRefundDto) =>
        axiosInstance.post(`/admin/refunds/${id}/approve`, data).then(r => r.data),

    reject: (id: string, data: RejectRefundDto) =>
        axiosInstance.post(`/admin/refunds/${id}/reject`, data).then(r => r.data),

    markProcessed: (id: string) =>
        axiosInstance.post(`/admin/refunds/${id}/processed`).then(r => r.data),
};
