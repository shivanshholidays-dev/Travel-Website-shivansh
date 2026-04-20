import axiosInstance from '../axios';
import { Transaction } from '../../types/transaction.types';
import { PaginatedResponse } from '../../types/api.types';

export const adminTransactionsApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<Transaction>>('/admin/transactions', { params }).then(r => r.data),

    getById: (id: string) =>
        axiosInstance.get<Transaction>(`/admin/transactions/${id}`).then(r => r.data),

    exportCsv: (params?: Record<string, any>) =>
        axiosInstance.get('/admin/transactions/export', { params, responseType: 'blob' }).then(r => r.data),
};
