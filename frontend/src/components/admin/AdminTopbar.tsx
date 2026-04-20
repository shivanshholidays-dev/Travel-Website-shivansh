'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import useAuthStore from '@store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useNotificationHooks } from '@hooks/useNotificationHooks';

interface Props {
    onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: Props) {
    const { logout } = useAuthStore();
    const router = useRouter();
    const { useUnreadCount } = useNotificationHooks();
    const { data: unreadData } = useUnreadCount();

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        logout();
        window.location.href = '/login';
    };
    return (
        <div className="togo-dashboard-header">
            <div className="togo-dashboard-header-back d-flex align-items-center gap-2">
                <button
                    className="d-xl-none me-2"
                    onClick={onMenuClick}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
                <Link href="/">Back to Home</Link>
            </div>

            <div className="togo-dashboard-header-right">
                {/* Notifications */}
                {/* <div className="togo-dashboard-header-notifi">
                    <button
                        onClick={() => router.push('/admin/messages')}
                        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                <path d="M17.2618 9.40139C17.2618 6.00841 15.0062 2.75 11.0164 2.75C7.02662 2.75 4.77105 6.00841 4.77105 9.40139C4.77105 10.7778 3.86557 11.8345 3.10494 12.9386C-0.314343 18.4122 22.1778 18.1663 18.9279 12.9386C18.1672 11.8345 17.2618 10.7778 17.2618 9.40139Z" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7.92188 16.837C8.49824 18.2607 9.23119 19.25 10.9992 19.25C12.7672 19.25 13.5002 18.2607 14.0766 16.837" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        {(unreadData?.data?.count ?? unreadData?.count ?? 0) > 0 && (
                            <span style={{
                                position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px',
                                borderRadius: '50%', backgroundColor: '#ff4444', color: '#fff', fontSize: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                                border: '2px solid #fff'
                            }}>
                                {(unreadData?.data?.count ?? unreadData?.count) > 9 ? '9+' : (unreadData?.data?.count ?? unreadData?.count)}
                            </span>
                        )}
                    </button>
                </div> */}

                {/* Admin user */}
                <div className="togo-dashboard-header-author">
                    <div className="togo-header-user-thumb">
                        <Link href="/admin">
                            <span className="mr-5">Admin</span>
                            {/* travel-frontend\public\assets\img\tour\home-9\avatar.jpg */}
                            <Image
                                src="/assets/img/tour/home-9/avatar.jpg"
                                alt="Admin"
                                width={36}
                                height={36}
                                style={{ borderRadius: '50%', objectFit: 'cover' }}
                            />
                        </Link>
                        <div className="togo-header-user-submenu">
                            <div className="togo-header-user-thumb mb-20">
                                <Link href="/admin">
                                    <Image className="mr-5" src="/assets/img/tour/home-9/avatar.jpg" alt="Admin" width={36} height={36} style={{ borderRadius: '50%' }} />
                                    <span>Admin</span>
                                </Link>
                            </div>
                            <div className="togo-header-user-menu">
                                <Link href="/admin">
                                    <span className="togo-svg-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 22 22" fill="none">
                                            <path d="M8.25 3.20831L8.25 18.7916" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M18.7943 8.70831H3.21094" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M2.75 11C2.75 7.11091 2.75 5.16637 3.95818 3.95818C5.16637 2.75 7.11091 2.75 11 2.75C14.8891 2.75 16.8336 2.75 18.0418 3.95818C19.25 5.16637 19.25 7.11091 19.25 11C19.25 14.8891 19.25 16.8336 18.0418 18.0418C16.8336 19.25 14.8891 19.25 11 19.25C7.11091 19.25 5.16637 19.25 3.95818 18.0418C2.75 16.8336 2.75 14.8891 2.75 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    Dashboard
                                </Link>
                                <Link href="/admin/bookings">
                                    <span className="togo-svg-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M19 19C20.1046 19 21 18.1046 21 17V14C19.8954 14 19 13.1046 19 12C19 10.8954 19.8954 10 21 10V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V10C4.10457 10 5 10.8954 5 12C5 13.1046 4.10457 14 3 14V17C3 18.1046 3.89543 19 5 19H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    Bookings
                                </Link>
                                <a href="#" onClick={handleLogout}>
                                    <span className="togo-svg-icon">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                                            <path d="M13.4958 21H6.5C5.39543 21 4.5 19.8487 4.5 18.4286V5.57143C4.5 4.15127 5.39543 3 6.5 3H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M16 15.5L19.5 12L16 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9.5 11.9958H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    Logout
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
