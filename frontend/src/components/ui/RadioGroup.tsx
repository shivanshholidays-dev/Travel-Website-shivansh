import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface RadioOption {
    label: React.ReactNode;
    value: string;
}

export interface RadioGroupProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    options: RadioOption[];
    name: string;
    value?: string;
    onChange?: (val: string) => void;
    error?: string;
    orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
    ({ className, options, name, value, onChange, error, orientation = 'vertical', ...props }, ref) => {
        return (
            <div className="togo-radio-group mb-20">
                <div className={cn('d-flex gap-3', orientation === 'vertical' ? 'flex-column' : 'align-items-center', className)}>
                    {options.map((option, idx) => {
                        const id = `${name}-${option.value}`;
                        const isChecked = value === option.value;
                        return (
                            <div key={option.value} className="d-flex align-items-center gap-2 cursor-pointer w-auto">
                                <div className="p-relative d-flex align-items-center justify-content-center">
                                    <input
                                        type="radio"
                                        id={id}
                                        name={name}
                                        value={option.value}
                                        checked={isChecked}
                                        onChange={(e) => onChange?.(e.target.value)}
                                        className="opacity-0 position-absolute w-100 h-100 cursor-pointer z-1 m-0"
                                        ref={idx === 0 ? ref : undefined}
                                        {...props}
                                    />
                                    <div className={cn(
                                        'w-4 h-4 rounded-circle border transition-colors d-flex align-items-center justify-content-center',
                                        error ? 'border-danger' : isChecked ? 'border-primary' : 'border-gray-300'
                                    )} style={{ width: '18px', height: '18px' }}>
                                        {isChecked && <div className="rounded-circle bg-primary" style={{ width: '10px', height: '10px' }} />}
                                    </div>
                                </div>
                                <label htmlFor={id} className="cursor-pointer select-none text-dark m-0 pb-0">
                                    {option.label}
                                </label>
                            </div>
                        );
                    })}
                </div>
                {error && <p className="text-danger text-sm mt-5 mb-0">{error}</p>}
            </div>
        );
    }
);
RadioGroup.displayName = 'RadioGroup';
