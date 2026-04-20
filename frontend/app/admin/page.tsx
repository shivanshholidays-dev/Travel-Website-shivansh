'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAdminDashboardHooks } from '@hooks/admin/useAdminDashboardHooks';
import { useAdminBookingHooks } from '@hooks/admin/useAdminBookingHooks';
import { DateUtils } from '@lib/utils/date-utils';
import { formatCurrency } from '@lib/utils/currency-utils';
import { BookingStatus } from '@lib/constants/enums';
import { getBookingStatusLabel } from '@lib/utils/enum-mappings';
import { getImgUrl } from '@lib/utils/image';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
    IndianRupee, Ticket, Package, Star,
    Bell, Download, ArrowUpRight,
    CheckCircle, AlertCircle, TrendingUp, Calendar, MapPin,
    CreditCard, AlertTriangle, Gift, ChevronRight, Activity,
    XCircle,
} from 'lucide-react';

// ─── Booking status → activity icon/colour ───────────────────────────────────
const getActivityMeta = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === BookingStatus.CONFIRMED) return { icon: <CheckCircle size={15} />, color: '#2d8a4e', bg: '#eaf8e7', label: 'Confirmed' };
    if (s === BookingStatus.COMPLETED) return { icon: <CheckCircle size={15} />, color: '#1a73e8', bg: '#e8f0fe', label: 'Completed' };
    if (s === BookingStatus.CANCELLED) return { icon: <XCircle size={15} />, color: '#e55', bg: '#fff2f5', label: 'Cancelled' };
    if (s === 'PAYMENT_PENDING') return { icon: <CreditCard size={15} />, color: '#f5a623', bg: '#fff6e4', label: 'Payment Pending' };
    if (s === 'PENDING') return { icon: <Ticket size={15} />, color: '#888', bg: '#f8f9fa', label: 'Booking Received' };
    return { icon: <Activity size={15} />, color: '#666', bg: '#f8f9fa', label: 'Activity' };
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const statusStyle = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === BookingStatus.CONFIRMED) return { bg: '#eaf8e7', color: '#2d8a4e' };
    if (s === BookingStatus.COMPLETED) return { bg: '#e8f0fe', color: '#1a73e8' };
    if (s === BookingStatus.CANCELLED) return { bg: '#fff2f5', color: '#e55' };
    if (s === 'PAYMENT_PENDING' || s === 'PENDING') return { bg: '#fff6e4', color: '#f5a623' };
    return { bg: '#f1f3f9', color: '#555' };
};

// ─── Response shape normalizer ─────────────────────────────────────────────────
const toArray = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data && typeof raw.data === 'object')
    {
        if (Array.isArray(raw.data.items)) return raw.data.items;
        if (Array.isArray(raw.data.data)) return raw.data.data;
    }
    if (Array.isArray(raw.items)) return raw.items;
    return [];
};

const toObj = (raw: any) => {
    if (!raw) return {};
    if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) return raw.data;
    return raw;
};

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: '12px 16px', fontSize: '13px', border: 'none' }}>
            <p style={{ marginBottom: '4px', color: '#888', fontSize: '11px', fontWeight: 700 }}>{label}</p>
            <p style={{ margin: 0, color: '#1a73e8', fontWeight: 800, fontSize: '15px' }}>{formatCurrency(payload[0].value)}</p>
        </div>
    );
};

