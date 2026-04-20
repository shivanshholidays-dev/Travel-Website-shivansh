'use client';

import { useState } from 'react';
import { useAdminReviewHooks } from '@hooks/admin/useAdminReviewHooks';
import toast from 'react-hot-toast';
import {
    Star,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    MapPin,
    Calendar,
    User
} from 'lucide-react';
import { DateUtils } from '@lib/utils/date-utils';
import { ReviewStatus } from '@lib/constants/enums';
import { getReviewStatusLabel, getStatusBadgeClass } from '@lib/utils/enum-mappings';
import Pagination from '@components/ui/Pagination';
import Modal from '@components/ui/Modal';
import { Textarea } from '@components/ui/Textarea';

export default function AdminReviewsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [reviewToReject, setReviewToReject] = useState<{ id: string; reason: string } | null>(null);
    const limit = 10;
    const { useReviewsList, useApproveReview, useRejectReview } = useAdminReviewHooks();

    const params = {
        page,
        limit,
        ...(statusFilter ? { status: statusFilter } : {})
    };
    const { data: response, isLoading } = useReviewsList(params);

    const approveMutation = useApproveReview();
    const rejectMutation = useRejectReview();

    const result = (response as any)?.data ?? response;
    const reviews = result?.items || [];
    const totalPages = result?.totalPages || 1;

    const handleApprove = async (id: string) => {
        try
        {
            await approveMutation.mutateAsync(id);
            toast.success('Review approved successfully');
        } catch (err)
        {
            toast.error('Failed to approve review');
        }
    };

    const handleReject = (id: string) => {
        setReviewToReject({ id, reason: '' });
    };

    const confirmReject = async () => {
        if (!reviewToReject || !reviewToReject.reason.trim())
        {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try
        {
            await rejectMutation.mutateAsync({ id: reviewToReject.id, reason: reviewToReject.reason });
            toast.success('Review rejected');
            setReviewToReject(null);
        } catch (err)
        {
            toast.error('Failed to reject review');
        }
    };

    const RenderStars = ({ rating }: { rating: number }) => (
        <div className="d-flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={14}
                    fill={s <= rating ? '#f5a623' : 'transparent'}
                    color={s <= rating ? '#f5a623' : '#ddd'}
                />
            ))}
        </div>
    );

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-end mb-30">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-0">Review Moderation</h4>
                        <p className="text-muted small mb-0">Ensure quality across the platform by managing customer feedback.</p>
                    </div>
                    <div className="d-flex gap-2">
                        <div className="position-relative">
                            <Search size={16} color="#aaa" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search comments..."
                                className="form-control"
                                style={{ paddingLeft: '35px', borderRadius: '10px', fontSize: '13px', width: '250px', border: '1px solid #eee' }}
                            />
                        </div>
                        <select
                            className="form-select border-0 shadow-sm"
                            style={{ width: 'auto', padding: '10px 40px 10px 15px', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Status</option>
                            {Object.values(ReviewStatus).map(status => (
                                <option key={status} value={status}>{getReviewStatusLabel(status)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th className="ps-4 py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>User & Tour</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Rating & Content</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Date</th>
                                    <th className="pe-4 py-3 text-end" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={5} className="text-center py-5 text-muted">Loading reviews...</td></tr>
                                ) : !reviews || reviews.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-5 text-muted">No reviews found in this category.</td></tr>
                                ) : (
                                    reviews.map((r: any) => (
                                        <tr key={r.id || r._id} style={{ borderBottom: '1px solid #f1f3f9' }}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a73e8' }}>
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#111', fontSize: '14px' }}>{r.user?.name || 'Anonymous User'}</div>
                                                        <div className="d-flex align-items-center gap-1" style={{ fontSize: '12px', color: '#1a73e8', fontWeight: 600 }}>
                                                            <MapPin size={12} /> {r.tour?.title || 'Unknown Tour'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="mb-1"><RenderStars rating={r.rating || 5} /></div>
                                                <div style={{ fontSize: '13.5px', color: '#444', fontStyle: 'italic', maxWidth: '400px', lineHeight: '1.4' }}>
                                                    "{r.comment || r.content}"
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`px-3 py-1 rounded-pill fw-bold text-uppercase ${getStatusBadgeClass(r.status || ReviewStatus.PENDING)}`} style={{ fontSize: '11px' }}>
                                                    {getReviewStatusLabel(r.status || ReviewStatus.PENDING)}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Calendar size={14} color="#ccc" />
                                                    {DateUtils.formatToIST(r.createdAt || r.date, 'DD MMM YYYY')}
                                                </div>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    {(r.status === ReviewStatus.PENDING || !r.status) && (
                                                        <button
                                                            onClick={() => handleApprove(r.id || r._id)}
                                                            disabled={rejectMutation.isPending || approveMutation.isPending}
                                                            className="btn btn-sm btn-success d-flex align-items-center gap-2"
                                                            style={{ fontWeight: 700, fontSize: '12px', borderRadius: '8px', padding: '6px 12px' }}
                                                        >
                                                            <CheckCircle2 size={14} /> Approve
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleReject(r.id || r._id)}
                                                        disabled={rejectMutation.isPending || approveMutation.isPending}
                                                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                                                        style={{ fontWeight: 700, fontSize: '12px', borderRadius: '8px', padding: '6px 12px' }}
                                                    >
                                                        <XCircle size={14} /> {r.status === ReviewStatus.REJECTED ? 'Permanent Reject' : 'Reject'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
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

            {/* Rejection Modal */}
            <Modal
                isOpen={!!reviewToReject}
                onClose={() => setReviewToReject(null)}
                title="Reject Review"
                size="md"
                footer={(
                    <>
                        <button type="button" onClick={() => setReviewToReject(null)}
                            style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="button"
                            onClick={confirmReject}
                            disabled={rejectMutation.isPending}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
                            {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                    </>
                )}
            >
                <div>
                    <div style={{ background: '#fff5f5', color: '#dc2626', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <XCircle size={22} />
                    </div>
                    <h5 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '18px', color: '#111' }}>Reason for Rejection</h5>
                    <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px', lineHeight: 1.5 }}>
                        Please explain why this review is being rejected. This note will be recorded for internal moderation logs.
                    </p>

                    <textarea
                        className="form-control"
                        placeholder="Type rejection reason here (e.g., spam, inappropriate language, off-topic)..."
                        rows={4}
                        value={reviewToReject?.reason || ''}
                        onChange={(e) => setReviewToReject(p => p ? { ...p, reason: e.target.value } : null)}
                        style={{ borderRadius: '12px', border: '1.5px solid #eee', padding: '12px', fontSize: '14px', outline: 'none', resize: 'none' }}
                        autoFocus
                    />
                </div>
            </Modal>
        </div>
    );
}
