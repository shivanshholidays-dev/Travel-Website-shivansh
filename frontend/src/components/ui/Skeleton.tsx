interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 4, className = '' }: SkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{ width, height, borderRadius }}
            aria-hidden="true"
        />
    );
}

export function TourCardSkeleton() {
    return (
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Skeleton height={220} borderRadius={0} />
            <div style={{ padding: '16px 20px' }}>
                <Skeleton height={20} width="70%" className="mb-2" />
                <Skeleton height={14} width="50%" className="mb-3" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                    <Skeleton height={16} width={80} />
                    <Skeleton height={32} width={100} borderRadius={4} />
                </div>
            </div>
        </div>
    );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} style={{ padding: '14px 16px' }}>
                    <Skeleton height={14} width={i === 0 ? '80%' : '60%'} />
                </td>
            ))}
        </tr>
    );
}
