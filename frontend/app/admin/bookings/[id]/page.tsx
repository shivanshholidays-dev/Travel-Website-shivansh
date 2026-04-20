'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminBookingHooks } from '@hooks/admin/useAdminBookingHooks';
import toast from 'react-hot-toast';
import { DateUtils } from '@lib/utils/date-utils';
import { BookingStatus, TransactionType, TransactionStatus } from '@lib/constants/enums';
import { getBookingStatusLabel, getStatusBadgeClass, getGenderLabel, getPickupTypeLabel } from '@lib/utils/enum-mappings';
import { getImgUrl } from '@lib/utils/image';
import { formatCurrency } from '@lib/utils/currency-utils';
import {
    ArrowLeft, ExternalLink, CheckCircle2, XCircle,
    Users, CreditCard, FileText, Clock, RefreshCw, AlertTriangle,
    ShieldCheck, Calendar, MapPin, Search
} from 'lucide-react';
import { getErrorMessage } from '@lib/utils/error-handler';

/* ═══════════════════════════════════════════════════════════════════
   Reusable Confirmation Modal
   ═══════════════════════════════════════════════════════════════════ */
function ConfirmModal({ open, title, message, confirmLabel, confirmColor, confirmBg, confirmBorder, icon, loading, onConfirm, onCancel }: {
    open: boolean; title: string; message: string;
    confirmLabel: string; confirmColor: string; confirmBg: string; confirmBorder: string;
    icon?: React.ReactNode; loading?: boolean;
    onConfirm: () => void; onCancel: () => void;
}) {
    if (!open) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                    {icon}
                    <h6 className="mb-0 fw-bold">{title}</h6>
                </div>
                <p className="text-muted mb-4" style={{ fontSize: 14, lineHeight: 1.6 }}>{message}</p>
                <div className="d-flex gap-2">
                    <button onClick={onCancel} disabled={loading}
                        className="btn btn-light flex-grow-1"
                        style={{ borderRadius: 10, fontWeight: 600, fontSize: 14, padding: '11px 0' }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="btn flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                        style={{ background: confirmBg, color: confirmColor, border: `1px solid ${confirmBorder}`, borderRadius: 10, fontWeight: 700, fontSize: 14, padding: '11px 0' }}>
                        {loading ? 'Processing…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── small helpers ── */
const InfoBox = ({ label, value, mono = false }: { label: string; value: any; mono?: boolean }) => (
    <div className="p-3 h-100" style={{
        background: '#f8fafc',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        transition: 'all 0.2s ease-in-out'
    }}>
        <div className="text-muted mb-1" style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>{label}</div>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', wordBreak: mono ? 'break-all' : undefined }}>{value ?? '—'}</div>
    </div>
);

const SectionCard = ({ children, className = '', header, style }: { children: React.ReactNode; className?: string; header?: React.ReactNode; style?: React.CSSProperties }) => (
    <div className={`mb-4 overflow-hidden ${className}`} style={{
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
        border: '1px solid #edf2f7',
        ...style
    }}>
        {header && (
            <div className="px-4 py-3 border-bottom" style={{ background: '#fcfdfe' }}>
                {header}
            </div>
        )}
        <div className="p-4 p-md-4">
            {children}
        </div>
    </div>
);

const SectionTitle = ({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: React.ReactNode }) => (
    <div className="d-flex align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, borderRadius: 10, background: '#f5f7ff', color: '#4f46e5' }}>
            {icon}
        </div>
        <h6 className="mb-0" style={{ fontWeight: 800, fontSize: 16, color: '#1e293b' }}>{title}</h6>
        {badge}
    </div>
);

export default function AdminBookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;

    const {
        useBookingById, useUpdateStatus, useConfirmBooking,
        useAddPayment, useCancelBooking, useVerifyReceipt,
    } = useAdminBookingHooks();

    const { data: response, isLoading, refetch } = useBookingById(bookingId);
    const updateStatusMutation = useUpdateStatus();
    const confirmMutation = useConfirmBooking();
    const cancelMutation = useCancelBooking();
    const addPaymentMutation = useAddPayment();
    const verifyMutation = useVerifyReceipt();

    const booking = (response as any)?.data || response;
    const paymentSummary = booking?.paymentSummary || {};
    const paymentHistory = paymentSummary.payments || [];

    const [noteInput, setNoteInput] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [approveTarget, setApproveTarget] = useState<{ id: string; amount: number; transactionId: string } | null>(null);
    const [rejectTarget, setRejectTarget] = useState<{ id: string; bookingNum: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    /* ── Modal State ── */
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean; title: string; message: string;
        confirmLabel: string; confirmColor: string; confirmBg: string; confirmBorder: string;
        icon?: React.ReactNode; action: () => Promise<void>;
    }>({ open: false, title: '', message: '', confirmLabel: '', confirmColor: '', confirmBg: '', confirmBorder: '', action: async () => { } });

    const openModal = (opts: Omit<typeof confirmModal, 'open'>) => setConfirmModal({ ...opts, open: true });
    const closeModal = () => setConfirmModal(prev => ({ ...prev, open: false }));
    const [modalLoading, setModalLoading] = useState(false);

    const execModal = async () => {
        setModalLoading(true);
        try { await confirmModal.action(); } finally { setModalLoading(false); closeModal(); }
    };

    /* ── handlers ── */
    const handleAddNote = async () => {
        if (!noteInput.trim()) return;
        try
        {
            await updateStatusMutation.mutateAsync({ id: bookingId, status: booking.status, internalNotes: noteInput.trim() });
            setNoteInput('');
            toast.success('Note added');
        } catch (err: any) { toast.error(getErrorMessage(err, 'Failed to add note')); }
    };

    const requestConfirm = () => openModal({
        title: 'Confirm Booking',
        message: 'This will increment booked seats on the tour date and send a confirmation email + notification to the customer. Are you sure?',
        confirmLabel: 'Confirm Booking',
        confirmColor: '#fff', confirmBg: '#111', confirmBorder: '#111',
        icon: <ShieldCheck size={18} style={{ color: '#16a34a' }} />,
        action: async () => {
            try { await confirmMutation.mutateAsync(bookingId); toast.success('Booking confirmed'); }
            catch (err: any) { toast.error(getErrorMessage(err, 'Failed to confirm')); }
        },
    });

    const requestCancel = () => openModal({
        title: 'Cancel Booking',
        message: 'This will restore seat availability, release any coupon, and notify the customer. This action cannot be undone.',
        confirmLabel: 'Cancel Booking',
        confirmColor: '#991b1b', confirmBg: '#fee2e2', confirmBorder: '#fca5a5',
        icon: <AlertTriangle size={18} style={{ color: '#dc2626' }} />,
        action: async () => {
            try { await cancelMutation.mutateAsync(bookingId); toast.success('Booking cancelled'); }
            catch (err: any) { toast.error(getErrorMessage(err, 'Failed to cancel')); }
        },
    });

    const requestStatusOverride = (newStatus: string) => {
        const isDangerous = newStatus === BookingStatus.CANCELLED;
        openModal({
            title: `Override Status → ${getBookingStatusLabel(newStatus)}`,
            message: isDangerous
                ? 'WARNING: Changing to Cancelled via override will NOT restore seats or release coupons. Use the Cancel button for proper cancellation. Continue anyway?'
                : `This will manually set the booking status to "${getBookingStatusLabel(newStatus)}". Status overrides skip normal validation workflows. Continue?`,
            confirmLabel: `Set ${getBookingStatusLabel(newStatus)}`,
            confirmColor: isDangerous ? '#991b1b' : '#4f46e5',
            confirmBg: isDangerous ? '#fee2e2' : '#eef2ff',
            confirmBorder: isDangerous ? '#fca5a5' : '#c7d2fe',
            icon: <AlertTriangle size={18} style={{ color: isDangerous ? '#dc2626' : '#f59e0b' }} />,
            action: async () => {
                try
                {
                    await updateStatusMutation.mutateAsync({ id: bookingId, status: newStatus });
                    toast.success(`Status → ${getBookingStatusLabel(newStatus)}`);
                } catch (err: any) { toast.error(getErrorMessage(err, 'Failed to update status')); }
            },
        });
    };

    const handleVerifySubmit = async () => {
        if (!approveTarget || isProcessing) return;
        setIsProcessing(true);
        try
        {
            await import('@lib/api/admin/payments.api').then(m => m.adminPaymentsApi.verify(approveTarget.id));
            toast.success('✓ Payment approved — booking confirmed');
            setApproveTarget(null);
            refetch();
        } catch (err: any)
        {
            toast.error(getErrorMessage(err, 'Failed to approve payment'));
        } finally
        {
            setIsProcessing(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectTarget || !rejectReason.trim() || isProcessing) return;
        setIsProcessing(true);
        try
        {
            await import('@lib/api/admin/payments.api').then(m => m.adminPaymentsApi.reject(rejectTarget.id, rejectReason.trim()));
            toast.success('Payment rejected — user notified');
            setRejectTarget(null);
            setRejectReason('');
            refetch();
        } catch (err: any)
        {
            toast.error(getErrorMessage(err, 'Failed to reject payment'));
        } finally
        {
            setIsProcessing(false);
        }
    };

    const requestVerifyTransaction = (approve: boolean, transactionId?: string) => {
        const target = transactionId
            ? paymentHistory.find((p: any) => p._id === transactionId)
            : paymentHistory.find((p: any) => p.status === 'PENDING');

        if (!target)
        {
            toast.error('No pending transaction found');
            return;
        }

        if (approve)
        {
            setApproveTarget({
                id: target._id,
                amount: target.amount,
                transactionId: target.transactionId || target._id.slice(-8)
            });
        } else
        {
            setRejectTarget({
                id: target._id,
                bookingNum: booking.bookingNumber || target._id.slice(-6)
            });
        }
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(paymentAmount);
        if (!amount || amount <= 0) return toast.error('Enter a valid amount');
        if (amount > (booking?.pendingAmount || 0)) return toast.error('Amount exceeds pending balance');
        if (!paymentNotes.trim()) return toast.error('Internal notes are required for manual payments');
        try
        {
            await addPaymentMutation.mutateAsync({
                bookingId,
                amount,
                paymentMethod,
                notes: paymentNotes.trim(),
                receiptNumber: receiptNumber.trim() || undefined
            });
            toast.success(`${formatCurrency(amount)} recorded via ${paymentMethod}`);
            setShowPaymentForm(false);
            setPaymentAmount('');
            setPaymentMethod('Cash');
            setPaymentNotes('');
            setReceiptNumber('');
        } catch (err: any) { toast.error(getErrorMessage(err, 'Failed to record payment')); }
    };

    /* ── loading / not found ── */
    if (isLoading) return (
        <div className="p-5 text-center text-muted">
            <div className="spinner-border spinner-border-sm me-2" role="status" />Loading booking...
        </div>
    );
    if (!booking) return <div className="p-5 text-center text-muted">Booking not found.</div>;

    /* ── derived values ── */
    const isFullyPaid = (booking.paidAmount || 0) >= booking.totalAmount;

    // Find the most relevant pending transaction with an image
    const pendingPayment = paymentHistory.find((p: any) =>
        (p.status === 'PENDING') && p.receiptImage
    ) || paymentHistory.find((p: any) => p.status === 'PENDING');

    // Ensure booking.receiptImage is populated for the UI if missing at top level
    if (!booking.receiptImage && pendingPayment?.receiptImage)
    {
        booking.receiptImage = pendingPayment.receiptImage;
    }

    const hasPendingReceipt = !!pendingPayment && (pendingPayment.status === 'PENDING');
    const paidPct = Math.min(100, Math.round(((booking.paidAmount || 0) / booking.totalAmount) * 100)) || 0;

    // Financial Calculation Refinements
    const receiptsVerified = (booking.paidAmount || 0); // Already synced in backend
    const receiptsPending = paymentHistory.reduce((acc: number, pt: any) =>
        (pt.type !== TransactionType.REFUND && pt.status === 'PENDING') ? acc + (pt.amount || 0) : acc, 0);

    const refundsVerified = (booking.refundAmount || 0);
    const netPaidAmount = receiptsVerified - refundsVerified;
    const totalReceiptsClaimed = receiptsVerified + receiptsPending;

    const claimedPct = Math.min(100, Math.round((totalReceiptsClaimed / booking.totalAmount) * 100)) || 0;
    const remainingToPay = Math.max(0, booking.totalAmount - netPaidAmount - receiptsPending);

    const notes: any[] = Array.isArray(booking.internalNotes) ? booking.internalNotes : [];
    const canConfirm = booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.CANCELLED;
    const canCancel = booking.status !== BookingStatus.CANCELLED && booking.status !== BookingStatus.COMPLETED;

    return (
        <div className="togo-dashboard-booking-sec pt-40 pb-60" style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <div className="container container-1440">

                {/* ── Breadcrumbs & Back ── */}
                <div className="mb-4 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: 13, fontWeight: 600 }}>
                        <Link href="/admin/dashboard" className="text-muted text-decoration-none hover-indigo transition-colors">Dashboard</Link>
                        <span className="text-muted opacity-50">/</span>
                        <Link href="/admin/bookings" className="text-muted text-decoration-none hover-indigo transition-colors">Bookings</Link>
                        <span className="text-muted opacity-50">/</span>
                        <span style={{ color: '#4f46e5' }}>Details</span>
                    </div>
                    <button onClick={() => refetch()} className="btn btn-white btn-sm d-inline-flex align-items-center gap-1"
                        style={{ borderRadius: 8, fontWeight: 700, fontSize: 12, border: '1px solid #e2e8f0', background: '#fff' }}>
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Refresh Data
                    </button>
                </div>

                {/* ── Main Header Area ── */}
                <div className="row align-items-center mb-4 g-3">
                    <div className="col-lg-8">
                        <div className="d-flex align-items-center gap-3">
                            {/* <div className="d-flex align-items-center justify-content-center" style={{ width: 56, height: 56, borderRadius: 18, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                <FileText size={28} style={{ color: '#4f46e5' }} />
                            </div> */}
                            <div>
                                <h3 className="mb-1 fw-black" style={{ fontSize: 30, color: '#0f172a', letterSpacing: '-0.02em' }}>
                                    Booking #{booking.bookingNumber || booking._id?.slice(-8)}
                                </h3>
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <span className={`px-2 py-1 rounded fw-bold text-uppercase ${getStatusBadgeClass(booking.status)}`} style={{ fontSize: 10, letterSpacing: '0.05em' }}>
                                        {getBookingStatusLabel(booking.status)}
                                    </span>
                                    <span className="text-muted small d-flex align-items-center gap-1">
                                        <Clock size={12} /> Created {DateUtils.formatToIST(booking.createdAt, 'DD MMM YYYY, hh:mm A')}
                                    </span>
                                    <span className="text-muted small d-flex align-items-center gap-1">
                                        • Ref: <code style={{ fontSize: 11, background: '#f8fafc', padding: '2px 6px', borderRadius: 4, color: '#4f46e5' }}>{booking._id}</code>
                                    </span>
                                    {hasPendingReceipt && (
                                        <span className="px-2 py-1 rounded fw-bold d-flex align-items-center gap-1" style={{ fontSize: 10, background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5' }}>
                                            <AlertTriangle size={10} /> Receipt Pending Review
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">

                    {/* ═══════════════ LEFT COLUMN ═══════════════ */}
                    <div className="col-xl-8">

                        {/* 1. Tour & Overview */}
                        <SectionCard>
                            <SectionTitle icon={<FileText size={18} />} title="Tour & Booking Overview" />
                            <div className="row g-3">
                                <div className="col-md-6"><InfoBox label="Tour Package" value={booking.tour?.title} /></div>
                                <div className="col-md-6">
                                    <InfoBox label="Departure Date"
                                        value={booking.tourDate?.startDate
                                            ? DateUtils.formatToIST(booking.tourDate.startDate, 'DD MMMM YYYY')
                                            : 'Flexible'} />
                                </div>
                                <div className="col-md-6">
                                    <InfoBox label="Return Date"
                                        value={booking.tourDate?.endDate
                                            ? DateUtils.formatToIST(booking.tourDate.endDate, 'DD MMMM YYYY')
                                            : '—'} />
                                </div>
                                <div className="col-md-6">
                                    <InfoBox label="Pickup Point"
                                        value={booking.pickupOption
                                            ? (booking.pickupOption.type === 'LAND_PACKAGE'
                                                ? `${booking.pickupOption.fromCity || ''} (Land Package)`
                                                : `${booking.pickupOption.fromCity || ''} \u2014 ${booking.pickupOption.toCity || ''} (${getPickupTypeLabel(booking.pickupOption.type)})`)
                                            : 'Default (Direct)'} />
                                </div>
                                <div className="col-md-6">
                                    <InfoBox label="Customer Name" value={(booking.user as any)?.name || 'Guest User'} />
                                </div>
                                <div className="col-md-6">
                                    <InfoBox label="Contact Email" value={
                                        (booking.user as any)?._id ? (
                                            <Link href={`/admin/users/${(booking.user as any)?._id}`} className="text-decoration-none" style={{ color: '#4f46e5', fontWeight: 600 }}>
                                                {(booking.user as any)?.email || '—'}
                                            </Link>
                                        ) : ((booking.user as any)?.email || '—')
                                    } />
                                </div>
                                {booking.additionalRequests && (
                                    <div className="col-12 ">
                                        <InfoBox label="Additional Requests" value={booking.additionalRequests} />
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Financial Breakdown */}
                        <SectionCard>
                            <SectionTitle
                                icon={<CreditCard size={18} style={{ color: '#4f46e5' }} />}
                                title="Financial Breakdown"
                            />
                            <div className="p-4" style={{ borderRadius: 16, border: '1px dashed #cbd5e1', background: '#fff' }}>
                                <div className="d-flex flex-column gap-2 mb-1">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span style={{ fontSize: 13, color: '#64748b' }}>
                                            Base Fare ({booking.totalTravelers} &times; {formatCurrency(booking.baseAmount || 0)})
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                                            {formatCurrency((booking.baseAmount || 0) * booking.totalTravelers)}
                                        </span>
                                    </div>

                                    {booking.pickupOption && booking.pickupOption.priceAdjustment > 0 && (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span style={{ fontSize: 13, color: '#64748b' }}>
                                                Extra Add-on ({booking.pickupOption.type}) ({booking.totalTravelers} &times; {formatCurrency(booking.pickupOption.priceAdjustment)})
                                            </span>
                                            <span style={{ fontWeight: 600, fontSize: 14, color: '#4f46e5' }}>
                                                {formatCurrency(booking.pickupOption.priceAdjustment * booking.totalTravelers)}
                                            </span>
                                        </div>
                                    )}

                                    {booking.discountAmount > 0 && (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span style={{ fontSize: 13, color: '#64748b' }}>
                                                Discount ({booking.couponCode || 'Promo'})
                                            </span>
                                            <span style={{ fontWeight: 600, fontSize: 14, color: '#ef4444' }}>
                                                −{formatCurrency(booking.discountAmount)}
                                            </span>
                                        </div>
                                    )}

                                    {typeof booking.taxAmount === 'number' && booking.taxAmount > 0 && (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span style={{ fontSize: 13, color: '#64748b' }}>
                                                GST ({booking.taxRate || 5}%)
                                            </span>
                                            <span style={{ fontWeight: 600, fontSize: 14, color: '#64748b' }}>
                                                {formatCurrency(booking.taxAmount)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ height: 1, backgroundColor: '#e2e8f0', width: '100%', marginTop: '10px' }}></div>

                                <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                                    <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Total Amount</span>
                                    <span style={{ fontWeight: 800, fontSize: 24, color: '#4f46e5', letterSpacing: '-0.02em' }}>
                                        {formatCurrency(booking.totalAmount)}
                                    </span>
                                </div>

                                {/* <div style={{ height: 1, backgroundColor: '#e2e8f0', width: '100%', margin: '20px 0' }}></div> */}

                                <div className="d-flex justify-content-between align-items-center mb-2 mt-4">
                                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Payment Progress</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>
                                        {paidPct}% verified {receiptsPending > 0 ? `(+${Math.round((receiptsPending / (booking.totalAmount || 1)) * 100)}% reviewing)` : ''}
                                    </span>
                                </div>

                                <div className="w-100 mb-2 d-flex" style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ width: `${paidPct}%`, background: '#22c55e', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                    {receiptsPending > 0 && (
                                        <div style={{ width: `${Math.round((receiptsPending / (booking.totalAmount || 1)) * 100)}%`, background: '#f59e0b', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                    )}
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        NET PAID: {formatCurrency(netPaidAmount)}
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        REVIEWING: {formatCurrency(receiptsPending)}
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        REMAINING: {formatCurrency(remainingToPay)}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* 2. Travelers Table */}
                        {booking.travelers?.length > 0 && (
                            <SectionCard>
                                <SectionTitle
                                    icon={<Users size={18} />}
                                    title={`Traveler Details (${booking.totalTravelers})`}
                                />
                                <div className="table-responsive" style={{ borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                                    <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                                        <thead style={{ background: '#f8fafc' }}>
                                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                {['#', 'Full Name', 'Age', 'Gender', 'Phone', 'ID Number'].map(h => (
                                                    <th key={h} className="py-3 px-3" style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {booking.travelers.map((t: any, i: number) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td className="px-3 py-3 text-muted" style={{ fontSize: 12, fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</td>
                                                    <td className="px-3 py-3 fw-bold" style={{ fontSize: 14, color: '#1e293b' }}>{t.fullName}</td>
                                                    <td className="px-3 py-3" style={{ fontSize: 13, color: '#64748b' }}>{t.age} yrs</td>
                                                    <td className="px-3 py-3" style={{ fontSize: 13, color: '#64748b' }}>{getGenderLabel(t.gender)}</td>
                                                    <td className="px-3 py-3" style={{ fontSize: 13, color: '#64748b' }}>{t.phone || '—'}</td>
                                                    <td className="px-3 py-3 text-muted" style={{ fontSize: 12, fontFamily: 'monospace' }}>{t.idNumber || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard>
                        )}

                        {/* 4. Receipt / Payment Proof */}
                        {booking.receiptImage && (
                            <div className="mb-4" style={{
                                borderRadius: 12,
                                border: hasPendingReceipt ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                                background: '#fff',
                                padding: '20px'
                            }}>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <FileText size={18} style={{ color: '#f59e0b' }} />
                                            <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Payment Proof</span>
                                        </div>
                                        {hasPendingReceipt && (
                                            <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                                                Awaiting Approval
                                            </span>
                                        )}
                                    </div>
                                    <a href={getImgUrl(booking.receiptImage)} target="_blank" rel="noopener noreferrer"
                                        className="btn btn-sm d-inline-flex align-items-center gap-2"
                                        style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#475569', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                                        <ExternalLink size={14} /> Full Size
                                    </a>
                                </div>

                                <div className="row g-4">
                                    <div className="col-md-5">
                                        <a href={getImgUrl(booking.receiptImage)} target="_blank" rel="noopener noreferrer" className="d-block h-100">
                                            <div className="position-relative overflow-hidden h-100 d-flex align-items-center justify-content-center" style={{ borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', padding: '12px' }}>
                                                <img src={getImgUrl(booking.receiptImage)} alt="Payment Proof"
                                                    style={{ width: '100%', maxHeight: 290, objectFit: 'contain' }} />
                                            </div>
                                        </a>
                                    </div>
                                    <div className="col-md-7">
                                        <div className="d-flex flex-column h-100 justify-content-between">
                                            <div className="d-flex flex-column gap-3 mb-4">
                                                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 6 }}>
                                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>TRANSACTION ID / UTR</div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{pendingPayment?.transactionId || booking.transactionId || '—'}</div>
                                                </div>
                                                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 6 }}>
                                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>PAYMENT METHOD</div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{pendingPayment?.paymentMethod || booking.paymentType || '—'}</div>
                                                </div>
                                                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 6 }}>
                                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>AMOUNT CLAIMED</div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{formatCurrency(pendingPayment?.amount ?? (booking.paidAmount || booking.totalAmount || 0))}</div>
                                                </div>
                                            </div>

                                            {/* Approve / Reject buttons */}
                                            {hasPendingReceipt && (
                                                <div className="d-flex gap-3 mt-auto">
                                                    <button
                                                        onClick={() => requestVerifyTransaction(true)}
                                                        disabled={isProcessing}
                                                        className="btn flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                                                        style={{ background: '#d1fae5', color: '#059669', border: '1px solid #6ee7b7', borderRadius: 6, fontWeight: 600, fontSize: 14, padding: '10px 0' }}>
                                                        {isProcessing ? (
                                                            <div className="spinner-border spinner-border-sm" role="status" />
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 size={16} />
                                                                Approve
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => requestVerifyTransaction(false)}
                                                        disabled={isProcessing}
                                                        className="btn flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                                                        style={{ background: '#fee2e2', color: '#e11d48', border: '1px solid #fca5a5', borderRadius: 6, fontWeight: 600, fontSize: 14, padding: '10px 0' }}>
                                                        {isProcessing ? (
                                                            <div className="spinner-border spinner-border-sm" role="status" />
                                                        ) : (
                                                            <>
                                                                <XCircle size={16} />
                                                                Reject
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}

                                            {!hasPendingReceipt && booking.paymentVerifiedAt && (
                                                <div className="p-3 d-flex align-items-center gap-3 mt-1" style={{ background: '#f0fdf4', borderRadius: 16, border: '1px solid #d1fae5' }}>
                                                    <div className="d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, borderRadius: 12, background: '#10b981', color: '#fff' }}>
                                                        <ShieldCheck size={20} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: 14, color: '#065f46' }}>Verified Receipt</div>
                                                        <div style={{ fontSize: 12, color: '#059669' }}>Approved on {DateUtils.formatToIST(booking.paymentVerifiedAt, 'DD MMM YYYY, hh:mm A')}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. Payment History */}
                        {paymentHistory.length > 0 && (
                            <SectionCard>
                                <SectionTitle icon={<Clock size={16} style={{ color: '#4f46e5' }} />} title="Payment History" />
                                <div className="table-responsive">
                                    <table className="table mb-0" style={{ fontSize: 13, borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                        <thead>
                                            <tr className="text-secondary" style={{ borderBottom: '1px solid #eee' }}>
                                                <th className="px-3 py-2 fw-bold" style={{ fontSize: 11, letterSpacing: '0.5px' }}>DATE</th>
                                                <th className="px-3 py-2 fw-bold" style={{ fontSize: 11, letterSpacing: '0.5px' }}>TYPE</th>
                                                <th className="px-3 py-2 fw-bold" style={{ fontSize: 11, letterSpacing: '0.5px' }}>AMOUNT</th>
                                                <th className="px-3 py-2 fw-bold" style={{ fontSize: 11, letterSpacing: '0.5px' }}>STATUS</th>
                                                <th className="px-3 py-2 fw-bold" style={{ fontSize: 11, letterSpacing: '0.5px' }}>METHOD</th>
                                                <th className="px-3 py-2 fw-bold" style={{ fontSize: 11, letterSpacing: '0.5px' }}>DETAILS</th>
                                                <th className="px-3 py-2 fw-bold text-end" style={{ fontSize: 11, letterSpacing: '0.5px' }}>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paymentHistory.map((pt: any, i: number) => (
                                                <tr key={i} style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderRadius: 10 }}>
                                                    <td className="px-3 py-3 text-muted align-middle" style={{ borderBottom: '1px solid #f8f9fa' }}>
                                                        {DateUtils.formatToIST(pt.createdAt, 'DD MMM YYYY')}<br />
                                                        <small>{DateUtils.formatToIST(pt.createdAt, 'hh:mm A')}</small>
                                                    </td>
                                                    <td className="px-3 py-3 align-middle" style={{ borderBottom: '1px solid #f8f9fa' }}>
                                                        <span style={{
                                                            fontSize: 10,
                                                            fontWeight: 800,
                                                            padding: '3px 8px',
                                                            borderRadius: 6,
                                                            background: pt.type === TransactionType.REFUND ? '#fef2f2' : pt.type === TransactionType.OFFLINE_PAYMENT ? '#f0f9ff' : '#f5f3ff',
                                                            color: pt.type === TransactionType.REFUND ? '#991b1b' : pt.type === TransactionType.OFFLINE_PAYMENT ? '#075985' : '#5b21b6',
                                                            boxShadow: 'inset 0 0 0 1px currentColor'
                                                        }}>
                                                            {pt.type === TransactionType.REFUND ? 'REFUND' : pt.type === TransactionType.OFFLINE_PAYMENT ? 'OFFLINE' : 'ONLINE'}
                                                        </span>
                                                    </td>
                                                    <td className={`px-3 py-3 fw-bold align-middle ${pt.type === TransactionType.REFUND ? 'text-danger' : pt.status === 'REJECTED' ? 'text-danger' : ''}`} style={{ borderBottom: '1px solid #f8f9fa', fontSize: 14 }}>
                                                        <span style={{
                                                            whiteSpace: 'nowrap',
                                                            color: pt.status === 'SUCCESS' ? '#10b981' : (pt.status === 'FAILED' || pt.status === 'PENDING') ? '#f59e0b' : undefined
                                                        }}>
                                                            {pt.type === TransactionType.REFUND ? '−' : ''}{formatCurrency(pt.amount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 align-middle" style={{ borderBottom: '1px solid #f8f9fa' }}>
                                                        <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-1 fw-bold text-uppercase" style={{
                                                            fontSize: 9,
                                                            background: pt.status === 'SUCCESS' ? '#d1fae5' : pt.status === 'REJECTED' || (pt.type === TransactionType.REFUND && pt.status === 'SUCCESS') ? '#fee2e2' : pt.status === 'FAILED' ? '#fef3c7' : '#fef3c7',
                                                            color: pt.status === 'SUCCESS' ? '#065f46' : pt.status === 'REJECTED' || (pt.type === TransactionType.REFUND && pt.status === 'SUCCESS') ? '#991b1b' : pt.status === 'FAILED' ? '#92400e' : '#92400e'
                                                        }}>
                                                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                                                            {pt.type === TransactionType.REFUND && pt.status === 'SUCCESS' ? 'PROCESSED' : pt.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 align-middle text-dark fw-medium" style={{ borderBottom: '1px solid #f8f9fa' }}>
                                                        {pt.paymentMethod || pt.method || '—'}
                                                    </td>

                                                    <td className="px-3 py-3 align-middle text-muted" style={{ borderBottom: '1px solid #f8f9fa', fontSize: 12, maxWidth: 200 }}>
                                                        {pt.type === TransactionType.REFUND ? (pt.description || 'Refund processed') : pt.offlineReceiptNumber ? `Ref: ${pt.offlineReceiptNumber}` : pt.transactionId ? `Tx: ${pt.transactionId}` : pt.description || '—'}
                                                    </td>
                                                    <td className="px-3 py-3 align-middle text-end" style={{ borderBottom: '1px solid #f8f9fa' }}>
                                                        {/* {(pt.status === 'PENDING') && (
                                                            <div className="d-flex justify-content-end gap-1">
                                                                <button onClick={() => requestVerifyTransaction(true, pt._id)} className="btn btn-sm btn-outline-success border-0 px-2" title="Approve">
                                                                    <CheckCircle2 size={16} />
                                                                </button>
                                                                <button onClick={() => requestVerifyTransaction(false, pt._id)} className="btn btn-sm btn-outline-danger border-0 px-2" title="Reject">
                                                                    <XCircle size={16} />
                                                                </button>
                                                            </div>
                                                        )} */}
                                                        {pt.receiptImage && (
                                                            <a href={getImgUrl(pt.receiptImage)} target="_blank" className="btn btn-sm btn-light border-0 ms-1" style={{ fontSize: 10 }}>View Receipt</a>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </SectionCard>
                        )}

                    </div >

                    {/* ═══════════════ RIGHT COLUMN ═══════════════ */}
                    <div className="col-xl-4">



                        {/* 5. Payment Status Summary Card */}
                        <div className="mb-4 overflow-hidden" style={{ background: '#fff', border: isFullyPaid ? '1px solid #bbf7d0' : '1px solid #e2e8f0', borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div className="p-3 px-4">
                                <div className="d-flex align-items-center gap-2 mb-3 mt-1">
                                    <FileText size={20} style={{ color: '#10b981' }} />
                                    <h6 className="mb-0 fw-bold" style={{ fontSize: 16, color: '#0f172a' }}>Payment Overview</h6>
                                </div>

                                <div className="d-flex flex-column gap-2 mb-3 pb-1">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Total Amount</span>
                                        <span style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>{formatCurrency(booking.totalAmount)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Amount Paid</span>
                                        <span style={{ fontWeight: 800, fontSize: 14, color: '#10b981' }}>{formatCurrency(netPaidAmount)}</span>
                                    </div>
                                    {refundsVerified > 0 && (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Refunded</span>
                                            <span style={{ fontWeight: 800, fontSize: 14, color: '#ef4444' }}>−{formatCurrency(refundsVerified)}</span>
                                        </div>
                                    )}
                                    {receiptsPending > 0 && (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span style={{ fontSize: 13, fontWeight: 500, color: '#d97706' }}>Awaiting Review</span>
                                            <span style={{ fontWeight: 800, fontSize: 14, color: '#b45309' }}>{formatCurrency(receiptsPending)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="px-3 py-2 rounded-2 mt-1 mb-3 d-flex justify-content-between align-items-center"
                                    style={{
                                        background: remainingToPay > 0 ? '#f8fafc' : '#22c55e',
                                        border: remainingToPay > 0 ? '1px solid #e2e8f0' : 'none',
                                        color: remainingToPay > 0 ? '#0f172a' : '#fff'
                                    }}>
                                    <span style={{ fontSize: 14, fontWeight: remainingToPay > 0 ? 600 : 500 }}>Remaining Balance</span>
                                    <span style={{ fontSize: 16, fontWeight: 800 }}>{formatCurrency(remainingToPay)}</span>
                                </div>

                                <div className="pt-2 text-center" style={{ borderTop: isFullyPaid ? '1px solid #bbf7d0' : '1px solid #e2e8f0' }}>
                                    {isFullyPaid ? (
                                        <span className="d-inline-flex align-items-center gap-1" style={{ color: '#059669', fontSize: 14, fontWeight: 700 }}>
                                            <CheckCircle2 size={15} strokeWidth={3} /> Fully Paid
                                        </span>
                                    ) : (
                                        <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                                            {paidPct}% Paid
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 7. Management Actions */}
                        <SectionCard>
                            <SectionTitle icon={< ShieldCheck size={18} />} title="Management Actions" />
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex gap-2">
                                    <button onClick={requestConfirm} disabled={!canConfirm || confirmMutation.isPending}
                                        className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                        style={{
                                            borderRadius: 12, height: 46, fontWeight: 700, fontSize: 14,
                                            background: !canConfirm ? '#ecfdf5' : '#1e1b4b',
                                            color: !canConfirm ? '#059669' : '#fff',
                                            border: !canConfirm ? '1px solid #a7f3d0' : 'none'
                                        }}>
                                        {booking.status === BookingStatus.CONFIRMED ? <><ShieldCheck size={18} /> Already Confirmed</> : 'Confirm Order'}
                                    </button>
                                    {canCancel && (
                                        <button onClick={requestCancel} disabled={cancelMutation.isPending}
                                            className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                            style={{
                                                borderRadius: 12, height: 46, fontWeight: 700, fontSize: 14,
                                                background: '#fef2f2',
                                                color: '#b91c1c',
                                                border: '1px solid #fecaca'
                                            }}>
                                            <XCircle size={18} /> Cancel
                                        </button>
                                    )}
                                </div>

                                <div className="mt-3">
                                    <div className="mb-3" style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Manual Status Override
                                    </div>
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {Object.values(BookingStatus).map(s => {
                                            const isActive = booking.status === s;
                                            return (
                                                <button key={s} onClick={() => requestStatusOverride(s)}
                                                    disabled={isActive || updateStatusMutation.isPending}
                                                    className="btn btn-sm"
                                                    style={{
                                                        fontSize: 13, fontWeight: 700, borderRadius: 8, padding: '6px 14px',
                                                        background: '#fff',
                                                        border: isActive ? '1px solid #818cf8' : '1px solid #e2e8f0',
                                                        color: isActive ? '#6366f1' : '#475569'
                                                    }}>
                                                    {getBookingStatusLabel(s)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="d-flex align-items-center gap-2" style={{ color: '#f59e0b', fontSize: 12, fontWeight: 500 }}>
                                        <AlertTriangle size={14} /> Status overrides skip validation workflows.
                                    </div>
                                </div>

                                <button onClick={() => setShowPaymentForm(!showPaymentForm)}
                                    className="btn btn-white w-100 d-flex align-items-center justify-content-center gap-2"
                                    style={{ borderRadius: 14, height: 48, fontWeight: 700, border: '1px solid #e2e8f0' }}>
                                    <CreditCard size={18} /> {showPaymentForm ? 'Cancel Payment' : 'Record Payment'}
                                </button>
                            </div>

                            {showPaymentForm && (
                                <form onSubmit={handleAddPayment} className="mt-4 p-3" style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Amount to Record</label>
                                        <input type="number" className="form-control" placeholder="0.00" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Method</label>
                                        <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                            <option value="Cash">Cash</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Card">Card</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Ref # / Receipt #</label>
                                        <input type="text" className="form-control" placeholder="UTR, Check #, etc." value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Internal Notes</label>
                                        <textarea className="form-control" rows={2} value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Required for reporting" required />
                                    </div>
                                    <button type="submit" disabled={addPaymentMutation.isPending} className="btn btn-indigo w-100 py-3 rounded-4 fw-bold shadow-sm">
                                        {addPaymentMutation.isPending ? 'Saving...' : 'Confirm Payment'}
                                    </button>
                                </form>
                            )}
                        </SectionCard>

                        {/* 8. Internal Timeline / Notes */}
                        <SectionCard>
                            <SectionTitle icon={<Clock size={18} />} title="Internal Notes" />

                            <div className="mb-4">
                                <textarea className="form-control mb-2" rows={3}
                                    placeholder="Add a private note..."
                                    value={noteInput}
                                    onChange={e => setNoteInput(e.target.value)}
                                    style={{ borderRadius: 16, fontSize: 13, background: '#f8fafc', border: '1px solid #e2e8f0', resize: 'none' }} />
                                <button onClick={handleAddNote} disabled={!noteInput.trim() || updateStatusMutation.isPending}
                                    className="btn btn-indigo w-100 py-2 rounded-3 fw-bold" style={{ fontSize: 13 }}>
                                    Post Note
                                </button>
                            </div>

                            <div className="timeline-container ps-2" style={{ maxHeight: 300, overflowY: 'auto' }}>
                                {notes.length > 0 ? [...notes].reverse().map((n: any, i: number) => (
                                    <div key={i} className="mb-4 position-relative ps-4" style={{ borderLeft: '2px solid #f1f5f9' }}>
                                        <div className="position-absolute" style={{ left: -7, top: 4, width: 12, height: 12, borderRadius: '50%', background: '#6366f1', border: '2px solid #fff' }} />
                                        <p className="mb-1" style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>{typeof n === 'string' ? n : n.note}</p>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                                            {n.createdAt ? DateUtils.formatToIST(n.createdAt, 'DD MMM, hh:mm A') : 'System'}
                                        </span>
                                    </div>
                                )) : <div className="text-center py-3 text-muted small fw-bold">No internal notes yet.</div>}
                            </div>
                        </SectionCard>
                    </div>
                </div >
            </div >

            {/* ── Modals ── */}
            < ConfirmModal
                open={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                confirmColor={confirmModal.confirmColor}
                confirmBg={confirmModal.confirmBg}
                confirmBorder={confirmModal.confirmBorder}
                icon={confirmModal.icon}
                loading={modalLoading}
                onConfirm={execModal}
                onCancel={closeModal}
            />

            {approveTarget && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                        <h6 className="mb-1 fw-bold text-success d-flex align-items-center gap-2">
                            <CheckCircle2 size={20} /> Approve Payment
                        </h6>
                        <p className="text-muted small mt-3 mb-0">Transaction amount: <strong className="text-dark">{formatCurrency(approveTarget.amount)}</strong></p>
                        <p className="text-muted small mt-1 mb-4">Are you sure you want to approve this payment?</p>
                        <div className="d-flex gap-2">
                            <button onClick={() => setApproveTarget(null)} className="btn btn-light flex-grow-1" style={{ borderRadius: 10, fontWeight: 600 }}>Cancel</button>
                            <button onClick={handleVerifySubmit} disabled={isProcessing} className="btn btn-success flex-grow-1 fw-bold" style={{ borderRadius: 10 }}>
                                {isProcessing ? '...' : 'Confirm Approval'}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {
                rejectTarget && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                            <h6 className="mb-1 fw-bold">Reject Payment</h6>
                            <p className="text-muted small mb-3">Please provide a reason for rejection.</p>
                            <textarea className="form-control mb-3" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason..." style={{ borderRadius: 10 }} />
                            <div className="d-flex gap-2">
                                <button onClick={() => { setRejectTarget(null); setRejectReason(''); }} className="btn btn-light flex-grow-1" style={{ borderRadius: 10 }}>Cancel</button>
                                <button onClick={handleRejectSubmit} disabled={!rejectReason.trim() || isProcessing} className="btn btn-danger flex-grow-1 fw-bold" style={{ borderRadius: 10 }}>
                                    {isProcessing ? '...' : 'Reject Receipt'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
