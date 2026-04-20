import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { toursApi } from '../api/tours.api';

import { usePathname } from 'next/navigation';

export const useTourHooks = () => {
    const pathname = usePathname();

    const useToursList = (params?: Record<string, any>, options?: any) => useQuery({
        queryKey: ['tours', params],
        queryFn: () => toursApi.getAll(params),
        placeholderData: keepPreviousData,
        ...options
    });


    const useFilterOptions = () => useQuery({
        queryKey: ['tours', 'filterOptions'],
        queryFn: () => toursApi.getFilterOptions(),
        enabled: pathname !== '/', // Prevent redundant fetch on homepage
    });

    const useToursByState = (state: string) => useQuery({
        queryKey: ['tours', 'state', state],
        queryFn: () => toursApi.getByState(state),
        enabled: !!state,
    });

    const useTourBySlug = (slug: string) => useQuery({
        queryKey: ['tours', 'slug', slug],
        queryFn: () => toursApi.getBySlug(slug),
        enabled: !!slug,
    });

    const useTourDates = (tourId: string) => useQuery({
        queryKey: ['tours', tourId, 'dates'],
        queryFn: () => toursApi.getDates(tourId),
        enabled: !!tourId,
    });

    return {
        useToursList,
        useFilterOptions,
        useToursByState,
        useTourBySlug,
        useTourDates
    };
};
