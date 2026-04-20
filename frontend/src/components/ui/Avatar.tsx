import Image from 'next/image';

interface AvatarProps {
    src?: string | null;
    name?: string;
    size?: number;
    className?: string;
}

function getInitials(name?: string) {
    if (!name) return '?';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export default function Avatar({ src, name, size = 40, className = '' }: AvatarProps) {
    if (src)
    {
        return (
            <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }} className={className}>
                <Image
                    src={src} alt={name || 'User'}
                    width={size} height={size}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
            </div>
        );
    }

    return (
        <div
            className={className}
            style={{
                width: size, height: size, borderRadius: '50%',
                background: '#FD4621', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: size * 0.35, fontWeight: 600, flexShrink: 0,
                fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label={name}
        >
            {getInitials(name)}
        </div>
    );
}
