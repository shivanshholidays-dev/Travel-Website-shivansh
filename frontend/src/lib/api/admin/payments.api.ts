import axiosInstance from '../axios';
import { Payment } from '../../types/payment.types';
import { PaginatedResponse } from '../../types/api.types';

export const adminPaymentsApi = {
    getPending: (params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<Payment>>('/admin/transactions/pending-receipts', { params }).then(r => r.data),

    getById: (id: string) =>
        axiosInstance.get<Payment>(`/admin/transactions/${id}`).then(r => r.data),

    verify: (id: string) =>
        axiosInstance.patch<Payment>(`/admin/transactions/${id}/approve`).then(r => r.data),

    reject: (id: string, reason: string) =>
        axiosInstance.patch<Payment>(`/admin/transactions/${id}/reject`, { reason }).then(r => r.data),

    recordOffline: (data: {
        bookingId: string;
        amount: number;
        paymentMethod: string;
        notes?: string;
        receiptNumber?: string;
        collectedAt?: string;
    }) =>
        axiosInstance.post<Payment>('/admin/transactions/offline', data).then(r => r.data),

    getHistory: (bookingId: string) =>
        axiosInstance.get<{
            totalAmount: number;
            paidAmount: number;
            pendingAmount: number;
            paymentType: string;
            payments: any[];
        }>(`/admin/bookings/${bookingId}/payment-history`).then(r => r.data),
};
