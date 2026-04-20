'use client';

import Link from 'next/link';
import { useAdminCouponHooks } from '@hooks/admin/useAdminCouponHooks';
import toast from 'react-hot-toast';
import {
    Tag,
    Trash2,
    Edit3,
    Calendar,
    Activity,
    Plus,
    Search,
    ChevronDown
} from 'lucide-react';
import { DateUtils } from '@lib/utils/date-utils';
import { CouponType } from '@lib/constants/enums';
import Pagination from '@components/ui/Pagination';
import { useState } from 'react';
import Modal from '@components/ui/Modal';

export default function AdminCouponsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [couponToDelete, setCouponToDelete] = useState<{ id: string; code: string } | null>(null);
    const limit = 10;
    const { useCouponsList, useDeleteCoupon } = useAdminCouponHooks();

    const { data: response, isLoading } = useCouponsList({ page, limit, search });
    const deleteMutation = useDeleteCoupon();

    const result = (response as any)?.data ?? response;
    const coupons = result?.items || [];
    const totalPages = result?.totalPages || 1;

    const handleDelete = async (id: string, code: string) => {
        setCouponToDelete({ id, code });
    };

    const confirmDelete = async () => {
        if (!couponToDelete) return;
        try
        {
            await deleteMutation.mutateAsync(couponToDelete.id);
            toast.success('Coupon deleted');
            setCouponToDelete(null);
        } catch (err)
        {
            toast.error('Failed to delete coupon');
        }
    };

    const formatDiscount = (c: any) => {
        if (c.discountType === CouponType.PERCENT) return `${c.discountValue}%`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(c.discountValue || 0);
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-end mb-30">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-0">Coupons & Promotions</h4>
                        <p className="text-muted small mb-0">Create and manage discount codes to drive platform bookings.</p>
                    </div>
                    <div className="d-flex gap-2">
                        <div className="position-relative">
                            <Search size={16} color="#aaa" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search codes..."
                                className="form-control"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                style={{ paddingLeft: '35px', borderRadius: '10px', fontSize: '13px', width: '250px', border: '1px solid #eee' }}
                            />
                        </div>
                        <Link href="/admin/coupons/new" className="btn btn-dark d-flex align-items-center gap-2" style={{ borderRadius: '10px', padding: '10px 20px', fontWeight: 600 }}>
                            <Plus size={18} /> Create Coupon
                        </Link>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th className="ps-4 py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Promo Code</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Benefit</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Usage Metrics</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Expiration</th>
                                    <th className="pe-4 py-3 text-end" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={6} className="text-center py-5 text-muted">Loading coupons...</td></tr>
                                ) : !coupons || coupons.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-5 text-muted">No coupons found. Start by creating one.</td></tr>
                                ) : (
                                    coupons.map((c: any) => {
                                        const used = c.usedCount || 0;
                                        const max = c.maxUsage || 0;
                                        const usagePercent = max > 0 ? Math.min((used / max) * 100, 100) : 0;

                                        return (
                                            <tr key={c.id || c._id || c.code} style={{ borderBottom: '1px solid #f1f3f9' }}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div style={{ padding: '8px', background: '#f8f9fa', borderRadius: '8px', color: '#555' }}>
                                                            <Tag size={18} />
                                                        </div>
                                                        <div style={{ backgroundColor: '#fff', padding: '6px 12px', borderRadius: '8px', border: '1px dashed #ced4da', display: 'inline-block' }}>
                                                            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#111', fontSize: '14px', letterSpacing: '1px' }}>{c.code}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 800, fontSize: '16px', color: '#111' }}>{formatDiscount(c)} OFF</div>
                                                    <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>{c.discountType === CouponType.PERCENT ? 'Percentage' : 'Flat Discount'}</div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column gap-2" style={{ width: '160px' }}>
                                                        <div className="d-flex justify-content-between align-items-end" style={{ fontSize: '11px', color: '#555', fontWeight: 700 }}>
                                                            <Link href={`/admin/coupons/${c.id || c._id}/usage`} className="d-flex align-items-center gap-1 hover-link" style={{ color: used > 0 ? '#FD4621' : '#888', textDecoration: 'none' }}>
                                                                <Activity size={10} /> {used} used
                                                                {used > 0 && <span style={{ fontSize: '9px' }}>↗</span>}
                                                            </Link>
                                                            <span style={{ color: '#aaa' }}>Lmt: {max || '∞'}</span>
                                                        </div>
                                                        <div style={{ height: '7px', background: '#f1f3f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div
                                                                style={{
                                                                    width: max > 0 ? `${usagePercent}%` : '0%',
                                                                    height: '100%',
                                                                    background: usagePercent > 90 ? '#ef4444' : usagePercent > 70 ? '#f5a623' : '#FD4621',
                                                                    borderRadius: '4px',
                                                                    transition: 'width 0.5s ease-out'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-block', padding: '5px 14px', borderRadius: '30px', fontSize: '11px', fontWeight: 800,
                                                        backgroundColor: c.isActive ? '#FFF3F1' : '#F3F4F6',
                                                        color: c.isActive ? '#FD4621' : '#6B7280',
                                                        textTransform: 'uppercase'
                                                    }}>{c.isActive ? 'Active' : 'Draft'}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '13px', color: '#555', fontWeight: 500 }}>
                                                        <Calendar size={14} color="#aaa" />
                                                        {c.expiryDate ? DateUtils.formatToIST(c.expiryDate, 'DD MMM YYYY') : <span style={{ color: '#aaa', fontStyle: 'italic' }}>Lifetime</span>}
                                                    </div>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <Link href={`/admin/coupons/${c.id || c._id}/usage`} className="btn btn-sm btn-light p-2" title="Usage History" style={{ borderRadius: '8px' }}>
                                                            <Activity size={16} color="#666" />
                                                        </Link>
                                                        <Link href={`/admin/coupons/${c.id || c._id}/edit`} className="btn btn-sm btn-light p-2" title="Edit" style={{ borderRadius: '8px' }}>
                                                            <Edit3 size={16} color="#666" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(c.id || c._id, c.code)}
                                                            disabled={deleteMutation.isPending}
                                                            className="btn btn-sm btn-light p-2 hover-danger"
                                                            title="Delete"
                                                            style={{ borderRadius: '8px' }}
                                                        >
                                                            <Trash2 size={16} color="#666" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-30 d-flex justify-content-center">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            </div>

            {/* Deletion Confirmation Modal */}
            <Modal
                isOpen={!!couponToDelete}
                onClose={() => setCouponToDelete(null)}
                title="Confirm Coupon Deletion"
                size="sm"
                footer={(
                    <>
                        <button type="button" onClick={() => setCouponToDelete(null)}
                            style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="button"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete Coupon'}
                        </button>
                    </>
                )}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ background: '#fef2f2', color: '#dc2626', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Trash2 size={24} />
                    </div>
                    <p style={{ margin: 0, color: '#111827', fontWeight: 700, fontSize: 16 }}>Delete coupon <span style={{ color: '#dc2626' }}>{couponToDelete?.code}</span>?</p>
                    <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>
                        This promo code will be permanently removed. This action cannot be undone and will prevent future use of this code.
                    </p>
                </div>
            </Modal>

            <style jsx>{`
                .hover-danger:hover {
                    background-color: #fff2f2 !important;
                }
                .hover-danger:hover :global(svg) {
                    color: #e55 !important;
                }
            `}</style>
        </div>
    );
}
