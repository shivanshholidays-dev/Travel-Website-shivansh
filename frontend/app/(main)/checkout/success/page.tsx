'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useBookingById } from '@lib/hooks/useBookingHooks';
import { DateUtils } from '@lib/utils/date-utils';

function SuccessContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId') || '';

    const { data: response, isLoading } = useBookingById(bookingId);

    const booking = (response as any)?.data || response;

    useEffect(() => {
        // Optional: Trigger confetti or analytics event
    }, []);

    const formatCurrency = (amt: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

    if (isLoading)
    {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <p className="text-muted">Loading booking details...</p>
            </div>
        );
    }

    if (!booking)
    {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <h3 className="mb-20">Booking Not Found</h3>
                <Link href="/" className="togo-btn-primary">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="pt-80 pb-80" style={{ backgroundColor: '#f9f9f9', minHeight: '80vh' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-xl-6 text-center">
                        <div style={{ background: '#fff', borderRadius: '15px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#EAF8E7', color: '#2d8a4e', fontSize: '40px', marginBottom: '20px' }}>
                                ✓
                            </div>
                            <h2 className="mb-10" style={{ fontWeight: 700 }}>Booking Successful!</h2>
                            <p className="text-muted mb-30" style={{ fontSize: '15px' }}>
                                Thank you for choosing us. Your booking request has been received and is currently under review by our agents.
                            </p>

                            <div style={{ background: '#fcfcfc', border: '1px solid #eee', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '30px' }}>
                                <div className="row mb-15 pb-15" style={{ borderBottom: '1px dashed #ddd' }}>
                                    <div className="col-6">
                                        <span style={{ fontSize: '13px', color: '#888' }}>Booking ID</span>
                                        <h6 style={{ margin: 0, fontWeight: 700, color: '#111' }}>#{booking.bookingNumber || booking.id || booking._id}</h6>
                                    </div>
                                    <div className="col-6 text-end">
                                        <span style={{ fontSize: '13px', color: '#888' }}>Total Amount</span>
                                        <h6 style={{ margin: 0, fontWeight: 700, color: '#e55' }}>{formatCurrency(booking.totalAmount)}</h6>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 mb-10">
                                        <span style={{ fontSize: '13px', color: '#888' }}>Tour Name</span>
                                        <p style={{ margin: 0, fontWeight: 600 }}>{booking.tour?.title || 'Unknown Tour'}</p>
                                    </div>
                                    <div className="col-6">
                                        <span style={{ fontSize: '13px', color: '#888' }}>Date</span>
                                        <p style={{ margin: 0, fontWeight: 600 }}>{booking.departureDate ? DateUtils.formatToIST(booking.departureDate, 'DD MMM YYYY') : 'N/A'}</p>
                                    </div>
                                    <div className="col-6 text-end">
                                        <span style={{ fontSize: '13px', color: '#888' }}>Travelers</span>
                                        <p style={{ margin: 0, fontWeight: 600 }}>{booking.travelers?.length || booking.travelersCount || 1} People</p>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex gap-3 justify-content-center">
                                <Link href={`/dashboard/bookings/${booking.id || booking._id}`} className="togo-btn-primary" style={{ padding: '12px 24px', borderRadius: '8px' }}>
                                    View Booking
                                </Link>
                                <Link href="/" className="togo-btn-primary" style={{ padding: '12px 24px', borderRadius: '8px', background: '#f1f3f9', color: '#111', border: 'none' }}>
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="p-5 text-center">Loading success page...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
