import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, ...props }, ref) => {
        return (
            <div className="togo-input-wrap mb-20 w-100">
                {label && (
                    <label className="d-block mb-10 fw-500 text-dark">
                        {label} {props.required && <span className="text-danger">*</span>}
                    </label>
                )}
                <div className="p-relative">
                    <input
                        className={cn(
                            'togo-input w-100 h-50 px-20 rounded-md border',
                            error ? 'border-danger focus:border-danger' : 'border-gray-300 focus:border-primary',
                            'transition-colors duration-200 outline-none',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && <p className="text-danger text-sm mt-5 mb-0">{error}</p>}
                {helperText && !error && <p className="text-muted text-sm mt-5 mb-0">{helperText}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
