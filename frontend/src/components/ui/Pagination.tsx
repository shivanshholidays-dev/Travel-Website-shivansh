interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages: (number | '...')[] = [];

    if (totalPages <= 7)
    {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else
    {
        pages.push(1);
        if (currentPage > 3) pages.push('...');
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
    }

    return (
        <div className={`togo-pagination ${className}`}>
            <nav>
                <ul style={{ display: 'flex', gap: 6, alignItems: 'center', listStyle: 'none', padding: 0 }}>
                    {/* Prev */}
                    <li>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                            style={btnStyle(false, currentPage === 1)}
                            aria-label="Previous page"
                        >
                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                                <path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </li>

                    {pages.map((page, i) =>
                        page === '...' ? (
                            <li key={`dots-${i}`} style={{ padding: '0 4px', color: '#999', fontSize: 14 }}>…</li>
                        ) : (
                            <li key={page}>
                                <button
                                    onClick={() => onPageChange(page as number)}
                                    style={btnStyle(page === currentPage, false)}
                                    aria-current={page === currentPage ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            </li>
                        )
                    )}

                    {/* Next */}
                    <li>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                            style={btnStyle(false, currentPage === totalPages)}
                            aria-label="Next page"
                        >
                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                                <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

function btnStyle(active: boolean, disabled: boolean): React.CSSProperties {
    return {
        width: 36, height: 36, borderRadius: 4, border: '1px solid',
        borderColor: active ? '#FD4621' : '#ddd',
        background: active ? '#FD4621' : '#fff',
        color: active ? '#fff' : disabled ? '#ccc' : '#333',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: active ? 600 : 400,
        transition: 'all 0.2s',
    };
}
