'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@lib/api/payments.api';
import { DateUtils } from '@lib/utils/date-utils';
import { FileText, CreditCard, ArrowDownRight, ArrowUpLeft, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { PaymentStatus, TransactionType } from '@lib/constants/enums';
import { getStatusBadgeClass } from '@lib/utils/enum-mappings';
import { getImgUrl } from '@lib/utils/image';

function statusClass(status: string) {
    return getStatusBadgeClass(status);
}

function getStatusIcon(status: string) {
    const s = (status || '').toUpperCase();
    if (s === 'SUCCESS') return <CheckCircle2 size={14} />;
    if (s === 'PENDING') return <Clock size={14} />;
    if (s === 'FAILED' || s === 'REJECTED') return <XCircle size={14} />;
    return <AlertCircle size={14} />;
}

function getTransactionTypeInfo(type: string, description?: string) {
    const t = type?.toUpperCase();
    if (t === TransactionType.REFUND)
    {
        return {
            label: 'Refund',
            icon: <ArrowUpLeft size={14} className="text-danger" />,
            bg: 'bg-danger-subtle text-danger',
            isDebit: true
        };
    }

    // Check description for hints if type is generic
    const desc = (description || '').toLowerCase();
    if (desc.includes('advance') || desc.includes('25%'))
    {
        return {
            label: 'Advance Payment',
            icon: <ArrowDownRight size={14} className="text-success" />,
            bg: 'bg-success-subtle text-success',
            isDebit: false
        };
    }
    if (desc.includes('installment') || desc.includes('part'))
    {
        return {
            label: 'Installment',
            icon: <ArrowDownRight size={14} className="text-success" />,
            bg: 'bg-success-subtle text-success',
            isDebit: false
        };
    }

    return {
        label: t === TransactionType.OFFLINE_PAYMENT ? 'Offline Payment' : 'Online Payment',
        icon: <ArrowDownRight size={14} className="text-success" />,
        bg: 'bg-success-subtle text-success',
        isDebit: false
    };
}

function formatStatus(status: string) {
    if (!status) return '—';
    const mapped = status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    return mapped;
}

export default function DashboardPaymentsPage() {
    const { data: response, isLoading } = useQuery<any>({
        queryKey: ['payments', 'my'],
        queryFn: () => paymentsApi.getMyPayments()
    });

    const payments = (Array.isArray(response) ? response : response?.data) || [];

    return (
        <div className="pt-25 pb-60">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="togo-dashboard-account-title mb-0">Payment History</h4>
                        </div>

                        <div className="bg-white rounded-4 p-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            {isLoading ? (
                                <div className="text-center py-5 text-muted">Loading payments...</div>
                            ) : payments.length > 0 ? (
                                <>
                                    <div className="table-responsive d-none d-md-block">
                                        <table className="table border-0" style={{ fontSize: 14 }}>
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 py-3 px-3 fw-bold text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 0.5 }}>Date</th>
                                                    <th className="border-0 py-3 px-3 fw-bold text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 0.5 }}>Transaction ID</th>
                                                    <th className="border-0 py-3 px-3 fw-bold text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 0.5 }}>Booking #</th>
                                                    <th className="border-0 py-3 px-3 fw-bold text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 0.5 }}>Type</th>
                                                    <th className="border-0 py-3 px-3 fw-bold text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 0.5 }}>Amount</th>
                                                    <th className="border-0 py-3 px-3 fw-bold text-muted text-uppercase text-center" style={{ fontSize: 11, letterSpacing: 0.5 }}>Status</th>
                                                    <th className="border-0 py-3 px-3 fw-bold text-muted text-uppercase text-center" style={{ fontSize: 11, letterSpacing: 0.5 }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map((payment: any, idx: number) => (
                                                    <tr key={payment._id} className="border-bottom" style={{ verticalAlign: 'middle' }}>
                                                        <td className="py-3 px-3">
                                                            <div className="fw-medium text-dark">{DateUtils.formatToIST(payment.createdAt, 'DD MMM YYYY')}</div>
                                                            <div className="text-muted" style={{ fontSize: 12 }}>{DateUtils.formatToIST(payment.createdAt, 'hh:mm A')}</div>
                                                        </td>
                                                        <td className="py-3 px-3 text-dark fw-medium">
                                                            {payment.transactionId || payment.offlineReceiptNumber || '—'}
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <Link href={`/dashboard/bookings/${payment.booking?._id || payment.booking}`} className="text-primary fw-medium text-decoration-none">
                                                                {payment.booking?.bookingNumber || 'View Booking'}
                                                            </Link>
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            {(() => {
                                                                const info = getTransactionTypeInfo(payment.type, payment.description);
                                                                return (
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <div className={`p-1 rounded-circle d-flex align-items-center justify-content-center ${info.bg}`} style={{ width: 24, height: 24 }}>
                                                                            {info.icon}
                                                                        </div>
                                                                        <div>
                                                                            <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{info.label}</div>
                                                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'capitalize' }}>via {payment.paymentMethod || payment.paymentType || 'System'}</div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="py-3 px-3 fw-bold">
                                                            <span className={getTransactionTypeInfo(payment.type, payment.description).isDebit ? 'text-danger' : 'text-dark'}>
                                                                {getTransactionTypeInfo(payment.type, payment.description).isDebit ? '-' : ''}
                                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(payment.amount || 0)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 text-center">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <span className={`px-2 py-1 rounded-pill fw-bold d-flex align-items-center gap-1 ${statusClass(payment.status)}`} style={{ fontSize: 11 }}>
                                                                    {getStatusIcon(payment.status)}
                                                                    {formatStatus(payment.status)}
                                                                </span>
                                                                {payment.status === PaymentStatus.REJECTED && payment.rejectionReason && (
                                                                    <div className="text-danger mt-1 fw-medium" style={{ fontSize: 10, maxWidth: 120, lineHeight: 1.2 }}>
                                                                        {payment.rejectionReason}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-3 text-center">
                                                            {payment.paymentReceiptImage ? (
                                                                <a
                                                                    href={getImgUrl(payment.paymentReceiptImage)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-sm btn-light border rounded-pill text-muted px-3"
                                                                    style={{ fontSize: 12 }}
                                                                >
                                                                    <FileText size={14} className="me-1" /> Receipt
                                                                </a>
                                                            ) : (
                                                                <span className="text-muted" style={{ fontSize: 12 }}>—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="d-md-none">
                                        {payments.map((payment: any) => (
                                            <div key={payment._id} className="bg-light rounded-4 p-4 mb-3" style={{ border: '1px solid #eee' }}>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: 10, letterSpacing: 0.5 }}>Date</div>
                                                        <div className="fw-medium text-dark">{DateUtils.formatToIST(payment.createdAt, 'DD MMM YYYY')}</div>
                                                        <div className="text-muted" style={{ fontSize: 12 }}>{DateUtils.formatToIST(payment.createdAt, 'hh:mm A')}</div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: 10, letterSpacing: 0.5 }}>Status</div>
                                                        <span className={`px-2 py-1 rounded-pill fw-medium d-inline-block ${statusClass(payment.status)}`} style={{ fontSize: 11 }}>
                                                            {formatStatus(payment.status)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: 10, letterSpacing: 0.5 }}>Transaction ID</div>
                                                    <div className="text-dark fw-medium" style={{ wordBreak: 'break-all', fontSize: 13 }}>
                                                        {payment.transactionId || payment.offlineReceiptNumber || '—'}
                                                    </div>
                                                </div>

                                                <div className="row g-3 mb-3">
                                                    <div className="col-6">
                                                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: 10, letterSpacing: 0.5 }}>Booking #</div>
                                                        <Link href={`/dashboard/bookings/${payment.booking?._id || payment.booking}`} className="text-primary fw-medium text-decoration-none" style={{ fontSize: 13 }}>
                                                            {payment.booking?.bookingNumber || 'View Booking'}
                                                        </Link>
                                                    </div>
                                                    <div className="col-6 text-end">
                                                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: 10, letterSpacing: 0.5 }}>Type</div>
                                                        {(() => {
                                                            const info = getTransactionTypeInfo(payment.type, payment.description);
                                                            return (
                                                                <div className="d-flex align-items-center justify-content-end gap-1">
                                                                    <span className="text-dark fw-bold" style={{ fontSize: 12 }}>{info.label}</span>
                                                                    <div className={`p-1 rounded-circle d-flex align-items-center justify-content-center ${info.bg}`} style={{ width: 20, height: 20 }}>
                                                                        {info.icon}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                        <div className="text-muted" style={{ fontSize: 11 }}>via {payment.paymentMethod || payment.paymentType}</div>
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                                    <div>
                                                        <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: 10, letterSpacing: 0.5 }}>Amount</div>
                                                        <div className="fw-bold fs-5" style={{ color: '#111' }}>
                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(payment.amount || 0)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {payment.paymentReceiptImage ? (
                                                            <a
                                                                href={getImgUrl(payment.paymentReceiptImage)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-sm btn-light border rounded-pill text-muted px-3"
                                                                style={{ fontSize: 12 }}
                                                            >
                                                                <FileText size={14} className="me-1" /> Receipt
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted" style={{ fontSize: 12 }}>—</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {payment.status === PaymentStatus.REJECTED && payment.rejectionReason && (
                                                    <div className="text-danger mt-2 pt-2 border-top border-danger border-opacity-10" style={{ fontSize: 11 }}>
                                                        <span className="fw-bold text-uppercase me-1">Reason:</span>
                                                        {payment.rejectionReason}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <div className="d-inline-flex justify-content-center align-items-center bg-light rounded-circle mb-3" style={{ width: 80, height: 80 }}>
                                        <CreditCard size={32} className="text-muted opacity-50" />
                                    </div>
                                    <h5 className="fw-bold mb-2">No payment history</h5>
                                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 400 }}>
                                        You haven't uploaded any payment proofs or made any transactions yet. Your payment records will appear here.
                                    </p>
                                    <Link href="/dashboard/bookings" className="togo-btn-primary px-4 py-2" style={{ borderRadius: 8 }}>
                                        View Bookings
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
