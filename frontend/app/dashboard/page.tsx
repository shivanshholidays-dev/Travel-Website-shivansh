'use client';

import Link from 'next/link';
import { Calendar, Clock, Users, MapPin, ArrowRight, Book, CheckCircle, Star as StarIcon, Heart } from 'lucide-react';
import { useUserHooks } from '@lib/hooks/useUserHooks';
import useAuthStore from '@store/useAuthStore';
import { Booking } from '@lib/types/booking.types';
import { BookingStatus } from '@lib/constants/enums';
import { DateUtils } from '@lib/utils/date-utils';
import { getBookingStatusLabel, getStatusBadgeClass } from '@lib/utils/enum-mappings';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getStatusBadge(status: string) {
    return getStatusBadgeClass(status);
}

function getNotifIcon(type?: string) {
    const colors: Record<string, string> = {
        booking: '#4F46E5',
        payment: '#F59E0B',
        review: '#10B981',
        system: '#6B7280',
    };
    const bg = colors[type || 'system'] || '#6B7280';
    return (
        <span
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 45, height: 45, background: bg + '18', border: `1.5px solid ${bg}30` }}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={bg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={bg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </span>
    );
}

function getTourImage(booking: Booking): string {
    const tour = booking.tour as any;
    if (!tour) return '/assets/img/tour/home-9/thumb-5.jpg';
    const img = tour.thumbnailImage || tour.images?.[0];
    if (!img) return '/assets/img/tour/home-9/thumb-5.jpg';
    return img.startsWith('http') ? img : `${NEXT_PUBLIC_API_URL}/${img}`;
}

function getTourTitle(booking: Booking): string {
    const tour = booking.tour as any;
    return tour?.title || 'Tour';
}

