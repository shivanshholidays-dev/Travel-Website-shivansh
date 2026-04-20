'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
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
        <html lang="en">
            <body>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: 'system-ui, sans-serif' }}>
                    <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px' }}>
                        <div style={{ fontSize: '50px', marginBottom: '20px' }}>⚠️</div>
                        <h2 style={{ marginBottom: '15px', fontWeight: 700 }}>Something went wrong!</h2>
                        <p style={{ color: '#555', marginBottom: '30px' }}>
                            We apologize for the inconvenience. A critical error occurred.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button
                                onClick={() => reset()}
                                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#e55', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Try again
                            </button>
                            <Link href="/">
                                <button style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f3f9', color: '#111', fontWeight: 600, cursor: 'pointer' }}>
                                    Go to Homepage
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
