'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingById, useCancelBooking } from '@lib/hooks/useBookingHooks';
import { paymentsApi } from '@lib/api/payments.api';
import { BookingTraveler } from '@lib/types/booking.types';
import { BookingStatus, PaymentType, RefundStatus } from '@lib/constants/enums';
import { DateUtils } from '@lib/utils/date-utils';
import { getBookingStatusLabel, getStatusBadgeClass, getRefundStatusLabel, getRefundStatusBadgeClass } from '@lib/utils/enum-mappings';
import { ArrowLeft, UploadCloud, X, CreditCard, Building, CheckCircle, Clock, XCircle, Star, FileText, Image, RefreshCcw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImgUrl } from '@lib/utils/image';
import { useSettingsStore } from '@store/useSettingsStore';
import { useEffect } from 'react';
import ConfirmationModal from '@components/common/ConfirmationModal';
import RefundRequestModal from '@components/common/RefundRequestModal';
import { refundsApi } from '@lib/api/refunds.api';

// ─── Booking Lifecycle Timeline ─────────────────────────────────────────────

const LIFECYCLE_STEPS = [
    { key: BookingStatus.PENDING, label: 'Booking Created', icon: Clock },
    { key: 'PAYMENT', label: 'Payment Verified', icon: CreditCard },
    { key: BookingStatus.CONFIRMED, label: 'Confirmed', icon: CheckCircle },
    { key: BookingStatus.COMPLETED, label: 'Completed', icon: Star },
];

