import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { homeApi } from '../api/home.api';
import { useSettingsStore } from '../../store/useSettingsStore';

export const useHomeHooks = () => {
    const queryClient = useQueryClient();
    const setSettings = useSettingsStore(state => state.setSettings);

    const useHomeData = () => useQuery({
        queryKey: ['home', 'home-data'],
        queryFn: async () => {
            const result = await homeApi.homeData();
            if (result?.data)
            {
                if (result.data.filterOptions)
                {
                    queryClient.setQueryData(['tours', 'filterOptions'], result.data.filterOptions);
                }
                if (result.data.settings)
                {
                    setSettings(result.data.settings);
                }
            }
            return result;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const useFeaturedTours = () => useQuery({
        queryKey: ['home', 'featured-tours'],
        queryFn: () => homeApi.featuredTours(),
    });

    const useUpcomingDepartures = () => useQuery({
        queryKey: ['home', 'upcoming-departures'],
        queryFn: () => homeApi.upcomingDepartures(),
    });

    const useOffers = () => useQuery({
        queryKey: ['home', 'offers'],
        queryFn: () => homeApi.offers(),
    });

    const useBlogs = () => useQuery({
        queryKey: ['home', 'blogs'],
        queryFn: () => homeApi.blogs(),
    });

    const useToursByState = () => useQuery({
        queryKey: ['home', 'tours-by-state'],
        queryFn: () => homeApi.toursByState(),
    });

    const useRecentlyViewed = () => useQuery({
        queryKey: ['home', 'recently-viewed'],
        queryFn: () => homeApi.recentlyViewed(),
    });

    return {
        useHomeData,
        useFeaturedTours,
        useUpcomingDepartures,
        useOffers,
        useBlogs,
        useToursByState,
        useRecentlyViewed
    };
};
