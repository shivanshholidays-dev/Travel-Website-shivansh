import { clsx } from 'clsx';

interface BadgeProps {
    status: string;
    label?: string;
    className?: string;
}

// All enums share uppercase string values. One lookup map keyed by uppercase string.
const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    // Booking / TourDate
    'PENDING': { bg: '#FFE453', color: '#111', label: 'Pending' },
    'CONFIRMED': { bg: '#46E86A', color: '#111', label: 'Confirmed' },
    'CANCELLED': { bg: '#FF252B', color: '#fff', label: 'Cancelled' },
    'COMPLETED': { bg: '#FD4621', color: '#fff', label: 'Completed' },

    // Payment status
    'SUCCESS': { bg: '#46E86A', color: '#111', label: 'Success' },
    'REJECTED': { bg: '#FF252B', color: '#fff', label: 'Rejected' },
    'FAILED': { bg: '#FF252B', color: '#fff', label: 'Failed' },
    // Blog status
    'PUBLISHED': { bg: '#46E86A', color: '#111', label: 'Published' },
    'DRAFT': { bg: '#DDDDDD', color: '#111', label: 'Draft' },
    // TourDate specific
    'UPCOMING': { bg: '#46E86A', color: '#111', label: 'Upcoming' },
    'FULL': { bg: '#f97316', color: '#fff', label: 'Full' },
    // Review status
    'APPROVED': { bg: '#46E86A', color: '#111', label: 'Approved' },
    // Generic
    'ACTIVE': { bg: '#46E86A', color: '#111', label: 'Active' },
    'INACTIVE': { bg: '#DDDDDD', color: '#111', label: 'Inactive' },
};

export default function Badge({ status, label, className }: BadgeProps) {
    const normalizedStatus = String(status).toUpperCase();
    const config = statusConfig[normalizedStatus] || {
        bg: '#DDDDDD',
        color: '#111',
        label: String(status).replace(/_/g, ' '),
    };
    const displayLabel = label ?? config.label;

    return (
        <span
            className={clsx('d-inline-block', className)}
            style={{
                background: config.bg,
                color: config.color,
                padding: '3px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'capitalize',
                fontFamily: "'DM Sans', sans-serif",
            }}
        >
            {displayLabel}
        </span>
    );
}
