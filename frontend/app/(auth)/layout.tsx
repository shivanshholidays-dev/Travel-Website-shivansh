'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/src/store/useAuthStore';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isHydrated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isHydrated || !mounted) return;

        if (isAuthenticated && pathname !== '/callback')
        {
            router.replace('/dashboard');
        }
    }, [mounted, isAuthenticated, isHydrated, pathname, router]);

    return <>{children}</>;
}
