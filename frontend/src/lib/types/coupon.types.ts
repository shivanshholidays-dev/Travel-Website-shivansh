import { Tour } from './tour.types';
import { CouponType } from '../constants/enums';

export type DiscountType = CouponType | string;

export interface Coupon {
    _id: string;
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    maxDiscountAmount?: number;
    expiryDate?: string;
    maxUsage?: number;
    maxUsagePerUser?: number;
    usedCount?: number;
    minOrderAmount?: number;
    applicableTours?: Tour[] | string[];
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type CreateCouponPayload = Omit<Coupon, '_id' | 'usedCount' | 'createdAt' | 'updatedAt'>;
export type UpdateCouponPayload = Partial<CreateCouponPayload>;
