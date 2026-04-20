'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Menu, Ticket, MessageSquare, AlertCircle, CheckCircle2, CreditCard, Info, Gift, ArrowRight } from 'lucide-react';
import useAuthStore from '@store/useAuthStore';
import { getImgUrl } from '@lib/utils/image';
import { useNotificationHooks } from '@lib/hooks/useNotificationHooks';
import { DateUtils } from '@lib/utils/date-utils';
import SafeImage from '@/src/components/common/SafeImage';

function getIcon(type?: string) {
    switch (type)
    {
        case 'booking_created':
        case 'booking_confirmed':
        case 'booking_cancelled':
            return <Ticket size={16} className="text-primary" />;
        case 'payment_success':
            return <CheckCircle2 size={16} className="text-success" />;
        case 'payment_failed':
            return <AlertCircle size={16} className="text-danger" />;
        case 'trip_reminder':
            return <Info size={16} className="text-info" />;
        case 'offer':
            return <Gift size={16} className="text-purple-500" />;
        case 'review':
            return <MessageSquare size={16} className="text-success" />;
        default:
            return <Bell size={16} className="text-secondary" />;
    }
}

interface DashboardTopbarProps {
    onMenuClick: () => void;
}

export default function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const { user, logout, refreshToken } = useAuthStore();

    const { useUnreadCount, useInfiniteNotifications, useMarkRead } = useNotificationHooks();
    const { data: unreadData } = useUnreadCount();
    const { data: notificationsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteNotifications(5);
    const markReadMutation = useMarkRead();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node))
            {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = unreadData?.count || 0;

    const extractArray = (data: any) => {
        if (Array.isArray(data)) return data;
        const actualData = data?.data || data;
        if (Array.isArray(actualData)) return actualData;
        if (Array.isArray(actualData?.items)) return actualData.items;
        return [];
    };
    const notifications = notificationsData?.pages.flatMap(page => extractArray(page)) || [];

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        try
        {
            if (refreshToken)
            {
                const { authApi } = await import('@lib/api/auth.api');
                await authApi.logout(refreshToken);
            }
        } catch (error)
        {
            console.error('Logout failed on server', error);
        } finally
        {
            logout();
            window.location.href = '/login';
        }
    };

    const displayName = user?.name || 'Traveller';
    const userImage = user?.avatar || user?.profileImage;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="togo-dashboard-header d-flex justify-content-between align-items-center w-100">
            {/* Left Side: Mobile Menu Toggle & Back Home */}
            <div className="d-flex align-items-center" style={{ gap: '15px' }}>
                <button
                    className="d-xl-none border-0 bg-transparent p-0 flex-shrink-0 text-dark"
                    onClick={onMenuClick}
                    style={{ cursor: 'pointer' }}
                >
                    <Menu size={26} />
                </button>
                <div className="togo-dashboard-header-back d-none d-sm-block">
                    <Link href="/">Back to Home</Link>
                </div>
            </div>

            {/* Right Side: Notifications & User Menu */}
            <div className="togo-dashboard-header-right d-flex align-items-center" style={{ gap: '15px' }}>
                <div className="togo-dashboard-header-notifi" ref={notificationRef}>
                    <button
                        className="border-0 bg-transparent p-0 position-relative"
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    >
                        <span className="text-dark d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, borderRadius: '50%', background: '#f8f9fa' }}>
                            <Bell size={20} />
                        </span>
                        {unreadCount > 0 && (
                            <span
                                className="position-absolute translate-middle badge rounded-pill bg-danger"
                                style={{ top: '8px', right: '-4px', fontSize: '9px', padding: '3px 5px', border: '2px solid #fff' }}
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    <div
                        className="dropdown-menu dropdown-menu-end shadow-lg border-0 p-0 show"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            width: '320px',
                            maxHeight: '480px',
                            display: isNotificationOpen ? 'flex' : 'none',
                            flexDirection: 'column',
                            marginTop: '10px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            zIndex: 1001
                        }}
                    >
                        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
                            <h6 className="mb-0 fw-bold">Notifications</h6>
                            <Link href="/dashboard/notifications" className="text-primary text-decoration-none fw-medium" style={{ fontSize: '12px' }} onClick={() => setIsNotificationOpen(false)}>
                                View All
                            </Link>
                        </div>

                        <div className="overflow-auto flex-grow-1 bg-white" style={{ maxHeight: '350px' }}>
                            {notifications.length > 0 ? (
                                <>
                                    {notifications.map((notif: any) => (
                                        <div
                                            key={notif._id}
                                            className={`p-3 border-bottom position-relative transition-all d-flex gap-3 hover-bg-light ${notif.isRead ? 'opacity-75' : 'bg-light bg-opacity-25'}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                if (!notif.isRead) markReadMutation.mutate(notif._id);
                                                const bookingId = notif.metadata?.bookingId;
                                                if (bookingId)
                                                {
                                                    window.location.href = `/dashboard/bookings/${bookingId}`;
                                                }
                                                setIsNotificationOpen(false);
                                            }}
                                        >
                                            <div className="flex-shrink-0">
                                                <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center border" style={{ width: 32, height: 32 }}>
                                                    {getIcon(notif.type)}
                                                </div>
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <div className="d-flex justify-content-between align-items-start gap-2">
                                                    <p className={`mb-0 text-truncate ${notif.isRead ? 'fw-medium' : 'fw-bold'}`} style={{ fontSize: '13px' }}>{notif.title}</p>
                                                    <span className="text-muted flex-shrink-0" style={{ fontSize: '10px' }}>{DateUtils.timeAgoIST(notif.createdAt)}</span>
                                                </div>
                                                <p className="mb-0 text-muted text-truncate-2" style={{ fontSize: '12px', lineHeight: '1.4' }}>{notif.message}</p>
                                            </div>
                                            {!notif.isRead && (
                                                <div className="flex-shrink-0 d-flex align-items-center">
                                                    <div className="rounded-circle" style={{ width: 6, height: 6, backgroundColor: 'var(--togo-theme-primary)' }}></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {hasNextPage && (
                                        <button
                                            className="w-100 p-2 text-center text-primary fw-medium border-0 bg-transparent hover-bg-light"
                                            style={{ fontSize: '12px' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fetchNextPage();
                                            }}
                                            disabled={isFetchingNextPage}
                                        >
                                            {isFetchingNextPage ? 'Loading...' : 'Load More'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="p-4 text-center text-muted">
                                    <Bell size={24} className="mb-2 opacity-25" />
                                    <p className="mb-0" style={{ fontSize: '13px' }}>No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="togo-dashboard-header-author position-relative m-0">
                    <div
                        className="togo-header-user-thumb cursor-pointer d-flex align-items-center gap-2 bg-white rounded-pill pe-2 ps-1 py-1"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}
                        onMouseEnter={() => setIsMenuOpen(true)}
                        onMouseLeave={() => setIsMenuOpen(false)}
                    >
                        {userImage ? (
                            <SafeImage src={userImage} fallbackSrc="/assets/img/avatar.png" alt={displayName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div
                                className="d-flex align-items-center justify-content-center fw-bold text-white rounded-circle"
                                style={{ width: 32, height: 32, background: '#FD4621', fontSize: 11 }}
                            >
                                {getInitials(displayName)}
                            </div>
                        )}
                        <span className="d-none d-md-block fw-semibold text-dark" style={{ fontSize: 13, marginRight: 4 }}>
                            {displayName}
                        </span>

                        {/* Dropdown Submenu */}
                        <div
                            className="togo-header-user-submenu bg-white rounded-3 p-3 shadow-lg"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                minWidth: 200,
                                opacity: isMenuOpen ? 1 : 0,
                                visibility: isMenuOpen ? 'visible' : 'hidden',
                                transform: isMenuOpen ? 'translateY(10px)' : 'translateY(20px)',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                zIndex: 1000,
                                border: '1px solid #eee'
                            }}
                        >
                            <div className="togo-header-user-thumb border-bottom pb-3 mb-3 d-flex align-items-center gap-2">
                                <Link href="/dashboard" className="d-flex align-items-center gap-2 text-decoration-none w-100">
                                    {userImage ? (
                                        <SafeImage src={userImage} fallbackSrc="/assets/img/avatar.png" alt={displayName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div
                                            className="d-flex align-items-center justify-content-center fw-bold text-white rounded-circle"
                                            style={{ width: 40, height: 40, background: '#FD4621', fontSize: 14 }}
                                        >
                                            {getInitials(displayName)}
                                        </div>
                                    )}
                                    <div>
                                        <div className="fw-bold text-dark" style={{ fontSize: 14 }}>{displayName}</div>
                                        <div className="text-muted" style={{ fontSize: 12 }}>View Profile</div>
                                    </div>
                                </Link>
                            </div>
                            <div className="togo-header-user-menu d-flex flex-column gap-0">
                                <Link href="/dashboard" className="text-decoration-none text-dark d-block px-2 hover-bg-light rounded" style={{ fontSize: 14 }}>Dashboard</Link>
                                <Link href="/dashboard/bookings" className="text-decoration-none text-dark d-block px-2 hover-bg-light rounded" style={{ fontSize: 14 }}>Bookings</Link>
                                <Link href="/dashboard/wishlist" className="text-decoration-none text-dark d-block px-2 hover-bg-light rounded" style={{ fontSize: 14 }}>Wishlist</Link>
                                <Link href="/dashboard/reviews" className="text-decoration-none text-dark d-block px-2 hover-bg-light rounded" style={{ fontSize: 14 }}>Reviews</Link>
                                <Link href="/dashboard/settings" className="text-decoration-none text-dark d-block px-2 hover-bg-light rounded" style={{ fontSize: 14 }}>Settings</Link>
                                <hr className="my-1 border-light" />
                                <a href="#" className="text-danger text-decoration-none d-block px-2 py-1 hover-bg-light rounded" style={{ fontSize: 14, fontWeight: 500 }} onClick={handleLogout}>Logout</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
