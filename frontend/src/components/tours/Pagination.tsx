import React from 'react';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const delta = 2; // show +/- 2 pages around current
        const range = [];
        for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++)
        {
            range.push(i);
        }
        return range;
    };

    return (
        <nav className="togo-pagination" aria-label="Tour pagination">
            <ul className="pagination d-flex justify-content-center gap-2">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">
                        &laquo;
                    </button>
                </li>
                {getPageNumbers().map((page) => (
                    <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(page)}>{page}</button>
                    </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">
                        &raquo;
                    </button>
                </li>
            </ul>
        </nav>
    );
};
