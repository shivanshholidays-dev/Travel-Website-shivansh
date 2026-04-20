import axiosInstance from './axios';
import { Transaction } from '../types/transaction.types';
import { PaginatedResponse } from '../types/api.types';

export const transactionsApi = {
    getMy: (params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<Transaction>>('/transactions/my', { params }).then(r => r.data),

    getById: (id: string) =>
        axiosInstance.get<Transaction>(`/transactions/${id}`).then(r => r.data),
};
