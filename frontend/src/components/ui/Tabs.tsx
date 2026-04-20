import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface TabItem {
    label: string;
    content: React.ReactNode;
}

export interface TabsProps {
    tabs: TabItem[];
    defaultIndex?: number;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultIndex = 0, className }) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex);

    return (
        <div className={cn("togo-tabs-wrap", className)}>
            <div className="d-flex border-bottom mb-4">
                {tabs.map((tab, idx) => (
                    <button
                        key={idx}
                        className={cn(
                            "px-4 py-3 border-0 bg-transparent fw-500 transition-colors p-relative",
                            activeIndex === idx ? "text-primary" : "text-muted hover:text-dark"
                        )}
                        onClick={() => setActiveIndex(idx)}
                    >
                        {tab.label}
                        {activeIndex === idx && (
                            <div className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '2px' }} />
                        )}
                    </button>
                ))}
            </div>
            <div className="togo-tabs-content">
                {tabs[activeIndex]?.content}
            </div>
        </div>
    );
};
