'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const TOUR_STYLES = ['Natural', 'Cuisine', 'Biking', 'Family'];
const TOUR_TYPES = ['Group tour', 'Private tour', 'Daily tour', 'Package tour', 'City Tours', 'Cultural & Thematic Tours', 'Family Friendly Tours'];
const DURATIONS = ['0 - 3 hours', '3 - 5 hours', '5 - 8 hours', '8 - 12 hours'];
const TIME_OF_DAY = ['Morning, 8 AM-12 PM', 'Afternoon, 12 PM-5 PM', 'Evening, 5 PM-12 AM'];
const LANGUAGES = ['English', 'French', 'German', 'Italian'];

export default function TourFilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [styles, setStyles] = useState<string[]>(searchParams.getAll('style'));
    const [types, setTypes] = useState<string[]>(searchParams.getAll('type'));

    // Sync state when URL params change (e.g., clear all)
    useEffect(() => {
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '');
        setStyles(searchParams.getAll('style'));
        setTypes(searchParams.getAll('type'));
    }, [searchParams]);

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (minPrice) params.set('minPrice', minPrice);
        else params.delete('minPrice');

        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        params.delete('style');
        styles.forEach(s => params.append('style', s));

        params.delete('type');
        types.forEach(t => params.append('type', t));

        router.push(`/tours?${params.toString()}`, { scroll: false });
    };

    const handleCheckbox = (
        value: string,
        list: string[],
        setList: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        if (list.includes(value))
        {
            setList(list.filter(item => item !== value));
        } else
        {
            setList([...list, value]);
        }
    };

    return (
        <div className="togo-tour-sidebar mb-30">

            {/* Search Widget */}
            <div className="togo-tour-widget">
                <h4 className="togo-tour-widget-title">Search</h4>
                <div className="togo-hero-11-input-wrapper p-relative box-shadow-none p-0 bdr-none bg-transparent">
                    <div className="togo-hero-11-input-search border-style mb-15 d-flex align-items-center">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                <path d="M11.5132 19.0857C11.206 19.3048 10.794 19.3048 10.4868 19.0857C6.06043 15.9292 1.36177 9.43901 6.11114 4.74951C7.40775 3.46924 9.16632 2.75 11 2.75C12.8337 2.75 14.5923 3.46924 15.8889 4.74951C20.6382 9.43901 15.9396 15.9292 11.5132 19.0857Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.0013 11C12.0138 11 12.8346 10.1792 12.8346 9.16665C12.8346 8.15412 12.0138 7.33331 11.0013 7.33331C9.98878 7.33331 9.16797 8.15412 9.16797 9.16665C9.16797 10.1792 9.98878 11 11.0013 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <div className="togo-hero-11-input-search-wrap trip-search-form">
                            <input
                                type="text"
                                placeholder="Where to?"
                                defaultValue={searchParams.get('keyword') || ''}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    if (e.target.value) params.set('keyword', e.target.value);
                                    else params.delete('keyword');
                                    router.push(`/tours?${params.toString()}`, { scroll: false });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Widget */}
            <div className="togo-tour-widget">
                <h4 className="togo-tour-widget-title">Filter by price</h4>
                <div className="togo-tour-widget-filter-content inner_content">
                    <div className="togo-tour-widget-filter-content">
                        <div className="price-inputs d-flex mt-3" style={{ gap: '10px' }}>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Min"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                            />
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                            />
                        </div>
                        <button
                            className="togo-btn-primary mt-3 w-100"
                            style={{ borderRadius: '8px', padding: '8px 16px' }}
                            onClick={applyFilters}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            {/* Tour Styles */}
            <div className="togo-tour-widget">
                <h4 className="togo-tour-widget-title">Tour styles</h4>
                <div className="togo-tour-widget-filter-checkbox inner_content">
                    <ul>
                        {TOUR_STYLES.map(style => (
                            <li key={style}>
                                <span className="togo-from-checkbox">
                                    <input
                                        id={`style-${style}`}
                                        type="checkbox"
                                        checked={styles.includes(style)}
                                        onChange={() => {
                                            const newStyles = styles.includes(style) ? styles.filter(s => s !== style) : [...styles, style];
                                            setStyles(newStyles);
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.delete('style');
                                            newStyles.forEach(s => params.append('style', s));
                                            router.push(`/tours?${params.toString()}`, { scroll: false });
                                        }}
                                    />
                                    <label htmlFor={`style-${style}`}>{style}</label>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Tour Types */}
            <div className="togo-tour-widget">
                <h4 className="togo-tour-widget-title">Tour types</h4>
                <div className="togo-tour-widget-filter-checkbox inner_content">
                    <ul>
                        {TOUR_TYPES.map(type => (
                            <li key={type}>
                                <span className="togo-from-checkbox">
                                    <input
                                        id={`type-${type}`}
                                        type="checkbox"
                                        checked={types.includes(type)}
                                        onChange={() => {
                                            const newTypes = types.includes(type) ? types.filter(t => t !== type) : [...types, type];
                                            setTypes(newTypes);
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.delete('type');
                                            newTypes.forEach(t => params.append('type', t));
                                            router.push(`/tours?${params.toString()}`, { scroll: false });
                                        }}
                                    />
                                    <label htmlFor={`type-${type}`}>{type}</label>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Other similar filter widgets for Durations, Time of Day, Languages could be implemented here */}
        </div>
    );
}
