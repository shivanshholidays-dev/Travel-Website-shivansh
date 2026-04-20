import { useQuery } from '@tanstack/react-query';
import { adminLogsApi } from '../../api/admin/logs.api';

export const useAdminLogHooks = () => {
    const useLogsList = (params?: Record<string, any>) => useQuery({
        queryKey: ['admin', 'logs', params],
        queryFn: () => adminLogsApi.getAll(params),
    });

    return {
        useLogsList
    };
};
