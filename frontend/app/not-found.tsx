import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', backgroundColor: '#fcfcfc' }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', padding: '40px' }}>
                <h1 style={{ fontSize: '120px', fontWeight: 900, color: '#e55', margin: 0, lineHeight: 1 }}>404</h1>
                <h3 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '20px', color: '#111' }}>Page Not Found</h3>
                <p style={{ color: '#666', fontSize: '16px', marginBottom: '40px' }}>
                    Oops! The page you are looking for does not exist. It might have been moved or deleted.
                </p>
                <Link href="/" className="togo-btn-primary" style={{ padding: '14px 30px', fontSize: '16px', borderRadius: '8px' }}>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
