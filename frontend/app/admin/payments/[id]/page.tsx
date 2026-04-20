'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAdminPaymentHooks } from '@hooks/admin/useAdminPaymentHooks';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PaymentStatus } from '@lib/constants/enums';
import { DateUtils } from '@lib/utils/date-utils';

export default function AdminPaymentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const paymentId = params.id as string;

    const { usePaymentById, useVerifyPayment, useRejectPayment } = useAdminPaymentHooks();

    const { data: response, isLoading } = usePaymentById(paymentId);
    const verifyMutation = useVerifyPayment();
    const rejectMutation = useRejectPayment();

    const payment = (response as any)?.data || response;

    const handleVerify = async () => {
        if (!window.confirm('Are you sure you want to verify and approve this payment?')) return;
        try
        {
            await verifyMutation.mutateAsync(paymentId);
            toast.success('Payment verified successfully');
        } catch (err)
        {
            toast.error('Failed to verify payment');
        }
    };

    const handleReject = async () => {
        const reason = window.prompt('Please enter a reason for rejecting this payment:');
        if (reason === null) return; // User cancelled
        if (!reason.trim()) return toast.error('A rejection reason is required');

        try
        {
            await rejectMutation.mutateAsync({ id: paymentId, reason });
            toast.success('Payment rejected');
        } catch (err)
        {
            toast.error('Failed to reject payment');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
    };

    if (isLoading) return <div className="p-5 text-center">Loading payment details...</div>;
    if (!payment) return <div className="p-5 text-center text-danger">Payment not found</div>;

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <h4 className="togo-dashboard-account-title mb-0">Payment Details</h4>
                    <Link href="/admin/payments" className="togo-btn-primary" style={{ background: '#f1f3f9', color: '#111' }}>
                        Back to Payments
                    </Link>
                </div>

                <div className="row">
                    <div className="col-lg-7 mb-30">
                        <div style={{ background: '#fff', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-20 pb-20 border-bottom">
                                <div>
                                    <h5 className="mb-2" style={{ fontWeight: 600 }}>Payment #{payment._id || payment.id}</h5>
                                    <span style={{ fontSize: '13px', color: '#888' }}>
                                        Submitted on {DateUtils.formatToIST(payment.createdAt || payment.paymentDate, 'DD MMM YYYY, hh:mm A')}
                                    </span>
                                </div>
                                <span style={{
                                    display: 'inline-block', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                    backgroundColor: payment.status === PaymentStatus.SUCCESS ? '#EAF8E7' : payment.status === PaymentStatus.FAILED || payment.status === PaymentStatus.REJECTED ? '#FFF2F5' : '#FFF6E4',
                                    color: payment.status === PaymentStatus.SUCCESS ? '#2d8a4e' : payment.status === PaymentStatus.FAILED || payment.status === PaymentStatus.REJECTED ? '#e55' : '#e5a323'
                                }}>
                                    {payment.status || 'PENDING'}
                                </span>
                            </div>

                            <div className="row mb-30">
                                <div className="col-sm-6 mb-15">
                                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Amount</div>
                                    <div style={{ fontWeight: 700, fontSize: '20px', color: '#111' }}>{formatCurrency(payment.amount)}</div>
                                </div>
                                <div className="col-sm-6 mb-15">
                                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Payment Method</div>
                                    <div style={{ fontWeight: 600, fontSize: '16px', color: '#555' }}>
                                        {payment.paymentMethod || 'BANK_TRANSFER'}
                                    </div>
                                </div>
                                <div className="col-sm-6 mb-15">
                                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>User</div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>
                                        {payment.user?.name || 'Guest User'} <br />
                                        <span style={{ fontSize: '12px', color: '#888', fontWeight: 400 }}>{payment.user?.email}</span>
                                    </div>
                                </div>
                                <div className="col-sm-6 mb-15">
                                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Related Booking</div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a73e8' }}>
                                        <Link href={`/admin/bookings/${payment.booking?._id || payment.booking?.id || ''}`} style={{ color: '#1a73e8' }}>
                                            {payment.booking?.bookingNumber || payment.booking?._id || 'View Booking'}
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {payment.transactionId && (
                                <div className="mb-20 p-3" style={{ background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                                    <strong style={{ fontSize: '12px', color: '#555', display: 'block' }}>Gateway Transaction ID</strong>
                                    <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{payment.transactionId}</span>
                                </div>
                            )}

                            {payment.notes && (
                                <div className="mb-20 p-3" style={{ background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                                    <strong style={{ fontSize: '12px', color: '#555', display: 'block' }}>Customer / Staff Notes</strong>
                                    <span style={{ fontSize: '14px' }}>{payment.notes}</span>
                                </div>
                            )}

                            {(payment.status === PaymentStatus.PENDING) ? (
                                <div className="d-flex gap-3 pt-20 border-top mt-20">
                                    <button
                                        className="togo-btn-primary flex-grow-1"
                                        onClick={handleVerify}
                                        disabled={verifyMutation.isPending || rejectMutation.isPending}
                                        style={{ background: '#2d8a4e', border: 'none' }}
                                    >
                                        Verify & Approve
                                    </button>
                                    <button
                                        className="togo-btn-primary flex-grow-1"
                                        onClick={handleReject}
                                        disabled={verifyMutation.isPending || rejectMutation.isPending}
                                        style={{ background: '#FFF2F5', color: '#e55', border: 'none' }}
                                    >
                                        Reject Payment
                                    </button>
                                </div>
                            ) : null}

                            {payment.status === PaymentStatus.REJECTED && payment.reason && (
                                <div className="mt-20 p-3" style={{ background: '#FFF2F5', borderLeft: '4px solid #e55', borderRadius: '4px' }}>
                                    <strong style={{ display: 'block', color: '#e55', marginBottom: '5px' }}>Rejection Reason</strong>
                                    {payment.reason}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-5 mb-30">
                        {payment.receiptImage ? (
                            <div style={{ background: '#fff', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <h5 className="mb-20" style={{ fontWeight: 600 }}>Payment Receipt</h5>
                                <div style={{ flexGrow: 1, background: '#f8f9fa', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <a href={payment.receiptImage?.startsWith('http') ? payment.receiptImage : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${payment.receiptImage}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                                        <img src={payment.receiptImage?.startsWith('http') ? payment.receiptImage : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${payment.receiptImage}`} alt="Receipt" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </a>
                                </div>
                                <p className="text-center text-muted mt-2 mb-0" style={{ fontSize: '12px' }}>Click image to view full size</p>
                            </div>
                        ) : payment.paymentMethod === 'BANK_TRANSFER' ? (
                            <div style={{ background: '#fff', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="text-center text-muted">
                                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📄</div>
                                    <p>No receipt image uploaded for this Bank Transfer.</p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
