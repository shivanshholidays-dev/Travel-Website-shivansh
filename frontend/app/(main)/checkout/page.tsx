'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// The old checkout flow has been replaced by the new 4-step booking flow.
// This redirect preserves any old links that may point here.
export default function CheckoutPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/tours');
    }, []);
    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
                <div className="spinner-border mb-3" style={{ color: '#FD4621' }} />
                <p>Redirecting to tours...</p>
            </div>
        </div>
    );
}
