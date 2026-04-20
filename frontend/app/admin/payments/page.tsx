'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminPaymentHooks } from '@hooks/admin/useAdminPaymentHooks';
import { formatCurrency } from '@lib/utils/currency-utils';
import toast from 'react-hot-toast';
import { DateUtils } from '@lib/utils/date-utils';
import { getImgUrl } from '@lib/utils/image';
import { CheckCircle2, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import Pagination from '@components/ui/Pagination';
import { TableRowSkeleton } from '@/src/components/ui/Skeleton';

export default function AdminPaymentsPage() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const { usePendingPayments, useVerifyPayment, useRejectPayment } = useAdminPaymentHooks();

    const { data: response, isLoading, refetch } = usePendingPayments({ page, limit });
    const verifyMutation = useVerifyPayment();
    const rejectMutation = useRejectPayment();

    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
    const [approveTarget, setApproveTarget] = useState<{ id: string; amount: number; transactionId: string } | null>(null);
    const [rejectTarget, setRejectTarget] = useState<{ id: string; bookingNum: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Fix field name: backend uses paymentReceiptImage, not receiptImage
    const result = (response as any)?.data ?? response;
    const payments: any[] = result?.items || [];
    const totalPages = result?.totalPages || 1;
    const totalCount = result?.total || 0;

    const handleVerifySubmit = async () => {
        if (!approveTarget) return;
        try
        {
            await verifyMutation.mutateAsync(approveTarget.id);
            toast.success('✓ Payment approved — booking confirmed');
            setApproveTarget(null);
        } catch (err: any)
        {
            toast.error(err?.response?.data?.message || 'Failed to approve payment');
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectTarget || !rejectReason.trim()) return;
        try
        {
            await rejectMutation.mutateAsync({ id: rejectTarget.id, reason: rejectReason.trim() });
            toast.success('Payment rejected — user notified');
            setRejectTarget(null);
            setRejectReason('');
        } catch (err: any)
        {
            toast.error(err?.response?.data?.message || 'Failed to reject payment');
        }
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-25">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-1">Payment Receipt Review</h4>
                        <p className="text-muted small mb-0">
                            {totalCount} receipt{totalCount !== 1 ? 's' : ''} awaiting verification
                        </p>
                    </div>
                    <button onClick={() => refetch()} className="btn btn-light btn-sm d-inline-flex align-items-center gap-1"
                        style={{ borderRadius: 8, fontWeight: 600, fontSize: 12 }}>
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>

                {/* Queue count banner */}
                {totalCount > 0 && (
                    <div className="mb-20 p-3 rounded-3 d-flex align-items-center gap-3"
                        style={{ background: '#fef3c7', border: '1px solid #fbbf24' }}>
                        <span style={{ fontSize: 22 }}>⏳</span>
                        <div>
                            <div className="fw-bold" style={{ color: '#92400e', fontSize: 14 }}>
                                {totalCount} payment{totalCount !== 1 ? 's' : ''} pending review
                            </div>
                            <div style={{ fontSize: 12, color: '#78350f' }}>
                                Review and approve/reject each payment receipt below. Approval automatically confirms the booking.
                            </div>
                        </div>
                    </div>
                )}

                {/* Payments Table */}
                <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    {['Transaction / User', 'Booking', 'Amount', 'Submitted', 'Receipt', 'Actions'].map(h => (
                                        <th key={h} className="py-3 px-3" style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <>
                                        <TableRowSkeleton cols={6} />
                                        <TableRowSkeleton cols={6} />
                                        <TableRowSkeleton cols={6} />
                                        <TableRowSkeleton cols={6} />
                                        <TableRowSkeleton cols={6} />
                                    </>
                                ) : payments.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-5">
                                        <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                                        <div className="fw-bold text-success mb-1">All caught up!</div>
                                        <div className="text-muted small">No pending payment receipts to review.</div>
                                    </td></tr>
                                ) : payments.map((p: any) => {
                                    const receiptUrl = p.paymentReceiptImage || p.receiptImage;
                                    const bookingId = (p.booking as any)?._id || (p.booking as any)?.id || p.booking;
                                    const bookingNum = (p.booking as any)?.bookingNumber;
                                    const paymentId = p._id || p.id;

                                    return (
                                        <tr key={paymentId} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                            {/* Transaction + User */}
                                            <td className="px-3 py-3">
                                                <div className="fw-bold" style={{ fontSize: 13, fontFamily: 'monospace', color: '#4f46e5' }}>
                                                    #{p.transactionId || paymentId?.slice(-8)}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#888' }}>
                                                    {(p.user as any)?.name || 'Guest'}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#aaa' }}>
                                                    {(p.user as any)?.email || ''}
                                                </div>
                                            </td>

                                            {/* Booking */}
                                            <td className="px-3 py-3">
                                                {bookingId ? (
                                                    <Link href={`/admin/bookings/${bookingId}`}
                                                        style={{ fontWeight: 700, fontSize: 13, color: '#4f46e5', textDecoration: 'none' }}>
                                                        {bookingNum ? `#${bookingNum}` : 'View Booking'}
                                                    </Link>
                                                ) : <span className="text-muted small">—</span>}
                                            </td>

                                            {/* Amount */}
                                            <td className="px-3 py-3">
                                                <div className="fw-black" style={{ fontSize: 15, color: '#111' }}>{formatCurrency(p.amount || 0)}</div>
                                                <div style={{ fontSize: 11, color: '#888' }}>{p.paymentMethod || 'UPI'}</div>
                                            </td>

                                            {/* Submitted */}
                                            <td className="px-3 py-3" style={{ fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>
                                                {DateUtils.formatToIST(p.createdAt, 'DD MMM YYYY')}<br />
                                                <span style={{ fontSize: 11, color: '#aaa' }}>
                                                    {DateUtils.formatToIST(p.createdAt, 'hh:mm A')}
                                                </span>
                                            </td>

                                            {/* Receipt */}
                                            <td className="px-3 py-3">
                                                {receiptUrl ? (
                                                    <div className="d-flex align-items-center gap-2">
                                                        <img
                                                            src={getImgUrl(receiptUrl)}
                                                            alt="Receipt thumbnail"
                                                            style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee', cursor: 'pointer' }}
                                                            onClick={() => setSelectedReceipt(receiptUrl)} />
                                                        <div>
                                                            <button onClick={() => setSelectedReceipt(receiptUrl)}
                                                                className="btn btn-sm btn-light d-block"
                                                                style={{ fontSize: 11, fontWeight: 700, borderRadius: 6 }}>
                                                                Preview
                                                            </button>
                                                            <a href={getImgUrl(receiptUrl)} target="_blank" rel="noopener noreferrer"
                                                                className="d-flex align-items-center gap-1 mt-1"
                                                                style={{ fontSize: 10, color: '#888' }}>
                                                                <ExternalLink size={10} /> Full size
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small">No receipt</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 py-3">
                                                <div className="d-flex flex-column gap-2">
                                                    <button
                                                        onClick={() => setApproveTarget({ id: paymentId, amount: p.amount || 0, transactionId: p.transactionId || paymentId?.slice(-8) })}
                                                        disabled={verifyMutation.isPending || rejectMutation.isPending}
                                                        className="btn btn-sm d-inline-flex align-items-center justify-content-center gap-1"
                                                        style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: 8, fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
                                                        <CheckCircle2 size={13} />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectTarget({ id: paymentId, bookingNum: bookingNum || paymentId?.slice(-6) })}
                                                        disabled={verifyMutation.isPending || rejectMutation.isPending}
                                                        className="btn btn-sm d-inline-flex align-items-center justify-content-center gap-1"
                                                        style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 8, fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
                                                        <XCircle size={13} />
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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

            {/* ── Receipt Preview Modal ── */}
            {selectedReceipt && (
                <div onClick={() => setSelectedReceipt(null)}
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div onClick={e => e.stopPropagation()}
                        style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0 fw-bold">Payment Receipt</h6>
                            <div className="d-flex gap-2">
                                <a href={getImgUrl(selectedReceipt)} target="_blank" rel="noopener noreferrer"
                                    className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
                                    style={{ borderRadius: 8, fontSize: 12 }}>
                                    <ExternalLink size={12} /> Open Full Size
                                </a>
                                <button onClick={() => setSelectedReceipt(null)}
                                    style={{ background: '#f1f3f9', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>×</button>
                            </div>
                        </div>
                        <img src={getImgUrl(selectedReceipt)} alt="Receipt"
                            style={{ width: '100%', borderRadius: 12, objectFit: 'contain', background: '#f8f9fa' }} />
                    </div>
                </div>
            )}

            {/* ── Approve Confirm Modal ── */}
            {approveTarget && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                        <h6 className="mb-1 fw-bold text-success d-flex align-items-center gap-2">
                            <CheckCircle2 size={20} /> Approve Payment
                        </h6>
                        <p className="text-muted small mt-3 mb-0">
                            Transaction amount:{' '}
                            <strong className="text-dark">{formatCurrency(approveTarget.amount)}</strong>
                        </p>
                        <p className="text-muted small mt-1 mb-4">
                            Are you sure you want to approve this payment for transaction ID <strong>#{approveTarget.transactionId}</strong>? The associated booking will be confirmed automatically.
                        </p>
                        <div className="d-flex gap-2">
                            <button onClick={() => setApproveTarget(null)}
                                className="btn btn-light flex-grow-1" style={{ borderRadius: 10, fontWeight: 600 }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleVerifySubmit}
                                disabled={verifyMutation.isPending}
                                className="btn flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                                style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: 10, fontWeight: 700 }}>
                                <CheckCircle2 size={15} />
                                {verifyMutation.isPending ? 'Approving…' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Reject Reason Modal ── */}
            {rejectTarget && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                        <h6 className="mb-1 fw-bold">Reject Payment</h6>
                        <p className="text-muted small mb-3">
                            Booking #{rejectTarget.bookingNum} · The user will be notified with your reason.
                        </p>
                        <textarea
                            className="form-control mb-3"
                            rows={3}
                            placeholder="e.g. Receipt unclear, wrong amount, duplicate transaction…"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            style={{ borderRadius: 10, fontSize: 13 }}
                            autoFocus
                        />
                        <div className="d-flex gap-2">
                            <button onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                                className="btn btn-light flex-grow-1" style={{ borderRadius: 10, fontWeight: 600 }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={!rejectReason.trim() || rejectMutation.isPending}
                                className="btn flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                                style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 10, fontWeight: 700 }}>
                                <XCircle size={15} />
                                {rejectMutation.isPending ? 'Rejecting…' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
