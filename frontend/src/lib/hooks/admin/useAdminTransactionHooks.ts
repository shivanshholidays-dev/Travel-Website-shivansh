import { useMutation, useQuery } from '@tanstack/react-query';
import { adminTransactionsApi } from '../../api/admin/transactions.api';

export const useAdminTransactionHooks = () => {
    const useTransactionsList = (params?: Record<string, any>) => useQuery({
        queryKey: ['admin', 'transactions', params],
        queryFn: () => adminTransactionsApi.getAll(params),
    });

    const useTransactionById = (id: string) => useQuery({
        queryKey: ['admin', 'transactions', id],
        queryFn: () => adminTransactionsApi.getById(id),
        enabled: !!id,
    });

    const useExportTransactionsCsv = () => useMutation({
        mutationFn: (params?: Record<string, any>) => adminTransactionsApi.exportCsv(params),
    });

    return {
        useTransactionsList,
        useTransactionById,
        useExportTransactionsCsv
    };
};
