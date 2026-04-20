import React, { useState, useRef, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface DropdownItem {
    label: React.ReactNode;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
}

export interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    align?: 'left' | 'right';
    className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'left', className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node))
            {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn("p-relative d-inline-block", className)} ref={ref}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>
            {isOpen && (
                <div className={cn(
                    "position-absolute bg-white rounded shadow-lg border z-3 py-2 mt-2 min-w-[200px]",
                    align === 'right' ? 'end-0' : 'start-0'
                )} style={{ minWidth: 200 }}>
                    {items.map((item, idx) => (
                        item.href ? (
                            <a
                                key={idx}
                                href={item.href}
                                className="d-flex align-items-center gap-2 px-4 py-2 text-dark hover:bg-light text-decoration-none transition-colors"
                            >
                                {item.icon} {item.label}
                            </a>
                        ) : (
                            <button
                                key={idx}
                                onClick={() => {
                                    item.onClick?.();
                                    setIsOpen(false);
                                }}
                                className="d-flex align-items-center gap-2 px-4 py-2 w-100 text-start text-dark hover:bg-light border-0 bg-transparent transition-colors"
                            >
                                {item.icon} {item.label}
                            </button>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};
