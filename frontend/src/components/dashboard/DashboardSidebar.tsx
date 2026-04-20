'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '@store/useAuthStore';
import { authApi } from '@lib/api/auth.api';
import toast from 'react-hot-toast';
import {
    LayoutDashboard,
    CalendarCheck,
    FileText,
    Heart,
    Star,
    Settings,
    LogOut,
    CreditCard
} from 'lucide-react';

const DASHBOARD_LINKS = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', path: '/dashboard/bookings', icon: CalendarCheck },
    { name: 'Payments', path: '/dashboard/payments', icon: CreditCard },
    // { name: 'Invoices', path: '/dashboard/invoices', icon: FileText },
    { name: 'Wishlist', path: '/dashboard/wishlist', icon: Heart },
    { name: 'Reviews', path: '/dashboard/reviews', icon: Star },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

interface DashboardSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function DashboardSidebar({ isOpen, setIsOpen }: DashboardSidebarProps) {
    const pathname = usePathname();
    const { logout, refreshToken } = useAuthStore();

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        try
        {
            if (refreshToken)
            {
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

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="togo-dashboard-overlay"
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 998,
                        display: 'block'
                    }}
                />
            )}

            <div className={`togo-dashboard-sidebar ${isOpen ? 'active' : ''}`}>
                <div className="togo-dashboard-nav">
                    <div className="togo-dashboard-nav-top d-flex justify-content-between align-items-center">
                        <div className="togo-dashboard-nav-logo">
                            <Link href="/">
                                <img width="120" src="/assets/img/logo/the-trek-stories.png" alt="Shivansh Holidays" />
                            </Link>
                        </div>
                        <div className="togo-dashboard-close d-xl-none" onClick={() => setIsOpen(false)}>
                            <span className="togo-svg-icon dashboard-nav-close cursor-pointer">
                                <svg aria-hidden="true" role="img" focusable="false" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.5 12H4.5M4.5 12L10.125 6M4.5 12L10.125 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </span>
                        </div>
                    </div>

                    <div className="togo-dashboard-nav-menu">
                        {DASHBOARD_LINKS.map((link) => {
                            const Icon = link.icon;
                            // Match exact for Dashboard, child routes for others
                            const isActive = link.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(link.path);

                            return (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    className={isActive ? 'active' : ''}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className="togo-svg-icon">
                                        <Icon size={20} strokeWidth={1.5} />
                                    </span>
                                    {link.name}
                                </Link>
                            );
                        })}

                        <a href="#" onClick={handleLogout} className="text-danger mt-4">
                            <span className="togo-svg-icon">
                                <LogOut size={20} strokeWidth={1.5} />
                            </span>
                            Logout
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
