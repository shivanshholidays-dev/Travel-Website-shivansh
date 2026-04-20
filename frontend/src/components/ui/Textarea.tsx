import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, rows = 4, ...props }, ref) => {
        return (
            <div className="togo-input-wrap mb-20 w-100">
                {label && (
                    <label className="d-block mb-10 fw-500 text-dark">
                        {label} {props.required && <span className="text-danger">*</span>}
                    </label>
                )}
                <textarea
                    className={cn(
                        'togo-textarea w-100 p-20 rounded-md border',
                        error ? 'border-danger focus:border-danger' : 'border-gray-300 focus:border-primary',
                        'transition-colors duration-200 outline-none resize-y',
                        className
                    )}
                    rows={rows}
                    ref={ref}
                    {...props}
                />
                {error && <p className="text-danger text-sm mt-5 mb-0">{error}</p>}
                {helperText && !error && <p className="text-muted text-sm mt-5 mb-0">{helperText}</p>}
            </div>
        );
    }
);
Textarea.displayName = 'Textarea';
