'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminCouponHooks } from '@hooks/admin/useAdminCouponHooks';
import { UpdateCouponPayload } from '@lib/types/coupon.types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { DateUtils } from '@lib/utils/date-utils';
import { CouponType } from '@lib/constants/enums';

export default function AdminCouponEditPage() {
    const router = useRouter();
    const params = useParams();
    const couponId = params.id as string;

    const { useCouponById, useUpdateCoupon } = useAdminCouponHooks();
    const { data: response, isLoading } = useCouponById(couponId);
    const updateMutation = useUpdateCoupon();

    const [formData, setFormData] = useState<UpdateCouponPayload>({
        code: '',
        description: '',
        discountType: CouponType.PERCENT,
        discountValue: 0,
        maxDiscountAmount: 0,
        minOrderAmount: 0,
        maxUsage: 100,
        maxUsagePerUser: 1,
        isActive: true,
        expiryDate: '',
    });

    useEffect(() => {
        if (response)
        {
            const coupon = (response as any).data || response;
            setFormData({
                code: coupon.code || '',
                description: coupon.description || '',
                discountType: coupon.discountType || CouponType.PERCENT,
                discountValue: coupon.discountValue || 0,
                maxDiscountAmount: coupon.maxDiscountAmount || 0,
                minOrderAmount: coupon.minOrderAmount || 0,
                maxUsage: coupon.maxUsage || 100,
                maxUsagePerUser: coupon.maxUsagePerUser || 1,
                isActive: coupon.isActive !== undefined ? coupon.isActive : true,
                expiryDate: coupon.expiryDate ? DateUtils.formatDateForInput(coupon.expiryDate) : '',
            });
        }
    }, [response]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: any = value;
        if (type === 'number') finalValue = value === '' ? undefined : Number(value);
        if (type === 'checkbox') finalValue = (e.target as HTMLInputElement).checked;

        setFormData((prev: UpdateCouponPayload) => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try
        {
            await updateMutation.mutateAsync({ id: couponId, data: formData });
            toast.success('Coupon updated successfully');
            router.push('/admin/coupons');
        } catch (err: any)
        {
            toast.error(err.response?.data?.message || 'Failed to update coupon');
        }
    };

    if (isLoading) return <div className="p-5 text-center">Loading coupon data...</div>;

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <h4 className="togo-dashboard-account-title mb-0">Edit Coupon</h4>
                    <Link href="/admin/coupons" className="togo-btn-primary" style={{ background: '#f1f3f9', color: '#111' }}>
                        Cancel
                    </Link>
                </div>

                <div style={{ background: '#fff', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleSubmit} className="row">
                        <div className="col-md-6 mb-20">
                            <label className="form-label font-bold mb-10">Coupon Code</label>
                            <input type="text" className="form-control" name="code" value={formData.code} onChange={handleChange} required style={{ borderRadius: '8px' }} />
                        </div>
                        <div className="col-md-6 mb-20">
                            <label className="form-label font-bold mb-10">Discount Type</label>
                            <select className="form-select" name="discountType" value={formData.discountType} onChange={handleChange} required style={{ borderRadius: '8px' }}>
                                <option value={CouponType.PERCENT}>Percentage (%)</option>
                                <option value={CouponType.FLAT}>Flat Amount (₹)</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-20">
                            <label className="form-label font-bold mb-10">Discount Value</label>
                            <input type="number" step="0.01" className="form-control" name="discountValue" value={formData.discountValue} onChange={handleChange} required min="0" style={{ borderRadius: '8px' }} />
                        </div>
                        <div className="col-md-6 mb-20">
                            <label className="form-label font-bold mb-10">Max Discount Amount (optional)</label>
                            <input type="number" step="0.01" className="form-control" name="maxDiscountAmount" value={formData.maxDiscountAmount || ''} onChange={handleChange} min="0" style={{ borderRadius: '8px' }} />
                        </div>
                        <div className="col-md-6 mb-20">
                            <label className="form-label font-bold mb-10">Min Order Amount (optional)</label>
                            <input type="number" step="0.01" className="form-control" name="minOrderAmount" value={formData.minOrderAmount || ''} onChange={handleChange} min="0" style={{ borderRadius: '8px' }} />
                        </div>
                        <div className="col-md-6 mb-20">
                            <label className="form-label font-bold mb-10">Expiry Date (optional)</label>
                            <input type="date" className="form-control" name="expiryDate" value={formData.expiryDate} onChange={handleChange} style={{ borderRadius: '8px' }} />
                        </div>
                        <div className="col-md-4 mb-20">
                            <label className="form-label font-bold mb-10">Total Max Usage</label>
                            <input type="number" className="form-control" name="maxUsage" value={formData.maxUsage || ''} onChange={handleChange} min="1" style={{ borderRadius: '8px' }} />
                        </div>
                        <div className="col-md-4 mb-20">
                            <label className="form-label font-bold mb-10">Max Usage Per User</label>
                            <input type="number" className="form-control" name="maxUsagePerUser" value={formData.maxUsagePerUser || ''} onChange={handleChange} min="1" style={{ borderRadius: '8px' }} />
                        </div>
                        <div className="col-md-4 mb-20 d-flex align-items-center">
                            <div className="form-check mt-30">
                                <input className="form-check-input" type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActiveEdit" />
                                <label className="form-check-label font-bold" htmlFor="isActiveEdit">
                                    Active Coupon
                                </label>
                            </div>
                        </div>

                        <div className="col-12 mt-20 d-flex gap-2">
                            <button type="submit" className="togo-btn-primary w-100" disabled={updateMutation.isPending} style={{ padding: '14px', borderRadius: '8px', border: 'none' }}>
                                {updateMutation.isPending ? 'Updating...' : 'Update Coupon'}
                            </button>
                            <Link href={`/admin/coupons/${couponId}/usage`} className="togo-btn-primary w-100 text-center" style={{ padding: '14px', borderRadius: '8px', border: 'none', background: '#f1f3f9', color: '#111' }}>
                                View Usage History
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
