'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@store/useAuthStore';
import AdminSidebar from '@components/admin/AdminSidebar';
import AdminTopbar from '@components/admin/AdminTopbar';
import { UserRole } from '@lib/constants/enums';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const [isChecking, setIsChecking] = useState(true);



    useEffect(() => {
        // Wait for hydration
        if (!isHydrated) return;

        // Check auth and role
        if (!isAuthenticated)
        {
            router.push('/login');
        } else if (user?.role?.toUpperCase() !== UserRole.ADMIN)
        {
            router.push('/');
        } else
        {
            setIsChecking(false);
        }
    }, [user, isAuthenticated, isHydrated, router]);

    if (isChecking) return <div className="p-5 text-center">Checking permissions...</div>;

    return (
        <div className="togo-dashboard-sec" style={{ backgroundColor: '#FBFBFB', minHeight: '100vh' }}>
            <div className="togo-dashboard-wrapper">
                {/* Sidebar */}
                <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                {/* Main Content */}
                <div className="togo-dashboard-main-wrap">
                    {/* Topbar */}
                    <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />

                    {/* Page Content */}
                    <div className="togo-dashboard-content-area" style={{ paddingBottom: '50px' }}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
