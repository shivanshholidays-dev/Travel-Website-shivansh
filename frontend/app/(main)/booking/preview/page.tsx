'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getImgUrl } from '@lib/utils/image';
import { bookingsApi, CreateBookingDto } from '@lib/api/bookings.api';
import { useBookingStore } from '@lib/store/booking.store';
import useAuthStore from '@store/useAuthStore';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usersApi } from '@lib/api/users.api';
import { DateUtils } from '@lib/utils/date-utils';
import { Gender } from '@lib/constants/enums';
import { useSettingsStore } from '@/src/store/useSettingsStore';

// ─── Icons ──────────────────────────────────────────────────────────────────
const CheckIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round">
        <path d="M5 13.5L8.5 17L19 7" />
    </svg>
);
const TagIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
);
const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const LockIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);
const CreditCard = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
);

// ─── Helper ──────────────────────────────────────────────────────────────────
const stepClass = (current: number, step: number) =>
    `rounded-circle d-flex align-items-center justify-content-center fw-bold`
    + (current >= step ? '' : ' text-muted');

export default function BookingPreviewPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const {
        selection, travelers, contactEmail, contactPhone, additionalRequests,
        couponCode, pricing, setTravelers, setContactDetails, setAdditionalRequests,
        setCouponCode, setPricing: setServerPricing, paymentType, setPaymentType
    } = useBookingStore();
    const [existingBookingId, setExistingBookingId] = useState<string | null>(useBookingStore.getState().bookingId);

    // Hydration guard
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const { settings, fetchSettings } = useSettingsStore();
    useEffect(() => { fetchSettings(); }, [fetchSettings]);
    const liveGstRate = settings?.businessDetails?.gstRate ?? 5;

    const [couponInput, setCouponInput] = useState(couponCode || '');
    const [couponError, setCouponError] = useState('');
    const [submiting, setSubmiting] = useState(false);

    // Policy Checkboxes State
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [readInstructions, setReadInstructions] = useState(false);
    const allPoliciesAccepted = acceptedTerms && acceptedPrivacy && readInstructions;

    const didAutoFill = useRef(false);

    const { data: profileResp } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: () => usersApi.getProfile(),
        enabled: !!isAuthenticated,
    });
    const profile = (profileResp as any)?.data || profileResp;

    useEffect(() => {
        if (didAutoFill.current) return;
        const email = profile?.email || user?.email || '';
        const phone = profile?.phone || user?.phone || '';
        if (email || phone) {
            setContactDetails(email, phone);
            didAutoFill.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.email, user?.email]);

    const hasSelection = !!selection;
    const hasPricing = !!pricing;
    useEffect(() => {
        if (!mounted) return;
        if (!hasSelection || !hasPricing) {
            router.replace('/tours');
        } else if (!isAuthenticated) {
            localStorage.setItem('booking_redirect_intent', '/booking/preview');
            router.replace('/login?redirect=/booking/preview');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted, hasSelection, hasPricing, isAuthenticated]);

    if (!mounted || !selection || !pricing) return null;

    const currentPricing = pricing;
    const totalAmount = currentPricing.totalAmount;

    // ─── Traveler Management ─────────────────────────────────────────────────
    const updateTraveler = (i: number, field: string, value: string | number) => {
        const updated = travelers.map((t, idx) => idx === i ? { ...t, [field]: value } : t);
        setTravelers(updated);
    };

    const autoFillFromProfile = (i: number) => {
        if (!profile && !user) return;
        const name = profile?.name || user?.name || '';
        const phone = profile?.phone || user?.phone || '';
        updateTraveler(i, 'fullName', name);
        updateTraveler(i, 'phone', phone);
    };

    // ─── Coupon Logic ─────────────────────────────────────────────────────────
    const applyCoupon = async () => {
        setCouponError('');
        if (!couponInput.trim()) return;
        try {
            const result = await bookingsApi.preview({
                tourDateId: selection.tourDateId,
                pickupOptionIndex: selection.pickupOptionIndex,
                travelerCount: selection.travelerCount,
                couponCode: couponInput.trim().toUpperCase(),
            });
            const p = (result as any)?.data || result;
            setServerPricing({
                baseAmount: p.baseAmount,
                perPersonPrice: p.perPersonPrice,
                subtotal: p.subtotal,
                couponDiscount: p.couponDiscount,
                taxAmount: p.taxAmount,
                taxRate: p.taxRate ?? pricing?.taxRate ?? 5,
                totalAmount: p.totalAmount,
                appliedCoupon: couponInput.trim().toUpperCase(),
                pickupOption: p.pickupOption,
                pricingSummary: p.pricingSummary,
            });
            setCouponCode(couponInput.trim().toUpperCase());
        } catch (err: any) {
            setCouponError(err?.response?.data?.message || 'Invalid or expired coupon code.');
        }
    };

    const removeCoupon = async () => {
        setCouponInput('');
        setCouponError('');
        setCouponCode('');
        try {
            const result = await bookingsApi.preview({
                tourDateId: selection.tourDateId,
                pickupOptionIndex: selection.pickupOptionIndex,
                travelerCount: selection.travelerCount,
            });
            const p = (result as any)?.data || result;
            setServerPricing({ ...pricing!, couponDiscount: 0, taxAmount: p.taxAmount, taxRate: p.taxRate ?? pricing?.taxRate ?? 5, totalAmount: p.totalAmount, appliedCoupon: null });
        } catch { setServerPricing(pricing!); }
    };

    const handlePaymentTypeChange = (type: 'FULL' | 'PARTIAL', percentage: number) => {
        const amount = percentage === 100 ? totalAmount : Math.ceil((totalAmount * percentage) / 100);
        setPaymentType(type, percentage as any, amount);
    };

    // ─── Validation ──────────────────────────────────────────────────────────
    const validateForm = () => {
        for (let i = 0; i < travelers.length; i++) {
            const t = travelers[i];
            if (!t.fullName?.trim()) return `Full name is required for Traveler ${i + 1}`;
            if (!t.age || t.age < 1) return `Valid age is required for Traveler ${i + 1}`;
            if (!t.gender) return `Gender is required for Traveler ${i + 1}`;
        }
        if (!contactEmail?.trim()) return 'Contact email is required';
        if (!contactPhone?.trim()) return 'Contact phone is required';
        return null;
    };

    // ─── Proceed to Payment ──────────────────────────────────────────────────
    const handleProceed = async () => {
        const error = validateForm();
        if (error) { alert(error); return; }

        if (!allPoliciesAccepted) {
            alert("Please accept all policies and instructions to proceed.");
            return;
        }

        if (existingBookingId) {
            router.push('/booking/payment');
            return;
        }

        setSubmiting(true);
        try {
            const dto: CreateBookingDto = {
                tourDateId: selection.tourDateId,
                pickupOptionIndex: selection.pickupOptionIndex,
                travelers: travelers.map(t => ({
                    fullName: t.fullName,
                    age: Number(t.age),
                    gender: t.gender,
                    phone: t.phone || '',
                    idNumber: t.idNumber || '',
                })),
                couponCode: currentPricing.appliedCoupon || undefined,
                additionalRequests: additionalRequests || undefined,
                paymentType: paymentType,
                partialAmount: (paymentType === 'PARTIAL') ? useBookingStore.getState().partialAmount : undefined
            };
            const result = await bookingsApi.create(dto);
            const booking = (result as any)?.data || result;

            if (!booking?._id) {
                throw new Error('Server returned invalid booking data');
            }

            useBookingStore.getState().setBookingResult(booking._id, booking.bookingNumber);
            router.push('/booking/payment');
        } catch (err: any) {
            console.error('[BookingPreview] Creation failed:', err);
            alert(err?.response?.data?.message || 'Failed to create booking. Please try again.');
        } finally {
            setSubmiting(false);
        }
    };

    // ────────────────────────────────────────────────────────────────────────────
    return (
        <main style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>

            {/* ─── STEP 1: Stepper Header ───────────────────────────────────────────── */}
            <div style={{ backgroundColor: '#1a1a2e', padding: '20px 0' }}>
                <div className="container container-1440 px-3 px-md-4">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        {[
                            { step: 1, label: 'Select Tour' },
                            { step: 2, label: 'Contact Details' },
                            { step: 3, label: 'Payment' },
                            { step: 4, label: 'Complete' },
                        ].map(({ step, label }, i, arr) => (
                            <div key={step} className="d-flex align-items-center gap-2">
                                <div className={stepClass(2, step)} style={{
                                    width: '32px', height: '32px', fontSize: '14px',
                                    backgroundColor: 2 >= step ? '#FD4621' : 'rgba(255,255,255,0.1)',
                                    color: 2 >= step ? 'white' : 'rgba(255,255,255,0.4)',
                                }}>
                                    {2 > step ? <CheckIcon size={14} /> : step}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 2 >= step ? 'white' : 'rgba(255,255,255,0.4)' }}>
                                    {label}
                                </span>
                                {i < arr.length - 1 && (
                                    <div className="mx-2" style={{ height: '1px', width: '32px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container container-1440 px-3 px-md-4 py-5">
                <div className="row g-4">

                    {/* ══════════════════════════════════════════════════════
                        LEFT COLUMN
                        Order: 1. Traveller Details
                               2. Contact Details
                               3. Coupon Code
                               4. Proceed Button (mobile only)
                    ══════════════════════════════════════════════════════ */}
                    <div className="col-lg-8">

                        {/* ─── SECTION 1: Traveller Details ─────────────────── */}
                        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4">
                            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <span className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                                    style={{ width: '32px', height: '32px', backgroundColor: '#FD4621', fontSize: '14px', flexShrink: 0 }}>
                                    <UserIcon />
                                </span>
                                Traveller Details
                            </h4>

                            <div className="d-flex flex-column gap-4">
                                {travelers.map((traveler, i) => (
                                    <div key={i} className="p-4 rounded-3" style={{ border: '1px solid #e9ecef', backgroundColor: '#fafafa' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold mb-0 text-dark">
                                                Traveller {i + 1}
                                                {i === 0 && (
                                                    <span className="badge rounded-pill ms-2 small"
                                                        style={{ backgroundColor: '#FD4621', fontSize: '10px' }}>
                                                        Primary
                                                    </span>
                                                )}
                                            </h6>
                                            <button
                                                onClick={() => autoFillFromProfile(i)}
                                                className="btn btn-sm text-decoration-none"
                                                style={{ color: '#FD4621', fontSize: '12px', fontWeight: 600 }}>
                                                Auto-fill from profile
                                            </button>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-muted">Full Name *</label>
                                                <input type="text" className="form-control" placeholder="As per ID proof"
                                                    value={traveler.fullName}
                                                    onChange={e => updateTraveler(i, 'fullName', e.target.value)} />
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="form-label small fw-bold text-muted">Age *</label>
                                                <input type="number" className="form-control" placeholder="Age" min={1} max={120}
                                                    value={traveler.age || ''}
                                                    onChange={e => updateTraveler(i, 'age', parseInt(e.target.value) || 0)} />
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <label className="form-label small fw-bold text-muted">Gender *</label>
                                                <select className="form-select"
                                                    value={traveler.gender}
                                                    onChange={e => updateTraveler(i, 'gender', e.target.value)}>
                                                    <option value={Gender.MALE}>Male</option>
                                                    <option value={Gender.FEMALE}>Female</option>
                                                    <option value={Gender.OTHER}>Other</option>
                                                </select>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-muted">Phone Number</label>
                                                <input type="tel" className="form-control" placeholder="+91 XXXXXXXXXX"
                                                    value={traveler.phone || ''}
                                                    onChange={e => updateTraveler(i, 'phone', e.target.value)} />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-muted">Aadhar / Passport No.</label>
                                                <input type="text" className="form-control" placeholder="ID Number (optional)"
                                                    value={traveler.idNumber || ''}
                                                    onChange={e => updateTraveler(i, 'idNumber', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ─── SECTION 2: Contact Details ───────────────────── */}
                        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4">
                            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <span className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                                    style={{ width: '32px', height: '32px', backgroundColor: '#FD4621', fontSize: '14px', flexShrink: 0 }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </span>
                                Contact Details
                            </h4>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Email Address *</label>
                                    <input type="email" className="form-control" placeholder="your@email.com"
                                        value={contactEmail}
                                        onChange={e => setContactDetails(e.target.value, contactPhone)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Phone Number *</label>
                                    <input type="tel" className="form-control" placeholder="+91 XXXXXXXXXX"
                                        value={contactPhone}
                                        onChange={e => setContactDetails(contactEmail, e.target.value)} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">Additional Requests</label>
                                    <textarea className="form-control" rows={3}
                                        placeholder="Any dietary requirements, special assistance needs, etc."
                                        value={additionalRequests}
                                        onChange={e => setAdditionalRequests(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* ─── SECTION 3: Coupon Code ───────────────────────── */}
                        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4">
                            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <TagIcon /> Coupon Code
                            </h4>
                            {currentPricing.appliedCoupon ? (
                                <div className="d-flex align-items-center gap-3 p-3 rounded-3"
                                    style={{ backgroundColor: '#e6f9ed', border: '1px solid #34c759' }}>
                                    <CheckIcon />
                                    <div>
                                        <div className="fw-bold" style={{ color: '#34c759' }}>
                                            Coupon "{currentPricing.appliedCoupon}" applied!
                                        </div>
                                        <div className="small text-muted">
                                            You saved {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentPricing.couponDiscount)}
                                        </div>
                                    </div>
                                    <button onClick={removeCoupon} className="btn btn-sm ms-auto text-danger">Remove</button>
                                </div>
                            ) : (
                                <div>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="text"
                                            className="form-control text-uppercase"
                                            placeholder="Enter coupon code"
                                            value={couponInput}
                                            onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }} />
                                        <button
                                            onClick={applyCoupon}
                                            className="btn fw-bold text-white px-4 flex-shrink-0"
                                            style={{ backgroundColor: '#FD4621', whiteSpace: 'nowrap' }}>
                                            Apply
                                        </button>
                                    </div>
                                    {couponError && <div className="text-danger small mt-2">{couponError}</div>}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* ══════════════════════════════════════════════════════
                        RIGHT COLUMN (Sticky Sidebar)
                        Order: 1. Tour Card (image + trip details)
                               2. Price Breakdown
                               3. Payment Options
                               4. Agreement / Policy Checkboxes
                               5. Proceed to Payment Button (Desktop)
                               6. SSL Secure text
                    ══════════════════════════════════════════════════════ */}
                    <div className="col-lg-4">
                        <div className="sticky-top" style={{ top: '90px' }}>

                            {/* ─── SIDEBAR 1: Tour Card ─────────────────────── */}
                            <div className="bg-white rounded-4 shadow-sm overflow-hidden mb-3">
                                {selection.tourThumbnail && (
                                    <div style={{ height: '140px', overflow: 'hidden' }}>
                                        <img
                                            src={selection.tourThumbnail.startsWith('http') ? selection.tourThumbnail : getImgUrl(selection.tourThumbnail)}
                                            alt={selection.tourTitle}
                                            className="w-100"
                                            style={{ objectFit: 'cover', height: '100%' }} />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h6 className="fw-bold text-dark mb-3">{selection.tourTitle}</h6>
                                    <div className="d-flex flex-column gap-2" style={{ fontSize: '13px' }}>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">Travel Date</span>
                                            <span className="fw-bold text-dark">
                                                {selection.selectedDate
                                                    ? DateUtils.formatToIST(selection.selectedDate.startDate, 'DD MMM YYYY')
                                                    : '—'}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted">Departure</span>
                                            <div className="text-end d-flex flex-column align-items-end" style={{ maxWidth: '65%' }}>
                                                <span className="fw-bold text-dark">
                                                    {selection.selectedPickup?.type === 'LAND_PACKAGE'
                                                        ? `${selection.selectedPickup?.fromCity} (Land Package)`
                                                        : `${selection.selectedPickup?.fromCity} \u2192 ${selection.selectedPickup?.toCity || '(Optional)'}`}
                                                </span>
                                                <span className="badge mt-1" style={{ backgroundColor: '#e9ecef', color: '#495057', fontSize: '10px', fontWeight: 600 }}>
                                                    {selection.selectedPickup?.totalDays || 1} Days / {selection.selectedPickup?.totalNights || 0} Nights
                                                </span>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">Guests</span>
                                            <span className="fw-bold text-dark">
                                                {selection.travelerCount} Person{selection.travelerCount > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── SIDEBAR 2: Price Breakdown ───────────────── */}
                            <div className="bg-white rounded-4 shadow-sm p-4 mb-3">
                                <h6 className="fw-bold mb-3 text-dark">Price Breakdown</h6>
                                <div className="d-flex flex-column gap-2" style={{ fontSize: '14px' }}>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Base Price</span>
                                        <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentPricing.baseAmount)}/person</span>
                                    </div>
                                    {(selection.selectedPickup?.priceAdjustment ?? 0) !== 0 && (
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">Departure Adjustment</span>
                                            <span className={(selection.selectedPickup?.priceAdjustment ?? 0) < 0 ? 'text-success' : ''}>
                                                {(selection.selectedPickup?.priceAdjustment ?? 0) > 0 ? '+' : ''}
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(selection.selectedPickup?.priceAdjustment ?? 0)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Per Person Price</span>
                                        <span className="fw-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentPricing.perPersonPrice)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">× {selection.travelerCount} Guests</span>
                                        <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentPricing.subtotal)}</span>
                                    </div>
                                    {currentPricing.couponDiscount > 0 && (
                                        <div className="d-flex justify-content-between text-success">
                                            <span>Coupon ({currentPricing.appliedCoupon})</span>
                                            <span>-{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentPricing.couponDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">GST ({liveGstRate}%)</span>
                                        <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentPricing.taxAmount)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between pt-3 border-top mt-1">
                                        <span className="fw-bolder fs-5">Total</span>
                                        <span className="fw-bolder fs-5" style={{ color: '#FD4621' }}>
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentPricing.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ─── SIDEBAR 3: Payment Options ───────────────── */}
                            <div className="bg-white rounded-4 shadow-sm p-4 mb-4 border border-light">
                                <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                                    <CreditCard size={18} className="text-primary" /> Payment Options
                                </h6>
                                <div className="text-muted small mb-3">Choose your preferred payment plan:</div>

                                <div className="row g-2">
                                    {[25, 50, 75].map((pct) => {
                                        const amount = Math.ceil((totalAmount * pct) / 100);
                                        const isSelected = paymentType === 'PARTIAL' && useBookingStore.getState().selectedPercentage === pct;
                                        return (
                                            <div key={pct} className="col-4">
                                                <label
                                                    className="h-100 p-2 rounded-3 border d-flex flex-column align-items-center text-center"
                                                    style={{ cursor: 'pointer', border: isSelected ? '1.5px solid #FD4621' : '1px solid #efefef' }}>
                                                    <div className="mb-1">
                                                        <div className="rounded-circle border d-flex align-items-center justify-content-center"
                                                            style={{ width: '14px', height: '14px', flexShrink: 0, backgroundColor: isSelected ? '#FD4621' : 'white', borderColor: isSelected ? '#FD4621' : '#ccc' }}>
                                                            {isSelected && <div className="bg-white rounded-circle" style={{ width: '5px', height: '5px' }} />}
                                                        </div>
                                                    </div>
                                                    <div className="small fw-bold text-dark mb-1" style={{ fontSize: '10px' }}>{pct}% Advance</div>
                                                    <div className="fw-bolder" style={{ color: isSelected ? '#FD4621' : '#2d3436', fontSize: '0.85rem' }}>
                                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)}
                                                    </div>
                                                    <input type="radio" name="paymentType" className="d-none"
                                                        checked={isSelected}
                                                        onChange={() => handlePaymentTypeChange('PARTIAL', pct)} />
                                                </label>
                                            </div>
                                        );
                                    })}

                                    <div className="col-12 mt-2">
                                        <label
                                            className="p-3 rounded-3 border d-flex align-items-center gap-3"
                                            style={{ cursor: 'pointer', border: paymentType === 'FULL' ? '1.5px solid #34c759' : '1px solid #efefef', backgroundColor: paymentType === 'FULL' ? 'rgba(52,199,89,0.08)' : 'white' }}>
                                            <div className="rounded-circle border d-flex align-items-center justify-content-center"
                                                style={{ width: '16px', height: '16px', flexShrink: 0, backgroundColor: paymentType === 'FULL' ? '#34c759' : 'white', borderColor: paymentType === 'FULL' ? '#34c759' : '#ccc' }}>
                                                {paymentType === 'FULL' && <div className="bg-white rounded-circle" style={{ width: '6px', height: '6px' }} />}
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>Pay 100% Full Amount</span>
                                                        <span className="badge rounded-pill bg-success text-white ms-2" style={{ fontSize: '8px', verticalAlign: 'middle' }}>Recommended</span>
                                                    </div>
                                                    <div className="fw-bolder" style={{ fontSize: '1.05rem', color: paymentType === 'FULL' ? '#34c759' : '#2d3436' }}>
                                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalAmount)}
                                                    </div>
                                                </div>
                                            </div>
                                            <input type="radio" name="paymentType" className="d-none"
                                                checked={paymentType === 'FULL'}
                                                onChange={() => handlePaymentTypeChange('FULL', 100)} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* ─── SIDEBAR 4: Agreement / Policy Checkboxes ─── */}
                            <div className="bg-white rounded-4 shadow-sm p-4 mb-4 border border-light">
                                <h6 className="fw-bold mb-3 text-dark">Agreement</h6>
                                <div className="d-flex flex-column gap-2">
                                    <label className="d-flex align-items-start gap-2" style={{ cursor: 'pointer' }}>
                                        <input type="checkbox" className="form-check-input mt-1"
                                            checked={acceptedTerms}
                                            onChange={e => setAcceptedTerms(e.target.checked)} />
                                        <span className="small text-muted">
                                            I accept the <a href="/terms-and-conditions" target="_blank" className="text-primary text-decoration-none">Terms & Conditions</a>
                                        </span>
                                    </label>
                                    <label className="d-flex align-items-start gap-2" style={{ cursor: 'pointer' }}>
                                        <input type="checkbox" className="form-check-input mt-1"
                                            checked={acceptedPrivacy}
                                            onChange={e => setAcceptedPrivacy(e.target.checked)} />
                                        <span className="small text-muted">
                                            I accept the <a href="/privacy-policy" target="_blank" className="text-primary text-decoration-none">Privacy Policy</a>
                                        </span>
                                    </label>
                                    <label className="d-flex align-items-start gap-2" style={{ cursor: 'pointer' }}>
                                        <input type="checkbox" className="form-check-input mt-1"
                                            checked={readInstructions}
                                            onChange={e => setReadInstructions(e.target.checked)} />
                                        <span className="small text-muted">
                                            I have read the <a href="/booking-instructions" target="_blank" className="text-primary text-decoration-none">Booking Instructions</a>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* ─── SIDEBAR 5: Proceed to Payment Button (Desktop) ─ */}
                            <button
                                onClick={handleProceed}
                                disabled={submiting || !allPoliciesAccepted}
                                className="btn w-100 fw-bold py-3 text-white rounded-4 shadow-sm d-none d-lg-block"
                                style={{
                                    backgroundColor: allPoliciesAccepted ? '#FD4621' : '#ccc',
                                    fontSize: '16px',
                                    transition: 'all 0.2s',
                                    cursor: allPoliciesAccepted ? 'pointer' : 'not-allowed'
                                }}>
                                {submiting
                                    ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
                                    : 'Proceed to Payment →'}
                            </button>

                            {/* ─── SIDEBAR 6: SSL Secure Text ───────────────── */}
                            <div className="text-center mt-3 text-muted small d-none d-lg-block">
                                <LockIcon size={12} />
                                <span className="ms-1">Secure SSL Encrypted Checkout</span>
                            </div>

                        </div>
                    </div>

                </div>

                {/* ─── MOBILE: Proceed to Payment Button (after all sections) ─── */}
                <div className="d-lg-none mt-3 mb-4">
                    <button
                        onClick={handleProceed}
                        disabled={submiting || !allPoliciesAccepted}
                        className="btn w-100 fw-bold py-3 text-white rounded-pill"
                        style={{ backgroundColor: allPoliciesAccepted ? '#FD4621' : '#ccc', fontSize: '16px' }}>
                        {submiting
                            ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
                            : 'Proceed to Payment →'}
                    </button>
                    {!allPoliciesAccepted && (
                        <div className="text-center text-danger small mt-2">
                            Please accept all policies to proceed.
                        </div>
                    )}
                    <div className="text-center mt-2 text-muted small">
                        <LockIcon size={12} />
                        <span className="ms-1">Secure SSL Encrypted Checkout</span>
                    </div>
                </div>

            </div>
        </main>
    );
}