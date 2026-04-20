'use client';

import Link from 'next/link';
import { useTransactionHooks } from '@lib/hooks/useTransactionHooks';
import { Transaction } from '@lib/types/transaction.types';
import { DateUtils } from '@lib/utils/date-utils';
import { Download } from 'lucide-react';
import { TransactionStatus } from '@lib/constants/enums';
import { getStatusBadgeClass } from '@lib/utils/enum-mappings';

function statusClass(status: string) {
    return getStatusBadgeClass(status);
}

export default function DashboardTransactionsPage() {
    const { useMyTransactions } = useTransactionHooks();
    const { data, isLoading } = useMyTransactions({ limit: 50 });
    const extractArray = (data: any) => Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
    const transactions: Transaction[] = extractArray(data);

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                            <h4 className="togo-dashboard-account-title mb-0">My Transactions</h4>
                        </div>

                        <div className="bg-white p-4 rounded-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            {isLoading ? (
                                <div className="text-center py-5 text-muted">Loading transactions…</div>
                            ) : transactions.length > 0 ? (
                                <div className="togo-dashboard-table" style={{ overflowX: 'auto' }}>
                                    <ul className="mb-0 p-0" style={{ listStyle: 'none', minWidth: 650 }}>
                                        {/* Header */}
                                        <li className="bg-light rounded-3 px-4 py-3 mb-3">
                                            <div className="row align-items-center text-uppercase text-muted fw-bold" style={{ fontSize: 12, letterSpacing: '0.5px' }}>
                                                <div className="col-2">ID</div>
                                                <div className="col-2">Type</div>
                                                <div className="col-3">Booking</div>
                                                <div className="col-2 text-center">Amount</div>
                                                <div className="col-2 text-center">Status</div>
                                                <div className="col-1 text-end">Date</div>
                                            </div>
                                        </li>

                                        {transactions.map((txn) => (
                                            <li key={txn._id} className="border-bottom py-3 px-4">
                                                <div className="row align-items-center" style={{ fontSize: 14 }}>
                                                    <div className="col-2 fw-medium text-dark" style={{ fontSize: 13 }}>
                                                        {(txn as any).transactionId || txn._id?.slice(-6)?.toUpperCase()}
                                                    </div>
                                                    <div className="col-2">
                                                        <div className="fw-medium text-dark">{(txn as any).type || 'Payment'}</div>
                                                        <div className="text-muted" style={{ fontSize: 12 }}>{(txn as any).paymentMethod || 'Online'}</div>
                                                    </div>
                                                    <div className="col-3">
                                                        {(txn as any).booking ? (
                                                            <Link href={`/dashboard/bookings/${(txn as any).booking?._id || (txn as any).booking}`} className="text-primary text-decoration-none fw-medium">
                                                                #{(txn as any).booking?.bookingNumber || (txn as any).booking?.slice?.(-6)?.toUpperCase()}
                                                            </Link>
                                                        ) : '—'}
                                                    </div>
                                                    <div className="col-2 text-center fw-bold text-dark">
                                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((txn as any).amount || 0)}
                                                    </div>
                                                    <div className="col-2 text-center">
                                                        <span className={`px-3 py-1 rounded-pill d-inline-block fw-medium ${statusClass((txn as any).status)}`} style={{ fontSize: 12 }}>
                                                            {(txn as any).status}
                                                        </span>
                                                    </div>
                                                    <div className="col-1 text-end text-muted" style={{ fontSize: 12 }}>
                                                        {txn.createdAt ? DateUtils.formatToIST(txn.createdAt, 'DD MMM') : '—'}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <Download size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
                                    <h5 className="mb-2">No transactions yet</h5>
                                    <p>Your payment history will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
