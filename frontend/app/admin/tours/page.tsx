'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAdminTourHooks } from '@hooks/admin/useAdminTourHooks';
import { formatCurrency } from '@lib/utils/currency-utils';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/src/components/common/ConfirmationModal';
import Pagination from '@/src/components/ui/Pagination';
import { TableRowSkeleton } from '@/src/components/ui/Skeleton';

export default function AdminToursPage() {
    const { useToursList, useDeleteTour, useToggleStatus, useToggleFeatured } = useAdminTourHooks();

    const [page, setPage] = useState(1);

    // Soft-delete confirmation modal state
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; tourId: string; tourTitle: string }>({
        isOpen: false,
        tourId: '',
        tourTitle: '',
    });

    const { data: response, isLoading } = useToursList({ page, limit: 10 });
    const deleteTourMutation = useDeleteTour();
    const toggleStatusMutation = useToggleStatus();
    const toggleFeaturedMutation = useToggleFeatured();

    const tours = (response as any)?.data?.items || (response as any)?.data || (response as any)?.items || response || [];
    const totalPages = (response as any)?.data?.totalPages || (response as any)?.totalPages || 1;
    const currentPage = (response as any)?.data?.page || (response as any)?.page || page;

    // Opens the confirmation modal – no actual delete yet
    const promptDelete = (id: string, title: string) => {
        setDeleteModal({ isOpen: true, tourId: id, tourTitle: title });
    };

    // Called when user clicks "Delete" inside the modal
    const confirmDelete = async () => {
        try
        {
            await deleteTourMutation.mutateAsync(deleteModal.tourId);
            toast.success('Tour deleted successfully');
        } catch (err: any)
        {
            toast.error(err?.response?.data?.message || 'Failed to delete tour');
        } finally
        {
            setDeleteModal({ isOpen: false, tourId: '', tourTitle: '' });
        }
    };

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        const newStatus = !isActive ? 'Active' : 'Draft';
        try
        {
            await toggleStatusMutation.mutateAsync(id);
            toast.success(`Tour status changed to ${newStatus}`);
        } catch
        {
            toast.error('Failed to change status');
        }
    };

    const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
        try
        {
            await toggleFeaturedMutation.mutateAsync(id);
            toast.success(`Tour is now ${!isFeatured ? 'Featured' : 'Unfeatured'}`);
        } catch
        {
            toast.error('Failed to toggle featured status');
        }
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <h4 className="togo-dashboard-account-title mb-0">Tour Manager</h4>
                    <Link className="togo-btn-primary" href="/admin/tours/new">+ Add New Tour</Link>
                </div>

                <div className="mb-3" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th className="ps-4 py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Tour</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Location &amp; Stats</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Price</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                    <th className="pe-4 py-3 text-end" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <>
                                        <TableRowSkeleton cols={5} />
                                        <TableRowSkeleton cols={5} />
                                        <TableRowSkeleton cols={5} />
                                        <TableRowSkeleton cols={5} />
                                        <TableRowSkeleton cols={5} />
                                    </>
                                ) : !tours || tours.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-5 text-muted">No tours found.</td></tr>
                                ) : (
                                    tours.map((t: any) => (
                                        <tr key={t.id || t._id} style={{ borderBottom: '1px solid #f1f3f9' }}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div style={{ width: '60px', height: '45px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                                        <img
                                                            src={t.thumbnailImage?.startsWith('http') ? t.thumbnailImage : t.thumbnailImage ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${t.thumbnailImage}` : '/assets/img/tour/tour-thumb-1.jpg'}
                                                            alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div style={{ maxWidth: '280px' }}>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.title}>
                                                                {t.title}
                                                            </div>
                                                            {t.isFeatured && <span title="Featured" style={{ color: '#f5a623', fontSize: '14px' }}>★</span>}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#888' }}>ID: {t.id?.slice(-8) || t._id?.slice(-8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>📍 {t.location?.city || t.location || 'Multiple'}</div>
                                                <div style={{ fontSize: '11px', color: '#888' }}>{t.bookingCount || 0} Bookings · {t.reviewsCount || 0} Reviews</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 700, fontSize: '15px', color: '#e55' }}>{formatCurrency(t.basePrice || t.price || 0)}</div>
                                                <div style={{ fontSize: '11px', color: '#888' }}>Starting from</div>
                                            </td>
                                            <td>
                                                <span
                                                    onClick={() => handleToggleStatus(t.id || t._id, t.isActive)}
                                                    style={{
                                                        display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                                                        backgroundColor: t.isActive ? '#E8F5E9' : '#F3F4F6',
                                                        color: t.isActive ? '#2E7D32' : '#6B7280'
                                                    }}>{t.isActive ? 'ACTIVE' : 'DRAFT'}</span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Link href={`/admin/tours/${t.id || t._id}/dates`} className="btn btn-sm btn-light" style={{ fontWeight: 600, fontSize: '12px', borderRadius: '8px' }}>
                                                        Dates
                                                    </Link>
                                                    <Link href={`/admin/tours/${t.id || t._id}/edit`} className="btn btn-sm btn-light" style={{ fontWeight: 600, fontSize: '12px', borderRadius: '8px' }}>
                                                        Edit
                                                    </Link>
                                                    <div className="dropdown">
                                                        <button className="btn btn-sm btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ borderRadius: '8px' }}>
                                                            <i className="bi bi-three-dots"></i>
                                                        </button>
                                                        <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" style={{ borderRadius: '12px', padding: '8px' }}>
                                                            <li>
                                                                <button className="dropdown-item" onClick={() => handleToggleFeatured(t.id || t._id, t.isFeatured)} style={{ fontSize: '13px', fontWeight: 500, borderRadius: '6px' }}>
                                                                    {t.isFeatured ? 'Unfeature' : 'Mark as Featured'}
                                                                </button>
                                                            </li>
                                                            <li><hr className="dropdown-divider" /></li>
                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-danger"
                                                                    onClick={() => promptDelete(t.id || t._id, t.title)}
                                                                    style={{ fontSize: '13px', fontWeight: 500, borderRadius: '6px' }}
                                                                >
                                                                    🗑️ Delete Tour
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center py-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(p) => setPage(p)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Permanent Delete Confirmation Modal ─────────────────────────────── */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, tourId: '', tourTitle: '' })}
                onConfirm={confirmDelete}
                type="danger"
                title="Permanently Delete Tour?"
                message={`Are you sure you want to permanently delete "${deleteModal.tourTitle}"? This action cannot be undone — the tour and all its data will be removed forever.`}
                confirmText={deleteTourMutation.isPending ? 'Deleting...' : 'Yes, Delete Permanently'}
                cancelText="Cancel"
                isLoading={deleteTourMutation.isPending}
            />
        </div>
    );
}
