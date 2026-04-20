import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface SelectOption {
    label: string;
    value: string | number;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
    helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, options, error, helperText, ...props }, ref) => {
        return (
            <div className="togo-input-wrap mb-20 w-100">
                {label && (
                    <label className="d-block mb-10 fw-500 text-dark">
                        {label} {props.required && <span className="text-danger">*</span>}
                    </label>
                )}
                <div className="p-relative">
                    <select
                        className={cn(
                            'togo-select w-100 h-50 px-20 rounded-md border appearance-none bg-white',
                            error ? 'border-danger focus:border-danger' : 'border-gray-300 focus:border-primary',
                            'transition-colors duration-200 outline-none cursor-pointer',
                            className
                        )}
                        ref={ref}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {/* Custom dropdown arrow to match template style */}
                    <div className="position-absolute top-50 end-0 translate-middle-y pe-20 pointer-events-none text-muted">
                        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
                {error && <p className="text-danger text-sm mt-5 mb-0">{error}</p>}
                {helperText && !error && <p className="text-muted text-sm mt-5 mb-0">{helperText}</p>}
            </div>
        );
    }
);
Select.displayName = 'Select';
