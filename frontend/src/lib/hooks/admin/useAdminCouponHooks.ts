import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCouponsApi } from '../../api/admin/coupons.api';
import { CreateCouponPayload, UpdateCouponPayload } from '../../types/coupon.types';

export const useAdminCouponHooks = () => {
    const queryClient = useQueryClient();

    const useCouponsList = (params?: Record<string, any>) => useQuery({
        queryKey: ['admin', 'coupons', params],
        queryFn: () => adminCouponsApi.getAll(params),
    });

    const useCouponById = (id: string) => useQuery({
        queryKey: ['admin', 'coupons', id],
        queryFn: () => adminCouponsApi.getById(id),
        enabled: !!id,
    });

    const useCreateCoupon = () => useMutation({
        mutationFn: (data: CreateCouponPayload) => adminCouponsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
        }
    });

    const useUpdateCoupon = () => useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCouponPayload }) => adminCouponsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'coupons', variables.id] });
        }
    });

    const useDeleteCoupon = () => useMutation({
        mutationFn: (id: string) => adminCouponsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
        }
    });

    const useCouponUsage = (id: string, params?: Record<string, any>) => useQuery({
        queryKey: ['admin', 'coupons', id, 'usage', params],
        queryFn: () => adminCouponsApi.getUsage(id, params),
        enabled: !!id,
    });

    return {
        useCouponsList,
        useCouponById,
        useCreateCoupon,
        useUpdateCoupon,
        useDeleteCoupon,
        useCouponUsage
    };
};