export default function DashboardAccountPage() {
    const { user } = useAuthStore();
    const { useDashboardSummary } = useUserHooks();

    const { data: summaryData, isLoading } = useDashboardSummary();

    const bookings: Booking[] = summaryData?.recentBookings || [];
    const notifications = summaryData?.recentNotifications || [];

    const completedTripsCount = summaryData?.stats?.completedTripsCount || 0;
    const totalBookingsCount = summaryData?.stats?.totalBookingsCount || 0;
    const reviewsCount = summaryData?.stats?.reviewsCount || 0;
    const wishlistCount = summaryData?.stats?.wishlistCount || 0;

    // Find the soonest confirmed/pending booking with a future start date
    const now = new Date();
    const upcomingBooking = summaryData?.upcomingBooking ||
        bookings
            .filter((b: Booking) =>
                (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING) &&
                ((b.tourDate as any)?.startDate ? new Date((b.tourDate as any).startDate) >= now : true)
            )
            .sort((a: Booking, b: Booking) => {
                const da = (a.tourDate as any)?.startDate ? new Date((a.tourDate as any).startDate).getTime() : 0;
                const db_ = (b.tourDate as any)?.startDate ? new Date((b.tourDate as any).startDate).getTime() : 0;
                return da - db_;
            })[0] || null;

    return (
        <div className="togo-dashboard-account-sec pt-50 pb-50 px-0 px-md-15" style={{ overflowX: 'hidden' }}>
            <div className="container container-1850 gx-0 px-0 px-md-0">
                <div className="row mx-0">
                    <div className="col-lg-12 px-0">
                        <div className="togo-dashboard-account-wrapper mb-30">
                            <h4 className="togo-dashboard-account-title">
                                Welcome, {user?.name || 'Traveller'}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="row mb-30 mx-0">
                    <div className="col-lg-3 col-md-6 mb-3 mb-lg-0">
                        <div className="bg-white p-4 rounded-4 d-flex align-items-center gap-3" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-flex align-items-center justify-content-center">
                                <Book size={24} />
                            </div>
                            <div>
                                <h3 className="mb-0 fw-bold">{totalBookingsCount}</h3>
                                <span className="text-muted" style={{ fontSize: 13 }}>Total Bookings</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-3 mb-lg-0">
                        <div className="bg-white p-4 rounded-4 d-flex align-items-center gap-3" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle d-flex align-items-center justify-content-center">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <h3 className="mb-0 fw-bold">{completedTripsCount}</h3>
                                <span className="text-muted" style={{ fontSize: 13 }}>Completed Trips</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-3 mb-md-0">
                        <div className="bg-white p-4 rounded-4 d-flex align-items-center gap-3" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle d-flex align-items-center justify-content-center">
                                <StarIcon size={24} />
                            </div>
                            <div>
                                <h3 className="mb-0 fw-bold">{reviewsCount}</h3>
                                <span className="text-muted" style={{ fontSize: 13 }}>Reviews</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="bg-white p-4 rounded-4 d-flex align-items-center gap-3" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle d-flex align-items-center justify-content-center">
                                <Heart size={24} />
                            </div>
                            <div>
                                <h3 className="mb-0 fw-bold">{wishlistCount}</h3>
                                <span className="text-muted" style={{ fontSize: 13 }}>Wishlist</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mx-0">
                    {/* === UPCOMING TRIP === */}
                    <div className="col-xxl-4 col-lg-6">
                        <div className="togo-dashboard-account-box mb-30" style={{ backgroundColor: '#FFE3EA', borderRadius: 15, padding: 30 }}>
                            <h4 className="mb-24">Upcoming Trip</h4>

                            {isLoading ? (
                                <div className="text-center py-5 text-muted">Loading…</div>
                            ) : upcomingBooking ? (
                                <div className="togo-dashboard-account-card">
                                    <div className="togo-dashboard-account-card-thumb mb-20" style={{ borderRadius: 10, overflow: 'hidden' }}>
                                        <img
                                            src={getTourImage(upcomingBooking)}
                                            alt="Upcoming Trip"
                                            style={{ width: '100%', height: 180, objectFit: 'cover' }}
                                        />
                                    </div>
                                    <h5 className="togo-dashboard-account-card-title">{getTourTitle(upcomingBooking)}</h5>

                                    <div className="togo-dashboard-account-card-meta mb-24 d-flex flex-wrap gap-3 mt-2" style={{ fontSize: 14, color: '#555' }}>
                                        <span className="d-flex align-items-center gap-1">
                                            <Calendar size={15} />
                                            {DateUtils.formatToIST((upcomingBooking.tourDate as any)?.startDate || (upcomingBooking.tourDate as any)?.date || upcomingBooking.createdAt)}
                                        </span>
                                        <span className="d-flex align-items-center gap-1">
                                            <Users size={15} />
                                            {upcomingBooking.totalTravelers || upcomingBooking.travelers?.length || 1} Traveler(s)
                                        </span>
                                        {(upcomingBooking.tour as any)?.location && (
                                            <span className="d-flex align-items-center gap-1">
                                                <MapPin size={15} />
                                                {(upcomingBooking.tour as any).location}
                                            </span>
                                        )}
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Link href={`/dashboard/bookings/${upcomingBooking._id}`} className="togo-btn-primary">
                                            View Booking
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3, marginBottom: 16 }}>
                                        <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p style={{ fontSize: 15, color: '#888' }}>No upcoming trips.</p>
                                    <Link href="/tours" className="togo-btn-primary" style={{ display: 'inline-block', marginTop: 8 }}>Explore Tours</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* === MY BOOKINGS SNIPPET === */}
                    <div className="col-xxl-4 col-lg-6">
                        <div className="mb-30" style={{ backgroundColor: '#fff', borderRadius: 15, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <h4 className="mb-24">My Bookings</h4>

                            {isLoading ? (
                                <div className="text-center py-4 text-muted">Loading…</div>
                            ) : bookings.length > 0 ? (
                                <>
                                    {bookings.slice(0, 3).map(booking => (
                                        <div key={booking._id} className="d-flex gap-3 mb-4 align-items-start">
                                            <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                                                <img src={getTourImage(booking)} alt="Tour" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div>
                                                <h5 className="mb-1" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                                                    {getTourTitle(booking).substring(0, 45)}{getTourTitle(booking).length > 45 ? '…' : ''}
                                                </h5>
                                                <div className="d-flex align-items-center gap-2" style={{ fontSize: 12, color: '#888' }}>
                                                    <span>{DateUtils.timeAgoIST(booking.createdAt)}</span>
                                                    <span>|</span>
                                                    <span className={getStatusBadge(booking.status)}>{getBookingStatusLabel(booking.status)}</span>
                                                    {(booking.status === BookingStatus.PENDING) && (
                                                        <>
                                                            <span>|</span>
                                                            <Link href={`/dashboard/bookings/${booking._id}`} style={{ color: '#FD4621', textDecoration: 'underline', fontSize: 12 }}>Pay now</Link>
                                                        </>
                                                    )}
                                                    {booking.status === BookingStatus.COMPLETED && (
                                                        <>
                                                            <span>|</span>
                                                            <Link href={`/dashboard/reviews`} style={{ color: '#FD4621', textDecoration: 'underline', fontSize: 12 }}>Leave review</Link>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-3 border-top text-center">
                                        <Link href="/dashboard/bookings" className="d-inline-flex align-items-center gap-1 fw-medium" style={{ color: '#FD4621', fontSize: 14 }}>
                                            View all bookings <ArrowRight size={15} />
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted mb-3">No bookings yet.</p>
                                    <Link href="/tours" className="togo-btn-primary">Explore Tours</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* === NOTIFICATIONS SNIPPET === */}
                    <div className="col-xxl-4 col-lg-6">
                        <div className="mb-30" style={{ backgroundColor: '#fff', borderRadius: 15, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <h4 className="mb-24">Notifications</h4>

                            {isLoading ? (
                                <div className="text-center py-4 text-muted">Loading…</div>
                            ) : notifications.length > 0 ? (
                                <>
                                    {(Array.isArray(notifications) ? notifications : []).slice(0, 3).map((notif: any) => (
                                        <div key={notif._id} className="d-flex gap-3 mb-4">
                                            {getNotifIcon(notif.type)}
                                            <div>
                                                <h6 className="mb-1" style={{ fontSize: 14, fontWeight: 600 }}>
                                                    {notif.title}
                                                    {!notif.isRead && <span className="ms-1 d-inline-block bg-danger rounded-circle" style={{ width: 7, height: 7 }} />}
                                                </h6>
                                                <p className="text-muted mb-0" style={{ fontSize: 12 }}>{notif.message}</p>
                                                <span className="text-muted" style={{ fontSize: 11 }}>{DateUtils.timeAgoIST(notif.createdAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-3 border-top text-center">
                                        <Link href="/dashboard/notifications" className="d-inline-flex align-items-center gap-1 fw-medium" style={{ color: '#FD4621', fontSize: 14 }}>
                                            View all notifications <ArrowRight size={15} />
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <p>No notifications yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
