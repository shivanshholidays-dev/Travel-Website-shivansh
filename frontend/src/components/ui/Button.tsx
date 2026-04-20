import { clsx } from 'clsx';
import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    as?: 'button' | 'a';
    href?: string;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    const base = 'inline-flex items-center justify-content-center gap-2 transition-all duration-300 cursor-pointer border-0 font-medium';

    const variants: Record<string, string> = {
        primary: 'togo-btn-primary',
        outline: 'togo-tour-btn line-border',
        ghost: 'hover-line',
        danger: 'togo-btn-primary',
    };

    const sizes: Record<string, string> = {
        sm: 'text-sm',
        md: '',
        lg: 'text-lg px-8 py-4',
    };

    const dangerStyle = variant === 'danger'
        ? { backgroundColor: '#FF252B' }
        : {};

    return (
        <button
            className={clsx(base, variants[variant], sizes[size], className)}
            style={dangerStyle}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60" strokeDashoffset="40" />
                </svg>
            )}
            {children}
        </button>
    );
}
