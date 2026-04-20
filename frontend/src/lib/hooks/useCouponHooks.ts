import { useMutation } from '@tanstack/react-query';
import { couponsApi } from '../api/coupons.api';

export const useCouponHooks = () => {
    const useValidateCoupon = () => useMutation({
        mutationFn: (data: { code: string; tourId?: string; orderAmount?: number }) => couponsApi.validate(data)
    });

    return {
        useValidateCoupon
    };
};
