'use client';

import { useNotificationHooks } from '@lib/hooks/useNotificationHooks';
import { Bell, Ticket, MessageSquare, AlertCircle, CheckCircle2, CreditCard, Info, Gift, Trash2, ArrowRight } from 'lucide-react';
import { DateUtils } from '@lib/utils/date-utils';
import Link from 'next/link';

function getIcon(type?: string) {
    switch (type)
    {
        case 'booking_created':
        case 'booking_confirmed':
        case 'booking_cancelled':
            return <Ticket size={20} className="text-primary" />;
        case 'payment_success':
            return <CheckCircle2 size={20} className="text-success" />;
        case 'payment_failed':
            return <AlertCircle size={20} className="text-danger" />;
        case 'trip_reminder':
            return <Info size={20} className="text-info" />;
        case 'offer':
            return <Gift size={20} className="text-purple-500" />;
        case 'review':
            return <MessageSquare size={20} className="text-success" />;
        default:
            return <Bell size={20} className="text-secondary" />;
    }
}

export default function DashboardNotificationsPage() {
    const { useInfiniteNotifications, useMarkRead, useMarkAllRead } = useNotificationHooks();
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteNotifications(15);
    const markReadMutation = useMarkRead();
    const markAllMutation = useMarkAllRead();
    const extractArray = (data: any) => {
        if (Array.isArray(data)) return data;
        const actualData = data?.data || data;
        if (Array.isArray(actualData)) return actualData;
        if (Array.isArray(actualData?.items)) return actualData.items;
        return [];
    };
    const notifications = data?.pages.flatMap(page => extractArray(page)) || [];
    const hasUnread = notifications.some((n: any) => !n.isRead);

    return (
        <div className="togo-dashboard-booking-sec pt-50 pl-15 pr-15 pb-60">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="togo-dashboard-account-title mb-0">Notifications</h4>
                            {hasUnread && (
                                <button
                                    onClick={() => markAllMutation.mutate()}
                                    disabled={markAllMutation.isPending}
                                    className="btn btn-link text-primary text-decoration-none fw-medium d-flex align-items-center gap-2 p-0"
                                >
                                    <CheckCircle2 size={18} />
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-4 overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            {isLoading ? (
                                <div className="text-center py-5 text-muted">Loading…</div>
                            ) : notifications.length > 0 ? (
                                <div className="list-group list-group-flush border-0">
                                    {notifications.map((notif: any) => {
                                        const bookingId = notif.metadata?.bookingId;
                                        const href = bookingId ? `/dashboard/bookings/${bookingId}` : undefined;

                                        return (
                                            <div
                                                key={notif._id}
                                                className={`list-group-item border-0 border-bottom p-4 position-relative transition-all ${notif.isRead ? 'bg-white' : 'bg-light bg-opacity-50'}`}
                                                style={{
                                                    transition: 'all 0.2s ease',
                                                    cursor: href ? 'pointer' : 'default'
                                                }}
                                                onClick={() => {
                                                    if (!notif.isRead) markReadMutation.mutate(notif._id);
                                                    if (href)
                                                    {
                                                        window.location.href = href;
                                                    }
                                                }}
                                            >
                                                <div className="d-flex gap-3 gap-md-4">
                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 bg-white shadow-sm border"
                                                        style={{ width: 48, height: 48 }}
                                                    >
                                                        {getIcon(notif.type)}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                                            <h6 className={`mb-0 ${notif.isRead ? 'fw-medium text-dark' : 'fw-bold text-dark'}`}>
                                                                {notif.title}
                                                                {!notif.isRead && (
                                                                    <span
                                                                        className="ms-2 d-inline-block rounded-circle"
                                                                        style={{ width: 8, height: 8, backgroundColor: 'var(--togo-theme-primary)' }}
                                                                    />
                                                                )}
                                                            </h6>
                                                            <span className="text-muted flex-shrink-0 ms-2" style={{ fontSize: 12 }}>
                                                                {DateUtils.timeAgoIST(notif.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className={`mb-3 ${notif.isRead ? 'text-muted' : 'text-dark fw-medium'}`} style={{ fontSize: 14, lineHeight: '1.5' }}>
                                                            {notif.message}
                                                        </p>

                                                        {!notif.isRead && (
                                                            <div className="d-flex align-items-center gap-3 mt-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        markReadMutation.mutate(notif._id);
                                                                    }}
                                                                    disabled={markReadMutation.isPending}
                                                                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-medium d-flex align-items-center gap-1"
                                                                    style={{ fontSize: 12, borderColor: '#eee' }}
                                                                >
                                                                    <CheckCircle2 size={14} />
                                                                    Mark as read
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {hasNextPage && (
                                        <div className="p-4 text-center border-top bg-white">
                                            <button
                                                onClick={() => fetchNextPage()}
                                                disabled={isFetchingNextPage}
                                                className="btn btn-outline-primary rounded-pill px-4 fw-bold"
                                                style={{ fontSize: 14 }}
                                            >
                                                {isFetchingNextPage ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Loading...
                                                    </>
                                                ) : (
                                                    'Load More Notifications'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-5 px-4">
                                    <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-4" style={{ width: 80, height: 80 }}>
                                        <Bell size={32} className="text-muted" strokeWidth={1.5} />
                                    </div>
                                    <h4 className="mb-2 text-dark fw-bold">No Notifications</h4>
                                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 300 }}>
                                        You&apos;re all caught up! We&apos;ll notify you when something important happens.
                                    </p>
                                    <Link
                                        href="/tours"
                                        className="btn btn-primary rounded-pill px-4 py-2 fw-bold"
                                        style={{ backgroundColor: 'var(--togo-theme-primary)', border: 'none' }}
                                    >
                                        Explore Tours
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
