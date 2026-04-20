'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyBookings, useCancelBooking } from '@lib/hooks/useBookingHooks';
import { Booking } from '@lib/types/booking.types';
import { BookingStatus } from '@lib/constants/enums';
import { DateUtils } from '@lib/utils/date-utils';
import { getImgUrl } from '@lib/utils/image';
import ConfirmationModal from '@components/common/ConfirmationModal';
import toast from 'react-hot-toast';

// ─── helpers ────────────────────────────────────────────────────────────────

function getTourImg(booking: Booking) {
    const tour = booking.tour as any;
    const img = tour?.thumbnailImage || tour?.images?.[0];
    return getImgUrl(img);
}
function getTourTitle(booking: Booking) {
    return (booking.tour as any)?.title || 'Tour';
}
function getTravelDate(booking: Booking) {
    const d = (booking.tourDate as any)?.startDate;
    return d
        ? DateUtils.formatToIST(d, 'DD MMM YYYY')
        : DateUtils.formatToIST(booking.createdAt, 'DD MMM YYYY');
}
function fmtINR(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(amount || 0);
}

// ─── status config ───────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    [BookingStatus.CONFIRMED]: { label: 'Confirmed', color: '#059669', bg: '#dcfce7', dot: '#10b981' },
    [BookingStatus.PENDING]: { label: 'Pending', color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' },
    [BookingStatus.COMPLETED]: { label: 'Completed', color: '#2563eb', bg: '#dbeafe', dot: '#3b82f6' },
    [BookingStatus.CANCELLED]: { label: 'Cancelled', color: '#dc2626', bg: '#fee2e2', dot: '#ef4444' },
    VERIFICATION_PENDING: { label: 'Verification Pending', color: '#0284c7', bg: '#e0f2fe', dot: '#0ea5e9' },
    REFUND_REQUESTED: { label: 'Refund Requested', color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
    REFUND_APPROVED: { label: 'Refund Approved', color: '#4f46e5', bg: '#eef2ff', dot: '#6366f1' },
    REFUND_PROCESSED: { label: 'Refund Processed', color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
    REFUND_REJECTED: { label: 'Refund Rejected', color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
};

const TABS = [
    { key: 'All', label: 'All' },
    { key: BookingStatus.CONFIRMED, label: 'Confirmed' },
    { key: BookingStatus.PENDING, label: 'Pending' },
    { key: BookingStatus.COMPLETED, label: 'Completed' },
    { key: BookingStatus.CANCELLED, label: 'Cancelled' },
];

// ─── component ───────────────────────────────────────────────────────────────

export default function DashboardBookingsPage() {
    const [activeTab, setActiveTab] = useState<string>('All');

    // Always fetch all bookings so client-side counts + instant tab switching work.
    // If your API is paginated, pass status=undefined here and filter client-side.
    const { data, isLoading } = useMyBookings({ limit: 100 });
    const cancelMutation = useCancelBooking();

    // ── Modal State ──
    const [modal, setModal] = useState({
        isOpen: false,
        bookingId: '',
        title: '',
        message: ''
    });

    const extractArray = (d: any): Booking[] =>
        Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.items) ? d.items : [];

    const allBookings = extractArray(data);

    // ── Client-side filter for instant tab switching ──
    const bookings: Booking[] =
        activeTab === 'All'
            ? allBookings
            : allBookings.filter((b) => b.status === activeTab);

    const countFor = (key: string) =>
        key === 'All' ? allBookings.length : allBookings.filter((b) => b.status === key).length;

    const handleCancel = (id: string) => {
        const booking = allBookings.find(b => b._id === id);
        setModal({
            isOpen: true,
            bookingId: id,
            title: 'Cancel Booking',
            message: `Are you sure you want to cancel your booking for "${getTourTitle(booking as any)}"? This action cannot be undone.`
        });
    };

    const confirmCancel = async () => {
        try
        {
            await cancelMutation.mutateAsync({ id: modal.bookingId });
            toast.success('Booking cancelled successfully');
            setModal({ ...modal, isOpen: false });
        } catch (err: any)
        {
            toast.error(err?.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const getStatusMeta = (booking: Booking) => {
        if (booking.refundStatus && booking.refundStatus !== 'NONE')
        {
            return STATUS_META[`REFUND_${booking.refundStatus}` as keyof typeof STATUS_META] ||
                { label: `Refund ${booking.refundStatus.toLowerCase()}`, color: '#666', bg: '#f3f4f6', dot: '#9ca3af' };
        }
        if (booking.status === BookingStatus.PENDING && (booking as any).receiptImage)
            return STATUS_META.VERIFICATION_PENDING;
        return STATUS_META[booking.status] ?? { label: booking.status, color: '#666', bg: '#f3f4f6', dot: '#9ca3af' };
    };

    return (
        <>
            <style>{CSS}</style>

            <div className="bk-page">

                {/* ── Header ── */}
                <div className="bk-header">
                    <h1 className="bk-title">My Bookings</h1>
                    <p className="bk-subtitle">Track and manage all your travel reservations</p>
                </div>

                {/* ── Filter Tabs ── */}
                <div className="bk-tabs-wrap">
                    <div className="bk-tabs" role="tablist">
                        {TABS.map(({ key, label }) => {
                            const count = countFor(key);
                            const active = activeTab === key;
                            return (
                                <button
                                    key={key}
                                    role="tab"
                                    aria-selected={active}
                                    className={`bk-tab${active ? ' bk-tab--active' : ''}`}
                                    onClick={() => setActiveTab(key)}
                                >
                                    {label}
                                    {!isLoading && (
                                        <span className={`bk-badge-pill${active ? ' bk-badge-pill--on' : ''}`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bk-card">
                    {isLoading ? (
                        <div className="bk-loader">
                            <span className="bk-spinner" />
                            <p>Loading your bookings…</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="bk-empty">
                            <div className="bk-empty-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e84033" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 19C20.1046 19 21 18.1046 21 17V14C19.8954 14 19 13.1046 19 12C19 10.8954 19.8954 10 21 10V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V10C4.10457 10 5 10.8954 5 12C5 13.1046 4.10457 14 3 14V17C3 18.1046 3.89543 19 5 19H19Z" />
                                </svg>
                            </div>
                            <h3 className="bk-empty-title">No bookings found</h3>
                            <p className="bk-empty-sub">
                                {activeTab === 'All'
                                    ? "You haven't made any reservations yet."
                                    : `No ${label(activeTab).toLowerCase()} bookings at the moment.`}
                            </p>
                            <Link href="/tours" className="bk-cta">Explore Tours</Link>
                        </div>
                    ) : (
                        <>
                            {/* Desktop header row */}
                            <div className="bk-thead">
                                <div className="c-id">Booking #</div>
                                <div className="c-tour">Tour</div>
                                <div className="c-date">Order Date</div>
                                <div className="c-date">Travel Date</div>
                                <div className="c-amt">Amount</div>
                                <div className="c-status">Status</div>
                                <div className="c-inv">Invoice</div>
                                <div className="c-act">Action</div>
                            </div>

                            {/* Data rows */}
                            {bookings.map((booking, idx) => {
                                const meta = getStatusMeta(booking);
                                const hasInvoice =
                                    booking.status === BookingStatus.CONFIRMED ||
                                    booking.status === BookingStatus.COMPLETED;
                                const canCancel =
                                    booking.status === BookingStatus.PENDING ||
                                    booking.status === BookingStatus.CONFIRMED;
                                const needsUpload =
                                    (booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED) &&
                                    ((booking as any).pendingAmount || 0) > 0 &&
                                    !(booking as any).receiptImage;

                                return (
                                    <div
                                        key={booking._id}
                                        className={`bk-row${idx < bookings.length - 1 ? ' bk-row--sep' : ''}`}
                                    >
                                        {/* ID */}
                                        <div className="c-id">
                                            <span className="m-lbl">Booking #</span>
                                            <span className="bk-id">{(booking as any).bookingNumber || `#${idx + 1}`}</span>
                                        </div>

                                        {/* Tour */}
                                        <div className="c-tour bk-tour">
                                            <img src={getTourImg(booking)} alt={getTourTitle(booking)} className="bk-thumb" />
                                            <Link href={`/dashboard/bookings/${booking._id}`} className="bk-tname">
                                                {getTourTitle(booking)}
                                            </Link>
                                        </div>

                                        {/* Order date */}
                                        <div className="c-date">
                                            <span className="m-lbl">Order Date</span>
                                            <span className="bk-dt">{DateUtils.formatToIST(booking.createdAt, 'DD MMM YYYY')}</span>
                                        </div>

                                        {/* Travel date */}
                                        <div className="c-date">
                                            <span className="m-lbl">Travel Date</span>
                                            <span className="bk-dt">{getTravelDate(booking)}</span>
                                        </div>

                                        {/* Amount */}
                                        <div className="c-amt">
                                            <span className="m-lbl">Amount</span>
                                            <span className="bk-amt">{fmtINR(booking.totalAmount)}</span>
                                        </div>

                                        {/* Status */}
                                        <div className="c-status">
                                            <span className="m-lbl">Status</span>
                                            <div className="d-flex flex-column gap-1 align-items-end align-items-md-start">
                                                <span className="bk-status" style={{ color: meta.color, background: meta.bg }}>
                                                    <i className="bk-dot" style={{ background: meta.dot }} />
                                                    {meta.label}
                                                </span>
                                                {booking.status === BookingStatus.CONFIRMED && (booking.pendingAmount || 0) > 0 && (
                                                    <span className="badge rounded-pill" style={{ fontSize: '10px', background: '#fff0ee', color: '#e84033', border: '1px solid #ffcfcc' }}>
                                                        Partial – {fmtINR(booking.pendingAmount)} pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Invoice */}
                                        <div className="c-inv">
                                            <span className="m-lbl">Invoice</span>
                                            {hasInvoice ? (
                                                <Link href={`/dashboard/invoice/${booking._id}`} className="bk-inv-btn">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                        <line x1="16" y1="13" x2="8" y2="13" />
                                                        <line x1="16" y1="17" x2="8" y2="17" />
                                                    </svg>
                                                    Invoice
                                                </Link>
                                            ) : (
                                                <span className="bk-dash">—</span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="c-act bk-acts">
                                            <Link href={`/dashboard/bookings/${booking._id}`} className="bk-btn bk-btn--red">Detail</Link>
                                            {needsUpload && (
                                                <Link href={`/dashboard/bookings/${booking._id}`} className="bk-btn bk-btn--gold">Upload Proof</Link>
                                            )}
                                            {canCancel && (
                                                <button
                                                    className="bk-btn bk-btn--ghost"
                                                    onClick={() => handleCancel(booking._id)}
                                                    disabled={cancelMutation.isPending}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={confirmCancel}
                title={modal.title}
                message={modal.message}
                type="danger"
                confirmText="Cancel Booking"
                isLoading={cancelMutation.isPending}
            />
        </>
    );
}

function label(key: string) {
    return TABS.find(t => t.key === key)?.label ?? key;
}

// ─── Scoped CSS ──────────────────────────────────────────────────────────────

const CSS = `

.bk-page { padding:36px 28px 80px; max-width:1280px; margin:0 auto; }

/* Header */
.bk-header { margin-bottom:26px; }
.bk-title  { font-size:32px; color:#1a1a1a; letter-spacing:-0.4px; line-height:1.15; margin:0 0 4px; }
.bk-subtitle { font-size:14px; color:#999; margin:0; }

/* Tabs */
.bk-tabs-wrap { margin-bottom:20px; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
.bk-tabs-wrap::-webkit-scrollbar { display:none; }
.bk-tabs { display:inline-flex; gap:5px; background:#efefef; border-radius:14px; padding:5px; white-space:nowrap; }

.bk-tab {
  display:inline-flex; align-items:center; gap:7px;
  padding:8px 16px; border:none; background:transparent;
  border-radius:10px; font-size:13px; font-weight:500;
  color:#777; cursor:pointer; transition:all .18s;
  font-family:inherit; outline:none;
}
.bk-tab:hover { color:#e84033; }
.bk-tab--active { background:#fff; color:#1a1a1a; font-weight:700; box-shadow:0 2px 10px rgba(0,0,0,.09); }

.bk-badge-pill { font-size:11px; font-weight:700; padding:2px 7px; border-radius:20px; background:#e2e2e2; color:#888; line-height:1.4; }
.bk-badge-pill--on { background:#fff0ee; color:#e84033; }

/* Card */
.bk-card { background:#fff; border-radius:18px; border:1px solid #ebebeb; box-shadow:0 2px 20px rgba(0,0,0,.055); overflow-x:auto; -webkit-overflow-scrolling:touch; }
.bk-card::-webkit-scrollbar { height:6px; }
.bk-card::-webkit-scrollbar-track { background:#f1f1f1; border-radius:10px; }
.bk-card::-webkit-scrollbar-thumb { background:#ddd; border-radius:10px; }
.bk-card::-webkit-scrollbar-thumb:hover { background:#ccc; }

/* Grid column widths */
.c-id     { flex:0 0 145px; min-width:0; }
.c-tour   { flex:1 1 0;     min-width:200px; padding-right:15px; }
.c-date   { flex:0 0 115px; }
.c-amt    { flex:0 0 115px; }
.c-status { flex:0 0 160px; }
.c-inv    { flex:0 0 115px; display:flex; justify-content:center; }
.c-act    { flex:0 0 150px; display:flex; justify-content:center; }

/* Table head */
.bk-thead { display:flex; align-items:center; padding:15px 24px; border-bottom:2px solid #f3f3f3; background:#fafafa; }
.bk-thead > div { font-size:11px; font-weight:700;  text-transform:uppercase; letter-spacing:.55px; color:#888; }

/* Row */
.bk-row { display:flex; align-items:center; padding:18px 24px; transition:background .12s; }
.bk-row:hover { background:#f9f9f9; }
.bk-row--sep { border-bottom:1px solid #f2f2f2; }

/* Booking ID */
.bk-id { font-size:12px; font-weight:600; color:#555; word-break:break-all; }

/* Tour */
.bk-tour { display:flex; align-items:center; gap:12px; }
.bk-thumb { width:48px; height:48px; border-radius:12px; object-fit:cover; flex-shrink:0; background:#f0f0f0; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.bk-tname { font-size:14px; font-weight:700; color:#1a1a1a; text-decoration:none; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.bk-tname:hover { color:#e84033; }

/* Date / Amount */
.bk-dt  { font-size:13px; color:#666; font-weight:500; }
.bk-amt { font-size:15px; font-weight:800; color:#1a1a1a; }

/* Status badge */
.bk-status { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:10px; font-size:11px; font-weight:700; white-space:nowrap; }
.bk-dot { display:inline-block; width:6px; height:6px; border-radius:50%; flex-shrink:0; }

/* Invoice */
.bk-inv-btn { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:10px; font-size:12px; font-weight:700; background:#f0f4ff; color:#4f46e5; border:1px solid #dde3fb; text-decoration:none; transition:all .15s; white-space:nowrap; }
.bk-inv-btn:hover { background:#e0e7ff; color:#3730a3; transform:translateY(-1px); }
.bk-dash { color:#d0d0d0; font-size:14px; }

/* Action buttons */
.bk-acts { display:flex; flex-direction:column; gap:6px; align-items:stretch; width:105px; }
.bk-btn { display:block; width:100%; text-align:center; border-radius:10px; font-size:12px; font-weight:700; padding:6px 8px; cursor:pointer; text-decoration:none; font-family:inherit; transition:all .15s; white-space:nowrap; border:none; }
.bk-btn--red   { background:#e84033; color:#fff; box-shadow:0 2px 6px rgba(232,64,51,.2); }
.bk-btn--red:hover { background:#cc3028; transform:translateY(-1px); box-shadow:0 4px 12px rgba(232,64,51,.3); }
.bk-btn--ghost { background:transparent; color:#999; border:1.5px solid #eaeaea; }
.bk-btn--ghost:hover { border-color:#e84033; color:#e84033; background:#fff5f4; }
.bk-btn--ghost:disabled { opacity:.45; cursor:not-allowed; }
.bk-btn--gold  { background:#fff8e0; color:#b45309; border:1px solid #fde68a; }
.bk-btn--gold:hover { background:#fef3c7; }

/* CTA */
.bk-cta { display:inline-block; padding:12px 32px; background:#e84033; color:#fff; border-radius:14px; font-size:15px; font-weight:700; text-decoration:none; box-shadow:0 4px 14px rgba(232,64,51,.25); transition:all .2s; }
.bk-cta:hover { background:#cc3028; transform:translateY(-1px); box-shadow:0 6px 20px rgba(232,64,51,.35); }

/* Loader */
.bk-loader { display:flex; flex-direction:column; align-items:center; gap:16px; padding:80px 24px; color:#aaa; font-size:14px; }
.bk-spinner { width:32px; height:32px; border:3.5px solid #f0f0f0; border-top-color:#e84033; border-radius:50%; animation:_spin .7s linear infinite; }
@keyframes _spin { to { transform:rotate(360deg); } }

/* Empty */
.bk-empty { display:flex; flex-direction:column; align-items:center; padding:100px 24px; text-align:center; }
.bk-empty-icon { width:70px; height:70px; background:#fff0ee; border-radius:20px; display:flex; align-items:center; justify-content:center; margin-bottom:20px; }
.bk-empty-title { font-size:24px; font-weight:800; color:#1a1a1a; margin:0 0 10px; }
.bk-empty-sub { font-size:15px; color:#999; margin:0 0 26px; }

/* Mobile label — hidden on desktop */
.m-lbl { display:none; }

/* ── Responsive ── */
@media (max-width:992px) {
  .bk-page { padding:24px 16px 80px; }
  .bk-title { font-size:28px; }
  .bk-thead { display:none; }
  .bk-card { background:transparent; border:none; box-shadow:none; overflow:visible; }

  .bk-row { 
    flex-direction:column; align-items:stretch; 
    padding:20px; gap:15px; 
    background:#fff; border-radius:20px; 
    border:1px solid #eee; margin-bottom:16px;
    box-shadow:0 2px 12px rgba(0,0,0,.04);
  }
  .bk-row:hover { background:#fff; transform:none; }
  .bk-row--sep { border-bottom:1px solid #eee; }

  .c-id,.c-tour,.c-date,.c-amt,.c-status,.c-inv,.c-act {
    flex:none; width:100%;
    display:flex; justify-content:space-between; align-items:center; padding-right:0;
  }
  
  /* Mobile Tour Header */
  .c-tour { 
    order:-1; flex-direction:row; justify-content:flex-start; 
    padding-bottom:12px; border-bottom:1px solid #f5f5f5; 
    margin-bottom:5px;
  }
  .bk-thumb { width:56px; height:56px; }
  .bk-tname { font-size:15px; -webkit-line-clamp:2; }

  .m-lbl { 
    display:inline; font-size:10px; color:#bbb; 
    font-weight:800; text-transform:uppercase; letter-spacing:.6px; 
  }
  
  .bk-id { font-size:13px; color:#1a1a1a; }
  .bk-dt, .bk-amt { font-size:14px; }
  
  .bk-acts { flex-direction:row; width:auto; margin-top:5px; }
  .bk-btn { flex:1; padding:10px; font-size:13px; }
}
`;