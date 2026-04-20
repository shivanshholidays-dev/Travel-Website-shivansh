'use client';

import Link from 'next/link';
import { useAdminTransactionHooks } from '@hooks/admin/useAdminTransactionHooks';
import { formatCurrency } from '@lib/utils/currency-utils';
import toast from 'react-hot-toast';
import { CreditCard, Download, Search, Filter, ArrowDownRight, ArrowUpLeft, Clock, CheckCircle2, XCircle, AlertCircle, User, Calendar, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { DateUtils } from '@lib/utils/date-utils';
import { TransactionType, TransactionStatus } from '@lib/constants/enums';
import Pagination from '@components/ui/Pagination';
import { useState, useMemo, useEffect } from 'react';
import { getStatusBadgeClass } from '@lib/utils/enum-mappings';
import { getImgUrl } from '@lib/utils/image';

export default function AdminTransactionsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const limit = 10;

    // Handle search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset page when filters or debounced search change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, typeFilter, statusFilter]);

    const { useTransactionsList, useExportTransactionsCsv } = useAdminTransactionHooks();

    // Construct params for host
    const queryParams = useMemo(() => ({
        page,
        limit,
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined
    }), [page, limit, debouncedSearch, typeFilter, statusFilter]);

    const { data: response, isLoading } = useTransactionsList(queryParams);
    const exportMutation = useExportTransactionsCsv();

    const result = (response as any)?.data ?? response;
    const transactions = result?.items || [];
    const totalPages = result?.totalPages || 1;

    const handleExport = async () => {
        try
        {
            const blob = await exportMutation.mutateAsync(queryParams);
            const url = window.URL.createObjectURL(new Blob([blob as any]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_export_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err)
        {
            toast.error('Failed to export CSV');
        }
    };

    const getStatusIcon = (status: string) => {
        const s = (status || '').toUpperCase();
        if (s === 'SUCCESS') return <CheckCircle2 size={14} />;
        if (s === 'PENDING') return <Clock size={14} />;
        if (s === 'FAILED' || s === 'REJECTED') return <XCircle size={14} />;
        return <AlertCircle size={14} />;
    };

    const getTransactionTypeInfo = (type: string, description?: string) => {
        const t = (type || '').toUpperCase();
        if (t === TransactionType.REFUND)
        {
            return {
                label: 'Refund',
                icon: <ArrowUpLeft size={14} className="text-danger" />,
                bg: 'bg-danger-subtle text-danger',
                isDebit: true
            };
        }

        const desc = (description || '').toLowerCase();
        if (desc.includes('advance') || desc.includes('25%'))
        {
            return {
                label: 'Advance',
                icon: <ArrowDownRight size={14} className="text-success" />,
                bg: 'bg-success-subtle text-success',
                isDebit: false
            };
        }

        return {
            label: t.replace(/_/g, ' '),
            icon: <ArrowDownRight size={14} className="text-success" />,
            bg: 'bg-success-subtle text-success',
            isDebit: false
        };
    };


    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-30">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-0">Transactions</h4>
                        <p className="text-muted small mb-0">Full history of platform payments and refunds.</p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exportMutation.isPending}
                        className="btn btn-dark d-flex align-items-center gap-2"
                        style={{ borderRadius: '10px', padding: '10px 20px', fontWeight: 600 }}
                    >
                        {exportMutation.isPending ? 'Exporting...' : <><Download size={18} /> Export CSV</>}
                    </button>
                </div>

                <div className="bg-white rounded-4 shadow-sm p-3 mb-4 border border-light-subtle">
                    <div className="row g-3">
                        <div className="col-lg-4 col-md-6">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-end-0 text-muted ps-3">
                                    <Search size={16} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-start-0 ps-0 py-2"
                                    placeholder="Search by ID, email or name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ fontSize: '13px' }}
                                />
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-6">
                            <select
                                className="form-select form-select-sm bg-light py-2 px-3 border-light-subtle"
                                style={{ fontSize: '13px', fontWeight: 500 }}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value={TransactionType.ONLINE_RECEIPT}>Online Receipt</option>
                                <option value={TransactionType.OFFLINE_PAYMENT}>Offline Payment</option>
                                <option value={TransactionType.REFUND}>Refund</option>
                                <option value={TransactionType.MANUAL_ADJUSTMENT}>Adjustment</option>
                            </select>
                        </div>
                        <div className="col-lg-2 col-md-6">
                            <select
                                className="form-select form-select-sm bg-light py-2 px-3 border-light-subtle"
                                style={{ fontSize: '13px', fontWeight: 500 }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value={TransactionStatus.SUCCESS}>Success</option>
                                <option value={TransactionStatus.PENDING}>Pending</option>
                                <option value={TransactionStatus.FAILED}>Failed</option>
                            </select>
                        </div>
                        <div className="col-lg-4 col-md-6 text-end">
                            {(search || typeFilter || statusFilter) && (
                                <button
                                    onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }}
                                    className="btn btn-sm btn-link text-danger text-decoration-none fw-bold"
                                    style={{ fontSize: '12px' }}
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-3" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th className="ps-4 py-3" style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Transaction & User</th>
                                    <th className="py-3" style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Type & Method</th>
                                    <th className="py-3" style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Amount</th>
                                    <th className="py-3" style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                    <th className="py-3" style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Processed By</th>
                                    <th className="pe-4 py-3 text-end" style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={6} className="text-center py-5">
                                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                        <span className="text-muted small">Loading transactions...</span>
                                    </td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-5">
                                        <div className="py-4">
                                            <AlertCircle size={40} className="text-muted opacity-20 mb-3" />
                                            <div className="text-muted fw-bold">No transactions found</div>
                                            <div className="small text-muted mt-1">Try adjusting your filters or search keywords</div>
                                        </div>
                                    </td></tr>
                                ) : (
                                    transactions.map((t: any) => {
                                        const typeInfo = getTransactionTypeInfo(t.type, t.description);
                                        return (
                                            <tr key={t.id || t._id} className="transition-all hover-bg-light" style={{ borderBottom: '1px solid #f1f3f9' }}>
                                                <td className="ps-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="d-flex flex-column">
                                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                                <span className="fw-bolder" style={{ color: '#111', fontSize: '13px', fontFamily: 'monospace' }}>
                                                                    {t.transactionId || t._id?.slice(-8).toUpperCase()}
                                                                </span>
                                                                {t.booking && (
                                                                    <Link href={`/admin/bookings/${t.booking._id || t.booking}`} className="badge bg-primary-subtle text-primary text-decoration-none" style={{ fontSize: '10px' }}>
                                                                        {t.booking.bookingNumber || t.booking}
                                                                    </Link>
                                                                )}
                                                            </div>
                                                            <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '11px' }}>
                                                                <User size={12} />
                                                                <span>{t.user?.name || 'Guest'}</span>
                                                                <span className="mx-1">•</span>
                                                                <Calendar size={12} />
                                                                <span>{DateUtils.formatToIST(t.createdAt, 'DD MMM, hh:mm A')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="d-flex flex-column">
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <div className={`p-1 rounded-circle d-flex align-items-center justify-content-center ${typeInfo.bg}`} style={{ width: 22, height: 22 }}>
                                                                {typeInfo.icon}
                                                            </div>
                                                            <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>{typeInfo.label}</span>
                                                        </div>
                                                        <span className="text-muted" style={{ fontSize: '11px', paddingLeft: '26px' }}>
                                                            {t.paymentMethod || 'Manual Entry'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="fw-bolder" style={{ color: typeInfo.isDebit ? '#dc3545' : '#198754', fontSize: '14px' }}>
                                                        {typeInfo.isDebit ? '-' : '+'}{formatCurrency(t.amount || 0)}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="d-flex flex-column align-items-start">
                                                        <span className={`px-2 py-1 rounded-pill fw-bold d-flex align-items-center gap-1 ${getStatusBadgeClass(t.status)}`} style={{ fontSize: '10px' }}>
                                                            {getStatusIcon(t.status)}
                                                            {t.status || 'SUCCESS'}
                                                        </span>
                                                        {t.rejectionReason && (
                                                            <span className="text-danger small mt-1" style={{ fontSize: '9px', maxWidth: '120px', lineHeight: 1.2 }}>
                                                                {t.rejectionReason}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    {t.processedBy ? (
                                                        <div className="d-flex flex-column">
                                                            <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>{t.processedBy.name || 'System'}</span>
                                                            {t.processedAt && (
                                                                <span className="text-muted" style={{ fontSize: '10px' }}>{DateUtils.formatToIST(t.processedAt, 'DD MMM')}</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted small">Auto-linked</span>
                                                    )}
                                                </td>
                                                <td className="pe-4 py-3 text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        {t.receiptImage && (
                                                            <a href={getImgUrl(t.receiptImage)} target="_blank" className="btn btn-sm btn-light border p-1" title="View Receipt">
                                                                <ImageIcon size={14} />
                                                            </a>
                                                        )}
                                                        {t.status === TransactionStatus.PENDING && (
                                                            <Link href="/admin/payments" className="btn btn-sm btn-primary py-1 px-2 fw-bold" style={{ fontSize: '11px' }}>
                                                                Review
                                                            </Link>
                                                        )}
                                                        {t.booking && (
                                                            <Link href={`/admin/bookings/${t.booking._id || t.booking}`} className="btn btn-sm btn-outline-dark p-1" title="Go to Booking">
                                                                <ExternalLink size={14} />
                                                            </Link>
                                                        )}
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
        </div>
    );
}
