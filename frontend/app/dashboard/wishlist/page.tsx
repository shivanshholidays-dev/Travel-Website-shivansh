'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlistHooks } from '@lib/hooks/useWishlistHooks';
import { Tour } from '@lib/types/tour.types';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getTourImg(tour: Tour) {
    const img = tour.thumbnailImage || (tour as any).images?.[0];
    if (!img) return '/assets/img/tour/tour-thumb-1.jpg';
    return img.startsWith('http') ? img : `${NEXT_PUBLIC_API_URL}/${img}`;
}

export default function DashboardWishlistPage() {
    const { useWishlist, useToggleWishlist } = useWishlistHooks();
    const { data: wishlist, isLoading } = useWishlist();
    const toggleMutation = useToggleWishlist();
    const extractArray = (data: any) => Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
    const tours: Tour[] = extractArray(wishlist);

    const handleRemove = (tourId: string) => {
        toggleMutation.mutate(tourId);
    };

    return (
        <div className="togo-dashboard-booking-sec pt-25 pb-60">
            <div className="container container-1440">
                <div className="row">
                    <div className="col-12 mb-20">
                        <h4 className="togo-dashboard-account-title mb-0">My Wishlist</h4>
                    </div>

                    {isLoading ? (
                        <div className="col-12 text-center py-5 text-muted">Loading wishlist…</div>
                    ) : tours.length > 0 ? (
                        tours.map(tour => (
                            <div key={tour._id} className="col-xxl-3 col-xl-4 col-md-6 mb-24">
                                <div className="bg-white rounded-4 overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'transform 0.2s' }}>
                                    {/* Image */}
                                    <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                                        <img src={getTourImg(tour)} alt={tour.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => handleRemove(tour._id)}
                                            disabled={toggleMutation.isPending}
                                            title="Remove from wishlist"
                                            style={{
                                                position: 'absolute', top: 12, right: 12,
                                                width: 38, height: 38, borderRadius: '50%',
                                                background: '#fff', border: 'none', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            }}
                                        >
                                            <Heart size={18} fill="#FD4621" stroke="#FD4621" />
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div style={{ padding: '16px 20px 20px' }}>
                                        <div className="text-muted mb-1" style={{ fontSize: 12 }}>{tour.location || 'Worldwide'}</div>
                                        <h5 className="mb-2" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
                                            <Link href={`/tours/${tour.slug || tour._id}`} className="text-dark text-decoration-none">
                                                {tour.title}
                                            </Link>
                                        </h5>
                                        <div className="d-flex align-items-center justify-content-between mt-2">
                                            <div>
                                                <span style={{ fontSize: 12, color: '#FFA800' }}>★ {tour.averageRating?.toFixed(1) || '5.0'}</span>
                                                <span style={{ fontSize: 12, color: '#aaa' }}> ({tour.reviewCount || 0} reviews)</span>
                                            </div>
                                            <div className="fw-bold" style={{ color: '#FD4621', fontSize: 16 }}>
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(tour.basePrice || 0)}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/tours/${tour.slug || tour._id}`}
                                            className="togo-btn-primary d-block text-center mt-3"
                                            style={{ borderRadius: 8, fontSize: 14 }}
                                        >
                                            View Tour
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 py-5 text-center bg-white" style={{ borderRadius: 15, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <Heart size={48} strokeWidth={1} style={{ opacity: 0.25, marginBottom: 16 }} />
                            <h5 className="mb-3">Your wishlist is empty</h5>
                            <p className="text-muted mb-4">Save tours you love to plan your next adventure.</p>
                            <Link href="/tours" className="togo-btn-primary">Browse Tours</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
