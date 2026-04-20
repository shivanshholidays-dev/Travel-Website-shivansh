'use client';
import { useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTourHooks } from '@lib/hooks/useTourHooks';
import { useWishlistHooks } from '@lib/hooks/useWishlistHooks';
import HeroSearchForm from '@components/home/HeroSearchForm';
import TourCard from '@components/tours/TourCard';
import { ViewToggle } from '@components/tours/ViewToggle';
import { getTourCategoryLabel } from '@lib/utils/enum-mappings';
import { TourCardSkeleton } from '@/src/components/ui/Skeleton';

// ── SVG Helpers ──────────────────────────────────────────────────────────────
const ChevronUpSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none">
        <path d="M12.75 6.75L6.75 0.75L0.75 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ── Sidebar widget helper ─────────────────────────────────────────────────────
function FilterWidget({ title, children, defaultOpen = true, contentClassName = "togo-tour-widget-content" }: { title: string; children: React.ReactNode, defaultOpen?: boolean, contentClassName?: string }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="togo-tour-widget">
            <h4
                className={`togo-tour-widget-title ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', transition: 'margin-bottom 0.5s ease-in-out' }}
            >
                {title}
                <span className="icon">
                    <ChevronUpSVG />
                </span>
            </h4>
            <div
                style={{
                    display: 'grid',
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: isOpen ? 'visible' : 'hidden'
                }}
            >
                <div style={{ minHeight: '0px' }}>
                    <div className={`${contentClassName} inner_content`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Listing Component ──────────────────────────────────────────────────
function TourListingContent({ defaultView = 'grid' }: { defaultView?: 'grid' | 'list' }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = Object.fromEntries(searchParams.entries());

    const [hasMounted, setHasMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const buildApiParams = () => {
        const apiParams: Record<string, string> = { limit: '6', ...params };
        if (params.sort === 'price_asc')
        {
            apiParams.sort = 'basePrice';
            apiParams.order = 'asc';
        } else if (params.sort === 'price_desc')
        {
            apiParams.sort = 'basePrice';
            apiParams.order = 'desc';
        } else if (params.sort === 'top_rated')
        {
            apiParams.sort = 'averageRating';
            apiParams.order = 'desc';
        } else if (params.sort === 'newest')
        {
            apiParams.sort = 'createdAt';
            apiParams.order = 'desc';
        } else
        {
            delete apiParams.sort; // Use default
        }
        return apiParams;
    };

    const { useToursList, useFilterOptions } = useTourHooks();
    const { useWishlist, useToggleWishlist } = useWishlistHooks();
    const { data: filterOpts } = useFilterOptions();
    const { data: toursData, isLoading, error } = useToursList(buildApiParams());
    const { data: wishlistRes } = useWishlist();
    const toggleMutation = useToggleWishlist();

    const wishlistIds = new Set<string>(
        (Array.isArray(wishlistRes) ? wishlistRes : (wishlistRes as any)?.data)?.map((t: any) => t._id ?? t) ?? []
    );

    const data = toursData as any;
    const tours = data?.items || [];
    const totalTours = data?.total || 0;
    const currentPage = parseInt(params.page || '1');
    const totalPages = data?.totalPages || 0;

    const getPaginationRange = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++)
        {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta))
            {
                range.push(i);
            }
        }

        for (let i of range)
        {
            if (l)
            {
                if (i - l === 2)
                {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1)
                {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    };

    // Local state for filters
    const [minPrice, setMinPrice] = useState(params.priceMin || '0');
    const [maxPrice, setMaxPrice] = useState(params.priceMax || '100000');

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        params.category ? params.category.split(',') : []
    );

    const updateUrl = (newParams: Record<string, string | undefined>) => {
        const current = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) current.set(key, value);
            else current.delete(key);
        });
        // Reset to page 1 on filter change, unless we are just changing page
        if (!newParams.page) current.set('page', '1');
        router.push(`?${current.toString()}`);
    };

    const toggleCategory = (cat: string) => {
        const nextCategories = selectedCategories.includes(cat)
            ? selectedCategories.filter(c => c !== cat)
            : [...selectedCategories, cat];
        setSelectedCategories(nextCategories);
        updateUrl({ category: nextCategories.join(',') });
    };

    // Toggle filter array helper (duration, language, etc)
    const toggleFilterArray = (paramName: string, value: string) => {
        const currentVals = params[paramName] ? params[paramName].split(',') : [];
        let nextVals;
        if (currentVals.includes(value))
        {
            nextVals = currentVals.filter(v => v !== value);
        } else
        {
            nextVals = [...currentVals, value];
        }
        updateUrl({ [paramName]: nextVals.length ? nextVals.join(',') : undefined });
    };

    // Sync slider when state changes (e.g., clear all)
    useEffect(() => {
        const $ = (window as any).jQuery;
        if ($ && $('#slider-range').length > 0 && typeof $.fn.slider === 'function')
        {
            const currentMin = parseInt(minPrice) || 0;
            const currentMax = parseInt(maxPrice) || 100000;

            // If slider not initialized, init it. If already there, just update values.
            if ($('#slider-range').children().length === 0)
            {
                $("#slider-range").slider({
                    range: true,
                    min: 0,
                    max: 100000,
                    values: [currentMin, currentMax],
                    slide: function (event: any, ui: any) {
                        setMinPrice(ui.values[0].toString());
                        setMaxPrice(ui.values[1].toString());
                    },
                    stop: function (event: any, ui: any) {
                        updateUrl({ priceMin: ui.values[0].toString(), priceMax: ui.values[1].toString() });
                    }
                });
            } else
            {
                $("#slider-range").slider("values", 0, currentMin);
                $("#slider-range").slider("values", 1, currentMax);
            }
        }
    }, [hasMounted, minPrice, maxPrice]);

    useEffect(() => {
        const initNiceSelect = () => {
            const $ = (window as any).jQuery;
            if ($ && typeof $.fn.niceSelect === 'function')
            {
                $('select.wide').on('change', function (this: HTMLSelectElement) {
                    updateUrl({ sort: this.value });
                });
            }
        };

        const timer = setTimeout(() => {
            initNiceSelect();
        }, 100);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync state from URL params
    useEffect(() => {
        setMinPrice(params.priceMin || '0');
        setMaxPrice(params.priceMax || '100000');
    }, [params.priceMin, params.priceMax]);

    return (
        <div className="togo-tour-grid-sec pb-80">
            <div className="container container-1440">
                <div className="row">
                    {/* ── Sidebar ── */}
                    <div className="col-xl-3 order-2 order-xl-1">
                        <div className="togo-tour-sidebar mb-30">
                            {/* Price range */}
                            <FilterWidget title="Price range">
                                <div className="togo-tour-widget-filter p-relative">
                                    {hasMounted && (
                                        <div id="slider-range" className="mb-25" style={{ width: 'calc(100% - 24px)' }}></div>
                                    )}
                                    <div className="input-range d-flex justify-content-between">
                                        <div className="input-range-item">
                                            <h4 className="input-range-item-title">Min. price</h4>
                                            <div className="p-relative">
                                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>₹</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    style={{ paddingLeft: '25px', height: '45px', fontSize: '14px' }}
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                    onBlur={() => updateUrl({ priceMin: minPrice })}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="input-range-item">
                                            <h4 className="input-range-item-title">Max. price</h4>
                                            <div className="p-relative">
                                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>₹</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    style={{ paddingLeft: '25px', height: '45px', fontSize: '14px' }}
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                    onBlur={() => updateUrl({ priceMax: maxPrice })}
                                                    placeholder="100000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FilterWidget>

                            {/* Categories */}
                            <FilterWidget title="Categories" contentClassName="togo-tour-widget-filter-checkbox">
                                <ul>
                                    {hasMounted && filterOpts?.categories?.map((cat: string) => (
                                        <li key={cat}>
                                            <span className="togo-from-checkbox">
                                                <input
                                                    id={`cb-cat-${cat}`}
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(cat)}
                                                    onChange={() => toggleCategory(cat)}
                                                />
                                                <label htmlFor={`cb-cat-${cat}`}>{getTourCategoryLabel(cat)}</label>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </FilterWidget>

                            {/* States */}
                            <FilterWidget title="States/Regions" contentClassName="togo-tour-widget-filter-checkbox">
                                <ul>
                                    {hasMounted && filterOpts?.states?.map((st: string) => (
                                        <li key={st}>
                                            <span className="togo-from-checkbox">
                                                <input
                                                    id={`cb-state-${st.replace(/\\s+/g, '-').toLowerCase()}`}
                                                    type="checkbox"
                                                    checked={(params.state || '').split(',').includes(st)}
                                                    onChange={() => toggleFilterArray('state', st)}
                                                />
                                                <label htmlFor={`cb-state-${st.replace(/\\s+/g, '-').toLowerCase()}`}>{st}</label>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </FilterWidget>

                            {/* Departure Cities */}
                            <FilterWidget title="Departure Cities" contentClassName="togo-tour-widget-filter-checkbox">
                                <ul>
                                    {hasMounted && filterOpts?.departureCities?.map((city: string) => (
                                        <li key={city}>
                                            <span className="togo-from-checkbox">
                                                <input
                                                    id={`cb-city-${city.toLowerCase()}`}
                                                    type="checkbox"
                                                    checked={(params.departureCity || '').split(',').includes(city)}
                                                    onChange={() => toggleFilterArray('departureCity', city)}
                                                />
                                                <label htmlFor={`cb-city-${city.toLowerCase()}`}>{city}</label>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </FilterWidget>
                        </div>
                    </div>
                    {/* ── Sidebar end ── */}

                    {/* ── Main grid ── */}
                    <div className="col-xl-9 order-1 order-xl-2">
                        <div className={`togo-tour-grid-wrapper grid-view`}>

                            <div className="togo-tour-grid-top-bar d-flex align-items-center justify-content-between mb-30 p-3 gap-2" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                                <div className="d-flex align-items-center">

                                    <div className="togo-tour-grid-filter-clear">
                                        <span style={{ fontSize: '14px', color: '#555', fontWeight: 500, display: 'flex', flexWrap: 'nowrap', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                            {totalTours} <span className="d-none d-sm-inline ms-1 me-1">tours</span> found
                                            <a onClick={(e) => { e.preventDefault(); router.push('?'); }} style={{ cursor: 'pointer', color: '#FD4621', marginLeft: '8px', textDecoration: 'underline', fontWeight: 600, whiteSpace: 'nowrap' }}>Clear<span className="d-none d-sm-inline"> filter</span></a>
                                        </span>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center" style={{ width: 'auto', minWidth: '130px', maxWidth: '180px' }}>
                                    <div className="togo-tour-grid-select" suppressHydrationWarning>
                                        {hasMounted && (
                                            <select className="wide" defaultValue={params.sort || ''} onChange={(e) => updateUrl({ sort: e.target.value })}>
                                                <option value="">Default sorting</option>
                                                <option value="price_asc">Price: Low to High</option>
                                                <option value="price_desc">Price: High to Low</option>
                                                <option value="top_rated">Top rated</option>
                                                <option value="newest">Newest first</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cards */}
                            <div className="togo-tour-grid-item-box">
                                {isLoading ? (
                                    <div className={viewMode === 'grid' ? "row g-4" : ""}>
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className={viewMode === 'grid' ? "col-12 col-md-6 col-lg-6 col-xl-4" : "mb-24"}>
                                                <TourCardSkeleton />
                                            </div>
                                        ))}
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger">Error loading tours. Please try again.</div>
                                ) : tours.length === 0 ? (
                                    <div className="text-center py-5 px-4" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                        <div className="mb-3 d-flex justify-content-center">
                                            <div style={{ width: '80px', height: '80px', background: '#fff5f3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#FD4621" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h4 style={{ color: '#111', fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>No tours found matching your search.</h4>
                                        <p style={{ color: '#666', marginBottom: '25px', maxWidth: '450px', margin: '0 auto 25px auto', fontSize: '15px' }}>
                                            We couldn't find any trips that match your current filter criteria. Try broadening your search or clearing the filters to see more options.
                                        </p>
                                        <button className="togo-btn-primary" onClick={(e) => { e.preventDefault(); router.push('?'); }} style={{ border: 'none', cursor: 'pointer', padding: '12px 30px' }}>
                                            Clear all filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className={viewMode === 'grid' ? "row g-4" : ""}>
                                        {tours.map((tour: any) => (
                                            <div key={tour._id} className={viewMode === 'grid' ? "col-12 col-md-6 col-lg-6 col-xl-4 d-flex align-items-stretch" : "mb-24"}>
                                                <TourCard
                                                    tour={tour}
                                                    viewMode={viewMode}
                                                    wishlistIds={wishlistIds}
                                                    onToggleWishlist={(id) => toggleMutation.mutate(id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="row">
                                    <div className="togo-tour-pagination mt-40">
                                        <div className="col-lg-12">
                                            <div className="togo-pagination">
                                                <nav>
                                                    <ul className="justify-content-center">
                                                        {currentPage > 1 && (
                                                            <li>
                                                                <a
                                                                    className="prev"
                                                                    onClick={() => updateUrl({ page: (currentPage - 1).toString() })}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    <span>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="13" viewBox="0 0 7 13" fill="none">
                                                                            <path d="M6.25 11.75L0.75 6.25L6.25 0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                    </span>
                                                                </a>
                                                            </li>
                                                        )}

                                                        {getPaginationRange().map((item, index) => (
                                                            <li key={index}>
                                                                <a
                                                                    className={item === currentPage ? 'active' : ''}
                                                                    onClick={() => item !== '...' && updateUrl({ page: item.toString() })}
                                                                    style={{ cursor: item === '...' ? 'default' : 'pointer' }}
                                                                >
                                                                    {item}
                                                                </a>
                                                            </li>
                                                        ))}

                                                        {currentPage < totalPages && (
                                                            <li>
                                                                <a
                                                                    className="next"
                                                                    onClick={() => updateUrl({ page: (currentPage + 1).toString() })}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    <span>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="13" viewBox="0 0 7 13" fill="none">
                                                                            <path d="M0.75 11.75L6.25 6.25L0.75 0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                    </span>
                                                                </a>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                    {/* ── Main grid end ── */}

                </div>
            </div>
        </div>
    );
}

export default function TourListing({ defaultView = 'grid' }: { defaultView?: 'grid' | 'list' }) {
    return (
        <Suspense fallback={<div className="text-center py-5">Loading Tours...</div>}>
            <TourListingContent defaultView={defaultView} />
        </Suspense>
    );
}
