'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { useAdminBookingHooks } from '@hooks/admin/useAdminBookingHooks';
import toast from 'react-hot-toast';
import { DateUtils } from '@lib/utils/date-utils';
import { BookingStatus } from '@lib/constants/enums';
import { getBookingStatusLabel, getStatusBadgeClass } from '@lib/utils/enum-mappings';
import { formatCurrency } from '@lib/utils/currency-utils';
import { Search, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, Filter, Calendar as CalendarIcon, CreditCard, MapPin, X, CheckCircle, Download } from 'lucide-react';
import { TableRowSkeleton } from '@/src/components/ui/Skeleton';
import { getErrorMessage } from '@lib/utils/error-handler';
import { useAdminTourHooks } from '@hooks/admin/useAdminTourHooks';

export default function AdminBookingsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [tourFilter, setTourFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

    // Created Date Range
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Travel Date Range
    const [travelStartDate, setTravelStartDate] = useState('');
    const [travelEndDate, setTravelEndDate] = useState('');

    const [page, setPage] = useState(1);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { useBookingsList, useUpdateStatus } = useAdminBookingHooks();
    const { useToursList } = useAdminTourHooks();

    const updateStatusMutation = useUpdateStatus();
    const { data: toursRes } = useToursList({ limit: 100 });
    const allTours = (toursRes as any)?.data?.items || [];

    const params = {
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(tourFilter && { tourId: tourFilter }),
        ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(travelStartDate && { travelStartDate }),
        ...(travelEndDate && { travelEndDate }),
        page,
        limit: 10,
    };

    const { data: response, isLoading, refetch } = useBookingsList(params);

    const handleExport = () => {
        if (bookings.length === 0) return toast.error('No data to export');

        const headers = ['Booking #', 'Date', 'Customer', 'Tour', 'Travel Date', 'Total Amount', 'Paid', 'Status'];
        const rows = bookings.map(b => [
            b.bookingNumber || b._id,
            DateUtils.formatToIST(b.createdAt, 'DD/MM/YYYY'),
            (b.user as any)?.name || 'Guest',
            `"${(b.tour?.title || 'N/A').replace(/"/g, '""')}"`, // Handle commas in titles
            b.tourDate?.startDate ? DateUtils.formatToIST(b.tourDate.startDate, 'DD/MM/YYYY') : 'N/A',
            b.totalAmount,
            b.paidAmount,
            b.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const raw = (response as any)?.data ?? response;
    const bookings: any[] = Array.isArray(raw)
        ? raw
        : (Array.isArray(raw?.items) ? raw.items : []);
    const total: number = Array.isArray(raw) ? raw.length : (raw?.total ?? 0);
    const totalPages: number = Array.isArray(raw) ? 1 : (raw?.totalPages ?? 1);

    const pendingCount = bookings.filter(b => b.status === BookingStatus.PENDING).length;
    const confirmedCount = bookings.filter(b => b.status === BookingStatus.CONFIRMED).length;
    const pageRevenue = bookings.reduce((s: number, b: any) => s + (b.totalAmount || 0), 0);

    const handleReset = () => {
        setSearch(''); setStatusFilter(''); setTourFilter(''); setPaymentStatusFilter('');
        setStartDate(''); setEndDate(''); setTravelStartDate(''); setTravelEndDate('');
        setPage(1);
    };

    /* ── Confirmation Modal State ── */
    const [pendingChange, setPendingChange] = useState<{ id: string; bookingNum: string; oldStatus: string; newStatus: string } | null>(null);
    const [changeLoading, setChangeLoading] = useState(false);
    const selectRefs = useRef<Record<string, HTMLSelectElement | null>>({});

    const requestStatusChange = (id: string, bookingNum: string, oldStatus: string, newStatus: string) => {
        if (oldStatus === newStatus) return;
        setPendingChange({ id, bookingNum, oldStatus, newStatus });
    };

    const confirmStatusChange = async () => {
        if (!pendingChange) return;
        setChangeLoading(true);
        try
        {
            await updateStatusMutation.mutateAsync({ id: pendingChange.id, status: pendingChange.newStatus });
            toast.success('Status updated');
        } catch (err: any) { toast.error(getErrorMessage(err, 'Failed to update status')); }
        finally { setChangeLoading(false); setPendingChange(null); }
    };

    const cancelStatusChange = () => {
        if (pendingChange && selectRefs.current[pendingChange.id])
        {
            selectRefs.current[pendingChange.id]!.value = pendingChange.oldStatus;
        }
        setPendingChange(null);
    };

    const StatCard = ({ label, value, color, bg, icon: Icon, active, onClick }: { label: string; value: any; color: string; bg: string; icon?: any; active?: boolean; onClick?: () => void }) => (
        <div className="col-6 col-md-3">
            <div
                onClick={onClick}
                style={{
                    background: bg,
                    borderRadius: 16,
                    padding: '20px',
                    border: `2px solid ${active ? color : 'transparent'}`,
                    boxShadow: active ? `0 8px 20px ${color}22` : 'none',
                    transition: 'all 0.2s ease',
                    cursor: onClick ? 'pointer' : 'default',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {Icon && <Icon size={40} style={{ position: 'absolute', right: -5, bottom: -5, opacity: 0.1, color }} />}
                <p className="mb-1 small fw-bold text-uppercase" style={{ color, opacity: 0.8, fontSize: 10, letterSpacing: 0.8 }}>{label}</p>
                <h4 className="mb-0 fw-black" style={{ color, fontSize: 24 }}>{value}</h4>
            </div>
        </div>
    );

    return (
        <div className="togo-dashboard-booking-sec pt-40 pb-60" style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <div className="container container-1440">

                {/* ── Header ── */}
                <div className="d-flex justify-content-between align-items-center mb-30">
                    <div>
                        <h3 className="fw-black mb-1" style={{ fontSize: 28, color: '#0f172a' }}>Booking Manager</h3>
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge" style={{ background: '#e2e8f0', color: '#475569', borderRadius: 6, padding: '4px 8px' }}>{total} Total Bookings</span>
                            <span className="text-muted small">•</span>
                            <span className="text-muted small">Manage reservations and payments</span>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            onClick={handleExport}
                            className="btn btn-white d-inline-flex align-items-center gap-2"
                            style={{ borderRadius: 10, fontWeight: 700, fontSize: 13, border: '1px solid #e2e8f0', background: '#fff', padding: '10px 16px', color: '#0f172a' }}>
                            <Download size={15} /> Export CSV
                        </button>
                        <button onClick={() => refetch()} className="btn btn-white d-inline-flex align-items-center gap-2"
                            style={{ borderRadius: 10, fontWeight: 700, fontSize: 13, border: '1px solid #e2e8f0', background: '#fff', padding: '10px 16px' }}>
                            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Refresh
                        </button>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="row g-3 mb-30">
                    <StatCard label="All Bookings" value={total} color="#6366f1" bg="#eef2ff"
                        active={!statusFilter} onClick={() => { setStatusFilter(''); setPage(1); }} />
                    <StatCard label="Pending Approval" value={pendingCount} color="#f59e0b" bg="#fffbeb" icon={AlertTriangle}
                        active={statusFilter === BookingStatus.PENDING} onClick={() => { setStatusFilter(BookingStatus.PENDING); setPage(1); }} />
                    <StatCard label="Confirmed" value={confirmedCount} color="#10b981" bg="#ecfdf5" icon={CheckCircle}
                        active={statusFilter === BookingStatus.CONFIRMED} onClick={() => { setStatusFilter(BookingStatus.CONFIRMED); setPage(1); }} />
                    <StatCard label="Total Revenue" value={formatCurrency(pageRevenue)} color="#06b6d4" bg="#ecfeff" icon={CreditCard} />
                </div>

                {/* ── Enhanced Filter Bar ── */}
                <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 4px 30px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', marginBottom: 25 }}>
                    <div className="row g-3">
                        {/* Main Search */}
                        <div className="col-lg-5">
                            <div className="position-relative">
                                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    className="form-control form-control-lg"
                                    style={{ paddingLeft: 44, borderRadius: 12, fontSize: 15, border: '1.5px solid #e2e8f0', background: '#f8fafc' }}
                                    placeholder="Search by Booking #, Name, Email or Tour..."
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Status Select */}
                        <div className="col-lg-3 col-md-6">
                            <div className="position-relative">
                                <Filter size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 10 }} />
                                <select className="form-select form-select-lg" style={{ paddingLeft: 40, borderRadius: 12, fontSize: 14, border: '1.5px solid #e2e8f0' }}
                                    value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                                    <option value="">All Statuses</option>
                                    {Object.values(BookingStatus).map(s => <option key={s} value={s}>{getBookingStatusLabel(s)}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Toggle Advanced */}
                        <div className="col-lg-2 col-md-3">
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className={`btn btn-lg w-100 d-flex align-items-center justify-content-center gap-2 ${showAdvancedFilters ? 'btn-dark' : 'btn-outline-secondary'}`}
                                style={{ borderRadius: 12, fontSize: 14, fontWeight: 700, border: showAdvancedFilters ? 'none' : '1.5px solid #e2e8f0' }}
                            >
                                <Filter size={16} /> Filters
                            </button>
                        </div>

                        {/* Reset */}
                        <div className="col-lg-2 col-md-3">
                            <button onClick={handleReset} className="btn btn-lg btn-light w-100"
                                style={{ borderRadius: 12, fontSize: 14, fontWeight: 700, background: '#f1f5f9', color: '#475569' }}>
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filter Panel */}
                    {showAdvancedFilters && (
                        <div className="mt-4 pt-4" style={{ borderTop: '1px dashed #e2e8f0' }}>
                            <div className="row g-4">
                                {/* Tour Filter */}
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted mb-2"><MapPin size={12} className="me-1" /> Filter by Tour Package</label>
                                    <select className="form-select" style={{ borderRadius: 10, fontSize: 14 }} value={tourFilter}
                                        onChange={e => { setTourFilter(e.target.value); setPage(1); }}>
                                        <option value="">All Tours</option>
                                        {allTours.map((t: any) => <option key={t._id} value={t._id}>{t.title}</option>)}
                                    </select>
                                </div>

                                {/* Payment Status */}
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted mb-2"><CreditCard size={12} className="me-1" /> Payment Condition</label>
                                    <select className="form-select" style={{ borderRadius: 10, fontSize: 14 }} value={paymentStatusFilter}
                                        onChange={e => { setPaymentStatusFilter(e.target.value); setPage(1); }}>
                                        <option value="">Any Payment Status</option>
                                        <option value="PAID">Fully Paid</option>
                                        <option value="PARTIAL">Partially Paid</option>
                                        <option value="PENDING_PAY">Unpaid / No Record</option>
                                    </select>
                                </div>

                                {/* Dates */}
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted mb-2"><CalendarIcon size={12} className="me-1" /> Created Date Range</label>
                                    <div className="d-flex gap-2">
                                        <input type="date" className="form-control" style={{ borderRadius: 10, fontSize: 13 }}
                                            value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
                                        <input type="date" className="form-control" style={{ borderRadius: 10, fontSize: 13 }}
                                            value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />
                                    </div>
                                </div>

                                {/* Travel Dates */}
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted mb-2"><MapPin size={12} className="me-1" /> Travel / Departure Date</label>
                                    <div className="d-flex gap-2">
                                        <input type="date" className="form-control" style={{ borderRadius: 10, fontSize: 13 }}
                                            value={travelStartDate} onChange={e => { setTravelStartDate(e.target.value); setPage(1); }} />
                                        <input type="date" className="form-control" style={{ borderRadius: 10, fontSize: 13 }}
                                            value={travelEndDate} onChange={e => { setTravelEndDate(e.target.value); setPage(1); }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Table ── */}
                <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    {['Booking', 'Tour', 'Customer', 'Departure', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="py-3 px-3" style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <>
                                        <TableRowSkeleton cols={8} />
                                        <TableRowSkeleton cols={8} />
                                        <TableRowSkeleton cols={8} />
                                        <TableRowSkeleton cols={8} />
                                        <TableRowSkeleton cols={8} />
                                    </>
                                ) : bookings.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-5 text-muted">No bookings found.</td></tr>
                                ) : bookings.map((b: any) => (
                                    <tr key={b._id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                        {/* Booking # */}
                                        <td className="px-3 py-3">
                                            <Link href={`/admin/bookings/${b._id}`} style={{ fontWeight: 700, fontSize: 13, color: '#4f46e5', textDecoration: 'none' }}>
                                                #{b.bookingNumber || b._id?.slice(-6)}
                                            </Link>
                                            <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>
                                                {DateUtils.formatToIST(b.createdAt, 'DD MMM YYYY')}
                                            </div>
                                        </td>

                                        {/* Tour */}
                                        <td className="px-3 py-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <img
                                                    src={b.tour?.thumbnailImage?.startsWith('http') ? b.tour.thumbnailImage
                                                        : b.tour?.thumbnailImage ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${b.tour.thumbnailImage}`
                                                            : '/assets/img/tour/home-9/order.jpg'}
                                                    alt="" style={{ width: 38, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                                                <span style={{ fontWeight: 500, fontSize: 13, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {b.tour?.title || 'N/A'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-3 py-3">
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{(b.user as any)?.name || 'Guest'}</div>
                                            <div style={{ fontSize: 11, color: '#aaa' }}>{(b.user as any)?.email || ''}</div>
                                        </td>

                                        {/* Departure */}
                                        <td className="px-3 py-3" style={{ fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>
                                            {b.tourDate?.startDate ? DateUtils.formatToIST(b.tourDate.startDate, 'DD MMM YYYY') : '—'}
                                        </td>

                                        {/* Amount */}
                                        <td className="px-3 py-3">
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{formatCurrency(b.totalAmount || 0)}</div>
                                            <div style={{ fontSize: 11, color: '#aaa' }}>{b.totalTravelers || 1} traveler{(b.totalTravelers || 1) > 1 ? 's' : ''}</div>
                                        </td>

                                        {/* Payment */}
                                        <td className="px-3 py-3">
                                            <div style={{ fontSize: 13, fontWeight: 600, color: (b.paidAmount || 0) >= b.totalAmount ? '#16a34a' : '#d97706' }}>
                                                {formatCurrency(b.paidAmount || 0)} paid
                                            </div>
                                            {(b.pendingAmount || 0) > 0 && (
                                                <div style={{ fontSize: 11, color: '#f59e0b' }}>
                                                    {formatCurrency(b.pendingAmount)} pending
                                                </div>
                                            )}
                                            {b.receiptImage && !b.paymentVerifiedAt && (
                                                <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '1px 6px', borderRadius: 4, display: 'inline-block', marginTop: 2 }}>
                                                    Receipt Pending
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-3 py-3">
                                            <span className={`px-2 py-1 rounded fw-bold text-uppercase ${getStatusBadgeClass(b.status)}`} style={{ fontSize: 11 }}>
                                                {getBookingStatusLabel(b.status)}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-3 py-3">
                                            <div className="d-flex gap-2">
                                                <select className="form-select form-select-sm" defaultValue={b.status}
                                                    ref={el => { selectRefs.current[b._id] = el; }}
                                                    onChange={e => requestStatusChange(b._id, b.bookingNumber || b._id?.slice(-6), b.status, e.target.value)}
                                                    disabled={updateStatusMutation.isPending}
                                                    style={{ width: 'auto', fontSize: 11, fontWeight: 600, borderRadius: 6 }}>
                                                    {Object.values(BookingStatus).map(s => (
                                                        <option key={s} value={s}>{getBookingStatusLabel(s)}</option>
                                                    ))}
                                                </select>
                                                <Link href={`/admin/bookings/${b._id}`} className="btn btn-sm btn-light"
                                                    style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', borderRadius: 8 }}>
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderTop: '1px solid #f1f3f9' }}>
                            <span style={{ fontSize: 13, color: '#888' }}>
                                Page {page} of {totalPages} &nbsp;·&nbsp; {total} total
                            </span>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
                                    disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                    style={{ borderRadius: 8, fontWeight: 600 }}>
                                    <ChevronLeft size={14} /> Prev
                                </button>
                                <button className="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
                                    disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                                    style={{ borderRadius: 8, fontWeight: 600 }}>
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* ── Status Change Confirmation Modal ── */}
            {pendingChange && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                            <h6 className="mb-0 fw-bold">Confirm Status Change</h6>
                        </div>
                        <p className="text-muted mb-3" style={{ fontSize: 14, lineHeight: 1.6 }}>
                            Change booking <strong>#{pendingChange.bookingNum}</strong> from{' '}
                            <span className="fw-bold">{getBookingStatusLabel(pendingChange.oldStatus)}</span> → <span className="fw-bold">{getBookingStatusLabel(pendingChange.newStatus)}</span>?
                        </p>
                        {pendingChange.newStatus === BookingStatus.CANCELLED && (
                            <div className="mb-3 p-2 rounded" style={{ background: '#fef2f2', border: '1px solid #fca5a5', fontSize: 12, color: '#991b1b' }}>
                                ⚠ Inline status override does NOT restore seats or release coupons. Use the booking detail Cancel button for proper cancellation.
                            </div>
                        )}
                        <div className="d-flex gap-2">
                            <button onClick={cancelStatusChange} disabled={changeLoading}
                                className="btn btn-light flex-grow-1" style={{ borderRadius: 10, fontWeight: 600, padding: '11px 0' }}>Cancel</button>
                            <button onClick={confirmStatusChange} disabled={changeLoading}
                                className="btn flex-grow-1" style={{ background: '#4f46e5', color: '#fff', borderRadius: 10, fontWeight: 700, padding: '11px 0' }}>
                                {changeLoading ? 'Updating…' : 'Confirm Change'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
