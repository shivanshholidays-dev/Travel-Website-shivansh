import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top', className }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-100 start-50 translate-middle-x mb-2',
        bottom: 'top-100 start-50 translate-middle-x mt-2',
        left: 'end-100 top-50 translate-middle-y me-2',
        right: 'start-100 top-50 translate-middle-y ms-2',
    };

    return (
        <div
            className="p-relative d-inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={cn(
                    "position-absolute z-3 px-3 py-2 bg-dark text-white rounded shadow-sm fs-12 whitespace-nowrap pointer-events-none fade-in",
                    positionClasses[position],
                    className
                )}>
                    {content}
                    {/* Tiny arrow pointer */}
                    <div className={cn(
                        "position-absolute bg-dark",
                        "w-2 h-2 rotate-45",
                        position === 'top' && "bottom-[-4px] start-50 translate-middle-x",
                        position === 'bottom' && "top-[-4px] start-50 translate-middle-x",
                        position === 'left' && "end-[-4px] top-50 translate-middle-y",
                        position === 'right' && "start-[-4px] top-50 translate-middle-y"
                    )} style={{ width: 8, height: 8 }} />
                </div>
            )}
        </div>
    );
};