export default function AdminPage() {
    // ─── Only 4 API calls: summary, revenue-chart, top-tours, bookings ──────
    const { useSummary, useRevenueChart, useTopTours } = useAdminDashboardHooks();
    const { useBookingsList } = useAdminBookingHooks();
    const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

    const { data: summaryRaw, isLoading: isSummaryLoading } = useSummary();
    const { data: chartRaw, isLoading: isChartLoading } = useRevenueChart(chartPeriod);
    const { data: topToursRaw, isLoading: isTopToursLoading } = useTopTours();
    // Single bookings call powers BOTH Recent Activity AND Platform Intelligence
    const { data: bookingsRaw, isLoading: isBookingsLoading } = useBookingsList({ limit: 10 });

    // ─── Normalise ───────────────────────────────────────────────────────────
    const summary = toObj(summaryRaw);
    const chartData = toArray(chartRaw);
    const topTours = toArray(topToursRaw);
    const allBookings = toArray(bookingsRaw);
    const recentBookings = allBookings.slice(0, 5);      // table
    const activityFeed = allBookings.slice(0, 8);      // Platform Intelligence

    // ─── Revenue chart: pad single-point months with context zeros ───────────
    const buildChartData = () => {
        if (chartData.length === 0) return [];
        if (chartData.length === 1 && chartPeriod === 'monthly')
        {
            const [year, month] = chartData[0].date.split('-').map(Number);
            const prev = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
            const next = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;
            return [{ date: prev, revenue: 0 }, chartData[0], { date: next, revenue: 0 }];
        }
        return chartData;
    };
    const displayChart = buildChartData();
    const maxRevenue = Math.max(...displayChart.map(d => d.revenue), 0);
    const totalPeriodRev = chartData.reduce((sum, d) => sum + d.revenue, 0);

    const STATS = [
        { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue || 0), sub: `Today: ${formatCurrency(summary.revenueToday || 0)}`, icon: <IndianRupee size={20} />, color: '#1a73e8', bg: '#e8f0fe' },
        { label: 'Total Bookings', value: summary.totalBookings ?? '—', sub: `Today: ${summary.bookingsToday ?? 0} new`, icon: <Ticket size={20} />, color: '#2d8a4e', bg: '#eaf8e7' },
        { label: 'Active Tours', value: summary.activeTours ?? '—', sub: `${summary.totalUsers ?? 0} registered users`, icon: <Package size={20} />, color: '#9c27b0', bg: '#f3e5f5' },
        { label: 'Pending Reviews', value: summary.pendingReviews ?? '—', sub: 'Awaiting approval', icon: <Star size={20} />, color: '#f5a623', bg: '#fff6e4' },
    ];

    return (
        <div className="pb-60">
            <div className="container-fluid container-1440 mt-2">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-30">
                    <div>
                        <h4 className="mb-1" style={{ fontSize: '24px', fontWeight: 800, color: '#111' }}>Command Center</h4>
                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Real-time intelligence and platform performance overview.</p>
                    </div>
                    {/* <button className="btn btn-dark d-flex align-items-center gap-2" style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 700, fontSize: '13px' }}>
                        <Download size={16} /> Export
                    </button> */}
                </div>

                {/* KPI Cards */}
                <div className="row g-3 mb-24">
                    {isSummaryLoading
                        ? Array(4).fill(0).map((_, i) => <div key={i} className="col-xl-3 col-md-6"><div className="loading-skeleton" style={{ height: '130px', borderRadius: '16px' }} /></div>)
                        : STATS.map((s) => (
                            <div key={s.label} className="col-xl-3 col-md-6">
                                <div style={{ background: '#fff', borderRadius: '16px', padding: '22px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f1f5', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: s.bg, opacity: 0.4 }} />
                                    <div className="d-flex justify-content-between align-items-start mb-12">
                                        <p style={{ fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 0 }}>{s.label}</p>
                                        <div style={{ width: '36px', height: '36px', background: s.bg, color: s.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                                    </div>
                                    <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#111', marginBottom: '6px', lineHeight: 1 }}>{s.value}</h3>
                                    <div className="d-flex align-items-center gap-1" style={{ fontSize: '11px', color: '#aaa' }}>
                                        <ArrowUpRight size={12} color="#2d8a4e" />
                                        <span>{s.sub}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {/* Revenue Chart + Tour Portfolio */}
                <div className="row g-3 mb-24">
                    <div className="col-xl-8">
                        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f1f5', height: '100%' }}>
                            <div className="d-flex justify-content-between align-items-center mb-20">
                                <div>
                                    <h5 className="mb-0" style={{ fontWeight: 800, color: '#111', fontSize: '16px' }}>Revenue Intelligence</h5>
                                    <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
                                        {chartData.length > 0 ? `${chartPeriod} · ${formatCurrency(totalPeriodRev)} period total` : 'Booking payment revenue by period'}
                                    </p>
                                </div>
                                <div className="d-flex gap-1" style={{ background: '#f8f9fa', borderRadius: '10px', padding: '4px' }}>
                                    {(['daily', 'monthly', 'yearly'] as const).map(p => (
                                        <button key={p} onClick={() => setChartPeriod(p)} style={{
                                            fontSize: '11px', fontWeight: 700, borderRadius: '8px', padding: '6px 14px',
                                            background: chartPeriod === p ? '#111' : 'transparent',
                                            color: chartPeriod === p ? '#fff' : '#888', border: 'none', cursor: 'pointer',
                                        }}>
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ height: '300px' }}>
                                {isChartLoading ? (
                                    <div className="d-flex justify-content-center align-items-center h-100 text-muted"><div className="spinner-border spinner-border-sm me-2" /><span style={{ fontSize: '13px' }}>Loading...</span></div>
                                ) : displayChart.length === 0 ? (
                                    <div className="d-flex flex-column justify-content-center align-items-center h-100 gap-2 text-muted">
                                        <TrendingUp size={48} strokeWidth={1} />
                                        <p style={{ fontSize: '14px', fontWeight: 600 }}>No revenue data for this period.</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={displayChart} margin={{ top: 10, right: 10, left: 5, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#1a73e8" stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor="#1a73e8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f1f5" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#aaa', fontWeight: 600 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#aaa', fontWeight: 600 }} tickFormatter={v => v === 0 ? '₹0' : `₹${(v / 1000).toFixed(0)}k`} domain={[0, maxRevenue > 0 ? maxRevenue * 1.2 : 100000]} width={50} />
                                            <ReferenceLine y={0} stroke="#f0f1f5" strokeWidth={1} />
                                            <RechartsTooltip content={<RevenueTooltip />} />
                                            <Area type="monotone" dataKey="revenue" stroke="#1a73e8" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: '#1a73e8', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#1a73e8', stroke: '#fff', strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4">
                        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f1f5', height: '100%' }}>
                            <div className="d-flex justify-content-between align-items-center mb-20">
                                <div>
                                    <h5 className="mb-0" style={{ fontWeight: 800, color: '#111', fontSize: '16px' }}>Tour Portfolio</h5>
                                    <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Top by booking volume</p>
                                </div>
                                <Link href="/admin/tours" className="d-flex align-items-center gap-1" style={{ fontSize: '12px', fontWeight: 700, color: '#1a73e8', textDecoration: 'none' }}>All <ChevronRight size={13} /></Link>
                            </div>
                            {isTopToursLoading ? (
                                <div className="d-flex flex-column gap-3">{Array(4).fill(0).map((_, i) => (<div key={i} className="d-flex align-items-center gap-3"><div className="loading-skeleton" style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0 }} /><div style={{ flex: 1 }}><div className="loading-skeleton mb-1" style={{ height: '13px', width: '70%', borderRadius: '4px' }} /><div className="loading-skeleton" style={{ height: '11px', width: '40%', borderRadius: '4px' }} /></div></div>))}</div>
                            ) : topTours.length === 0 ? (
                                <div className="d-flex flex-column align-items-center justify-content-center py-4 text-muted gap-2"><Package size={36} strokeWidth={1} /><p style={{ fontSize: '13px', fontWeight: 600, marginBottom: 0 }}>No booking data yet</p></div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {topTours.slice(0, 5).map((tour: any, i: number) => {
                                        const rankColors = ['#f5a623', '#9e9ea0', '#cd7f32', '#aaa', '#aaa'];
                                        return (
                                            <div key={i} className="d-flex align-items-center gap-3 p-2" style={{ borderRadius: '12px', transition: 'background 0.15s' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                <div style={{ width: '22px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: rankColors[i] ?? '#ccc', flexShrink: 0 }}>#{i + 1}</div>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1px solid #f0f1f5', background: '#f8f9fa' }}>
                                                    {tour.thumbnailImage ? <img src={getImgUrl(tour.thumbnailImage)} alt={tour.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="d-flex align-items-center justify-content-center h-100" style={{ color: '#ccc' }}><MapPin size={16} /></div>}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tour.title}</div>
                                                    <div className="d-flex align-items-center gap-1" style={{ fontSize: '11px', color: '#aaa' }}><Ticket size={10} /> {tour.bookingCount} booking{tour.bookingCount !== 1 ? 's' : ''}</div>
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: 800, color: '#2d8a4e', flexShrink: 0 }}>{formatCurrency(tour.revenue || 0)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity + Platform Intelligence */}
                <div className="row g-3">
                    <div className="col-xl-8">
                        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f1f5' }}>
                            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                                <div>
                                    <h5 className="mb-0" style={{ fontWeight: 800, fontSize: '16px' }}>Recent Activity</h5>
                                    <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Latest 5 bookings · All statuses</p>
                                </div>
                                <Link href="/admin/bookings" className="btn btn-sm btn-light" style={{ fontSize: '12px', fontWeight: 700, borderRadius: '8px' }}>Manage All →</Link>
                            </div>
                            <div className="table-responsive">
                                <table className="table mb-0 align-middle">
                                    <thead style={{ background: '#fafbfc' }}>
                                        <tr>
                                            {['Booking', 'Client', 'Date', 'Amount', 'Status', ''].map(h => (
                                                <th key={h} className="py-3 px-3" style={{ fontSize: '10px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f0f1f5', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isBookingsLoading ? (
                                            <tr><td colSpan={6} className="text-center py-5 text-muted" style={{ fontSize: '13px' }}>Loading bookings...</td></tr>
                                        ) : recentBookings.length === 0 ? (
                                            <tr><td colSpan={6} className="py-5"><div className="d-flex flex-column align-items-center text-muted gap-2"><Ticket size={36} strokeWidth={1} /><p className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>No bookings yet</p></div></td></tr>
                                        ) : recentBookings.map((b: any) => {
                                            const ss = statusStyle(b.status);
                                            const bId = b._id || b.id;
                                            return (
                                                <tr key={bId} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                                    <td className="px-3 py-3">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div style={{ width: '36px', height: '28px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid #f0f1f5', background: '#f8f9fa' }}>
                                                                {b.tour?.thumbnailImage ? <img src={getImgUrl(b.tour.thumbnailImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="d-flex align-items-center justify-content-center h-100" style={{ color: '#ddd' }}><Package size={12} /></div>}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '11px', fontWeight: 800, color: '#1a73e8', fontFamily: 'monospace' }}>#{b.bookingNumber || bId?.slice(-6)}</div>
                                                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#333', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.tour?.title || 'Unknown Tour'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3">
                                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#222' }}>{b.user?.name || b.contactName || 'Guest'}</div>
                                                        <div style={{ fontSize: '11px', color: '#aaa', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.user?.email || '—'}</div>
                                                    </td>
                                                    <td className="px-3" style={{ fontSize: '12px', color: '#666', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                        {/* IST-safe date using project's DateUtils — no new Date() */}
                                                        {DateUtils.formatToIST(b.createdAt, 'DD MMM YY')}
                                                    </td>
                                                    <td className="px-3" style={{ fontSize: '13px', fontWeight: 800, color: '#111', whiteSpace: 'nowrap' }}>{formatCurrency(b.totalAmount || 0)}</td>
                                                    <td className="px-3">
                                                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', background: ss.bg, color: ss.color, whiteSpace: 'nowrap' }}>
                                                            {getBookingStatusLabel(b.status) || b.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 text-end">
                                                        <Link href={`/admin/bookings/${bId}`} className="btn btn-sm btn-light" style={{ fontSize: '11px', fontWeight: 700, borderRadius: '6px', padding: '4px 10px' }}>View</Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Platform Intelligence — derived from bookings (no extra API call) */}
                    <div className="col-xl-4">
                        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f1f5', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div className="d-flex justify-content-between align-items-center mb-20">
                                <div>
                                    <h5 className="mb-0" style={{ fontWeight: 800, fontSize: '16px' }}>Platform Intelligence</h5>
                                    <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Recent booking activity · live data</p>
                                </div>
                                <div style={{ padding: '6px', background: '#f8f9fa', borderRadius: '8px', color: '#aaa' }}><Bell size={16} /></div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px' }}>
                                {isBookingsLoading ? (
                                    <div className="d-flex flex-column gap-3">
                                        {Array(5).fill(0).map((_, i) => (
                                            <div key={i} className="d-flex align-items-start gap-3 p-2">
                                                <div className="loading-skeleton" style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}><div className="loading-skeleton mb-1" style={{ height: '12px', width: '65%', borderRadius: '4px' }} /><div className="loading-skeleton" style={{ height: '11px', width: '90%', borderRadius: '4px' }} /></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : activityFeed.length === 0 ? (
                                    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2 text-muted" style={{ flex: 1 }}>
                                        <CheckCircle size={40} strokeWidth={1} /><p style={{ fontSize: '13px', fontWeight: 600, marginBottom: 0 }}>No activity yet</p>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-1">
                                        {activityFeed.map((b: any) => {
                                            const meta = getActivityMeta(b.status);
                                            const bId = b._id || b.id;
                                            return (
                                                <div key={bId} className="d-flex gap-3 p-2" style={{ borderRadius: '10px', transition: 'background 0.15s', cursor: 'default' }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                    <div style={{ width: '36px', height: '36px', background: meta.bg, color: meta.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${meta.color}22` }}>
                                                        {meta.icon}
                                                    </div>
                                                    <div style={{ minWidth: 0, flex: 1 }}>
                                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', lineHeight: 1.3, marginBottom: '2px' }}>
                                                            {meta.label} — #{b.bookingNumber || bId?.slice(-6)}
                                                        </div>
                                                        <p style={{ fontSize: '11px', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                                                            {b.tour?.title || 'Tour'} · {b.user?.name || 'Guest'} · {formatCurrency(b.totalAmount || 0)}
                                                        </p>
                                                        {/* ✅ IST-safe with timeAgoIST — no new Date() */}
                                                        <div style={{ fontSize: '10px', color: '#bbb', fontWeight: 600, marginTop: '3px' }}>
                                                            {DateUtils.timeAgoIST(b.createdAt)} · {DateUtils.formatToIST(b.createdAt, 'DD MMM, hh:mm A')}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="mt-16 pt-16" style={{ borderTop: '1px solid #f0f1f5' }}>
                                <Link href="/admin/bookings" className="btn btn-dark w-100" style={{ fontWeight: 700, fontSize: '13px', borderRadius: '10px', padding: '10px' }}>
                                    View All Activity →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
