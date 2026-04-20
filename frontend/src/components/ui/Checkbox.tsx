import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode;
    error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const generatedId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

        return (
            <div className="togo-checkbox-wrap mb-15">
                <div className="d-flex align-items-start gap-2">
                    <div className="togo-checkbox-box p-relative mt-1">
                        <input
                            type="checkbox"
                            id={generatedId}
                            className="opacity-0 position-absolute w-100 h-100 cursor-pointer z-1 m-0"
                            ref={ref}
                            {...props}
                        />
                        <div className={cn(
                            'w-5 h-5 rounded border d-flex align-items-center justify-content-center transition-colors',
                            'togo-checkbox-indicator',
                            error ? 'border-danger' : 'border-gray-300',
                            className
                        )}>
                            <svg className="opacity-0 w-3 h-3 text-white pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    {label && (
                        <label htmlFor={generatedId} className="cursor-pointer select-none text-dark m-0 pb-1">
                            {label}
                        </label>
                    )}
                </div>
                {error && <p className="text-danger text-sm mt-5 mb-0 ms-4">{error}</p>}
            </div>
        );
    }
);
Checkbox.displayName = 'Checkbox';
