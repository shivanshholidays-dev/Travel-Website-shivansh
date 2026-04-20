import React from 'react';

type ViewToggleProps = {
    viewMode: 'grid' | 'list';
    onToggle: (mode: 'grid' | 'list') => void;
};

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onToggle }) => {
    return (
        <div className="view-toggle d-flex align-items-center gap-2 mb-3">
            <button
                type="button"
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => onToggle('grid')}
                aria-label="Grid view"
            >
                {/* Grid Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </button>
            <button
                type="button"
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => onToggle('list')}
                aria-label="List view"
            >
                {/* List Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
            </button>
        </div>
    );
};
