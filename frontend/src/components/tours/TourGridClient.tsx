'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TourCard from './TourCard';
import { Tour } from '@lib/types/tour.types';

interface TourGridClientProps {
    initialTours: Tour[];
    totalTours: number;
}

export default function TourGridClient({ initialTours, totalTours }: TourGridClientProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', e.target.value);
        router.push(`/tours?${params.toString()}`, { scroll: false });
    };

    const clearFilters = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/tours');
    };

    return (
        <div className="togo-tour-grid-wrapper">
            <div className="togo-tour-grid-top-bar d-flex align-items-center justify-content-between mb-30">
                <div className="togo-tour-grid-filter-clear">
                    <i>
                        {totalTours} tours found{' '}
                        {searchParams.toString() && (
                            <a className="line-border ms-1" href="#" onClick={clearFilters}>
                                <span>Clear filter</span>
                            </a>
                        )}
                    </i>
                </div>
                <div className="togo-tour-grid-select-wrap">
                    <div className="togo-tour-grid-select d-flex align-items-center gap-2">
                        <select className="wide form-select" defaultValue={searchParams.get('sort') || ''} onChange={handleSortChange}>
                            <option value="">Popular</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Title: A to Z</option>
                            <option value="name_desc">Title: Z to A</option>
                        </select>
                        <div className="view-toggle d-flex align-items-center gap-2 ms-3">
                            <button
                                className={`togo-btn-primary ${viewMode === 'grid' ? '' : 'bdr-style outline-btn'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                Grid
                            </button>
                            <button
                                className={`togo-btn-primary ${viewMode === 'list' ? '' : 'bdr-style outline-btn'}`}
                                onClick={() => setViewMode('list')}
                            >
                                List
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="togo-tour-grid-item-box">
                <div className="row">
                    {(initialTours || []).map(tour => (
                        <div key={tour._id} className={viewMode === 'grid' ? 'col-lg-4 col-md-6 mb-24' : 'col-lg-12 mb-24'}>
                            <TourCard tour={tour} viewMode={viewMode} />
                        </div>
                    ))}

                    {(!initialTours || initialTours.length === 0) && (
                        <div className="col-12 text-center py-5">
                            <h4>No tours found matching your search.</h4>
                            <p>Try adjusting your filters or clearing them to see more results.</p>
                            <button className="togo-btn-primary" onClick={clearFilters}>Clear Filters</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