function BookingTimeline({ status, paymentType, receiptImage }: { status: string; paymentType?: string; receiptImage?: string }) {
    const s = status?.toUpperCase();
    const hasPaid = receiptImage || paymentType === PaymentType.ONLINE;

    const getStepState = (stepKey: string) => {
        if (s === BookingStatus.CANCELLED) return stepKey === 'PAYMENT' ? 'cancelled' : 'skipped';
        if (stepKey === BookingStatus.PENDING) return 'done';
        if (stepKey === 'PAYMENT')
        {
            if (s === BookingStatus.CONFIRMED || s === BookingStatus.COMPLETED) return 'done';
            if (hasPaid) return 'active';
            return 'pending';
        }
        if (stepKey === BookingStatus.CONFIRMED)
        {
            if (s === BookingStatus.CONFIRMED || s === BookingStatus.COMPLETED) return 'done';
            return 'pending';
        }
        if (stepKey === BookingStatus.COMPLETED)
        {
            if (s === BookingStatus.COMPLETED) return 'done';
            return 'pending';
        }
        return 'pending';
    };

    if (s === BookingStatus.CANCELLED)
    {
        return (
            <div className="d-flex align-items-center gap-2 p-3 rounded-3" style={{ backgroundColor: '#fff0ef' }}>
                <XCircle size={20} style={{ color: '#dc3545', flexShrink: 0 }} />
                <span className="fw-bold" style={{ color: '#dc3545' }}>This booking has been cancelled.</span>
            </div>
        );
    }

    return (
        <div className="d-flex align-items-center gap-2 py-3 overflow-auto" style={{ gap: 0 }}>
            {LIFECYCLE_STEPS.map((step, idx) => {
                const state = getStepState(step.key);
                const isLast = idx === LIFECYCLE_STEPS.length - 1;
                const Icon = step.icon;
                const colors = {
                    done: '#198754',
                    active: '#fd7e14',
                    pending: '#adb5bd',
                    cancelled: '#dc3545',
                    skipped: '#adb5bd',
                };
                const c = colors[state as keyof typeof colors] || '#adb5bd';

                return (
                    <div key={step.key} className="d-flex align-items-center" style={{ flexShrink: 0 }}>
                        <div className="d-flex flex-column align-items-center" style={{ minWidth: 70 }}>
                            <div className="d-flex align-items-center justify-content-center rounded-circle mb-1"
                                style={{ width: 34, height: 34, backgroundColor: c + '20', border: `2px solid ${c}` }}>
                                <Icon size={15} style={{ color: c }} />
                            </div>
                            <span style={{ fontSize: 10, color: c, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                                {step.label}
                            </span>
                        </div>
                        {!isLast && (
                            <div style={{ height: 2, width: 32, backgroundColor: state === 'done' ? '#198754' : '#dee2e6', marginBottom: 18 }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Refund Status Timeline ───────────────────────────────────────────────

const REFUND_STEPS = [
    { key: RefundStatus.REQUESTED, label: 'Refund Requested', icon: Clock },
    { key: RefundStatus.APPROVED, label: 'Refund Approved', icon: CheckCircle },
    { key: RefundStatus.PROCESSED, label: 'Amount Processed', icon: CreditCard },
];

function RefundTimeline({ status }: { status: string }) {
    const s = status?.toUpperCase();

    const getStepState = (stepKey: string) => {
        if (s === RefundStatus.REJECTED) return 'rejected';
        if (s === RefundStatus.PROCESSED) return 'done';
        if (s === RefundStatus.APPROVED)
        {
            if (stepKey === RefundStatus.REQUESTED || stepKey === RefundStatus.APPROVED) return 'done';
            return 'pending';
        }
        if (s === RefundStatus.REQUESTED)
        {
            if (stepKey === RefundStatus.REQUESTED) return 'done';
            return 'pending';
        }
        return 'pending';
    };

    if (s === RefundStatus.REJECTED)
    {
        return (
            <div className="d-flex align-items-center gap-2 p-3 rounded-3" style={{ backgroundColor: '#fff0ef' }}>
                <XCircle size={20} style={{ color: '#dc3545', flexShrink: 0 }} />
                <span className="fw-bold" style={{ color: '#dc3545' }}>Refund Request Rejected.</span>
            </div>
        );
    }

    return (
        <div className="d-flex align-items-center gap-2 py-3 overflow-auto" style={{ gap: 0 }}>
            {REFUND_STEPS.map((step, idx) => {
                const state = getStepState(step.key);
                const isLast = idx === REFUND_STEPS.length - 1;
                const Icon = step.icon;
                const colors = {
                    done: '#198754',
                    active: '#4f46e5',
                    pending: '#adb5bd',
                    rejected: '#dc3545',
                };
                const c = colors[state as keyof typeof colors] || '#adb5bd';

                return (
                    <div key={step.key} className="d-flex align-items-center" style={{ flexShrink: 0 }}>
                        <div className="d-flex flex-column align-items-center" style={{ minWidth: 80 }}>
                            <div className="d-flex align-items-center justify-content-center rounded-circle mb-1"
                                style={{ width: 34, height: 34, backgroundColor: c + '20', border: `2px solid ${c}` }}>
                                <Icon size={15} style={{ color: c }} />
                            </div>
                            <span style={{ fontSize: 10, color: c, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                                {step.label}
                            </span>
                        </div>
                        {!isLast && (
                            <div style={{ height: 2, width: 40, backgroundColor: state === 'done' ? '#198754' : '#dee2e6', marginBottom: 18 }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DashboardBookingDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const { settings, fetchSettings } = useSettingsStore();

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const { data: response, isLoading, error } = useBookingById(id);
    const booking = (response as any)?.data || response;
    const cancelMutation = useCancelBooking();

    const paymentSummary = booking?.paymentSummary || {};
    const paymentHistory = paymentSummary.payments || [];
    const pendingPayment = paymentHistory.find((p: any) => p.status === 'PENDING') || null;
    const rejectedTransaction = paymentHistory.find((p: any) => p.status === 'FAILED' && p.rejectionReason) || null;

    const queryClient = useQueryClient();
    const [selectedPct, setSelectedPct] = useState<number>(100);
    const getPaymentAmount = () => {
        if (selectedPct === 100) return pendingAmount;
        return Math.ceil((pendingAmount * selectedPct) / 100);
    };
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

    const refundMutation = useMutation({
        mutationFn: (reason: string) => refundsApi.request({ bookingId: id, reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings', id] });
            toast.success('Refund request submitted successfully');
            setIsRefundModalOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to submit refund request');
        }
    });

    const uploadReceiptMutation = useMutation({
        mutationFn: ({ file, txnId, paymentAmount }: { file: File, txnId: string, paymentAmount?: number }) => {
            return paymentsApi.submitProof({
                bookingId: id,
                transactionId: txnId || '',
                paymentMethod: 'UPI',
                receiptImage: file,
                paymentAmount: paymentAmount
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings', id] });
            queryClient.invalidateQueries({ queryKey: ['users', 'myBookings'] });
            toast.success('Receipt uploaded! Awaiting admin approval (1–2 business days).');
            setReceiptFile(null);
            setTransactionId('');
            setIsPaymentModalOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to upload receipt');
        }
    });

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Determine the amount based on current paid amount and total
        const remaining = booking.pendingAmount || 0;
        const total = booking.totalAmount || 0;
        const isInitialPartial = booking.paidAmount === 0 && booking.paymentType === PaymentType.PARTIAL;
        const pAmount = isInitialPartial ? (total / 2) : remaining;

        if (receiptFile) uploadReceiptMutation.mutate({
            file: receiptFile,
            txnId: transactionId,
            paymentAmount: pAmount
        });
    };

    const handleCancel = () => {
        setIsCancelModalOpen(true);
    };

    const confirmCancel = async () => {
        try
        {
            await cancelMutation.mutateAsync({ id });
            toast.success('Booking cancelled successfully');
            setIsCancelModalOpen(false);
        } catch (err: any)
        {
            toast.error(err?.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const tour = booking?.tour as any;
    const tourDate = booking?.tourDate as any;
    const user = booking?.user as any;

    // ─── Derived Conditions (Backend is source of truth) ────────────────────
    const isManualPayment = booking?.paymentType === PaymentType.OFFLINE || booking?.paymentType === PaymentType.PARTIAL;
    const isPending = booking?.status === BookingStatus.PENDING;
    const isConfirmed = booking?.status === BookingStatus.CONFIRMED;
    const isCompleted = booking?.status === BookingStatus.COMPLETED;
    const isCancelled = booking?.status === BookingStatus.CANCELLED;
    // Removed isOnHold check

    const isPaymentPending = (booking?.pendingAmount || 0) > 0;
    // Allow upload on PENDING or CONFIRMED if there is strictly still a pending amount and no current receipt is under review
    const canUploadReceipt = isPaymentPending && (isPending || isConfirmed) && !pendingPayment;
    // Receipt is under review only if image is present AND booking is still PENDING or CONFIRMED (for partials)
    const receiptUnderReview = !!pendingPayment;
    // Admin rejected receipt — booking moved to PENDING, receiptImage was cleared
    // ONLY show rejection if we don't have a newer success or review-pending payment, and if not fully confirmed
    const hasSuccessfulOrReviewingPayment = paymentHistory.some((p: any) => p.status === 'SUCCESS' || p.status === 'PENDING');
    const receiptRejected = !!rejectedTransaction && !isConfirmed && !isCompleted && !hasSuccessfulOrReviewingPayment;
    const canViewInvoice = isConfirmed || isCompleted;

    const tourStartDate = tourDate?.startDate ? new Date(tourDate.startDate) : null;
    const tourHasStarted = tourStartDate ? tourStartDate <= new Date() : false;
    const canCancel = (isPending || isConfirmed) && !tourHasStarted;

    // Settings-based payment info
    const upiId = settings?.businessDetails?.upiId || 'N/A';
    const bankDetails = (settings?.paymentDetails as any)?.bankAccountDetails || 'Contact support for bank details';
    const qrImageUrl = settings?.paymentDetails?.upiQrImageUrl;

    const fmtINR = (n: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

    if (isLoading) return (
        <div className="pt-50 pl-15 pr-15 text-center py-5 text-muted">Loading booking details…</div>
    );

    if (error || !booking) return (
        <div className="pt-50 pl-15 pr-15 text-center py-5">
            <p className="text-muted mb-4">Booking not found.</p>
            <Link href="/dashboard/bookings" className="togo-btn-primary">Back to Bookings</Link>
        </div>
    );

    const totalAmount = booking?.totalAmount || 0;
    const paidAmount = booking?.paidAmount || 0;
    const pendingAmount = booking?.pendingAmount || 0;

    // Calculate progress including pending review payments
    const totalClaimed = paymentHistory.reduce((acc: number, p: any) =>
        (p.status === 'SUCCESS' || p.status === 'PENDING') ? acc + (p.amount || 0) : acc, 0);
    const progressPct = Math.min(100, Math.round((totalClaimed / totalAmount) * 100)) || 0;

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <Link href="/dashboard/bookings" className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: 14, textDecoration: 'none' }}>
                                <ArrowLeft size={16} /> Back to Bookings
                            </Link>
                        </div>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-20">
                            <h4 className="togo-dashboard-account-title mb-0">Booking Detail</h4>
                            <div className="d-flex flex-wrap gap-2">
                                {canViewInvoice && (
                                    <Link href={`/dashboard/invoice/${booking._id}`} className="togo-btn-primary d-flex align-items-center gap-2 px-3 py-2" style={{ borderRadius: 8, fontSize: 13 }}>
                                        <FileText size={15} /> View Invoice
                                    </Link>
                                )}
                                {isCompleted && (
                                    <Link href={`/dashboard/reviews?bookingId=${booking._id}`} className="btn btn-dark d-flex align-items-center gap-2 px-3 py-2" style={{ borderRadius: 8, fontSize: 13 }}>
                                        <Star size={15} /> Leave a Review
                                    </Link>
                                )}
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelMutation.isPending}
                                    className="btn btn-outline-danger d-flex align-items-center gap-2 px-3 py-2"
                                    style={{ borderRadius: 8, fontSize: 13, borderWidth: 1 }}
                                >
                                    <XCircle size={15} /> {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Booking'}
                                </button>
                                {isCancelled && booking.paidAmount > 0 && (!booking.refundStatus || booking.refundStatus === RefundStatus.NONE) && (
                                    <button
                                        onClick={() => setIsRefundModalOpen(true)}
                                        className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
                                        style={{ borderRadius: 8, fontSize: 13 }}
                                    >
                                        <RefreshCcw size={15} /> Request Refund
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-8">
                        {/* Refund Status Section */}
                        {booking.refundStatus && booking.refundStatus !== RefundStatus.NONE && (
                            <div className="bg-white p-4 rounded-4 mb-4" style={{ boxShadow: '0 4px 25px rgba(0,0,0,0.08)' }}>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h5 className="fw-bold mb-1" style={{ fontSize: 17 }}>Refund Status</h5>
                                        <p className="text-muted small mb-0">Track your refund process here</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-pill fw-bold text-uppercase ${getRefundStatusBadgeClass(booking.refundStatus)}`} style={{ fontSize: 11 }}>
                                        {getRefundStatusLabel(booking.refundStatus)}
                                    </span>
                                </div>

                                <RefundTimeline status={booking.refundStatus} />

                                {(booking.refundAmount > 0 || booking.refundAdminNote) && (
                                    <div className="mt-3 p-3 rounded-3 bg-light border">
                                        {booking.refundAmount > 0 && (
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small fw-bold uppercase">Approved Refund Amount</span>
                                                <span className="fw-bold text-success" style={{ fontSize: 18 }}>{fmtINR(booking.refundAmount)}</span>
                                            </div>
                                        )}
                                        {booking.refundAdminNote && (
                                            <div className="mt-2 pt-2 border-top">
                                                <div className="text-muted small fw-bold mb-1 uppercase">Note from Administrator</div>
                                                <p className="mb-0 text-dark italic" style={{ fontSize: 13, lineHeight: 1.5 }}>
                                                    "{booking.refundAdminNote}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tour Card + Status */}
                        <div className="bg-white p-4 rounded-4 mb-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div className="d-flex gap-4 align-items-start mb-4">
                                <div style={{ width: 120, height: 90, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                                    <img src={getImgUrl(tour?.thumbnailImage || tour?.images?.[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <h5 className="mb-1 fw-bold" style={{ fontSize: 17 }}>{tour?.title || 'Tour'}</h5>
                                    <div className="text-muted mb-2" style={{ fontSize: 13 }}>{tour?.location}</div>
                                    <span className={`px-3 py-1 rounded-pill fw-medium ${getStatusBadgeClass(booking.status)}`} style={{ fontSize: 12 }}>
                                        {getBookingStatusLabel(booking.status)}
                                    </span>
                                    {tour?.brochureUrl && (
                                        <div className="mt-3">
                                            <a
                                                href={tour.brochureUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="d-flex align-items-center gap-2 text-danger text-decoration-none fw-bold"
                                                style={{ fontSize: 13 }}
                                            >
                                                <FileText size={16} />
                                                Download Tour Brochure (PDF)
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lifecycle Timeline */}
                            <BookingTimeline
                                status={booking.status}
                                paymentType={booking.paymentType}
                                receiptImage={booking.receiptImage}
                            />
                        </div>

                        {/* Unified Status Banner Section */}
                        {(receiptUnderReview || receiptRejected) && (
                            <div className={`p-4 rounded-4 mb-4 d-flex align-items-start gap-3 border shadow-sm transition-all`}
                                style={{
                                    backgroundColor: receiptUnderReview ? '#fffdf5' : '#fff5f5',
                                    borderColor: receiptUnderReview ? '#fef3c7' : '#fee2e2'
                                }}>
                                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        backgroundColor: receiptUnderReview ? '#fff8e1' : '#fff1f1',
                                        color: receiptUnderReview ? '#d97706' : '#dc2626'
                                    }}>
                                    {receiptUnderReview ? <Clock size={22} /> : <AlertTriangle size={22} />}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <h6 className="fw-bolder mb-0" style={{ color: receiptUnderReview ? '#92400e' : '#991b1b', fontSize: '15px' }}>
                                            {receiptUnderReview
                                                ? (pendingPayment?.amount ? `₹${pendingPayment.amount.toLocaleString('en-IN')} Receipt Under Review` : 'Payment Receipt Awaiting Approval')
                                                : 'Payment Receipt Rejected'}
                                        </h6>
                                        {receiptUnderReview && (
                                            <span className="badge rounded-pill" style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '10px' }}>
                                                1-2 Business Days
                                            </span>
                                        )}
                                    </div>
                                    <p className="mb-2" style={{ fontSize: '13px', color: receiptUnderReview ? '#78350f' : '#b91c1c', lineHeight: '1.5', fontWeight: 500 }}>
                                        {receiptUnderReview
                                            ? `We've received your receipt for ${pendingPayment?.amount ? `₹${pendingPayment.amount.toLocaleString('en-IN')}` : 'your payment'}. Our team is currently verifying the transaction. Your booking will be confirmed shortly.`
                                            : <span>Reason: <span className="fw-bold">{rejectedTransaction.rejectionReason}</span>. Please upload a clear and valid receipt to proceed.</span>}
                                    </p>
                                    <div className="d-flex gap-3 align-items-center mt-2 pt-2 border-top" style={{ borderColor: receiptUnderReview ? '#fef3c7' : '#fee2e2' }}>
                                        {receiptUnderReview && pendingPayment?.paymentReceiptImage && (
                                            <a href={getImgUrl(pendingPayment.paymentReceiptImage)} target="_blank" rel="noopener noreferrer"
                                                className="d-flex align-items-center gap-1 text-decoration-none fw-bold" style={{ fontSize: '12px', color: '#d97706' }}>
                                                <Image size={14} /> View Submitted Receipt
                                            </a>
                                        )}
                                        {receiptRejected && (
                                            <button onClick={() => setIsPaymentModalOpen(true)} className="btn btn-sm btn-danger px-3 py-1 fw-bold" style={{ fontSize: '12px', borderRadius: '6px' }}>
                                                Re-upload Receipt
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order & Contact Grid */}
                        <div className="bg-white p-4 rounded-4 mb-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div className="row g-4 d-flex">
                                {/* Order Summary */}
                                <div className="col-md-6 border-end pr-md-4">
                                    <h5 className="mb-4 fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: 13, letterSpacing: 1, color: 'var(--togo-theme-primary)', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                                        <FileText size={16} /> Order Summary
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-12 col-sm-6">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Order Number</div>
                                            <div className="fw-bold text-dark mt-1" style={{ fontSize: 14 }}>{booking.bookingNumber || '—'}</div>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Booking Date</div>
                                            <div className="fw-medium text-dark mt-1" style={{ fontSize: 14 }}>{DateUtils.formatToIST(booking.createdAt)}</div>
                                        </div>
                                        <div className="col-12">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tour</div>
                                            <div className="fw-medium text-dark mt-1" style={{ fontSize: 14 }}>{tour?.title || 'Tour'}</div>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Travel Date</div>
                                            <div className="fw-medium text-dark mt-1" style={{ fontSize: 14 }}>{DateUtils.formatToIST(tourDate?.startDate)}</div>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Duration</div>
                                            <div className="fw-medium text-dark mt-1" style={{ fontSize: 14 }}>
                                                {booking.pickupOption?.totalDays || tour?.duration?.days || 0} Days / {booking.pickupOption?.totalNights || tour?.duration?.nights || 0} Nights
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Package / Point</div>
                                            <div className="mt-1">
                                                <span className="bg-primary text-white px-2 py-1 rounded" style={{ fontSize: 12 }}>
                                                    {booking.pickupOption
                                                        ? (booking.pickupOption.type === 'LAND_PACKAGE'
                                                            ? `${booking.pickupOption.fromCity || ''} (Land Package)`
                                                            : `${booking.pickupOption.fromCity || ''} ${booking.pickupOption.fromCity && booking.pickupOption.toCity ? 'to' : ''} ${booking.pickupOption.toCity || ''} (${booking.pickupOption.type || 'Standard'})`.trim())
                                                        : tour?.location || '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Detail */}
                                <div className="col-md-6 pl-md-4">
                                    <h5 className="mb-4 fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: 13, letterSpacing: 1, color: 'var(--togo-theme-primary)', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                                        <Building size={16} /> Contact Detail
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-12 col-sm-6">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>First Name</div>
                                            <div className="fw-medium text-dark mt-1" style={{ fontSize: 14 }}>{user?.name?.split(' ')[0] || booking.travelers?.[0]?.fullName?.split(' ')[0] || '—'}</div>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Last Name</div>
                                            <div className="fw-medium text-dark mt-1" style={{ fontSize: 14 }}>{user?.name?.split(' ').slice(1).join(' ') || booking.travelers?.[0]?.fullName?.split(' ').slice(1).join(' ') || '—'}</div>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email Address</div>
                                            <div className="fw-medium text-dark mt-1 text-truncate" style={{ fontSize: 14 }} title={user?.email}>{user?.email || '—'}</div>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Phone Number</div>
                                            <div className="fw-medium text-dark mt-1" style={{ fontSize: 14 }}>{user?.phone || booking.travelers?.[0]?.phone || '—'}</div>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Country</div>
                                            <div className="fw-medium text-dark mt-1" style={{ fontSize: 14 }}>India</div>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Address</div>
                                            <div className="fw-medium text-dark mt-1 text-truncate" style={{ fontSize: 14 }} title={user?.address}>{user?.address || '—'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {booking.additionalRequests && (
                                <div className="mt-4 pt-3 border-top">
                                    <h5 className="mb-2 fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: 13, letterSpacing: 1, color: 'var(--togo-theme-primary)' }}>
                                        <FileText size={16} /> Customer's Note
                                    </h5>
                                    <p className="text-dark mb-0 bg-light p-3 rounded-3 border" style={{ fontSize: 13, whiteSpace: 'pre-line' }}>{booking.additionalRequests}</p>
                                </div>
                            )}
                        </div>

                        {/* Travelers */}
                        {booking.travelers?.length > 0 && (
                            <div className="bg-white p-4 rounded-4 mb-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                <h5 className="mb-4 fw-bold text-uppercase" style={{ fontSize: 13, letterSpacing: 1, color: 'var(--togo-theme-primary)', borderBottom: '1px solid #eee', paddingBottom: 10 }}>Traveller Info</h5>

                                <div className="d-flex flex-column gap-3">
                                    {booking.travelers.map((t: BookingTraveler, i: number) => (
                                        <div key={i} className="d-flex flex-wrap align-items-center justify-content-between p-3 border rounded-3 bg-light">
                                            <div className="d-flex align-items-center gap-3 mb-2 mb-md-0">
                                                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold shadow-sm" style={{ width: 40, height: 40, fontSize: 16 }}>
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <h6 className="mb-1 fw-bold text-dark">{t.fullName}</h6>
                                                    <div className="text-muted d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                                                        <span>{t.gender}</span>
                                                        <span style={{ color: '#ccc' }}>•</span>
                                                        <span>{t.age} yrs</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-md-end">
                                                <div className="text-muted mb-1" style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>ID / Passport</div>
                                                <div className="fw-medium text-dark" style={{ fontSize: 14 }}>{t.idNumber || 'Not Provided'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment History Table */}
                        {paymentHistory.length > 0 && (
                            <div className="bg-white p-4 rounded-4 mb-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                <h5 className="mb-4 fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: 13, letterSpacing: 1, color: 'var(--togo-theme-primary)', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                                    <Clock size={16} /> Payment History
                                </h5>
                                <div className="table-responsive">
                                    <table className="table table-borderless align-middle mb-0" style={{ minWidth: 600 }}>
                                        <thead>
                                            <tr className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                <th className="px-0 pb-3" style={{ fontWeight: 600 }}>Date</th>
                                                <th className="pb-3" style={{ fontWeight: 600 }}>Method</th>
                                                <th className="pb-3" style={{ fontWeight: 600 }}>Txn ID / UTR</th>
                                                <th className="pb-3" style={{ fontWeight: 600 }}>Receipt</th>
                                                <th className="pb-3 text-end" style={{ fontWeight: 600 }}>Amount</th>
                                                <th className="pb-3 text-end" style={{ fontWeight: 600 }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ fontSize: 13 }}>
                                            {paymentHistory.map((p: any) => (
                                                <tr key={p._id} className="border-bottom">
                                                    <td className="px-0 py-3">
                                                        <div className="fw-medium text-dark">{DateUtils.formatToIST(p.createdAt)}</div>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="text-muted text-capitalize">{p.paymentMethod || p.method}</div>
                                                    </td>
                                                    <td className="py-3">
                                                        <code className="text-primary" style={{ fontSize: 12 }}>{p.transactionId || p.offlineReceiptNumber || '—'}</code>
                                                    </td>
                                                    <td className="py-3">
                                                        {p.paymentReceiptImage || p.receiptImage ? (
                                                            <a href={getImgUrl(p.paymentReceiptImage || p.receiptImage)} target="_blank" rel="noopener noreferrer"
                                                                className="d-inline-flex align-items-center gap-1 text-primary" style={{ fontSize: 11, textDecoration: 'none', fontWeight: 600 }}>
                                                                <Image size={12} /> View
                                                            </a>
                                                        ) : <span className="text-muted" style={{ fontSize: 11 }}>—</span>}
                                                    </td>
                                                    <td className="py-3 text-end">
                                                        <div className="fw-bold text-dark">{fmtINR(p.amount)}</div>
                                                    </td>
                                                    <td className="py-3 text-end">
                                                        <span className={`px-2 py-1 rounded-pill fw-medium d-inline-block`} style={{
                                                            fontSize: 10,
                                                            backgroundColor: p.status === 'SUCCESS' ? '#f0fdf4' : p.status === 'PENDING' ? '#fffbeb' : '#fef2f2',
                                                            color: p.status === 'SUCCESS' ? '#16a34a' : p.status === 'PENDING' ? '#d97706' : '#dc2626'
                                                        }}>
                                                            {p.status === 'PENDING' ? 'Reviewing' : p.status}
                                                        </span>
                                                        {p.status === 'FAILED' && p.rejectionReason && (
                                                            <div className="text-danger mt-1 fw-medium" style={{ fontSize: 10, maxWidth: 150, marginLeft: 'auto' }}>
                                                                Note: {p.rejectionReason}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Order Status & Price Breakdown */}
                    <div className="col-xl-4 mt-4 mt-xl-0">
                        <div style={{ position: 'sticky', top: 90 }}>
                            {/* Order Status Box */}
                            <div className="bg-white p-4 rounded-4 mb-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                <h5 className="mb-4 fw-bold text-uppercase" style={{ fontSize: 13, letterSpacing: 1, color: 'var(--togo-theme-primary)', borderBottom: '1px solid #eee', paddingBottom: 10 }}>Order Status</h5>

                                {booking.receiptImage ? (
                                    <div className="mb-4">
                                        <div className="mb-3">
                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>Receipt Submitted</div>
                                            <h6 className="fw-bold mt-1" style={{ fontSize: 14 }}>Bank Payment Receipt</h6>
                                        </div>

                                        <div className="mb-4 border rounded p-3 text-center bg-light">
                                            <a href={getImgUrl(booking.receiptImage)} target="_blank" rel="noopener noreferrer">
                                                <img src={getImgUrl(booking.receiptImage)} alt="Receipt" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'contain' }} />
                                            </a>
                                        </div>

                                        <div className="border rounded-4 p-3 bg-white shadow-sm mb-4" style={{ border: '1px solid #eee' }}>
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Payment Progress</span>
                                                    <span className="fw-bold text-primary" style={{ fontSize: 12 }}>{progressPct}%</span>
                                                </div>
                                                <div style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${progressPct}%`, backgroundColor: '#4f46e5', transition: 'width 0.5s ease' }} />
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted" style={{ fontSize: 11 }}>Successfully Paid :</span>
                                                <span className="fw-bold text-success" style={{ fontSize: 11 }}>{fmtINR(paidAmount)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted" style={{ fontSize: 11 }}>Pending Approval :</span>
                                                <span className="fw-bold text-warning" style={{ fontSize: 11 }}>{fmtINR(totalClaimed - paidAmount)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted" style={{ fontSize: 11 }}>Remaining Balance :</span>
                                                <span className="fw-bold text-danger" style={{ fontSize: 11 }}>{fmtINR(totalAmount - totalClaimed)}</span>
                                            </div>
                                        </div>

                                        {pendingAmount > 0 && (
                                            <div className="mt-4 p-3 rounded-4 bg-light border border-primary-subtle">
                                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: 13, color: 'var(--togo-theme-primary)' }}>
                                                    <CreditCard size={14} /> Make Another Payment
                                                </h6>

                                                <div className="grid grid-cols-4 gap-2 mb-3 d-flex flex-wrap">
                                                    {[25, 50, 75, 100].map(p => (
                                                        <div key={p} style={{ flex: '1 1 20%' }}>
                                                            <button
                                                                onClick={() => setSelectedPct(p)}
                                                                className={`btn w-100 py-2 rounded-3 fw-bold transition-all ${selectedPct === p ? 'btn-primary shadow-sm' : 'btn-outline-secondary border-light hover-bg-white'}`}
                                                                style={{ fontSize: '11px', border: selectedPct === p ? 'none' : '1px solid #eee', backgroundColor: selectedPct === p ? '#FD4621' : 'white', color: selectedPct === p ? 'white' : '#666' }}
                                                            >
                                                                {p}%
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="bg-white p-3 rounded-3 border mb-3 shadow-none" style={{ borderColor: '#eee' }}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="text-muted fw-medium" style={{ fontSize: '11px', textTransform: 'uppercase' }}>To Pay:</span>
                                                        <span className="fw-bolder" style={{ fontSize: '1.25rem', color: '#FD4621' }}>{fmtINR(getPaymentAmount())}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setIsPaymentModalOpen(true)}
                                                    className={`w-100 py-2 d-flex align-items-center justify-content-center gap-2 border-0 fw-bold transition-all ${receiptRejected ? 'btn-danger bg-danger' : 'togo-btn-primary'}`}
                                                    style={{ fontSize: 13, borderRadius: 8, backgroundColor: receiptRejected ? '#dc3545' : undefined }}
                                                >
                                                    {receiptRejected ? <RefreshCcw size={16} /> : <UploadCloud size={16} />}
                                                    {receiptRejected ? 'Re-upload Receipt' : `Proceed with ${fmtINR(getPaymentAmount())}`}
                                                </button>
                                            </div>
                                        )}

                                        <div className="pt-3 border-top mt-4">
                                            <ul className="list-unstyled mb-0" style={{ fontSize: 13 }}>
                                                <li className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Total Amount:</span>
                                                    <span className="fw-bold">{fmtINR(totalAmount)}</span>
                                                </li>
                                                <li className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Paid Amount:</span>
                                                    <span className="fw-bold text-success">{fmtINR(paidAmount)}</span>
                                                </li>
                                                {pendingAmount > 0 && (
                                                    <li className="d-flex justify-content-between mb-2">
                                                        <span className="text-muted">Remaining:</span>
                                                        <span className="fw-bold text-danger">{fmtINR(pendingAmount)}</span>
                                                    </li>
                                                )}
                                                <li className="d-flex justify-content-between">
                                                    <span className="text-muted">Status:</span>
                                                    <span className={`fw-medium ${pendingAmount > 0 ? 'text-danger' : 'text-success'}`}>{pendingAmount > 0 ? 'Partially Paid' : 'Completed'}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (isPaymentPending ? (
                                    <div>
                                        <div className="mb-4 border rounded p-3 bg-light">
                                            <h6 className="fw-bold mb-3 text-center" style={{ fontSize: 14, color: 'var(--togo-theme-primary)' }}>Payment Options</h6>

                                            <div className="d-flex flex-column gap-3">
                                                {/* <div className="bg-white p-3 rounded-4 border-0 shadow-sm">
                                                    <div className="text-muted mb-3 fw-bold text-center" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Payment Amount</div>
                                                    <div className="row g-2 mb-3">
                                                        {[25, 50, 75, 100].map(p => (
                                                            <div key={p} className="col-3">
                                                                <button
                                                                    onClick={() => setSelectedPct(p)}
                                                                    className={`btn w-100 py-2 rounded-3 fw-bold transition-all ${selectedPct === p ? 'btn-primary' : 'btn-light border-light'}`}
                                                                    style={{ fontSize: 10, backgroundColor: selectedPct === p ? '#FD4621' : '#f8f9fa', color: selectedPct === p ? 'white' : '#666', border: 'none' }}
                                                                >
                                                                    {p}%
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                                                        <span className="fw-bold text-muted small">Pay Amount:</span>
                                                        <span className="fw-bolder" style={{ fontSize: '1.25rem', color: '#FD4621' }}>{fmtINR(getPaymentAmount())}</span>
                                                    </div>
                                                </div> */}

                                                <div className="p-3 bg-white rounded-3 border">
                                                    <div className="text-muted mb-2 fw-bold" style={{ fontSize: 11, textTransform: 'uppercase' }}>How to Pay?</div>
                                                    <ol className="ps-3 mb-0 text-muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
                                                        <li>Pay <strong>{fmtINR(getPaymentAmount())}</strong> via UPI or Bank Transfer</li>
                                                        <li>Take a screenshot of the successful payment</li>
                                                        <li>Click <strong>"Upload Receipt"</strong> below and attach the screenshot</li>
                                                        <li>Enter your Transaction ID / UTR number</li>
                                                    </ol>
                                                </div>

                                                <div className="p-3 bg-white rounded-3 border">
                                                    <div className="text-muted mb-2 fw-bold" style={{ fontSize: 11, textTransform: 'uppercase' }}>Payment Details</div>
                                                    <div className="mb-2">
                                                        <div className="text-muted small" style={{ fontSize: 10 }}>UPI ID</div>
                                                        <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{upiId}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted small" style={{ fontSize: 10 }}>BANK ACCOUNT</div>
                                                        <div className="fw-medium text-dark" style={{ fontSize: 12, whiteSpace: 'pre-line' }}>{bankDetails}</div>
                                                    </div>
                                                </div>

                                                {qrImageUrl && (
                                                    <div className="text-center pt-2">
                                                        <div className="text-muted mb-2 fw-bold" style={{ fontSize: 11 }}>SCAN TO PAY</div>
                                                        <img src={getImgUrl(qrImageUrl)} alt="UPI QR" style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, border: '1px solid #eee' }} />
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => setIsPaymentModalOpen(true)}
                                                className="togo-btn-primary w-100 py-3 mt-4 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                            >
                                                Upload Receipt & Proceed
                                            </button>
                                        </div>

                                        <div className="pt-3 border-top mt-4">
                                            <ul className="list-unstyled mb-0" style={{ fontSize: 13 }}>
                                                <li className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Total Amount:</span>
                                                    <span className="fw-bold">{fmtINR(totalAmount)}</span>
                                                </li>
                                                <li className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Paid Amount:</span>
                                                    <span className="fw-bold text-success">{fmtINR(paidAmount)}</span>
                                                </li>
                                                <li className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Remaining Balance:</span>
                                                    <span className="fw-bold text-danger">{fmtINR(pendingAmount)}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-4 text-center">
                                        <span className={`px-4 py-2 rounded-pill fw-bold ${getStatusBadgeClass(booking.status)}`} style={{ fontSize: 13 }}>
                                            {getBookingStatusLabel(booking.status)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown Card */}
                            <div className="bg-white p-4 rounded-4 mb-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                <h5 className="mb-3 fw-bold text-uppercase" style={{ fontSize: 13, letterSpacing: 1, color: 'var(--togo-theme-primary)', borderBottom: '1px solid #eee', paddingBottom: 10 }}>Price Breakdown</h5>

                                {/* {booking.pricingSummary && (
                                    <div className="mb-4 p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13, lineHeight: 1.6, color: '#475569' }}>
                                        {booking.pricingSummary}
                                    </div>
                                )} */}

                                <PriceRow label="Base Price (per person)" value={fmtINR(booking.baseAmount || 0)} />

                                {booking.pickupOption && booking.pickupOption.priceAdjustment > 0 && (
                                    <PriceRow label={`${booking.pickupOption.type || 'Pickup'} (per person)`} value={`+${fmtINR(booking.pickupOption.priceAdjustment)}`} />
                                )}

                                {(booking.pickupOption && booking.pickupOption.priceAdjustment > 0) && (
                                    <PriceRow label="Total Price per person" value={fmtINR(booking.perPersonPrice || booking.baseAmount || 0)} />
                                )}

                                {((booking.totalTravelers || booking.travelers?.length) > 1) && (
                                    <PriceRow label="Total Travelers" value={`x ${booking.totalTravelers || booking.travelers?.length || 1}`} />
                                )}

                                <div className="border-bottom my-3" style={{ borderStyle: 'dashed' }} />

                                <PriceRow label="Subtotal" value={fmtINR((booking.perPersonPrice || booking.baseAmount || 0) * (booking.totalTravelers || booking.travelers?.length || 1))} />

                                {booking.discountAmount > 0 && (
                                    <PriceRow label={`Discount${booking.couponCode ? ` (${booking.couponCode})` : ''}`} value={`-${fmtINR(booking.discountAmount || 0)}`} green />
                                )}

                                {booking.taxAmount > 0 && (
                                    <PriceRow label={`GST (${booking.taxRate ?? 5}%)`} value={fmtINR(booking.taxAmount || 0)} />
                                )}

                                <div className="border-bottom my-3" />
                                <div className="d-flex justify-content-between mb-3" style={{ fontSize: 15 }}>
                                    <span className="fw-bold text-dark">Total</span>
                                    <span className="fw-bold" style={{ color: '#FD4621' }}>{fmtINR(booking.totalAmount || 0)}</span>
                                </div>

                                <div className="border-bottom my-3" />
                                <PriceRow label="Paid Amount" value={fmtINR(booking.paidAmount || 0)} green />

                                {booking.refundStatus && booking.refundStatus !== RefundStatus.NONE && booking.refundAmount > 0 && (
                                    <PriceRow label="Approved Refund" value={`-${fmtINR(booking.refundAmount)}`} danger />
                                )}

                                <PriceRow label="Pending Amount" value={fmtINR(booking.pendingAmount || 0)} danger />
                            </div>


                        </div>
                    </div>
                </div>




            </div>

            {/* Payment Modal */}
            {
                isPaymentModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <div className="bg-white rounded-4 shadow-lg position-relative" style={{ width: '100%', maxWidth: 500, padding: 30 }}>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="btn btn-sm btn-light position-absolute d-flex align-items-center justify-content-center"
                                style={{ top: 15, right: 15, width: 32, height: 32, borderRadius: '50%', padding: 0 }}
                            >
                                <X size={18} />
                            </button>
                            <h5 className="fw-bold mb-2 text-dark">Upload Payment Receipt</h5>
                            <p className="text-muted mb-4" style={{ fontSize: 13 }}>
                                After paying via UPI or Bank Transfer, upload your payment screenshot and enter the transaction ID.
                            </p>

                            <form onSubmit={handleUploadSubmit}>
                                <div className="mb-4">
                                    <label className="form-label text-dark fw-bold small text-uppercase tracking-wider" style={{ fontSize: '11px' }}>Transaction ID / UTR Number</label>
                                    <input
                                        type="text"
                                        className="form-control px-4 py-3 bg-light border-0"
                                        placeholder="Enter the 12-digit payment ID"
                                        value={transactionId}
                                        onChange={e => setTransactionId(e.target.value)}
                                        style={{ borderRadius: 12, fontSize: 15 }}
                                    />
                                    <div className="text-muted mt-2" style={{ fontSize: 11 }}>Found in your bank/UPI app's transaction details.</div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-dark fw-bold small text-uppercase tracking-wider" style={{ fontSize: '11px' }}>Payment Screenshot</label>
                                    <div className="position-relative border rounded-4 p-4 text-center transition-all"
                                        style={{ borderStyle: 'dashed', borderColor: receiptFile ? '#34c759' : '#eee', backgroundColor: receiptFile ? '#f0fdf4' : '#fafafa' }}>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                            className="position-absolute w-100 h-100"
                                            style={{ top: 0, left: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }}
                                            required
                                        />
                                        <div className="mb-2">
                                            {receiptFile ? (
                                                <div className="mx-auto bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                                    <CheckCircle size={24} className="text-success" />
                                                </div>
                                            ) : (
                                                <div className="mx-auto bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                                    <UploadCloud size={24} style={{ color: '#FD4621' }} />
                                                </div>
                                            )}
                                        </div>
                                        <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: 14 }}>
                                            {receiptFile ? 'File Selected' : 'Tap to Upload Screenshot'}
                                        </h6>
                                        <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                                            {receiptFile ? receiptFile?.name : 'PNG, JPG or PDF (max 5MB)'}
                                        </p>
                                    </div>
                                </div>

                                <div className="d-flex flex-column gap-2 mt-2">
                                    <button
                                        type="submit"
                                        className="togo-btn-primary w-100 py-3 fw-bold shadow-lg"
                                        style={{ borderRadius: 12, fontSize: 16 }}
                                        disabled={!receiptFile || uploadReceiptMutation.isPending}
                                    >
                                        {uploadReceiptMutation.isPending ? 'Uploading…' : 'Submit Payment Proof'}
                                    </button>
                                    <button type="button" className="btn btn-link text-muted text-decoration-none fw-medium small py-2" onClick={() => setIsPaymentModalOpen(false)}>Maybe Later</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <ConfirmationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={confirmCancel}
                title="Cancel Booking"
                message={`Are you sure you want to cancel your booking for "${tour?.title || 'this tour'}"? This action cannot be undone.`}
                type="danger"
                confirmText="Cancel Booking"
                isLoading={cancelMutation.isPending}
            />

            <RefundRequestModal
                isOpen={isRefundModalOpen}
                onClose={() => setIsRefundModalOpen(false)}
                onConfirm={(reason) => refundMutation.mutate(reason)}
                title="Request Refund"
                bookingNumber={booking?.bookingNumber || ''}
                amountToRefund={booking?.paidAmount || 0}
                isLoading={refundMutation.isPending}
            />
        </div >
    );
}

function PriceRow({ label, value, green, danger }: { label: string; value: string; green?: boolean; danger?: boolean }) {
    return (
        <div className="d-flex justify-content-between mb-3" style={{ fontSize: 15 }}>
            <span className="text-muted">{label}</span>
            <span className={`fw-medium ${green ? 'text-success' : ''} ${danger ? 'text-danger' : ''}`}>{value}</span>
        </div>
    );
}
