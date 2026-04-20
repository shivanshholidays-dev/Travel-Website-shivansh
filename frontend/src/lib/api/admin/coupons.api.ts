import axiosInstance from '../axios';
import { Coupon, CreateCouponPayload, UpdateCouponPayload } from '../../types/coupon.types';
import { PaginatedResponse } from '../../types/api.types';

export const adminCouponsApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get<PaginatedResponse<Coupon>>('/admin/coupons', { params }).then(r => r.data),

    getById: (id: string) =>
        axiosInstance.get<Coupon>(`/admin/coupons/${id}`).then(r => r.data),

    create: (data: CreateCouponPayload) =>
        axiosInstance.post<Coupon>('/admin/coupons', data).then(r => r.data),

    update: (id: string, data: UpdateCouponPayload) =>
        axiosInstance.patch<Coupon>(`/admin/coupons/${id}`, data).then(r => r.data),

    delete: (id: string) =>
        axiosInstance.delete(`/admin/coupons/${id}`).then(r => r.data),

    getUsage: (id: string, params?: Record<string, any>) =>
        axiosInstance.get(`/admin/coupons/${id}/usage`, { params }).then(r => r.data),
};
