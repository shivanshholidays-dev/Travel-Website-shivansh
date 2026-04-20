'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DateUtils } from '@lib/utils/date-utils';
import useAuthStore from '@/src/store/useAuthStore';
import { authApi } from '@/src/lib/api/auth.api';
import toast from 'react-hot-toast';
import { useWishlistHooks } from '@/src/lib/hooks/useWishlistHooks';
import { useTourHooks } from '@/src/lib/hooks/useTourHooks';
import { getImgUrl } from '@lib/utils/image';
import SafeImage from '@/src/components/common/SafeImage';
import { Tour } from '@/src/lib/types/tour.types';
import { UserRole } from '@lib/constants/enums';

import { formatCurrency } from '@lib/utils/currency-utils';
import { useSettingsStore } from '@store/useSettingsStore';
import { Facebook, Instagram, Linkedin, MessageCircle, Phone, Mail } from 'lucide-react';


const ChevronRight = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ChevronDown = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ── Destinations Mega Menu ────────────────────────────────────────────────────────────────────────
function DestinationsMegaMenu() {
    const { useFilterOptions, useToursByState, useToursList } = useTourHooks();

    const [mounted, setMounted] = useState(false);
    const [activeCountry, setActiveCountry] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch filter options (states) and filter out empty ones
    const { data: filterData } = useFilterOptions();
    const states: string[] = (filterData?.states || []).filter((s: string) => s && s.trim() !== '');

    // Display top 5 states + "Top destinations"
    const displayStates = mounted ? ['Top destinations', ...states.slice(0, 5)] : ['Top destinations'];

    // Active state name
    const activeStateName = displayStates[activeCountry] || 'Top destinations';
    const isTopDestinations = activeStateName === 'Top destinations';

    // Fetch tours based on active state (if not default)
    const { data: stateToursRes, isLoading: isStateLoading } = useToursByState(isTopDestinations ? '' : activeStateName);
    const { data: allToursRes, isLoading: isAllLoading } = useToursList({ limit: 6 }, { enabled: isTopDestinations });

    const tours = (isTopDestinations ? (allToursRes as any)?.items : (stateToursRes as any)?.items)?.slice(0, 6) || [];
    const isLoading = isTopDestinations ? isAllLoading : isStateLoading;

    return (
        <div className="togo-megamenu mobile-slide">
            <div className="row">
                {/* Col 1 – Country nav */}
                <div className="col-xl-3">
                    <div className="togo-megamenu-nav">
                        <ul>
                            {displayStates.map((label, i) => (
                                <li key={label} className={i === activeCountry ? 'active' : ''}>
                                    <Link
                                        href={label === 'Top destinations' ? '/tours/grid' : `/tours/grid?state=${encodeURIComponent(label)}`}
                                        onClick={() => setActiveCountry(i)}
                                        onMouseEnter={() => setActiveCountry(i)}
                                    >
                                        {label}
                                        <span><ChevronRight /></span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="togo-megamenu-show d-none d-xl-block">
                            <Link className="togo-tour-btn line-border" href="/tours/grid"><span>View all</span></Link>
                        </div>
                    </div>
                </div>

                {/* Col 2 – Destination thumbnails (changes dynamically) */}
                <div className="col-xl-6">
                    <div className="togo-megamenu-destination">
                        <div className="togo-megamenu-destination-wrap" style={{ display: 'block' }}>
                            <span className="togo-megamenu-destination-title" style={{ textTransform: 'uppercase' }}>
                                {isTopDestinations ? "Top destinations" : `Top destinations in ${activeStateName}`}
                            </span>

                            {isLoading ? (
                                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p style={{ marginTop: '10px', color: '#888' }}>Finding tours...</p>
                                </div>
                            ) : tours.length === 0 ? (
                                <div style={{ padding: '20px 0', color: '#888' }}>No tours found for this destination.</div>
                            ) : (
                                <div className="row">
                                    <div className="col-xl-6">
                                        {tours.slice(0, 3).map((tour: Tour) => (

                                            <div key={tour._id} className="togo-megamenu-destination-item mb-20 d-flex align-items-center">
                                                <div className="togo-megamenu-destination-thumb" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                                    <SafeImage
                                                        src={getImgUrl(tour.thumbnailImage)}
                                                        alt={tour.title}
                                                        fallbackSrc="/assets/img/tour/tour-thumb-1.jpg"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div className="togo-megamenu-destination-content ml-15" style={{ overflow: 'hidden' }}>
                                                    <Link
                                                        href={`/tours/${tour.slug}`}
                                                        style={{
                                                            display: 'block',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            maxWidth: '100%'
                                                        }}
                                                        title={tour.title}
                                                    >
                                                        {tour.title}
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="col-xl-6">
                                        {tours.slice(3, 6).map((tour: Tour) => (

                                            <div key={tour._id} className="togo-megamenu-destination-item mb-20 d-flex align-items-center">
                                                <div className="togo-megamenu-destination-thumb" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                                    <SafeImage
                                                        src={getImgUrl(tour.thumbnailImage)}
                                                        alt={tour.title}
                                                        fallbackSrc="/assets/img/tour/tour-thumb-1.jpg"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div className="togo-megamenu-destination-content ml-15" style={{ overflow: 'hidden' }}>
                                                    <Link
                                                        href={`/tours/${tour.slug}`}
                                                        style={{
                                                            display: 'block',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            maxWidth: '100%'
                                                        }}
                                                        title={tour.title}
                                                    >
                                                        {tour.title}
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="togo-megamenu-show d-none d-xl-block mt-20">
                                <Link
                                    className="togo-tour-btn line-border"
                                    href={activeStateName === 'Top destinations' ? '/tours/grid' : `/tours/grid?state=${encodeURIComponent(activeStateName)}`}
                                >
                                    <span>View all</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Col 3 – Promo banner card */}
                <div className="col-xl-3">
                    <div
                        className="togo-megamenu-banner"
                        style={{ backgroundImage: 'url(/assets/img/banner/home-10/megamenu-1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                        <h4 className="togo-megamenu-banner-title">Shivansh Holidays <br /> Travel Tours</h4>
                        <p>Find your next incredible travel adventure</p>
                        <Link className="togo-btn-primary" href="/tours/grid">Get it now</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Mobile Menu (Fixed Version) ────────────────────────────────────────────────────────
function MobileMenu({ isAuthenticated, user, handleLogout, mobileOpen, closeMenu }: {
    isAuthenticated: boolean;
    user: any;
    handleLogout: () => void;
    mobileOpen: boolean;
    closeMenu: () => void;
}) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const [activeCountry, setActiveCountry] = useState(0);
    const { useFilterOptions, useToursByState, useToursList } = useTourHooks();

    const { data: filterData } = useFilterOptions();
    const states: string[] = (filterData?.states || []).filter((s: string) => s && s.trim() !== '');
    const displayStates = ['Top destinations', ...states.slice(0, 5)];
    const activeStateName = displayStates[activeCountry] || 'Top destinations';
    const isTopDestinations = activeStateName === 'Top destinations';

    const { data: stateToursRes, isLoading: isStateLoading } = useToursByState(isTopDestinations ? '' : activeStateName);
    const { data: allToursRes, isLoading: isAllLoading } = useToursList({ limit: 5 }, { enabled: mobileOpen && expanded === 'destinations' && isTopDestinations });

    const tours = (isTopDestinations ? (allToursRes as any)?.items : (stateToursRes as any)?.items)?.slice(0, 5) || [];
    const isMobileToursLoading = isTopDestinations ? isAllLoading : isStateLoading;

    const router = useRouter();

    const toggle = (item: string) => {
        setExpanded(prev => (prev === item ? null : item));
    };

    const handleNav = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        router.push(path);
    };

    return (
        <nav className="togo-mobile-menu custom-mobile-nav-container">
            <ul className="main-nav-list">
                <li key="home"><button type="button" onClick={(e) => handleNav(e, '/')} className="single-link w-100">Home</button></li>
                <li key="tours"><button type="button" onClick={(e) => handleNav(e, '/tours/grid')} className="single-link w-100">Tours</button></li>

                {/* Destinations Dropdown */}
                <li key="destinations" className={`nav-group-item ${expanded === 'destinations' ? 'is-expanded' : ''}`}>
                    <button
                        type="button"
                        className="group-header-btn w-100"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle('destinations'); }}
                        data-toggle="destinations"
                    >
                        <span className="group-label">Destinations</span>
                        <div className={`group-icon-box ${expanded === 'destinations' ? 'rotate-active' : ''}`}>
                            {expanded === 'destinations' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                    </button>

                    {expanded === 'destinations' && (
                        <div className="group-content destinations-content">
                            <ul className="sub-state-list">
                                {displayStates.map((label, i) => (
                                    <li key={`state-${label}`} className={i === activeCountry ? 'active-state' : ''}>
                                        <button
                                            type="button"
                                            className="state-row-btn d-flex align-items-center justify-content-between w-100"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveCountry(i); }}
                                        >
                                            <span className="state-name-text">{label}</span>
                                            <div className="sub-chevron">
                                                <ChevronRight size={12} />
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className="destination-previews-area">
                                <span className="preview-label">
                                    {isTopDestinations ? "TOP DESTINATIONS" : `TOP DESTINATIONS IN ${activeStateName.toUpperCase()}`}
                                </span>

                                {isMobileToursLoading ? (
                                    <div className="loading-container py-3">
                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                    </div>
                                ) : tours.length > 0 ? (
                                    <div className="tours-preview-list">
                                        {tours.map((tour: Tour) => (
                                            <button type="button" key={`tour-${tour._id}`} onClick={(e) => handleNav(e, `/tours/${tour.slug}`)} className="preview-tour-card w-100 text-left border-0 bg-transparent">
                                                <div className="tour-card-thumb">
                                                    <SafeImage
                                                        src={getImgUrl(tour.thumbnailImage)}
                                                        alt={tour.title}
                                                        fallbackSrc="/assets/img/tour/tour-thumb-1.jpg"
                                                    />
                                                </div>
                                                <span className="tour-card-name" title={tour.title}>{tour.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data-msg">Discover our featured tours.</p>
                                )}
                            </div>
                        </div>
                    )}
                </li>

                <li key="blog"><button type="button" onClick={(e) => handleNav(e, '/blog')} className="single-link w-100">Blog</button></li>
                <li key="about-us"><button type="button" onClick={(e) => handleNav(e, '/about')} className="single-link w-100">About Us</button></li>

                {/* Account Dropdown */}
                <li key="account" className={`nav-group-item ${expanded === 'account' ? 'is-expanded' : ''}`}>
                    <button
                        type="button"
                        className="group-header-btn w-100"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle('account'); }}
                        data-toggle="account"
                    >
                        <span className="group-label">
                            {isAuthenticated ? 'My Account' : 'Dashboard'}
                        </span>
                        <div className={`group-icon-box ${expanded === 'account' ? 'rotate-active' : ''}`}>
                            {expanded === 'account' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                    </button>
                    {expanded === 'account' && (
                        <div className="group-content account-list-content">
                            <ul className="simple-account-links">
                                {isAuthenticated ? (
                                    <>
                                        <li><button type="button" onClick={(e) => handleNav(e, (user?.role?.toUpperCase() === UserRole.ADMIN) ? "/admin" : "/dashboard")} className="logout-btn-link text-dark">Dashboard Home</button></li>
                                        <li><button type="button" onClick={(e) => handleNav(e, '/dashboard/bookings')} className="logout-btn-link text-dark">My Bookings</button></li>
                                        <li><button type="button" onClick={(e) => handleNav(e, '/dashboard/wishlist')} className="logout-btn-link text-dark">My Wishlist</button></li>
                                        <li><button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); closeMenu(); }} className="logout-btn-link">Sign Out</button></li>
                                    </>
                                ) : (
                                    <>
                                        <li><button type="button" onClick={(e) => handleNav(e, '/login')} className="logout-btn-link text-dark">Sign In</button></li>
                                        <li><button type="button" onClick={(e) => handleNav(e, '/register')} className="logout-btn-link text-dark">Register</button></li>
                                    </>
                                )}
                            </ul>
                        </div>
                    )}
                </li>

                <li key="custom-tour"><button type="button" onClick={(e) => handleNav(e, '/custom-tour')} className="single-link w-100">Custom Tour</button></li>
                <li key="contact"><button type="button" onClick={(e) => handleNav(e, '/contact')} className="single-link w-100">Contact Us</button></li>
            </ul>
        </nav>
    );
}

// ── Main Header ───────────────────────────────────────────────────────────────────────────────────
export default function Header() {
    const { user, isAuthenticated, logout, refreshToken } = useAuthStore();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const { settings, fetchSettings } = useSettingsStore();

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const business = settings?.businessDetails;
    const other = settings?.otherSettings;



    const { useWishlist, useToggleWishlist } = useWishlistHooks();
    const { data: wishlistRes, isLoading: wishlistLoading } = useWishlist();
    const toggleMutation = useToggleWishlist();

    const wishlistItems = (wishlistRes as any)?.data || [];
    const hasItems = wishlistItems.length > 0;


    const closeCart = () => {
        setCartOpen(false);
    };

    const openCart = () => {
        setCartOpen(true);
    };

    const toggleMobileMenu = () => {
        setMobileOpen(!mobileOpen);
    };

    const closeMobileMenu = () => {
        setMobileOpen(false);
    };


    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Basic scrolled state for background/sticky
            setScrolled(currentScrollY > 80);

            // Visibility logic
            if (currentScrollY < 80)
            {
                setVisible(true);
            } else if (currentScrollY > lastScrollY)
            {
                // Scrolling down
                setVisible(false);
            } else
            {
                // Scrolling up
                setVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleLogout = async () => {
        if (refreshToken)
        {
            try { await authApi.logout(refreshToken); } catch { /* ignore */ }
        }
        logout();
        toast.success('Logged out');
        router.push('/');
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .togo-header-sec {
                    position: relative;
                    width: 100%;
                    z-index: 900;
                    transition: transform 0.3s ease-in-out, background-color 0.3s ease;
                }
                /* Sticky spacer — prevents content jump when header becomes fixed */
                .togo-header-sticky-spacer {
                    display: none;
                }
                .togo-header-sticky ~ .togo-header-sticky-spacer,
                body.header-is-sticky .togo-header-sticky-spacer {
                    display: block;
                }
                .togo-header-sticky {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                }
                .togo-header-hidden {
                    transform: translateY(-100%);
                }
                .togo-header-visible {
                    transform: translateY(0);
                }
                .togo-header-sticky.togo-header-visible {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                /* Ensure sidebars always appear above header */
                .cart-wrapper, .offcanvas-wrapper {
                    z-index: 9999 !important;
                }
                .body-overlay {
                    z-index: 9900 !important;
                }

                .togo-header-social-links a {
                    color: #666;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #f5f5f5;
                }
                .togo-header-social-links a:hover {
                    color: #fff;
                    background: #FD4621;
                    transform: translateY(-2px);
                }
                .togo-header-top-info a {
                    transition: color 0.3s ease;
                }
                .togo-header-top-info a:hover {
                    color: #FD4621 !important;
                }
                .togo-header-powered-by {
                    font-size: 13px;
                    color: #888;
                    border-left: 2px solid #eee;
                    padding-left: 20px;
                    display: flex;
                    align-items: center;
                }
                .togo-header-powered-by .brand-name {
                    color: #FD4621;
                    font-weight: 600;
                    margin-left: 4px;
                }

                /* Semantic Mobile Nav Revamp - Aggressive Styles to override theme */
                .custom-mobile-nav-container {
                    padding: 0 !important;
                    position: relative;
                }
                .main-nav-list {
                    list-style: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }
                .main-nav-list > li {
                    border-bottom: 1px solid #f2f3f5 !important;
                    position: relative !important;
                    width: 100% !important;
                    display: block !important;
                }
                /* Kill theme injected icons for all items in our container */
                .custom-mobile-nav-container li::after,
                .custom-mobile-nav-container li::before,
                .custom-mobile-nav-container a::after,
                .custom-mobile-nav-container a::before,
                .custom-mobile-nav-container button::after,
                .custom-mobile-nav-container button::before {
                    display: none !important;
                    content: none !important;
                }

                .custom-mobile-nav-container svg {
                    position: static !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    top: auto !important;
                    right: auto !important;
                    left: auto !important;
                    bottom: auto !important;
                    transform: none !important;
                    stroke: currentColor !important;
                    stroke-width: 2px !important;
                }
                .custom-mobile-nav-container svg path {
                    stroke: currentColor !important;
                }

                .single-link, .group-header-btn {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    padding: 18px 0 !important;
                    font-size: 16px !important;
                    font-weight: 500 !important;
                    color: #111 !important;
                    width: 100% !important;
                    text-align: left !important;
                    border: none !important;
                    background: transparent !important;
                    transition: all 0.2s ease !important;
                    text-decoration: none !important;
                    cursor: pointer !important;
                    pointer-events: auto !important;
                }
                .single-link:hover, .group-header-btn:hover, .is-expanded .group-label {
                    color: #FD4621 !important;
                }

                .group-icon-box {
                    width: 32px !important;
                    height: 32px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border: 1px solid #F0F1F2 !important;
                    border-radius: 6px !important;
                    color: #111 !important;
                    background: #fff !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    margin-left: 10px !important;
                    pointer-events: none !important;
                }
                .group-icon-box svg {
                    width: 14px !important;
                    height: 14px !important;
                    display: block !important;
                }
                .rotate-active {
                    background-color: #FD4621 !important;
                    border-color: #FD4621 !important;
                    color: #ffffff !important;
                    box-shadow: 0 4px 12px rgba(253, 70, 33, 0.25) !important;
                }
                .rotate-active svg {
                    color: #ffffff !important;
                    stroke: #ffffff !important;
                }

                .group-content {
                    padding: 5px 0 25px 20px !important;
                    border-left: 1px solid #eee !important;
                    margin-left: 8px !important;
                    display: block !important;
                }
                
                .sub-state-list {
                    list-style: none !important;
                    padding: 0 !important;
                    margin: 0 0 25px 0 !important;
                }
                .state-row-btn {
                    padding: 12px 10px 12px 0 !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    border: none !important;
                    background: transparent !important;
                    text-align: left !important;
                    color: #444 !important;
                    font-size: 15px !important;
                    font-weight: 400 !important;
                    pointer-events: auto !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    width: 100% !important;
                }
                .active-state .state-row-btn {
                    color: #FD4621 !important;
                    font-weight: 600 !important;
                }
                .sub-chevron {
                    color: #ccc !important;
                    opacity: 0;
                    margin-left: 10px !important;
                    transition: all 0.2s ease !important;
                }
                .active-state .sub-chevron {
                    opacity: 1 !important;
                    color: #FD4621 !important;
                    transform: translateX(3px) !important;
                }

                .destination-previews-area {
                    margin-top: 15px !important;
                    padding-top: 25px !important;
                    border-top: 1px solid #f2f3f5 !important;
                }
                .preview-label {
                    font-size: 11px !important;
                    font-weight: 700 !important;
                    color: #999 !important;
                    letter-spacing: 1.2px !important;
                    display: block !important;
                    margin-bottom: 20px !important;
                    text-transform: uppercase !important;
                }
                .preview-tour-card {
                    display: flex !important;
                    align-items: center !important;
                    margin-bottom: 18px !important;
                    text-decoration: none !important;
                    pointer-events: auto !important;
                    cursor: pointer !important;
                }
                .tour-card-thumb {
                    width: 52px !important;
                    height: 52px !important;
                    border-radius: 50% !important;
                    overflow: hidden !important;
                    margin-right: 15px !important;
                    border: 2px solid #fff !important;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.06) !important;
                    flex-shrink: 0 !important;
                }
                .tour-card-thumb img {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                }
                .tour-card-name {
                    font-size: 15px !important;
                    color: #111 !important;
                    font-weight: 500 !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    white-space: nowrap !important;
                    max-width: 180px !important;
                }
                
                .simple-account-links {
                    list-style: none !important;
                    padding: 0 !important;
                }
                .simple-account-links li a, .logout-btn-link {
                    font-size: 15px !important;
                    padding: 10px 0 !important;
                    display: block !important;
                    color: #444 !important;
                    text-decoration: none !important;
                    width: 100% !important;
                    text-align: left !important;
                    border: none !important;
                    background: transparent !important;
                    cursor: pointer !important;
                    pointer-events: auto !important;
                }
                .logout-btn-link { color: #ff4d4f !important; }
                .togo-header-visible .togo-header-sec{
                padding-top: !important ;
                padding-bottom: !important ;
                }  
            `}} />

            {/* ── Wishlist sidebar (Cart Drawer) ── */}
            <div className={`cart-area ${cartOpen ? 'opened' : ''}`}>
                <div className="cart-wrapper">
                    <div className="cart-top">
                        <div className="cart-title-wrap">
                            <h4 className="cart-title">Your Wishlist</h4>
                        </div>
                        <div className="cart-close">
                            <button className="offcanvas-close-btn" onClick={closeCart}>
                                <svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.19141 9.80762L27.5762 28.1924" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9.19141 28.1924L27.5762 9.80761" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {hasItems ? (
                        <div className="cart-content" style={{ padding: '34px 24px 24px' }}>
                            <ul className="cart-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {wishlistItems.map((item: any) => (
                                    <li key={item._id} className="cart-item d-flex align-items-center mb-15" style={{
                                        position: 'relative',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid transparent',
                                        transition: 'all 0.3s ease',
                                        background: '#f9f9f9',
                                    }}>
                                        <div className="cart-item-thumb mr-15" style={{ width: 90, height: 65, flexShrink: 0 }}>
                                            <Link href={`/tours/${item.slug}`} onClick={closeCart}>
                                                <SafeImage src={getImgUrl(item.thumbnailImage)} alt={item.title} fallbackSrc="/assets/img/tour/tour-thumb-1.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                            </Link>
                                        </div>
                                        <div className="cart-item-content flex-grow-1 mr-10" style={{ overflow: 'hidden' }}>
                                            <h5 className="cart-item-title" style={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                margin: '0 0 4px',
                                                lineHeight: 1.4,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                color: '#111'
                                            }}>
                                                <Link href={`/tours/${item.slug}`} onClick={closeCart} style={{ color: 'inherit' }}>{item.title}</Link>
                                            </h5>
                                            <span className="cart-item-price" style={{ color: '#FD4621', fontSize: 13, fontWeight: 700 }}>
                                                {formatCurrency(item.basePrice)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => toggleMutation.mutate(item._id)}
                                            style={{
                                                color: '#bbb',
                                                background: 'none',
                                                border: 'none',
                                                padding: 8,
                                                cursor: 'pointer',
                                                transition: 'color 0.2s ease',
                                                borderRadius: '50%'
                                            }}
                                            onMouseOver={e => (e.currentTarget.style.color = '#ff4d4f')}
                                            onMouseOut={e => (e.currentTarget.style.color = '#bbb')}
                                            title="Remove"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="cart-bottom mt-25">
                                <Link className="togo-btn-primary w-100 text-center" href="/dashboard/wishlist" onClick={closeCart} style={{
                                    display: 'block',
                                    borderRadius: '10px',
                                    padding: '12px',
                                    fontWeight: 600
                                }}>
                                    View Full Wishlist
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="cart-empty-content">
                            <span className="cart-empty-icon">
                                <svg width="70" height="78" fill="none" viewBox="0 0 70 78">
                                    <path fill="#888" fillRule="evenodd" d="m2.357 32.177.732 3.764a1.13 1.13 0 1 1-2.216.433L.14 32.609c-.891-4.581 2.577-8.87 7.23-8.87H62.63c4.597 0 8.053 4.194 7.254 8.738l-6.933 39.386C62.329 75.406 59.278 78 55.698 78H15.73c-3.438 0-6.41-2.398-7.179-5.767l-1.08-4.735a1.129 1.129 0 1 1 2.201-.504l1.08 4.735c.538 2.355 2.607 4.01 4.978 4.01h39.968c2.468 0 4.594-1.79 5.03-4.268l6.933-39.386C68.22 28.899 65.798 26 62.63 26H7.37c-3.206 0-5.638 2.965-5.013 6.177Z" clipRule="evenodd"></path>
                                    <path fill="#888" d="M32.633 2.802a1.805 1.805 0 0 0-.489-2.496 1.786 1.786 0 0 0-2.485.49L11.027 28.684a1.805 1.805 0 0 0 .489 2.497A1.786 1.786 0 0 0 14 30.689L32.633 2.802ZM56.038 30.501a1.786 1.786 0 0 0 2.447-.657c.495-.86.203-1.96-.654-2.458L35.096 14.172a1.786 1.786 0 0 0-2.447.656c-.495.86-.203 1.96.654 2.459L56.038 30.5Z"></path>
                                    <path fill="#888" fillRule="evenodd" d="M35.012 53.02c-.298.07-.663.362-.897.674-.514.683-1.412.76-2.008.17-.595-.588-.662-1.62-.148-2.303.477-.635 1.358-1.48 2.488-1.742a2.917 2.917 0 0 1 1.943.207c.67.319 1.247.882 1.727 1.643.46.731.319 1.752-.318 2.281-.637.53-1.527.366-1.988-.365-.237-.375-.42-.498-.51-.54a.412.412 0 0 0-.29-.025Z" clipRule="evenodd"></path>
                                    <path fill="#888" d="M25.402 47.478a1.695 1.695 0 1 0-.002-3.389 1.695 1.695 0 0 0 .003 3.39ZM44.596 47.478c.936 0 1.693-.759 1.693-1.695a1.694 1.694 0 1 0-3.387 0c0 .936.758 1.695 1.694 1.695Z"></path>
                                </svg>
                            </span>
                            <h4 className="cart-empty-title">Your wishlist is currently empty!</h4>
                            <div className="cart-empty-text"><p>You may check out all the available trips and book one that suits you.</p></div>
                            <div className="cart-empty-btn"><Link className="togo-btn-primary" href="/tours" onClick={closeCart}>Continue Browsing Trips</Link></div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Mobile offcanvas ── */}
            <div className={`offcanvas-area ${mobileOpen ? 'opened' : ''}`}>
                <div className="offcanvas-wrapper p-4 pt-2">
                    <div className="offcanvas-top d-flex align-items-center justify-content-between">
                        <div className="offcanvas-logo">
                            <Link href="/">
                                <Image
                                    width={120}
                                    height={100}
                                    src={getImgUrl(other?.logoUrl, "/assets/img/logo/the-trek-stories.jpg")}
                                    alt={business?.supportEmail || "Shivansh Holidays"}
                                    style={{ objectFit: 'contain' }}
                                />
                            </Link>
                        </div>


                        <div className="offcanvas-close">
                            <button className="offcanvas-close-btn" onClick={closeMobileMenu}>
                                <svg width="37" height="38" viewBox="0 0 37 38" fill="none">
                                    <path d="M9.19141 9.80762L27.5762 28.1924" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9.19141 28.1924L27.5762 9.80761" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="offcanvas-content" style={{ marginTop: '20px' }}>
                        <div className="custom-mobilemenu-react-wrapper fix mb-30">
                            <MobileMenu
                                isAuthenticated={isAuthenticated}
                                user={user}
                                handleLogout={handleLogout}
                                mobileOpen={mobileOpen}
                                closeMenu={closeMobileMenu}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={`body-overlay ${(cartOpen || mobileOpen) ? 'opened' : ''}`} onClick={() => { closeCart(); closeMobileMenu(); }} />

            {/* ── HEADER ── */}
            <header>
                <div className={`togo-header-sec ${scrolled ? 'togo-header-sticky' : ''} ${visible ? 'togo-header-visible' : 'togo-header-hidden'}`} style={{ backgroundColor: '#fff', borderBottom: scrolled ? 'none' : '1px solid #eee' }}>


                    {/* Top Top bar */}
                    {!scrolled && (
                        <div className="togo-header-top d-none d-xl-block" style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
                            <div className="container-fluid">
                                <div className="row align-items-center">
                                    <div className="col-xl-6">
                                        <div className="togo-header-top-info">
                                            <ul className="d-flex list-unstyled m-0 gap-4">
                                                {business?.phoneNumber && (
                                                    <li className="d-flex align-items-center" style={{ fontSize: '14px' }}>
                                                        <span style={{ color: '#FD4621' }} className="mr-8">
                                                            <Phone size={16} />
                                                        </span>
                                                        <a href={`tel:${business.phoneNumber}`} style={{ color: '#666', fontWeight: 500 }}>{business.phoneNumber}</a>
                                                    </li>
                                                )}
                                                {business?.supportEmail && (
                                                    <li className="d-flex align-items-center" style={{ fontSize: '14px' }}>
                                                        <span style={{ color: '#FD4621' }} className="mr-8">
                                                            <Mail size={16} />
                                                        </span>
                                                        <a href={`mailto:${business.supportEmail}`} style={{ color: '#666', fontWeight: 500 }}>{business.supportEmail}</a>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-xl-6">
                                        <div className="togo-header-top-right d-flex align-items-center justify-content-end">
                                            <div className="togo-header-social-links d-flex align-items-center gap-2 mr-20">
                                                {settings?.socialMedia?.facebook && (
                                                    <a href={settings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" title="Facebook">
                                                        <Facebook size={16} />
                                                    </a>
                                                )}
                                                {settings?.socialMedia?.instagram && (
                                                    <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                                                        <Instagram size={16} />
                                                    </a>
                                                )}
                                                {settings?.socialMedia?.linkedin && (
                                                    <a href={settings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                                        <Linkedin size={16} />
                                                    </a>
                                                )}
                                                {settings?.socialMedia?.whatsapp && (
                                                    <a href={`https://wa.me/${settings.socialMedia.whatsapp}`} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                                                        <MessageCircle size={16} />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="togo-header-powered-by">
                                                <span>Powered By</span>
                                                <span className="brand-name">Shivansh Holidays</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main header row */}
                    <div className="container-fluid">

                        <div className="togo-header-wrapper">
                            <div className="row align-items-center">
                                {/* Logo */}
                                <div className="col-xl-3 col-lg-6 col-4">
                                    <div className="togo-header-logo">
                                        <Link href="/">
                                            <Image
                                                width={120}
                                                height={70}
                                                src={getImgUrl(other?.logoUrl, "/assets/img/logo/the-trek-stories.jpg")}
                                                alt={business?.supportEmail || "Shivansh Holidays"}
                                                priority
                                            />
                                        </Link>
                                    </div>
                                </div>



                                {/* Desktop Nav */}
                                <div className="col-xl-7 d-none d-xl-block">
                                    <div className="togo-header-style-1">
                                        <div className="togo-header-menu d-flex justify-content-center">
                                            <nav className="togo-mobile-menu">
                                                <ul>
                                                    {/* Home */}
                                                    <li>
                                                        <Link href="/">Home</Link>
                                                    </li>

                                                    {/* Tours */}
                                                    <li>
                                                        <Link href="/tours/grid">Tours</Link>
                                                    </li>

                                                    {/* Destinations – mega menu */}
                                                    <li className="togo-dropdown p-static">
                                                        <Link href="/tours/grid">Destinations</Link>
                                                        <DestinationsMegaMenu />
                                                    </li>

                                                    {/* Blog */}
                                                    <li>
                                                        <Link href="/blog">Blog</Link>
                                                    </li>

                                                    {/* Team */}
                                                    <li>
                                                        <Link href="/team">Team</Link>
                                                    </li>

                                                    {/* Dashboard / Auth */}
                                                    <li className="togo-dropdown">
                                                        <span style={{ cursor: 'pointer', padding: '10px 0', display: 'inline-block', fontWeight: 500, color: '#111' }}>Pages <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 4 }}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                                        <ul className="togo-submenu mobile-slide">
                                                            <li><Link href="/about">About Us</Link></li>
                                                            <li><Link href="/contact">Contact Us</Link></li>
                                                            <li><Link href="/custom-tour">Custom Tour</Link></li>
                                                            <li><Link href="/tours/grid">Tours</Link></li>
                                                            <li>{isAuthenticated ? <Link href={(user?.role?.toUpperCase() === UserRole.ADMIN) ? "/admin" : "/dashboard"}>Dashboard</Link> : <Link href="/login">Sign In</Link>}</li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: cart + user + CTA + hamburger */}
                                <div className="col-xl-2 col-lg-6 col-8">
                                    <div className="togo-header-right d-flex align-items-center justify-content-end">
                                        {/* Cart */}
                                        <div className="togo-header-cart ml-20">
                                            <button className="togo-header-cart-btn cart-open-btn" onClick={openCart}>
                                                <span className="p-relative">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path d="M1.45907 3.15018H16.6741C18.0517 3.15018 19.0468 4.42075 18.6694 5.69802L17.0149 11.298C16.761 12.1574 15.9465 12.7502 15.0196 12.7502H5.86164C4.93469 12.7502 4.12021 12.1574 3.86631 11.298L1.45907 3.15018ZM1.45907 3.15018L0.75 0.750183M15.75 17.2502C15.75 18.0786 15.0784 18.7502 14.25 18.7502C13.4216 18.7502 12.75 18.0786 12.75 17.2502C12.75 16.4218 13.4216 15.7502 14.25 15.7502C15.0784 15.7502 15.75 16.4218 15.75 17.2502ZM7.75 17.2502C7.75 18.0786 7.07843 18.7502 6.25 18.7502C5.42157 18.7502 4.75 18.0786 4.75 17.2502C4.75 16.4218 5.42157 15.7502 6.25 15.7502C7.07843 15.7502 7.75 16.4218 7.75 17.2502Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    {wishlistItems.length > 0 && (
                                                        <span className="cart-badge" style={{
                                                            position: 'absolute',
                                                            top: '-8px',
                                                            right: '-8px',
                                                            background: '#FD4621',
                                                            color: '#fff',
                                                            fontSize: '10px',
                                                            fontWeight: 'bold',
                                                            width: '18px',
                                                            height: '18px',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: '2px solid #fff'
                                                        }}>
                                                            {wishlistItems.length}
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        </div>

                                        {/* User menu */}
                                        <div className="togo-header-user ml-20">
                                            <span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                    <path d="M14.75 16.95C14.4331 10.7633 5.06692 10.7633 4.75 16.95M12.25 6.84999C12.25 8.2307 11.1307 9.34999 9.74998 9.34999C8.36926 9.34999 7.24997 8.2307 7.24997 6.84999C7.24997 5.46928 8.36926 4.34999 9.74998 4.34999C11.1307 4.34999 12.25 5.46928 12.25 6.84999ZM18.75 9.75C18.75 14.7206 14.7206 18.75 9.75 18.75C4.77944 18.75 0.75 14.7206 0.75 9.75C0.75 4.77944 4.77944 0.75 9.75 0.75C14.7206 0.75 18.75 4.77944 18.75 9.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                            <div className="togo-header-user-submenu">
                                                {isAuthenticated && user ? (
                                                    <>
                                                        <div className="togo-header-user-thumb mb-20">
                                                            <Link href="/dashboard" className="d-flex align-items-center">
                                                                <SafeImage className="mr-10" src={getImgUrl(user?.avatar || user?.profileImage, '/assets/img/tour/home-9/avatar.jpg')} alt={user?.name || (user as any)?.data?.name || 'Traveler'} fallbackSrc="/assets/img/tour/home-9/avatar.jpg" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                                                                <span className="fw-bold" style={{ fontSize: '15px', color: '#111' }}>{user?.name || (user as any)?.data?.name || 'Traveler'}</span>
                                                            </Link>
                                                        </div>
                                                        <div className="togo-header-user-menu">
                                                            <Link href={(user?.role === UserRole.ADMIN) ? "/admin" : "/dashboard"}>
                                                                <span className="togo-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M8.25 3.20831L8.25 18.7916" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.7943 8.70831H3.21094" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M2.75 11C2.75 7.11091 2.75 5.16637 3.95818 3.95818C5.16637 2.75 7.11091 2.75 11 2.75C14.8891 2.75 16.8336 2.75 18.0418 3.95818C19.25 5.16637 19.25 7.11091 19.25 11C19.25 14.8891 19.25 16.8336 18.0418 18.0418C16.8336 19.25 14.8891 19.25 11 19.25C7.11091 19.25 5.16637 19.25 3.95818 18.0418C2.75 16.8336 2.75 14.8891 2.75 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                                                Dashboard
                                                            </Link>
                                                            <Link href="/dashboard/bookings">
                                                                <span className="togo-svg-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><path d="M19 19C20.1046 19 21 18.1046 21 17V14C19.8954 14 19 13.1046 19 12C19 10.8954 19.8954 10 21 10V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V10C4.10457 10 5 10.8954 5 12C5 13.1046 4.10457 14 3 14V17C3 18.1046 3.89543 19 5 19H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                                                Bookings
                                                            </Link>
                                                            <Link href="/dashboard/wishlist">
                                                                <span className="togo-svg-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><path d="M7.75 3.5C5.12665 3.5 3 5.75956 3 8.54688C3 14.125 12 20.5 12 20.5C12 20.5 21 14.125 21 8.54688C21 5.09375 18.8734 3.5 16.25 3.5C14.39 3.5 12.7796 4.63593 12 6.2905C11.2204 4.63593 9.61003 3.5 7.75 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                                                Wishlist
                                                            </Link>
                                                            {user.role === UserRole.ADMIN && (
                                                                <Link href="/admin">
                                                                    <span className="togo-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M2.75 11C2.75 7.11091 2.75 5.16637 3.95818 3.95818C5.16637 2.75 7.11091 2.75 11 2.75C14.8891 2.75 16.8336 2.75 18.0418 3.95818C19.25 5.16637 19.25 7.11091 19.25 11C19.25 14.8891 19.25 16.8336 18.0418 18.0418C16.8336 19.25 14.8891 19.25 11 19.25C7.11091 19.25 5.16637 19.25 3.95818 18.0418C2.75 16.8336 2.75 14.8891 2.75 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                                                    Admin Panel
                                                                </Link>
                                                            )}
                                                            <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', width: '100%', color: '#ff4d4f', fontWeight: 500 }}>
                                                                <span className="togo-svg-icon" style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                                                                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                                                                        <path d="M13.4958 21H6.5C5.39543 21 4.5 19.8487 4.5 18.4286V5.57143C4.5 4.15127 5.39543 3 6.5 3H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M16 15.5L19.5 12L16 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M9.5 11.9958H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </span>
                                                                Logout
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="togo-header-user-menu">
                                                        <Link href="/login">
                                                            <span className="togo-svg-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><path d="M13.4958 21H6.5C5.39543 21 4.5 19.8487 4.5 18.4286V5.57143C4.5 4.15127 5.39543 3 6.5 3H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 15.5L19.5 12L16 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.5 11.9958H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                                            Sign In
                                                        </Link>
                                                        <Link href="/register">
                                                            <span className="togo-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M8.25 3.20831L8.25 18.7916" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.7943 8.70831H3.21094" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                                            Register
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>


                                        {/* Mobile hamburger */}
                                        <div className="togo-header-bar ml-20 d-xl-none">
                                            <button className="offcanvas-open-btn togo-offcanvas-hamburger-btn" onClick={toggleMobileMenu}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M4.5 6.5H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M4.5 12H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M4.5 17.5H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sticky spacer: when header becomes fixed-position it leaves the flow,
                this div takes its place to prevent content from jumping up underneath it.
                Height = approx nav bar height (80px) since top bar is hidden when sticky */}
            {scrolled && (
                <div style={{ height: '80px' }} aria-hidden="true" />
            )}
        </>
    );
}
