import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminTourDatesApi } from '../../api/admin/tour-dates.api';
import { CreateTourDatePayload, UpdateTourDatePayload } from '../../types/tour.types';

export const useAdminTourDateHooks = () => {
    const queryClient = useQueryClient();

    const useTourDatesByTour = (tourId: string) => useQuery({
        queryKey: ['admin', 'tours', tourId, 'dates'],
        queryFn: () => adminTourDatesApi.getByTour(tourId),
        enabled: !!tourId,
    });

    const useAddTourDate = () => useMutation({
        mutationFn: ({ data }: { data: CreateTourDatePayload }) => adminTourDatesApi.add(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours', variables.data.tour, 'dates'] });
            queryClient.invalidateQueries({ queryKey: ['tours', variables.data.tour, 'dates'] });
        }
    });

    const useUpdateTourDate = () => useMutation({
        mutationFn: ({ tourId, dateId, data }: { tourId: string; dateId: string; data: UpdateTourDatePayload }) => adminTourDatesApi.update(dateId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours', variables.tourId, 'dates'] });
            queryClient.invalidateQueries({ queryKey: ['tours', variables.tourId, 'dates'] });
        }
    });

    const useDeleteTourDate = () => useMutation({
        mutationFn: ({ tourId, dateId }: { tourId: string; dateId: string }) => adminTourDatesApi.delete(dateId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours', variables.tourId, 'dates'] });
            queryClient.invalidateQueries({ queryKey: ['tours', variables.tourId, 'dates'] });
        }
    });

    return {
        useTourDatesByTour,
        useAddTourDate,
        useUpdateTourDate,
        useDeleteTourDate
    };
};
