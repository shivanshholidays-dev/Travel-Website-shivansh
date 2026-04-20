'use client';
import { useEffect, useState, use } from 'react';
import { useTourHooks } from '@hooks/useTourHooks';
import { usePreviewBooking } from '@hooks/useBookingHooks';
import { Tour, TourDate } from '@lib/types/tour.types';
import { useBookingStore } from '@lib/store/booking.store';
import { useRouter } from 'next/navigation';
import useAuthStore from '@store/useAuthStore';
import { getImgUrl } from '@lib/utils/image';
import { DateUtils } from '@lib/utils/date-utils';
import { getTourCategoryLabel, getPickupTypeLabel } from '@lib/utils/enum-mappings';
import { TourDateStatus } from '@lib/constants/enums';
import { useSettingsStore } from '@/src/store/useSettingsStore';

// ─── SVG Icons ─────────────────────────────────────────────────────────────

const StarIcon = ({ filled = true, size = 16 }: { filled?: boolean; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#FD4621' : 'none'} stroke="#FD4621" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const CheckIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round">
        <path d="M5 13.5L8.5 17L19 7" />
    </svg>
);

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9l6 6 6-6" />
    </svg>
);

const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FD4621" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
);

const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FD4621" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const MapPinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FD4621" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
    </svg>
);

// ─── Types ──────────────────────────────────────────────────────────────────

type InfoTab = 'OVERVIEW' | 'ITINERARY' | 'FAQ' | 'REVIEWS';

// ─── Tour Details Page ──────────────────────────────────────────────────────

