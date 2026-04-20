interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    className?: string;
}

const sizes = { sm: 20, md: 32, lg: 48 };

export default function Spinner({ size = 'md', color = '#FD4621', className = '' }: SpinnerProps) {
    const px = sizes[size];
    return (
        <svg
            className={className}
            width={px}
            height={px}
            viewBox="0 0 24 24"
            fill="none"
            style={{ animation: 'spin 0.8s linear infinite' }}
            aria-label="Loading…"
        >
            <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
            <circle cx="12" cy="12" r="10" stroke="#eee" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}
