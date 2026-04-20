'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Anchor } from 'lucide-react';

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', backgroundColor: '#fcfcfc', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ padding: '40px', textAlign: 'center', maxWidth: '500px' }}>
                <div style={{ color: '#e55', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    <Anchor size={48} />
                </div>
                <h2 style={{ marginBottom: '15px', fontWeight: 700 }}>Oops! Something went wrong!</h2>
                <p style={{ color: '#555', marginBottom: '30px' }}>
                    We apologize for the inconvenience. An unexpected error occurred while loading this page.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button
                        onClick={() => reset()}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#e55', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Try again
                    </button>
                    <Link href="/" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f3f9', color: '#111', fontWeight: 600, textDecoration: 'none' }}>
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
