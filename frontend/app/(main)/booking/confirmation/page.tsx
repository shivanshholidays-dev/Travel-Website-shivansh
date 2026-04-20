'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBookingStore } from '@lib/store/booking.store';
import { DateUtils } from '@lib/utils/date-utils';
import { useSettingsStore } from '@store/useSettingsStore';

export default function BookingConfirmationPage() {
    const router = useRouter();
    const { bookingId, bookingNumber, selection, pricing, reset } = useBookingStore();

    const [mounted, setMounted] = useState(false);
    const { settings, fetchSettings } = useSettingsStore();

    useEffect(() => {
        setMounted(true);
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        if (!mounted) return;
        if (!bookingId)
        {
            router.replace('/tours/grid');
        }
    }, [mounted, bookingId]);

    if (!mounted || !bookingId) return null;

    const handleDone = () => {
        if (bookingId)
        {
            router.push(`/dashboard/bookings/${bookingId}`);
            reset();
        } else
        {
            router.push('/dashboard/bookings');
            reset();
        }
    };

    return (
        <main style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            {/* ─── Stepper ─────────────────────────────────────────────── */}
            <div style={{ backgroundColor: '#1a1a2e', padding: '20px 0' }}>
                <div className="container container-1440 px-3 px-md-4">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        {[{ step: 1, label: 'Select Tour' }, { step: 2, label: 'Contact Details' }, { step: 3, label: 'Payment' }, { step: 4, label: 'Complete' }].map(({ step, label }, i, arr) => (
                            <div key={step} className="d-flex align-items-center gap-2">
                                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{
                                    width: '32px', height: '32px', fontSize: '14px',
                                    backgroundColor: '#FD4621', color: 'white',
                                }}>✓</div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{label}</span>
                                {i < arr.length - 1 && <div className="mx-2" style={{ height: '1px', width: '32px', backgroundColor: 'rgba(255,255,255,0.3)' }} />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container container-1440 px-3 px-md-4 py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-6">

                        {/* Success Card */}
                        <div className="bg-white rounded-4 shadow-sm p-5 text-center mb-4">
                            {/* Animated checkmark */}
                            <div className="d-flex align-items-center justify-content-center mx-auto mb-4"
                                style={{
                                    width: '90px', height: '90px', borderRadius: '50%',
                                    backgroundColor: '#e6f9ed',
                                    animation: 'pulse 2s infinite',
                                }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M5 13.5L8.5 17L19 7" />
                                </svg>
                            </div>

                            <h2 className="fw-bolder text-dark mb-2">Booking Submitted!</h2>
                            <p className="text-muted mb-4">
                                Your booking request has been received. We'll verify your payment and confirm within 24 hours.
                            </p>

                            {/* Booking ID Badge */}
                            {bookingNumber && (
                                <div className="d-inline-block px-4 py-3 rounded-3 mb-4" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                                    <div className="text-muted small mb-1">Your Booking ID</div>
                                    <div className="fw-bolder text-dark" style={{ fontSize: '1.3rem', letterSpacing: '2px', fontFamily: 'monospace' }}>
                                        #{bookingNumber}
                                    </div>
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="d-flex justify-content-center mb-4">
                                <span className="badge rounded-pill px-4 py-2 fw-bold" style={{
                                    backgroundColor: '#fff8e7', color: '#f59e0b', border: '1px solid #fde68a', fontSize: '13px'
                                }}>
                                    ⏳ PENDING PAYMENT VERIFICATION
                                </span>
                            </div>

                            {/* What Happens Next */}
                            <div className="text-start p-4 rounded-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                                <h6 className="fw-bold text-dark mb-3">What happens next?</h6>
                                <div className="d-flex flex-column gap-2">
                                    {[
                                        { icon: '1️⃣', text: 'Admin reviews your payment receipt' },
                                        { icon: '2️⃣', text: 'Booking is confirmed within 24 hours' },
                                        { icon: '3️⃣', text: 'You receive a confirmation email' },
                                        { icon: '4️⃣', text: 'Enjoy your trip! 🎉' },
                                    ].map(({ icon, text }, i) => (
                                        <div key={i} className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '14px' }}>
                                            <span>{icon}</span><span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tour Summary */}
                            {selection && (
                                <div className="border rounded-3 p-3 text-start mb-4" style={{ fontSize: '13px' }}>
                                    <div className="fw-bold text-dark mb-2">{selection.tourTitle}</div>
                                    <div className="d-flex gap-3 text-muted flex-wrap">
                                        {selection.selectedDate && (
                                            <span>📅 {DateUtils.formatToIST(selection.selectedDate.startDate, 'DD MMM YYYY')}</span>
                                        )}
                                        <span>👥 {selection.travelerCount} person{selection.travelerCount > 1 ? 's' : ''}</span>
                                        {pricing && <span>💰 {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pricing.totalAmount)}</span>}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="d-flex flex-column gap-2">
                                <Link href="/dashboard/bookings" className="btn fw-bold py-3 text-white rounded-pill"
                                    style={{ backgroundColor: '#FD4621', fontSize: '15px' }}>
                                    View My Bookings
                                </Link>
                                <Link href="/tours" className="btn fw-bold py-2 rounded-pill"
                                    style={{ border: '1px solid #dee2e6', color: '#555' }}>
                                    Explore More Tours
                                </Link>
                            </div>
                        </div>

                        {/* Help Card */}
                        <div className="bg-white rounded-4 shadow-sm p-4 text-center">
                            <div className="fw-bold mb-1">Need help?</div>
                            <div className="text-muted small mb-2">Our team is available 24/7 to assist you</div>
                            <div className="d-flex justify-content-center gap-3 flex-wrap">
                                <a href={`tel:${settings?.businessDetails?.phoneNumber || '+919909899025'}`} className="text-decoration-none fw-bold" style={{ color: '#FD4621' }}>
                                    📞 {settings?.businessDetails?.phoneNumber || '+919909899025'}
                                </a>
                                <a href={`mailto:${settings?.businessDetails?.supportEmail || 'support@tramptravellers.com'}`} className="text-decoration-none fw-bold" style={{ color: '#FD4621' }}>
                                    ✉️ Email Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.3); }
                    50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(52, 199, 89, 0); }
                }
            `}</style>
        </main>
    );
}
