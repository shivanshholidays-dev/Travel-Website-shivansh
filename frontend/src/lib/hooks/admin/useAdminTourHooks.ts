import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminToursApi } from '../../api/admin/tours.api';
import { CreateTourPayload, UpdateTourPayload } from '../../types/tour.types';

export const useAdminTourHooks = () => {
    const queryClient = useQueryClient();

    const useToursList = (params?: Record<string, any>) => useQuery({
        queryKey: ['admin', 'tours', params],
        queryFn: () => adminToursApi.getAll(params),
    });

    const useTourById = (id: string) => useQuery({
        queryKey: ['admin', 'tours', id],
        queryFn: () => adminToursApi.getById(id),
        enabled: !!id,
    });

    const useCreateTour = () => useMutation({
        mutationFn: (data: CreateTourPayload | FormData) => adminToursApi.create(data as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours'] });
            queryClient.invalidateQueries({ queryKey: ['tours'] });
        }
    });

    const useUpdateTour = () => useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTourPayload | FormData }) => adminToursApi.update(id, data as any),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['tours'] });
        }
    });

    const useDeleteTour = () => useMutation({
        mutationFn: (id: string) => adminToursApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours'] });
            queryClient.invalidateQueries({ queryKey: ['tours'] });
        }
    });

    const useToggleStatus = () => useMutation({
        mutationFn: (id: string) => adminToursApi.toggleStatus(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours', variables] });
            queryClient.invalidateQueries({ queryKey: ['tours'] });
        }
    });

    const useToggleFeatured = () => useMutation({
        mutationFn: (id: string) => adminToursApi.toggleFeatured(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours', variables] });
            queryClient.invalidateQueries({ queryKey: ['home', 'featured-tours'] });
        }
    });

    const useUploadImages = () => useMutation({
        mutationFn: ({ id, formData }: { id: string; formData: FormData }) => adminToursApi.uploadImages(id, formData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours', variables.id] });
        }
    });

    const useDeleteImage = () => useMutation({
        mutationFn: ({ id, imageUrl }: { id: string; imageUrl: string }) => adminToursApi.deleteImage(id, imageUrl),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'tours', variables.id] });
        }
    });

    return {
        useToursList,
        useTourById,
        useCreateTour,
        useUpdateTour,
        useDeleteTour,
        useToggleStatus,
        useToggleFeatured,
        useUploadImages,
        useDeleteImage
    };
};
