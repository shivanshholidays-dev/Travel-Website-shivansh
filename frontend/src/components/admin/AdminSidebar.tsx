'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@store/useAuthStore';
import { authApi } from '@lib/api/auth.api';
import {
    LayoutDashboard, Ticket, Package, Gift,
    MessageSquare, Star, Settings, LogOut,
    Users, FileText, Activity, CreditCard, Bell, FileBarChart, X, UserCheck, ShieldCheck, RefreshCcw, MapPin
} from 'lucide-react';

const ADMIN_LINKS = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { group: 'Content' },
    { name: 'Tour Manager', path: '/admin/tours', icon: Package },
    { name: 'Blogs & Articles', path: '/admin/blogs', icon: FileText },
    { name: 'Team Members', path: '/admin/team', icon: UserCheck },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { group: 'Bookings & Finance' },
    { name: 'Booking Manager', path: '/admin/bookings', icon: Ticket },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Transactions', path: '/admin/transactions', icon: Activity },
    { name: 'Refund Manager', path: '/admin/refunds', icon: RefreshCcw },
    { name: 'Coupons', path: '/admin/coupons', icon: Gift },
    { name: 'Custom Tour Requests', path: '/admin/custom-tours', icon: MapPin },
    { group: 'Users' },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { group: 'System' },
    // { name: 'Broadcasts', path: '/admin/notifications/broadcast', icon: Bell },
    { name: 'System Logs', path: '/admin/logs', icon: Activity },
    { name: 'Policies', path: '/admin/policies', icon: ShieldCheck },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
];

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, refreshToken } = useAuthStore();

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isOpen)
        {
            document.body.style.overflow = 'hidden';
        } else
        {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

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
            {/* Dark overlay — only on mobile/tablet when sidebar is open */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`togo-dashboard-sidebar ${isOpen ? 'active' : ''} premium-sidebar`}>
                <div className="sidebar-inner">
                    {/* Top: Logo + Close */}
                    <div className="sidebar-header">
                        <Link href="/" className="logo-link">
                            <img width="140" src="/assets/img/logo/the-trek-stories.png" alt="The Shivansh Holidays" className="logo-img" />
                        </Link>
                        {/* Close button — visible only on mobile/tablet */}
                        <button className="close-btn d-xl-none" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <div className="sidebar-nav no-scrollbar">
                        {ADMIN_LINKS.map((link, index) => {
                            if ('group' in link)
                            {
                                return (
                                    <div key={`group-${index}`} className="nav-group-title">
                                        {link.group}
                                    </div>
                                );
                            }

                            const isActive = link.path === '/admin' ? pathname === '/admin' : pathname.startsWith(link.path!);
                            const Icon = link.icon!;
                            return (
                                <Link
                                    key={link.path}
                                    href={link.path!}
                                    onClick={() => setIsOpen(false)}
                                    className={`nav-link ${isActive ? 'active' : ''}`}
                                    style={{ display: "flex", justifyContent: "left", alignItems: "center", gap: 7, marginBottom: 5 }}
                                >
                                    <div className="nav-link-icon-bg">
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="nav-icon" />
                                    </div>
                                    <span className="nav-text">{link.name}</span>
                                    {isActive && <div className="active-indicator" />}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Logout — pinned at bottom */}
                    <div className="sidebar-footer">
                        <button onClick={handleLogout} className="logout-btn">
                            <div className="logout-icon-bg">
                                <LogOut size={18} strokeWidth={2} />
                            </div>
                            <span className="logout-text">Logout Admin</span>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .sidebar-overlay {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 1040;
                    transition: all 0.3s ease;
                }

                .premium-sidebar {
                    background: #ffffff;
                    border-right: 1px solid #f1f5f9;
                    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.02);
                    z-index: 1050;
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex !important;
                    flex-direction: column !important;
                }

                .sidebar-inner {
                    display: flex !important;
                    flex-direction: column !important;
                    height: 100%;
                    width: 100%;
                }

                .sidebar-header {
                    padding: 24px 24px 16px;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    position: sticky;
                    top: 0;
                    background: #ffffff;
                    z-index: 10;
                }

                .logo-link {
                    display: block;
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .logo-link:hover {
                    transform: scale(1.04);
                }

                .logo-img {
                    height: auto;
                    object-fit: contain;
                }

                .close-btn {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    border-radius: 8px;
                    padding: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .sidebar-nav {
                    flex: 1;
                    overflow-y: auto;
                    padding: 4px 16px 24px 16px;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 6px;
                }

                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .nav-group-title {
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #94a3b8;
                    margin: 28px 0 10px 10px;
                    display: flex !important;
                    align-items: center !important;
                    opacity: 0.8;
                }
                .nav-group-title::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #f1f5f9;
                    margin-left: 12px;
                }


                

/* ~line 167 */
.nav-link {
    display: flex;
    justify-content: left;
    padding: var(--bs-nav-link-padding-y) var(--bs-nav-link-padding-x);
    font-size: var(--bs-nav-link-font-size);
    font-weight: var(--bs-nav-link-font-weight);
    color: var(--bs-nav-link-color);
    text-decoration: none;
    background: 0 0;
    border: 0 !important;
    border-radius: 10px;
    position: relative;
    transition: color .15s ease-in-out, background-color .15s ease-in-out;
    align-items: center;
    gap: 12px;
    overflow: hidden;
}

/* Add this new rule */
.nav-link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%) scaleY(0);
    width: 3px;
    height: 60%;
    border-radius: 0 3px 3px 0;
    background: aliceblue;
    transition: transform 0.2s ease;
}

                .nav-link-icon-bg {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    background: #f8fafc;
                    color: #64748b;
                    transition: all 0.25s ease;
                    flex-shrink: 0;
                }

                .nav-text {
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    white-space: nowrap !important;
                    display: inline-block !important;
                }

/* ~line 202 */
.nav-link:hover {
    background: #f8fafc;
    color: #0f172a !important;
    transform: translateX(4px);
    border-radius: 10px;
}

                .nav-link:hover .nav-link-icon-bg {
                    background: #ffffff;
                    color: #3b82f6;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                }

/* ~line 211 */
.nav-link active {
    background: aliceblue !important;
    color: #2563eb !important;
    border-radius: 10px;
}

.nav-link.active::before {
}

                .nav-link.active .nav-text {
                    font-weight: 700;
                    color: #1d4ed8;
                }

                .nav-link.active .nav-link-icon-bg {
                    background: aliceblue;
                    color: #ffffff;
                    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
                }

                .nav-link.active:hover {
                    transform: none;
                }

                .active-indicator {
                    position: absolute;
                    right: 14px;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #2563eb;
                    box-shadow: 0 0 8px rgba(37, 99, 235, 0.6);
                }

                .sidebar-footer {
                    padding: 20px 16px;
                    background: #ffffff;
                    border-top: 1px solid #f1f5f9;
                    margin-top: auto;
                }

                .logout-btn {
                    width: 100%;
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: center !important;
                    gap: 12px;
                    padding: 10px;
                    border-radius: 12px;
                    border: none;
                    background: #fff5f5;
                    color: #ef4444;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                    white-space: nowrap !important;
                }

                .logout-text {
                    font-size: 14px;
                    font-weight: 700;
                }

                .logout-icon-bg {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 38px;
                    height: 38px;
                    flex-shrink: 0;
                    border-radius: 10px;
                    background: #fef2f2;
                    color: #ef4444;
                    transition: all 0.2s ease;
                }

                .logout-btn:hover {
                    background: #fef2f2;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.12);
                }

                .logout-btn:hover .logout-icon-bg {
                    background: #ef4444;
                    color: #ffffff;
                }
                    .nav-link.active {
  background-color: #007bff; /* your color */
  color: #fff; /* optional */
}
            `}</style>
        </>
    );
}

