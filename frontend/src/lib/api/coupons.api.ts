import axiosInstance from './axios';
import { Coupon } from '../types/coupon.types';

export const couponsApi = {
    validate: (data: { code: string; tourId?: string; orderAmount?: number }) =>
        axiosInstance.post<{ valid: boolean; discountAmount: number; coupon: Coupon }>('/coupons/validate', data).then(r => r.data),
};
