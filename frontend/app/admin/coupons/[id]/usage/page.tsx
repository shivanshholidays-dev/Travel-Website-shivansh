'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAdminCouponHooks } from '@hooks/admin/useAdminCouponHooks';
import Link from 'next/link';
import { DateUtils } from '@lib/utils/date-utils';

export default function AdminCouponUsagePage() {
    const params = useParams();
    const router = useRouter();
    const couponId = params.id as string;

    const { useCouponUsage, useCouponById } = useAdminCouponHooks();

    // We fetch the coupon just to show its code
    const { data: couponResponse } = useCouponById(couponId);
    const coupon = (couponResponse as any)?.data || couponResponse;

    const { data: usageResponse, isLoading } = useCouponUsage(couponId);
    const usages = usageResponse?.data?.items || usageResponse?.data || usageResponse?.items || [];

    if (isLoading) return <div className="p-5 text-center">Loading usage history...</div>;

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-30">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-0">Usage Intelligence</h4>
                        <div className="d-flex align-items-center gap-2 mt-2">
                            <span className="text-muted small">Tracking history for:</span>
                            <span className="badge" style={{ backgroundColor: '#FFF3F1', color: '#FD4621', border: '1px dashed #FD4621', padding: '6px 12px', fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px' }}>
                                {coupon?.code || 'COUPON'}
                            </span>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <Link href={`/admin/coupons/${couponId}/edit`} className="btn btn-dark d-flex align-items-center gap-2" style={{ borderRadius: '10px', padding: '10px 20px', fontWeight: 600 }}>
                            Edit Rules
                        </Link>
                        <button onClick={() => router.push('/admin/coupons')} className="btn btn-light" style={{ borderRadius: '10px', padding: '10px 20px', fontWeight: 600, border: '1px solid #ddd' }}>
                            Back
                        </button>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 25px rgba(0,0,0,0.04)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th className="ps-4 py-3" style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Booked By</th>
                                    <th className="py-3" style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Tour Experience</th>
                                    <th className="py-3" style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Reference</th>
                                    <th className="py-3" style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Benefit</th>
                                    <th className="py-3" style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Date Applied</th>
                                    <th className="pe-4 py-3 text-end" style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!usages || usages.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-5 text-muted italic">No usage records found for this promo code yet.</td></tr>
                                ) : (
                                    usages.map((u: any, i: number) => {
                                        const userName = u.user?.name || (u.travelers && u.travelers[0]?.fullName) || 'Guest User';
                                        const userEmail = u.user?.email || (u.travelers && u.travelers[0]?.phone) || 'N/A';
                                        const firstChar = userName.charAt(0).toUpperCase();

                                        return (
                                            <tr key={i} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                                <td className="ps-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div style={{
                                                            width: '40px', height: '40px', borderRadius: '10px',
                                                            background: u.user ? '#EEF2FF' : '#F1F3F9',
                                                            color: u.user ? '#4F46E5' : '#6B7280',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px',
                                                            border: '1px solid rgba(0,0,0,0.05)'
                                                        }}>
                                                            {u.user?.avatar ? <img src={u.user.avatar} className="w-100 h-100 rounded-2" style={{ objectFit: 'cover' }} /> : firstChar}
                                                        </div>
                                                        <div>
                                                            <Link href={`/admin/users/${u.user?._id || u.user?.id || u.user || '#'}`} style={{ fontWeight: 800, fontSize: '14px', color: '#111', textDecoration: 'none' }} className="hover-orange">
                                                                {userName}
                                                            </Link>
                                                            <div style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>{userEmail}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div style={{ maxWidth: '220px' }}>
                                                        <Link href={`/tours/${u.tour?.slug || u.tour?.id || '#'}`} style={{ fontSize: '13px', fontWeight: 600, color: '#444', textDecoration: 'none', lineHeight: '1.4', display: 'block' }}>
                                                            {u.tour?.title || 'Tour Not Found'}
                                                        </Link>
                                                        <span style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase', fontWeight: 700 }}>{u.tour?.tourType || 'Trip'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <Link href={`/admin/bookings/${u._id || u.id}`} className="badge" style={{ backgroundColor: '#F1F3F9', color: '#555', border: '1px solid #DDD', padding: '6px 10px', textDecoration: 'none' }}>
                                                        {u.bookingNumber || 'REF-N/A'}
                                                    </Link>
                                                </td>
                                                <td className="py-3">
                                                    <div style={{ fontWeight: 800, color: '#FD4621', fontSize: '14px' }}>
                                                        -{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(u.discountAmount || 0)}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>
                                                        {DateUtils.formatToIST(u.createdAt, 'DD MMM YYYY')}
                                                        <div style={{ fontSize: '10px', color: '#AAA' }}>{DateUtils.formatToIST(u.createdAt, 'hh:mm A')}</div>
                                                    </div>
                                                </td>
                                                <td className="pe-4 py-3 text-end">
                                                    <span style={{
                                                        display: 'inline-block', padding: '5px 12px', borderRadius: '30px', fontSize: '10px', fontWeight: 800,
                                                        backgroundColor: u.status === 'CONFIRMED' ? '#E8F5E9' : u.status === 'PENDING' ? '#FFF9C4' : '#F5F5F5',
                                                        color: u.status === 'CONFIRMED' ? '#2E7D32' : u.status === 'PENDING' ? '#FBC02D' : '#616161',
                                                        textTransform: 'uppercase'
                                                    }}>{u.status || 'UNKNOWN'}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .hover-orange:hover {
                    color: #FD4621 !important;
                }
            `}</style>
        </div>
    );
}
