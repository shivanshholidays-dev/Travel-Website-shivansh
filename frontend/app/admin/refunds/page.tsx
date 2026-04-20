'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRefundsApi } from '@lib/api/admin/refunds.api';
import toast from 'react-hot-toast';
import { DateUtils } from '@lib/utils/date-utils';
import { RefundStatus } from '@lib/constants/enums';
import { getRefundStatusLabel, getRefundStatusBadgeClass } from '@lib/utils/enum-mappings';
import { formatCurrency } from '@lib/utils/currency-utils';
import { Search, ChevronLeft, ChevronRight, RefreshCw, CheckCircle, XCircle, CreditCard, Clock, Info } from 'lucide-react';
import { TableRowSkeleton } from '@/src/components/ui/Skeleton';
import Link from 'next/link';
import { getErrorMessage } from '@lib/utils/error-handler';

export default function AdminRefundsPage() {
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data: response, isLoading, refetch } = useQuery({
        queryKey: ['admin', 'refunds', page],
        queryFn: () => adminRefundsApi.getAll({ page, limit: 10 })
    });

    const [pendingAction, setPendingAction] = useState<{ type: 'approve' | 'reject' | 'process'; refund: any } | null>(null);
    const [actionValue, setActionValue] = useState('');
    const [adminNote, setAdminNote] = useState('');

    const approveMutation = useMutation({
        mutationFn: ({ id, amount, note }: { id: string; amount: number; note: string }) =>
            adminRefundsApi.approve(id, { refundAmount: amount, refundAdminNote: note }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] });
            toast.success('Refund approved');
            setPendingAction(null);
            setAdminNote('');
        },
        onError: (err: any) => toast.error(getErrorMessage(err, 'Failed to approve refund'))
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => adminRefundsApi.reject(id, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] });
            toast.success('Refund rejected');
            setPendingAction(null);
        },
        onError: (err: any) => toast.error(getErrorMessage(err, 'Failed to reject refund'))
    });

    const processMutation = useMutation({
        mutationFn: (id: string) => adminRefundsApi.markProcessed(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] });
            toast.success('Refund marked as processed');
            setPendingAction(null);
        },
        onError: (err: any) => toast.error(getErrorMessage(err, 'Failed to process refund'))
    });

    const raw = (response as any)?.data ?? response;
    const refunds: any[] = raw?.items || [];
    const total: number = raw?.meta?.total || 0;
    const totalPages: number = raw?.meta?.totalPages || 1;

    const StatCard = ({ label, value, color, bg, icon: Icon }: { label: string; value: any; color: string; bg: string; icon: any }) => (
        <div className="col-6 col-md-3">
            <div style={{ background: bg, borderRadius: 16, padding: '18px 20px', border: `1px solid ${color}22` }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <p className="small fw-semibold text-uppercase mb-0" style={{ color, opacity: 0.75, fontSize: 11, letterSpacing: 0.5 }}>{label}</p>
                    <Icon size={14} style={{ color, opacity: 0.5 }} />
                </div>
                <h4 className="mb-0 fw-black" style={{ color, fontSize: 22 }}>{value}</h4>
            </div>
        </div>
    );

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-25">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-1">Refund Manager</h4>
                        <p className="text-muted small mb-0">{total} refund request{total !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => refetch()} className="btn btn-light btn-sm d-inline-flex align-items-center gap-1"
                        style={{ borderRadius: 8, fontWeight: 600, fontSize: 12 }}>
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>

                <div className="row g-3 mb-25">
                    <StatCard label="Pending Requests" value={refunds.filter(r => r.refundStatus === RefundStatus.REQUESTED).length} color="#d97706" bg="#fffbeb" icon={Clock} />
                    <StatCard label="Approved" value={refunds.filter(r => r.refundStatus === RefundStatus.APPROVED).length} color="#4f46e5" bg="#eef2ff" icon={CheckCircle} />
                    <StatCard label="Processed" value={refunds.filter(r => r.refundStatus === RefundStatus.PROCESSED).length} color="#16a34a" bg="#f0fdf4" icon={CreditCard} />
                    <StatCard label="Rejected" value={refunds.filter(r => r.refundStatus === RefundStatus.REJECTED).length} color="#dc2626" bg="#fef2f2" icon={XCircle} />
                </div>

                <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0 align-middle">
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    {['Booking', 'Tour', 'Amount Paid', 'Reason', 'Status', 'Date', 'Actions'].map(h => (
                                        <th key={h} className="py-3 px-3" style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <>
                                        <TableRowSkeleton cols={7} />
                                        <TableRowSkeleton cols={7} />
                                        <TableRowSkeleton cols={7} />
                                        <TableRowSkeleton cols={7} />
                                        <TableRowSkeleton cols={7} />
                                    </>
                                ) : refunds.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-5 text-muted">No refund requests found.</td></tr>
                                ) : refunds.map((r: any) => (
                                    <tr key={r._id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                        <td className="px-3 py-3">
                                            <Link href={`/admin/bookings/${r._id}`} style={{ fontWeight: 700, fontSize: 13, color: '#4f46e5', textDecoration: 'none' }}>
                                                #{r.bookingNumber}
                                            </Link>
                                            <div style={{ fontSize: 11, color: '#bbb' }}>{r.user?.name || 'Guest'}</div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div style={{ fontWeight: 500, fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {r.tour?.title || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="fw-bold" style={{ fontSize: 13 }}>{formatCurrency(r.paidAmount)}</div>
                                            {r.refundAmount > 0 && <div className="text-success small" style={{ fontSize: 11 }}>Refund: {formatCurrency(r.refundAmount)}</div>}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div style={{ fontSize: 12, color: '#666', maxWidth: 200 }} className="text-truncate" title={r.refundReason}>
                                                {r.refundReason || '—'}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`px-2 py-1 rounded fw-bold text-uppercase ${getRefundStatusBadgeClass(r.refundStatus)}`} style={{ fontSize: 10 }}>
                                                {getRefundStatusLabel(r.refundStatus)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3" style={{ fontSize: 12, color: '#888' }}>
                                            {r.refundRequestedAt ? DateUtils.formatToIST(r.refundRequestedAt, 'DD MMM YYYY') : '—'}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="d-flex gap-2">
                                                {r.refundStatus === RefundStatus.REQUESTED && (
                                                    <>
                                                        <button onClick={() => { setPendingAction({ type: 'approve', refund: r }); setActionValue(r.paidAmount.toString()); }} className="btn btn-sm btn-outline-success" style={{ borderRadius: 6, fontSize: 11 }}>Approve</button>
                                                        <button onClick={() => { setPendingAction({ type: 'reject', refund: r }); setActionValue(''); }} className="btn btn-sm btn-outline-danger" style={{ borderRadius: 6, fontSize: 11 }}>Reject</button>
                                                    </>
                                                )}
                                                {r.refundStatus === RefundStatus.APPROVED && (
                                                    <button onClick={() => setPendingAction({ type: 'process', refund: r })} className="btn btn-sm btn-success" style={{ borderRadius: 6, fontSize: 11 }}>Mark Processed</button>
                                                )}
                                                <Link href={`/admin/bookings/${r._id}`} className="btn btn-sm btn-light" style={{ borderRadius: 6, fontSize: 11 }}>View</Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderTop: '1px solid #f1f3f9' }}>
                            <span style={{ fontSize: 13, color: '#888' }}>Page {page} of {totalPages}</span>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-light" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
                                <button className="btn btn-sm btn-light" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Modals */}
            {pendingAction && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            {pendingAction.type === 'approve' && <><CheckCircle size={18} className="text-success" /> Approve Refund</>}
                            {pendingAction.type === 'reject' && <><XCircle size={18} className="text-danger" /> Reject Refund</>}
                            {pendingAction.type === 'process' && <><CreditCard size={18} className="text-primary" /> Mark Refund Processed</>}
                        </h6>
                        <p className="text-muted mb-4" style={{ fontSize: 13 }}>
                            Booking #{pendingAction.refund.bookingNumber} | Paid: {formatCurrency(pendingAction.refund.paidAmount)}
                        </p>

                        {pendingAction.type === 'approve' && (
                            <div className="mb-4">
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Refund Amount (₹)</label>
                                    <input type="number" className="form-control" value={actionValue} onChange={e => setActionValue(e.target.value)} style={{ borderRadius: 10 }} />
                                    <small className="text-muted">Enter the actual amount to be refunded to the customer.</small>
                                </div>
                                <div className="mb-0">
                                    <label className="form-label small fw-bold">Note to User / Calculation Breakdown</label>
                                    <textarea
                                        className="form-control"
                                        value={adminNote}
                                        onChange={e => setAdminNote(e.target.value)}
                                        rows={3}
                                        style={{ borderRadius: 10 }}
                                        placeholder="Explain the refund amount (e.g., '10% deduction as per policy'). This will be visible to the user."
                                    />
                                    <small className="text-muted">This note will be shown on the user's dashboard.</small>
                                </div>
                            </div>
                        )}

                        {pendingAction.type === 'reject' && (
                            <div className="mb-4">
                                <label className="form-label small fw-bold">Rejection Reason</label>
                                <textarea className="form-control" value={actionValue} onChange={e => setActionValue(e.target.value)} rows={3} style={{ borderRadius: 10 }} placeholder="Explain why the refund was rejected..." />
                            </div>
                        )}

                        {pendingAction.type === 'process' && (
                            <div className="mb-4 p-3 rounded bg-light border">
                                <div className="d-flex gap-2 align-items-center mb-1">
                                    <Info size={14} className="text-primary" />
                                    <span className="fw-bold" style={{ fontSize: 12 }}>Note</span>
                                </div>
                                <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
                                    This will mark the refund as completed and update the transaction status. Ensure the money has been sent to the customer.
                                </p>
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <button onClick={() => setPendingAction(null)} className="btn btn-light flex-grow-1" style={{ borderRadius: 10, fontWeight: 600 }}>Cancel</button>
                            <button
                                onClick={() => {
                                    if (pendingAction.type === 'approve') approveMutation.mutate({ id: pendingAction.refund._id, amount: Number(actionValue), note: adminNote });
                                    else if (pendingAction.type === 'reject') rejectMutation.mutate({ id: pendingAction.refund._id, reason: actionValue });
                                    else if (pendingAction.type === 'process') processMutation.mutate(pendingAction.refund._id);
                                }}
                                disabled={approveMutation.isPending || rejectMutation.isPending || processMutation.isPending || (pendingAction.type !== 'process' && !actionValue)}
                                className={`btn flex-grow-1 text-white fw-bold ${pendingAction.type === 'reject' ? 'btn-danger' : 'btn-primary'}`}
                                style={{ borderRadius: 10 }}
                            >
                                {approveMutation.isPending || rejectMutation.isPending || processMutation.isPending ? 'Processing…' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
