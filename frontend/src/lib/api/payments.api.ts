import axiosInstance from './axios';
import { Payment } from '../types/payment.types';

export interface SubmitProofDto {
    bookingId: string;
    transactionId: string;
    paymentMethod?: string;
    receiptImage: File;
    paymentAmount?: number;
}

export const paymentsApi = {
    submitProof: (data: SubmitProofDto) => {
        const formData = new FormData();
        formData.append('bookingId', data.bookingId);
        formData.append('transactionId', data.transactionId);
        formData.append('paymentMethod', data.paymentMethod || 'UPI');
        formData.append('receiptImage', data.receiptImage);
        if (data.paymentAmount !== undefined)
        {
            formData.append('paymentAmount', data.paymentAmount.toString());
        }
        return axiosInstance.post<Payment>('/transactions/submit-proof', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data);
    },

    getMyPayments: () =>
        axiosInstance.get<Payment[]>('/transactions/my').then(r => r.data),

    getById: (id: string) =>
        axiosInstance.get<Payment>(`/transactions/${id}`).then(r => r.data),

    getHistory: (bookingId: string) =>
        axiosInstance.get<{
            totalAmount: number;
            paidAmount: number;
            pendingAmount: number;
            paymentType: string;
            payments: any[];
        }>(`/bookings/${bookingId}/payment-summary`).then(r => r.data),
};
