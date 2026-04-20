import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../api/transactions.api';

export const useTransactionHooks = () => {
    const useMyTransactions = (params?: Record<string, any>) => useQuery({
        queryKey: ['transactions', 'my', params],
        queryFn: () => transactionsApi.getMy(params),
    });

    const useTransactionById = (id: string) => useQuery({
        queryKey: ['transactions', id],
        queryFn: () => transactionsApi.getById(id),
        enabled: !!id,
    });

    return {
        useMyTransactions,
        useTransactionById
    };
};