export default function TourDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;
    const router = useRouter();
    const { user } = useAuthStore();

    const tourImgHelper = (p?: string) => getImgUrl(p, '/assets/img/tour/details/details-1-1.jpg');

    const { useTourBySlug } = useTourHooks();
    const { data: tourResp, isLoading, error } = useTourBySlug(slug);
    const tourData: Tour & { availableDates?: TourDate[] } = (tourResp as any)?.data || tourResp;
    const availableDates: TourDate[] = tourData?.availableDates || [];

    // ── Info Tabs ────────────────────────────────────────────────────────────
    const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>('OVERVIEW');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    // ── Booking Sidebar State ─────────────────────────────────────────────────
    const [selectedDateId, setSelectedDateId] = useState('');
    const [selectedPickupIndex, setSelectedPickupIndex] = useState(-1);
    const [guestCount, setGuestCount] = useState(1);

    const { setSelection, setPricing } = useBookingStore();
    const previewMutation = usePreviewBooking();
    const { settings, fetchSettings } = useSettingsStore();
    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    // ── Derived Pricing (Client-side instant feedback) ────────────────────────
    const selectedDate = availableDates.find(d => d._id === selectedDateId);
    const basePerPerson = selectedDate?.priceOverride || tourData?.basePrice || 0;
    const pickupAdj = (selectedPickupIndex >= 0 && tourData?.departureOptions)
        ? (tourData.departureOptions[selectedPickupIndex]?.priceAdjustment || 0)
        : 0;
    const perPersonPrice = basePerPerson + pickupAdj;
    const subtotal = perPersonPrice * guestCount;
    const gstRate = settings?.businessDetails?.gstRate ?? 5;
    const taxAmount = gstRate > 0 ? Math.round(subtotal * (gstRate / 100)) : 0;
    const totalAmount = subtotal + taxAmount;

    const availableSeats = selectedDate 
        ? (selectedDate.status === TourDateStatus.FULL ? 0 : Math.max(0, selectedDate.totalSeats - selectedDate.bookedSeats)) 
        : 999;
    const maxGuests = Math.min(availableSeats, 10);

    // Compute max group size for the summary badge
    const maxUpcomingSeats = availableDates.reduce((max, d) => {
        if (d.status === TourDateStatus.FULL) return max;
        const avail = d.totalSeats - d.bookedSeats;
        return avail > max ? avail : max;
    }, 0);
    const maxGroupSizeDisplay = maxUpcomingSeats > 0 ? maxUpcomingSeats : 20;

    // ── Scroll spy for info tabs ─────────────────────────────────────────────
    const scrollToSection = (id: string) => {
        const el = document.getElementById(id.toLowerCase());
        if (el)
        {
            const y = el.getBoundingClientRect().top + window.scrollY - 130;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
        setActiveInfoTab(id as InfoTab);
    };

    const handleProceed = async () => {
        if (!user)
        {
            router.push(`/login?redirect=/tours/${slug}`);
            return;
        }
        if (!selectedDateId) { alert('Please select a travel date.'); return; }
        if (selectedPickupIndex < 0) { alert('Please select a departure point.'); return; }
        if (guestCount < 1) { alert('Please select at least 1 guest.'); return; }
        if (guestCount > availableSeats) { alert(`Only ${availableSeats} seats available.`); return; }

        try
        {
            const preview = await previewMutation.mutateAsync({
                tourDateId: selectedDateId,
                pickupOptionIndex: selectedPickupIndex,
                travelerCount: guestCount,
            });
            const pricingData = (preview as any)?.data || preview;

            setSelection({
                tourId: tourData._id,
                tourSlug: tourData.slug,
                tourTitle: tourData.title,
                tourThumbnail: tourData.thumbnailImage,
                tourDateId: selectedDateId,
                pickupOptionIndex: selectedPickupIndex,
                travelerCount: guestCount,
                selectedDate,
                selectedPickup: tourData.departureOptions?.[selectedPickupIndex],
            });
            setPricing({
                baseAmount: pricingData.baseAmount || basePerPerson,
                perPersonPrice: pricingData.perPersonPrice || perPersonPrice,
                subtotal: pricingData.subtotal || subtotal,
                couponDiscount: pricingData.couponDiscount || 0,
                taxAmount: pricingData.taxAmount || taxAmount,
                taxRate: pricingData.taxRate ?? gstRate,
                totalAmount: pricingData.totalAmount || totalAmount,
                appliedCoupon: null,
                pickupOption: pricingData.pickupOption,
                pricingSummary: pricingData.pricingSummary,
            });

            router.push('/booking/preview');
        } catch (err: any)
        {
            alert(err?.response?.data?.message || 'Failed to proceed. Please try again.');
        }
    };

    // gallery
    const gallery = tourData?.images?.length ? tourData.images.map((img: string) => tourImgHelper(img)) : ['/assets/img/tour/details/details-1-1.jpg'];
    const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

    if (isLoading)
    {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="text-center">
                    <div className="spinner-border mb-3" style={{ color: '#FD4621', width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading tour details...</p>
                </div>
            </div>
        );
    }

    if (error || !tourData)
    {
        return (
            <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
                <div style={{ fontSize: '4rem' }}>🏔️</div>
                <h3 className="fw-bold mt-3">Tour not found</h3>
                <p className="text-muted">We couldn't find the tour you're looking for.</p>
                <a href="/tours" className="btn rounded-pill px-4 py-2 fw-bold text-white" style={{ backgroundColor: '#FD4621' }}>
                    Explore Tours
                </a>
            </div>
        );
    }

    return (
        <main style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>

            {/* ─── Hero Section ────────────────────────── */}
            <div className="position-relative" style={{ height: '72vh', minHeight: '520px', overflow: 'hidden' }}>
                <img
                    src={gallery[activeGalleryIdx]}
                    alt={tourData.title}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
                {/* Gradient overlays */}
                <div className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)' }} />

                {/* Thumbnail strip */}
                {gallery.length > 1 && (
                    <div className="position-absolute end-0 top-50 translate-middle-y pe-3 d-flex flex-column gap-2" style={{ zIndex: 5 }}>
                        {gallery.slice(0, 5).map((img, i) => (
                            <div key={i} onClick={() => setActiveGalleryIdx(i)} style={{
                                width: '56px', height: '42px', borderRadius: '6px', overflow: 'hidden',
                                cursor: 'pointer', border: activeGalleryIdx === i ? '2px solid #FD4621' : '2px solid rgba(255,255,255,0.5)',
                                transition: 'border 0.2s'
                            }}>
                                <img src={img} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Hero Content */}
                <div className="position-absolute bottom-0 start-0 w-100 pb-4" style={{ zIndex: 2 }}>
                    <div className="container container-1440 px-3 px-md-4">
                        {/* Breadcrumb */}
                        <nav className="d-flex align-items-center gap-2 mb-2 small opacity-75 text-white">
                            <a href="/" className="text-white text-decoration-none">Home</a>
                            <span>/</span>
                            <a href="/tours" className="text-white text-decoration-none">Tours</a>
                            <span>/</span>
                            <span>{tourData.state || tourData.location?.split(',')[0]}</span>
                        </nav>

                        {/* Category badge */}
                        {tourData.category && (
                            <span className="badge rounded-pill mb-2 px-3 py-2 small fw-bold text-uppercase"
                                style={{ backgroundColor: '#FD4621', letterSpacing: '1px' }}>
                                {getTourCategoryLabel(tourData.category)}
                            </span>
                        )}

                        <h1 className="fw-bolder text-white mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                            {tourData.title}
                        </h1>

                        {/* Meta strip */}
                        <div className="d-flex flex-wrap gap-3 text-white">
                            <div className="d-flex align-items-center gap-2">
                                <div className="d-flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= Math.round(tourData.averageRating || 4)} size={14} />)}
                                </div>
                                <span className="fw-bold">{tourData.averageRating?.toFixed(1) || '4.5'}</span>
                                <span className="opacity-75 small">({tourData.reviewCount || 0} reviews)</span>
                            </div>
                            <span className="opacity-50">|</span>
                            <span className="opacity-75 d-flex align-items-center gap-1">
                                <MapPinIcon />
                                {tourData.location || `${tourData.state}, ${tourData.country || 'India'}`}
                            </span>
                            {tourData.duration && (
                                <>
                                    <span className="opacity-50">|</span>
                                    <span className="opacity-75 d-flex align-items-center gap-1">
                                        <ClockIcon />
                                        {tourData.duration}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Quick Info Bar ──────────────────────── */}
            <div className="container container-1440 px-3 px-md-4" style={{ position: 'relative', zIndex: 10, marginTop: '-20px' }}>
                <div className="bg-white rounded-4 shadow-lg px-4 px-lg-5 py-4 d-flex flex-wrap align-items-center gap-4 gap-md-5">
                    {[
                        { icon: <ClockIcon />, label: 'Duration', value: tourData.duration || 'N/A' },
                        { icon: <UsersIcon />, label: 'Group Size', value: `Up to ${maxGroupSizeDisplay} people` },
                        { icon: <MapPinIcon />, label: 'Location', value: tourData.state || tourData.location || 'India' },
                    ].map((info, i) => (
                        <div key={i} className="d-flex align-items-center gap-3">
                            <div>{info.icon}</div>
                            <div>
                                <div className="text-muted" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{info.label}</div>
                                <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>{info.value}</div>
                            </div>
                        </div>
                    ))}

                    {tourData.brochureUrl && (
                        <div className="d-flex align-items-center gap-3 ms-md-4">
                            <div className="bg-danger-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-muted" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Brochure</div>
                                <a href={tourData.brochureUrl} target="_blank" rel="noopener noreferrer" className="fw-bold text-danger text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: '14px' }}>
                                    Download PDF
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M7 17l10-10M7 7h10v10" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="ms-auto text-end">
                        <div className="text-muted small">Starting from</div>
                        <div className="fw-bolder" style={{ color: '#FD4621', fontSize: '1.6rem' }}>
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(tourData.basePrice || 0)}
                            <span className="text-muted fw-normal" style={{ fontSize: '0.85rem' }}>/person</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Main Content Grid ───────────────────── */}
            <div className="container container-1440 px-3 px-md-4 py-5">
                <div className="row g-5">

                    {/* ── Left Column ──────────────────────────── */}
                    <div className="col-lg-8 order-2 order-lg-1">

                        {/* Sticky Nav Tabs */}
                        <div className="sticky-top bg-white border-bottom shadow-sm mb-4 rounded-top-3 overflow-hidden" style={{ top: '72px', zIndex: 20 }}>
                            <div className="d-flex gap-2 px-3 py-1 overflow-auto no-scrollbar" style={{ whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                                {(['OVERVIEW', 'ITINERARY', 'FAQ', 'REVIEWS'] as InfoTab[]).map(tab => (
                                    <button key={tab} onClick={() => scrollToSection(tab)}
                                        className="btn border-0 py-3 px-3 fw-bold small text-uppercase"
                                        style={{
                                            color: activeInfoTab === tab ? '#FD4621' : '#888',
                                            borderBottom: activeInfoTab === tab ? '3px solid #FD4621' : '3px solid transparent',
                                            borderRadius: 0,
                                            background: 'transparent',
                                            letterSpacing: '0.5px',
                                            transition: 'color 0.2s',
                                        }}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── OVERVIEW ─────────────────────── */}
                        <section id="overview" className="mb-4">
                            {/* Description */}
                            <div className="bg-white rounded-4 shadow-sm p-4 p-md-4 mb-3">
                                <h3 className="fw-bold mb-2" style={{ color: '#111', fontSize: '1.3rem' }}>About This Tour</h3>
                                <p className="text-muted lh-lg mb-0" style={{ fontSize: '15px' }}>{tourData.description || 'No description available.'}</p>
                            </div>

                            {/* Highlights */}
                            {tourData.highlights && tourData.highlights.length > 0 && (
                                <div className="bg-white rounded-4 shadow-sm p-4 p-md-4 mb-3 border" style={{ borderColor: '#f0f0f0' }}>
                                    <h4 className="fw-bold mb-3" style={{ color: '#111', fontSize: '1.25rem' }}>Tour Highlights</h4>
                                    <div className="row g-3">
                                        {tourData.highlights.map((h, i) => (
                                            <div key={i} className="col-12 col-md-6">
                                                <div className="d-flex align-items-center gap-3 p-3 rounded-4 h-100 transition-all hover-shadow" style={{ backgroundColor: '#fffaf9', border: '1px solid #ffebea', transition: 'all 0.3s' }}>
                                                    <div className="flex-shrink-0">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                                            style={{ width: '28px', height: '28px', backgroundColor: '#fff' }}>
                                                            <CheckIcon size={16} />
                                                        </div>
                                                    </div>
                                                    <span className="text-dark fw-medium lh-base" style={{ fontSize: '15px' }}>{h}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Inclusions & Exclusions */}
                            {((tourData.inclusions?.length || 0) > 0 || (tourData.exclusions?.length || 0) > 0) && (
                                <div className="bg-white rounded-4 shadow-sm p-4 p-md-4 mb-3">
                                    <div className="row g-4">
                                        {tourData.inclusions && tourData.inclusions.length > 0 && (
                                            <div className="col-md-6">
                                                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                                    <span className="rounded-pill px-3 py-2 small" style={{ backgroundColor: '#e6f9ed', color: '#34c759', fontSize: '11px', fontWeight: 700 }}>INCLUDED</span>
                                                </h5>
                                                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                                                    {tourData.inclusions.map((inc, i) => (
                                                        <li key={i} className="d-flex align-items-center gap-2">
                                                            <span className="flex-shrink-0"><CheckIcon /></span>
                                                            <span style={{ fontSize: '14px' }}>{inc}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {tourData.exclusions && tourData.exclusions.length > 0 && (
                                            <div className="col-md-6">
                                                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                                    <span className="rounded-pill px-3 py-2 small" style={{ backgroundColor: '#fff0ef', color: '#FF3B30', fontSize: '11px', fontWeight: 700 }}>EXCLUDED</span>
                                                </h5>
                                                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                                                    {tourData.exclusions.map((exc, i) => (
                                                        <li key={i} className="d-flex align-items-center gap-2">
                                                            <span className="flex-shrink-0"><XIcon /></span>
                                                            <span style={{ fontSize: '14px', color: '#555' }}>{exc}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ── ITINERARY ─────────────────────── */}
                        <section id="itinerary" className="mb-4">
                            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 border" style={{ borderColor: '#f0f0f0' }}>
                                <h3 className="fw-bold mb-5" style={{ color: '#111', fontSize: '1.5rem' }}>Day-by-Day Itinerary</h3>
                                {tourData.itinerary && tourData.itinerary.length > 0 ? (
                                    <div className="d-flex flex-column position-relative" style={{ gap: '2rem' }}>
                                        {/* Background vertical line for timeline */}
                                        <div className="d-none d-sm-block position-absolute h-100" style={{ width: '2px', backgroundColor: '#f0f0f0', left: '26px', top: '10px', bottom: '10px', zIndex: 0 }} />

                                        {tourData.itinerary.map((day, i) => (
                                            <div key={i} className="d-flex flex-column flex-sm-row gap-3 gap-sm-4 position-relative" style={{ zIndex: 1 }}>
                                                {/* Timeline node */}
                                                <div className="d-flex flex-column align-items-start align-items-sm-center flex-shrink-0" style={{ width: 'auto', minWidth: '52px' }}>
                                                    <div className="rounded-circle fw-bold text-white d-flex align-items-center justify-content-center shadow-sm"
                                                        style={{ width: '52px', height: '52px', backgroundColor: '#FD4621', fontSize: '18px', border: '5px solid #fff' }}>
                                                        {i + 1}
                                                    </div>
                                                </div>
                                                {/* Content */}
                                                <div className="flex-grow-1 pt-1 pb-2">
                                                    <div className="mb-1 fw-bold text-uppercase" style={{ letterSpacing: '1px', fontSize: '11px', color: '#FD4621', opacity: 0.8 }}>Day {i + 1}</div>
                                                    <h5 className="fw-bold mb-4 text-dark" style={{ fontSize: '1.25rem' }}>{day.title}</h5>
                                                    <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                                                        {day.points?.map((point, pi) => (
                                                            <li key={pi} className="mb-1">
                                                                <div className="d-flex gap-3 align-items-start">
                                                                    <div className="flex-shrink-0 mt-1 d-flex align-items-center justify-content-center rounded-circle border"
                                                                        style={{ width: '32px', height: '32px', backgroundColor: '#fff', color: '#FD4621', borderColor: '#f0f0f0' }}>
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                                            <circle cx="12" cy="12" r="10"></circle>
                                                                            <path d="M12 8v4l3 3"></path>
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-grow-1">
                                                                        <div className="fw-bold text-dark mb-2" style={{ fontSize: '15px' }}>{point.text}</div>
                                                                        {point.description && (
                                                                            <div className="text-muted mt-2" style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                                                                {point.description}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted">Itinerary details coming soon.</p>
                                )}
                            </div>
                        </section>

                        {/* ── FAQ ─────────────────────────────── */}
                        <section id="faq" className="mb-4">
                            <div className="bg-white rounded-4 shadow-sm p-4 p-md-4">
                                <h3 className="fw-bold mb-3" style={{ color: '#111', fontSize: '1.3rem' }}>Frequently Asked Questions</h3>
                                {tourData.faqs && tourData.faqs.length > 0 ? (
                                    <div className="d-flex flex-column gap-2">
                                        {tourData.faqs.map((faq, i) => (
                                            <div key={i} className="border rounded-3 overflow-hidden">
                                                <button
                                                    className="w-100 text-start d-flex justify-content-between align-items-center p-4 bg-transparent border-0 fw-bold"
                                                    style={{ color: '#111', fontSize: '15px' }}
                                                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                                                    <span>{faq.question}</span>
                                                    <span style={{ transform: expandedFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                                                        <ChevronDown />
                                                    </span>
                                                </button>
                                                {expandedFaq === i && (
                                                    <div className="px-4 pb-4 text-muted lh-lg" style={{ fontSize: '14px', backgroundColor: '#fafafa' }}>
                                                        {faq.answer}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted">No FAQs available for this tour.</p>
                                )}
                            </div>
                        </section>

                        {/* ── REVIEWS ─────────────────────────── */}
                        <section id="reviews" className="mb-4">
                            <div className="bg-white rounded-4 shadow-sm p-4 p-md-4">
                                <h3 className="fw-bold mb-4" style={{ color: '#111', fontSize: '1.3rem' }}>Guest Reviews</h3>
                                <div className="d-flex align-items-center gap-5 mb-4 pb-4 border-bottom">
                                    <div className="text-center">
                                        <div className="fw-bolder mb-1" style={{ fontSize: '4rem', lineHeight: 1, color: '#FD4621' }}>
                                            {tourData.averageRating?.toFixed(1) || '4.5'}
                                        </div>
                                        <div className="d-flex justify-content-center gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= Math.round(tourData.averageRating || 4)} size={16} />)}
                                        </div>
                                        <div className="text-muted small">Based on {tourData.reviewCount || 0} reviews</div>
                                    </div>
                                    <div className="flex-grow-1">
                                        {[5, 4, 3, 2, 1].map(star => (
                                            <div key={star} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: '13px' }}>
                                                <span className="text-muted" style={{ width: '12px' }}>{star}</span>
                                                <StarIcon size={12} />
                                                <div className="flex-grow-1 rounded-pill overflow-hidden" style={{ height: '6px', backgroundColor: '#f0f0f0' }}>
                                                    <div className="rounded-pill" style={{
                                                        width: star === 5 ? '65%' : star === 4 ? '25%' : '5%',
                                                        height: '100%', backgroundColor: '#FD4621'
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-muted text-center py-3">Reviews from verified travelers will appear here.</p>
                            </div>
                        </section>
                    </div>

                    {/* ── Right Column: Booking Sidebar ──────── */}
                    <div className="col-lg-4 order-1 order-lg-2">
                        <div className="sticky-top" style={{ top: '90px', zIndex: 15 }}>
                            <div className="bg-white rounded-4 shadow-lg overflow-hidden">

                                {/* Price header */}
                                <div className="px-4 pt-4 pb-4 border-bottom" style={{ backgroundColor: '#fffaf9' }}>
                                    <div className="text-muted small fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px', color: '#FD4621' }}>Booking Details</div>
                                    <div className="d-flex align-items-baseline gap-1 flex-wrap">
                                        <span className="fw-bolder" style={{ fontSize: '2.4rem', color: '#FD4621', lineHeight: 1 }}>
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(perPersonPrice)}
                                        </span>
                                        <span className="text-muted fw-bold" style={{ fontSize: '15px' }}>/person</span>
                                        {pickupAdj !== 0 && (
                                            <span className={`badge rounded-pill ms-1 mt-1 px-2 py-1 small fw-bold shadow-sm ${pickupAdj > 0 ? 'bg-warning text-dark' : 'bg-success text-white'}`}>
                                                {pickupAdj > 0 ? '+' : ''}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pickupAdj)} pickup
                                            </span>
                                        )}
                                    </div>
                                    {selectedDate?.priceOverride && (
                                        <div className="d-flex align-items-center gap-2 mt-2">
                                            <span className="text-muted text-decoration-line-through small fw-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(tourData.basePrice || 0)}</span>
                                            <span className="badge rounded-pill text-white small shadow-sm px-2 py-1" style={{ backgroundColor: '#34c759' }}>
                                                SPECIAL DATE PRICE
                                            </span>
                                        </div>
                                    )}
                                    <div className="d-flex align-items-center gap-2 mt-3 p-2 rounded-3" style={{ backgroundColor: '#f0fcf4' }}>
                                        <ShieldIcon />
                                        <span className="text-success" style={{ fontSize: '13px', fontWeight: 700 }}>Secure Booking • No Hidden Fees</span>
                                    </div>
                                </div>

                                {/* Booking Form */}
                                <div className="p-4">
                                    {/* Date Selection */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-dark mb-1">📅 Select Travel Date</label>
                                        <select
                                            className="form-select border-2 py-2"
                                            style={{ borderColor: selectedDateId ? '#FD4621' : '#dee2e6', borderRadius: '10px', fontSize: '14px' }}
                                            value={selectedDateId}
                                            onChange={e => { setSelectedDateId(e.target.value); setSelectedPickupIndex(-1); }}>
                                            <option value="">Choose a date...</option>
                                            {availableDates.map(d => {
                                                const avail = d.totalSeats - d.bookedSeats;
                                                const isFull = avail <= 0 || d.status === TourDateStatus.FULL;
                                                const priceText = d.priceOverride ? ` (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(d.priceOverride)})` : '';

                                                let statusText = '';
                                                if (isFull) statusText = ' 🔴 [FULL]';
                                                else if (avail <= 5) statusText = ` ⚠️ [Only ${avail} left!]`;
                                                else statusText = ` ✅ [${avail} seats left]`;

                                                return (
                                                    <option key={d._id as string} value={d._id as string} disabled={isFull}>
                                                        {DateUtils.formatToIST(d.startDate, 'DD MMM YYYY')}
                                                        {' → '}
                                                        {DateUtils.formatToIST(d.endDate, 'DD MMM')}
                                                        {priceText}
                                                        {statusText}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {availableDates.length === 0 && (
                                            <div className="text-muted small mt-1 d-flex align-items-center gap-1">
                                                <InfoIcon /> No upcoming dates available
                                            </div>
                                        )}
                                    </div>

                                    {/* Departure Selection */}
                                    {selectedDateId && tourData.departureOptions && tourData.departureOptions.length > 0 && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold small text-dark mb-1">🚌 Departure From</label>
                                            <select
                                                className="form-select border-2 py-2"
                                                style={{ borderColor: selectedPickupIndex >= 0 ? '#FD4621' : '#dee2e6', borderRadius: '10px', fontSize: '14px' }}
                                                value={selectedPickupIndex}
                                                onChange={e => setSelectedPickupIndex(parseInt(e.target.value))}>
                                                <option value="-1">Choose departure point...</option>
                                                {tourData.departureOptions.map((opt, idx) => {
                                                    const isLandPackage = opt.type === 'LAND_PACKAGE';
                                                    const routeText = isLandPackage
                                                        ? `${opt.fromCity} (Land Package)`
                                                        : `${opt.fromCity} \u2192 ${opt.toCity || 'Destination'}${opt.type ? ` (${getPickupTypeLabel(opt.type)})` : ''}`;
                                                    const priceText = opt.priceAdjustment
                                                        ? ` ${opt.priceAdjustment > 0 ? '+' : ''}${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(opt.priceAdjustment)}`
                                                        : '';
                                                    return (
                                                        <option key={idx} value={idx}>
                                                            {routeText}{priceText}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            {selectedPickupIndex >= 0 && tourData.departureOptions[selectedPickupIndex] && (
                                                <div className="mt-2 px-3 py-2 rounded-3" style={{ backgroundColor: '#fff8f6', fontSize: '12px' }}>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Duration:</span>
                                                        <span className="fw-bold">{tourData.departureOptions[selectedPickupIndex].totalDays}D / {tourData.departureOptions[selectedPickupIndex].totalNights}N</span>
                                                    </div>
                                                    {tourData.departureOptions[selectedPickupIndex].departureTimeAndPlace && (
                                                        <div className="d-flex justify-content-between mt-1">
                                                            <span className="text-muted">Departure:</span>
                                                            <span className="fw-bold">{tourData.departureOptions[selectedPickupIndex].departureTimeAndPlace}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Guest Count */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold small text-dark mb-1">
                                            👥 Number of Guests
                                            {selectedDate && <span className="text-muted fw-normal ms-1">({availableSeats} seats left)</span>}
                                        </label>
                                        <div className="d-flex align-items-center gap-3">
                                            <button className="btn rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                                style={{ width: '40px', height: '40px', border: '2px solid #dee2e6', fontSize: '20px', color: '#FD4621' }}
                                                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                                                disabled={guestCount <= 1}>−</button>
                                            <span className="fw-bold fs-4" style={{ minWidth: '32px', textAlign: 'center' }}>{guestCount}</span>
                                            <button className="btn rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                                style={{ width: '40px', height: '40px', border: '2px solid #dee2e6', fontSize: '20px', color: '#FD4621' }}
                                                onClick={() => setGuestCount(Math.min(maxGuests, guestCount + 1))}
                                                disabled={guestCount >= maxGuests}>+</button>
                                            <span className="text-muted small ms-1">person{guestCount > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    {/* Live Price Breakdown */}
                                    {selectedDateId && selectedPickupIndex >= 0 && (
                                        <div className="rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                                            <div className="fw-bold small mb-2 text-dark">Price Breakdown</div>
                                            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                                                <span className="text-muted">Base Price</span>
                                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(basePerPerson)}</span>
                                            </div>
                                            {pickupAdj !== 0 && (
                                                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                                                    <span className="text-muted">Adjustment ({getPickupTypeLabel(tourData.departureOptions?.[selectedPickupIndex]?.type || '')})</span>
                                                    <span className={pickupAdj < 0 ? 'text-success' : ''}>
                                                        {pickupAdj > 0 ? '+' : ''}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pickupAdj)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                                                <span className="text-muted">× {guestCount} guest{guestCount > 1 ? 's' : ''}</span>
                                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(subtotal)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
                                                <span className="text-muted">GST ({gstRate}%)</span>
                                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(taxAmount)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between pt-2 border-top">
                                                <span className="fw-bold">Total</span>
                                                <span className="fw-bolder" style={{ color: '#FD4621', fontSize: '16px' }}>
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalAmount)}
                                                </span>
                                            </div>
                                            <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '11px' }}>
                                                * Final price confirmed on next step
                                            </p>
                                        </div>
                                    )}

                                    {/* Proceed Button */}
                                    <button
                                        onClick={handleProceed}
                                        disabled={previewMutation.isPending || !selectedDateId || selectedPickupIndex < 0}
                                        className="btn w-100 fw-bold py-3 text-white rounded-pill mb-3"
                                        style={{
                                            backgroundColor: selectedDateId && selectedPickupIndex >= 0 ? '#FD4621' : '#dee2e6',
                                            fontSize: '16px',
                                            cursor: selectedDateId && selectedPickupIndex >= 0 ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s',
                                        }}>
                                        {previewMutation.isPending ? (
                                            <><span className="spinner-border spinner-border-sm me-2" />Checking Availability...</>
                                        ) : !selectedDateId ? 'Select a Date First' :
                                            selectedPickupIndex < 0 ? 'Select Departure Point' :
                                                'Proceed Booking →'}
                                    </button>

                                    {/* Trust badges */}
                                    <div className="d-flex flex-column gap-1">
                                        {['No credit card required', 'Free cancellation up to 24 hrs', 'Secure payment via UPI'].map((badge, i) => (
                                            <div key={i} className="d-flex align-items-center gap-2" style={{ fontSize: '12px', color: '#555' }}>
                                                <span style={{ color: '#34c759' }}>✓</span>
                                                <span>{badge}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Need help section */}
                                <div className="border-top px-4 py-3 text-center" style={{ backgroundColor: '#fffaf9' }}>
                                    <div className="fw-bold small mb-1">Need help planning?</div>
                                    <a href={`tel:${settings?.businessDetails?.phoneNumber || '+919909899025'}`} className="text-decoration-none d-block fw-bold" style={{ color: '#FD4621' }}>
                                        📞 {settings?.businessDetails?.phoneNumber || '+919909899025'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .sticky-top { position: sticky; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .hover-shadow:hover { box-shadow: 0 10px 25px rgba(0,0,0,0.08); transform: translateY(-3px); }
                .transition-all { transition: all 0.3s ease; }
            `}</style>
        </main>
    );
}
