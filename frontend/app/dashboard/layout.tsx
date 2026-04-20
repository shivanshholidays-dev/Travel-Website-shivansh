'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@components/dashboard/DashboardSidebar';
import DashboardTopbar from '@components/dashboard/DashboardTopbar';
import useAuthStore from '@store/useAuthStore';
import { UserRole } from '@lib/constants/enums';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const router = useRouter();

    useEffect(() => {
        if (!isHydrated) return;

        if (isAuthenticated && user?.role?.toUpperCase() === UserRole.ADMIN)
        {
            router.push('/admin');
        }

        // --- Aggressive Back-to-Top Button Hider ---
        // The theme script might re-show the button on scroll or route change,
        // so we use a MutationObserver to ensure it stays hidden in the dashboard.
        const hideButton = () => {
            const backBtn = document.querySelector('.togo-back-wrapper') as HTMLElement;
            if (backBtn)
            {
                backBtn.style.setProperty('display', 'none', 'important');
                backBtn.style.setProperty('opacity', '0', 'important');
                backBtn.style.setProperty('pointer-events', 'none', 'important');
            }
        };

        hideButton(); // Initial hide

        const observer = new MutationObserver(() => {
            hideButton();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });

        return () => {
            observer.disconnect();
            // Restore visibility when leaving dashboard
            const backBtn = document.querySelector('.togo-back-wrapper') as HTMLElement;
            if (backBtn)
            {
                backBtn.style.display = '';
                backBtn.style.opacity = '';
                backBtn.style.pointerEvents = '';
            }
        };
    }, [user, isAuthenticated, router]);

    return (
        <div className="togo-dashboard-sec" style={{ backgroundColor: '#FBFBFB', minHeight: '100vh' }}>
            <div className="togo-dashboard-wrapper">
                {/* Sidebar */}
                <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                {/* Main Content Area */}
                <div className="togo-dashboard-main-wrap">
                    {/* Topbar */}
                    <DashboardTopbar onMenuClick={() => setIsSidebarOpen(true)} />

                    {/* Page Content */}
                    <div className="togo-dashboard-content-area" style={{ paddingBottom: '50px', paddingTop : "20px", paddingLeft : "10px", paddingRight : "10px" }}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
