'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyBookings } from '@lib/hooks/useBookingHooks';
import { Booking } from '@lib/types/booking.types';
import { DateUtils } from '@lib/utils/date-utils';
import { BookingStatus } from '@lib/constants/enums';
import { getBookingStatusLabel } from '@lib/utils/enum-mappings';

type TabStatus = 'All' | BookingStatus.CONFIRMED | BookingStatus.PENDING | BookingStatus.CANCELLED | BookingStatus.COMPLETED;

function statusClass(status: string) {
    const m: Record<string, string> = {
        [BookingStatus.COMPLETED]: 'text-success bg-success bg-opacity-10',
        [BookingStatus.CONFIRMED]: 'text-info bg-info bg-opacity-10',
        [BookingStatus.PENDING]: 'text-warning bg-warning bg-opacity-10',
        [BookingStatus.CANCELLED]: 'text-danger bg-danger bg-opacity-10',
        // [BookingStatus.ON_HOLD]: 'text-secondary bg-secondary bg-opacity-10',
    };
    return m[status?.toUpperCase()] || 'text-dark bg-light';
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function DashboardInvoicesPage() {
    const [activeTab, setActiveTab] = useState<TabStatus>('All');

    const statusParam = activeTab === 'All' ? undefined : activeTab;
    const { data, isLoading } = useMyBookings({ status: statusParam, limit: 30 });
    const extractArray = (data: any) => Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
    const bookings: Booking[] = extractArray(data);

    const tabs: { key: TabStatus; label: string }[] = [
        { key: 'All', label: 'All' },
        { key: BookingStatus.CONFIRMED, label: 'Confirmed' },
        { key: BookingStatus.PENDING, label: 'Pending Payment' },
        { key: BookingStatus.COMPLETED, label: 'Completed' },
        { key: BookingStatus.CANCELLED, label: 'Cancelled' },
    ];

    function getTourImg(booking: Booking) {
        const tour = booking.tour as any;
        const img = tour?.thumbnailImage || tour?.images?.[0];
        if (!img) return '/assets/img/tour/home-9/thumb-5.jpg';
        return img.startsWith('http') ? img : `${NEXT_PUBLIC_API_URL}/${img}`;
    }

    function getTourTitle(booking: Booking) {
        return (booking.tour as any)?.title || 'Tour';
    }

    function getTravelDate(booking: Booking) {
        const d = (booking.tourDate as any)?.startDate;
        return d ? DateUtils.formatToIST(d, 'DD MMM YYYY') : '—';
    }

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <h4 className="togo-dashboard-account-title mb-20">Invoices & History</h4>
                        <div className="togo-dashboard-wrap mb-40">
                            <div className="togo-dashboard-booking-wrapper">

                                {/* Tabs */}
                                <div className="togo-dashboard-booking-tab pb-30">
                                    <nav>
                                        <div className="nav nav-tabs border-0 flex-nowrap overflow-auto" style={{ gap: 10 }}>
                                            {tabs.map(tab => (
                                                <button
                                                    key={tab.key}
                                                    className={`nav-link border-0 rounded-pill px-4 py-2 fw-medium ${activeTab === tab.key ? 'bg-dark text-white' : 'bg-light text-dark'}`}
                                                    onClick={() => setActiveTab(tab.key)}
                                                    style={{ whiteSpace: 'nowrap', fontSize: 14 }}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    </nav>
                                </div>

                                <div className="togo-dashboard-booking-tab-content bg-white p-4" style={{ borderRadius: 15, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                    {isLoading ? (
                                        <div className="text-center py-5 text-muted">Loading…</div>
                                    ) : bookings.length > 0 ? (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="table border-0 w-100" style={{ minWidth: 700 }}>
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th className="border-0 py-3 px-4 text-uppercase text-muted fw-bold" style={{ fontSize: 12 }}>Tour</th>
                                                        <th className="border-0 py-3 px-4 text-uppercase text-muted fw-bold" style={{ fontSize: 12 }}>Booking #</th>
                                                        <th className="border-0 py-3 px-4 text-uppercase text-muted fw-bold" style={{ fontSize: 12 }}>Travel Date</th>
                                                        <th className="border-0 py-3 px-4 text-uppercase text-muted fw-bold" style={{ fontSize: 12 }}>Total</th>
                                                        <th className="border-0 py-3 px-4 text-uppercase text-muted fw-bold" style={{ fontSize: 12 }}>Status</th>
                                                        <th className="border-0 py-3 px-4" />
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bookings.map(booking => (
                                                        <tr key={booking._id} className="align-middle border-bottom border-light">
                                                            <td className="py-3 px-4">
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <img src={getTourImg(booking)} alt="" className="rounded" style={{ width: 56, height: 56, objectFit: 'cover' }} />
                                                                    <span className="fw-bold" style={{ fontSize: 14 }}>{getTourTitle(booking)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-muted fw-medium" style={{ fontSize: 13 }}>
                                                                {booking.bookingNumber || '—'}
                                                            </td>
                                                            <td className="py-3 px-4 text-muted fw-medium" style={{ fontSize: 13 }}>{getTravelDate(booking)}</td>
                                                            <td className="py-3 px-4 fw-bold text-dark">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(booking.totalAmount || 0)}</td>
                                                            <td className="py-3 px-4">
                                                                <span className={`px-3 py-1 rounded-pill fw-medium d-inline-block ${statusClass(booking.status)}`} style={{ fontSize: 12 }}>
                                                                    {getBookingStatusLabel(booking.status)}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-end">
                                                                {(booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.COMPLETED) ? (
                                                                    <Link href={`/dashboard/invoice/${booking._id}`} className="togo-btn-primary border-0 rounded px-4 py-2 d-inline-block text-decoration-none" style={{ fontSize: 13 }}>
                                                                        Invoice
                                                                    </Link>
                                                                ) : (
                                                                    <span className="text-muted" style={{ fontSize: 13 }}>N/A</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <h4 className="mb-3 text-muted">No bookings found.</h4>
                                            <Link href="/tours" className="togo-btn-primary px-4 py-2 rounded">Find Tours</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
