'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminCouponHooks } from '@hooks/admin/useAdminCouponHooks';
import { CreateCouponPayload } from '@lib/types/coupon.types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { CouponType } from '@lib/constants/enums';

export default function AdminCouponNewPage() {
    const router = useRouter();
    const { useCreateCoupon } = useAdminCouponHooks();
    const createMutation = useCreateCoupon();

    const [formData, setFormData] = useState<CreateCouponPayload>({
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: any = value;
        if (type === 'number') finalValue = value ? Number(value) : undefined;
        if (type === 'checkbox') finalValue = (e.target as HTMLInputElement).checked;

        setFormData((prev: CreateCouponPayload) => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try
        {
            await createMutation.mutateAsync(formData);
            toast.success('Coupon created successfully');
            router.push('/admin/coupons');
        } catch (err: any)
        {
            toast.error(err.response?.data?.message || 'Failed to create coupon');
        }
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <h4 className="togo-dashboard-account-title mb-0">Create New Coupon</h4>
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
                                <input className="form-check-input" type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActive" />
                                <label className="form-check-label font-bold" htmlFor="isActive">
                                    Active Coupon
                                </label>
                            </div>
                        </div>

                        <div className="col-12 mt-20">
                            <button type="submit" className="togo-btn-primary w-100" disabled={createMutation.isPending} style={{ padding: '14px', borderRadius: '8px', border: 'none' }}>
                                {createMutation.isPending ? 'Creating...' : 'Create Coupon'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
