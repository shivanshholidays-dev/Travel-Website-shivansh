import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customToursApi } from '../api/custom-tours.api';

export const useCustomTourHooks = () => {
    const useSubmitRequest = () =>
        useMutation({
            mutationFn: (data: Record<string, any>) => customToursApi.submit(data),
        });

    return { useSubmitRequest };
};
