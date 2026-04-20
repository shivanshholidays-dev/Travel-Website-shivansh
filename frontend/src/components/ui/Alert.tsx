import { clsx } from 'clsx';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type: AlertType;
    title?: string;
    message: string;
    onClose?: () => void;
    className?: string;
}

const config: Record<AlertType, { bg: string; border: string; color: string; icon: string }> = {
    success: { bg: '#f0fdf4', border: '#46E86A', color: '#15803d', icon: '✓' },
    error: { bg: '#fff1f2', border: '#FF252B', color: '#be123c', icon: '✕' },
    warning: { bg: '#fffbeb', border: '#FFE453', color: '#92400e', icon: '⚠' },
    info: { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8', icon: 'ℹ' },
};

export default function Alert({ type, title, message, onClose, className }: AlertProps) {
    const c = config[type];
    return (
        <div
            className={clsx(className)}
            style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                background: c.bg, border: `1px solid ${c.border}`,
                borderLeft: `4px solid ${c.border}`,
                borderRadius: 6, padding: '14px 18px',
                fontFamily: "'DM Sans', sans-serif",
            }}
        >
            <span style={{ fontSize: 18, color: c.color, flexShrink: 0, lineHeight: 1 }}>{c.icon}</span>
            <div style={{ flex: 1 }}>
                {title && <strong style={{ display: 'block', color: c.color, fontSize: 14, marginBottom: 2 }}>{title}</strong>}
                <p style={{ margin: 0, color: c.color, fontSize: 13 }}>{message}</p>
            </div>
            {onClose && (
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, fontSize: 18, lineHeight: 1, padding: 0 }}>
                    ×
                </button>
            )}
        </div>
    );
}
