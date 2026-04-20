import { useState } from 'react';
import Link from 'next/link';
import { Tour } from '@lib/types/tour.types';
import useAuthStore from '@/src/store/useAuthStore';
import { useWishlistHooks } from '@/src/lib/hooks/useWishlistHooks';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getImgUrl } from '@lib/utils/image';
import { getTourCategoryLabel } from '@lib/utils/enum-mappings';
import SafeImage from '@/src/components/common/SafeImage';
import { MapPin, Clock } from 'lucide-react';

interface TourCardProps {
    tour: Tour;
    viewMode?: 'grid' | 'list';
    wishlistIds?: Set<string>;
    onToggleWishlist?: (id: string) => void;
}

function getResolvedThumb(tour: Tour): string {
    const img = tour.thumbnailImage || tour.images?.[0];
    return getImgUrl(img, '/assets/img/tour/tour-thumb-1.jpg');
}

function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

function getDurationLabel(tour: Tour): string | null {
    if (tour.duration && tour.duration.trim()) return tour.duration.trim();
    const dep = (tour.departureOptions as any)?.[0];
    if (dep)
    {
        const days = dep.totalDays;
        const nights = dep.totalNights;
        if (days && nights) return `${days} Days ${nights} Nights`;
        if (days) return `${days} Days`;
    }
    const itLen = (tour.itinerary as any)?.length;
    if (itLen) return `${itLen} Day${itLen !== 1 ? 's' : ''} ${itLen - 1} Night${itLen - 1 !== 1 ? 's' : ''}`;
    return null;
}

function getDeterministicFakeRating(id: string): number {
    if (!id) return 4.8;
    const charCodeSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const ratings = [4.7, 4.8, 4.9, 5.0];
    return ratings[charCodeSum % ratings.length];
}

function getDeterministicFakeReviewCount(id: string): number {
    if (!id) return 15;
    const charCodeSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 12 + (charCodeSum % 39); // Consistent range between 12 and 50
}

function StarRating({ rating }: { rating: number }) {
    return (
        <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} width="13" height="13" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M8.14 1.13a.75.75 0 0 0-1.28 0L5.32 4.7a.75.75 0 0 1-.57.41l-3.88.56a.75.75 0 0 0-.42 1.28l2.81 2.74a.75.75 0 0 1 .22.66l-.66 3.87a.75.75 0 0 0 1.09.79l3.47-1.82a.75.75 0 0 1 .7 0l3.47 1.82a.75.75 0 0 0 1.09-.79l-.66-3.87a.75.75 0 0 1 .22-.66l2.81-2.74a.75.75 0 0 0-.42-1.28l-3.88-.56a.75.75 0 0 1-.57-.41L8.14 1.13Z"
                        fill={star <= Math.round(rating) ? '#f59e0b' : '#e5e7eb'}
                    />
                </svg>
            ))}
        </span>
    );
}

export default function TourCard({
    tour,
    viewMode = 'grid',
    wishlistIds: externalWishlistIds,
    onToggleWishlist: externalOnToggleWishlist
}: TourCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const thumbUrl = getResolvedThumb(tour);
    const displayPrice = tour.basePrice;
    const rating = tour.averageRating && tour.averageRating > 0 ? tour.averageRating : getDeterministicFakeRating(tour._id);
    const reviewCount = tour.reviewCount && tour.reviewCount > 0 ? tour.reviewCount : getDeterministicFakeReviewCount(tour._id);
    const durationLabel = getDurationLabel(tour);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const router = useRouter();

    // Wishlist Logic
    const { useWishlist, useToggleWishlist } = useWishlistHooks();
    const { data: wishlistRes } = useWishlist();
    const toggleMutation = useToggleWishlist();

    const wishlistIds = externalWishlistIds || new Set<string>(
        (Array.isArray(wishlistRes) ? wishlistRes : (wishlistRes as any)?.data)?.map((t: any) => t._id ?? t) ?? []
    );
    const isWished = wishlistIds.has(tour._id);
    const onToggleWishlist = externalOnToggleWishlist || ((id: string) => toggleMutation.mutate(id));

    return (
        <div
            className={`togo-tour-card mb-16 ${viewMode === 'list' ? 'd-flex align-items-center' : ''}`}
            style={{
                borderRadius: 16,
                overflow: 'hidden',
                background: '#fff',
                display: 'flex',
                flexDirection: viewMode === 'list' ? 'row' : 'column',
                height: '100%',
                boxShadow: isHovered ? '0 12px 40px rgba(0,0,0,0.15)' : '0 2px 16px rgba(0,0,0,0.07)',
                transition: 'box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                ...viewMode === 'list' ? { minHeight: 240 } : {}
            }}
            onMouseOver={() => {
                setIsHovered(true);
            }}
            onMouseOut={() => {
                setIsHovered(false);
            }}
        >
            {/* ── Thumbnail ── */}
            <div style={{ position: 'relative', flexShrink: 0, width: viewMode === 'list' ? '300px' : '100%', overflow: 'hidden' }}>
                <Link href={`/tours/${tour.slug}`} style={{ display: 'block', height: '100%', position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <SafeImage
                        src={thumbUrl}
                        alt={tour.title}
                        fallbackSrc="/assets/img/tour/tour-thumb-1.jpg"
                        style={{
                            width: '100%',
                            height: viewMode === 'list' ? '100%' : 210,
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.8s cubic-bezier(0.33, 1, 0.68, 1), filter 0.8s ease',
                            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                            filter: isHovered ? 'brightness(0.9)' : 'brightness(1)'
                        }}
                    />
                    {/* Hover Overlay */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.05)',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.8s ease',
                        pointerEvents: 'none',
                        zIndex: 2
                    }} />
                </Link>

                {/* Category badge */}
                {tour.category && (
                    <div style={{
                        position: 'absolute', top: 12, left: 12,
                        background: '#FD4621', color: '#fff',
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.5px',
                        padding: '4px 10px', borderRadius: 50,
                        textTransform: 'uppercase',
                        zIndex: 5
                    }}>
                        {getTourCategoryLabel(tour.category)}
                    </div>
                )}

                {/* Featured badge */}
                {tour.isFeatured && !tour.category && (
                    <div style={{
                        position: 'absolute', top: 12, left: 12,
                        background: '#7c3aed', color: '#fff',
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.5px',
                        padding: '4px 10px', borderRadius: 50,
                        zIndex: 5
                    }}>
                        ⭐ Featured
                    </div>
                )}

                {/* Wishlist button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isAuthenticated)
                        {
                            toast.error('Please login to save tours to your wishlist.');
                            const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
                            router.push(`/login${currentPath ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`);
                            return;
                        }
                        onToggleWishlist(tour._id);
                        if (isWished)
                        {
                            toast.success('Removed from wishlist');
                        } else
                        {
                            toast.success('Added to wishlist');
                        }
                    }}
                    title={isAuthenticated ? (isWished ? 'Remove from wishlist' : 'Save tour') : 'Login to save'}
                    style={{
                        position: 'absolute', top: 12, right: 12,
                        width: 36, height: 36, borderRadius: '50%',
                        background: isWished ? '#FD4621' : 'rgba(255,255,255,0.92)',
                        border: 'none', cursor: isAuthenticated ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'background 0.2s',
                        color: isWished ? '#fff' : '#333',
                        zIndex: 10
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isWished ? 'currentColor' : 'none'}>
                        <path d="M7.75 3.5C5.12665 3.5 3 5.75956 3 8.54688C3 14.125 12 20.5 12 20.5C12 20.5 21 14.125 21 8.54688C21 5.09375 18.8734 3.5 16.25 3.5C14.39 3.5 12.7796 4.63593 12 6.2905C11.2204 4.63593 9.61003 3.5 7.75 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Price overlay at bottom of image (only in grid mode) */}
                {viewMode === 'grid' && (
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        padding: '28px 14px 10px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}>From</span>
                            <span style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
                                {formatINR(displayPrice)}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>/ person</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Card body ── */}
            <div
                style={{
                    padding: '14px 14px 22px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    justifyContent: 'space-between'
                }}
            >

                {/* Title */}
                <h4 style={{
                    fontSize: viewMode === 'list' ? 20 : 16, fontWeight: 700, color: '#111',
                    lineHeight: 1.4, margin: 0,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    <Link href={`/tours/${tour.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {tour.title}
                    </Link>
                </h4>

                {/* Meta pills row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {/* Location */}
                    {(tour.location || tour.state || tour.country) && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: '#f5f5f5', borderRadius: 50, padding: '4px 12px',
                            fontSize: 12, color: '#555', fontWeight: 500,
                        }}>
                            <MapPin size={14} color="#FD4621" />
                            {tour.location || tour.state || tour.country}
                        </div>
                    )}

                    {/* Duration */}
                    {durationLabel && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: '#f5f5f5', borderRadius: 50, padding: '4px 12px',
                            fontSize: 12, color: '#555', fontWeight: 500,
                        }}>
                            <Clock size={14} color="#FD4621" />
                            {durationLabel}
                        </div>
                    )}
                </div>

                {/* Description excerpt */}
                {tour.description && (
                    <p style={{
                        fontSize: 13.5, color: '#888', lineHeight: 1.45, margin: 0,
                        display: '-webkit-box', WebkitLineClamp: viewMode === 'list' ? 3 : 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                        {tour.description}
                    </p>
                )}

                {/* Spacer */}
                {/* <div style={{ flex: 1 }} /> */}

                {/* Divider */}
                <div style={{ height: 1, background: '#f0f0f0', marginTop: 6 }} />

                {/* Footer: rating + CTA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <StarRating rating={rating} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                                {rating.toFixed(1)}
                            </span>
                        </div>
                        <span style={{ fontSize: 11, color: '#aaa' }}>
                            {reviewCount} Review{reviewCount !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        {viewMode === 'list' && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                                <span style={{ color: '#777', fontSize: 12, fontWeight: 500 }}>From</span>
                                <span style={{ color: '#111', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
                                    {formatINR(displayPrice)}
                                </span>
                            </div>
                        )}
                        <Link
                            href={`/tours/${tour.slug}`}
                            style={{
                                background: '#FD4621', color: '#fff',
                                fontSize: 13, fontWeight: 700,
                                padding: '8px 12px', borderRadius: 8,
                                textDecoration: 'none',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                                transform: isHovered ? 'translateX(2px)' : 'none',
                                letterSpacing: '0.2px',
                            }}
                            onMouseOver={e => (e.currentTarget.style.background = '#e03a14')}
                            onMouseOut={e => (e.currentTarget.style.background = '#FD4621')}
                        >
                            View Tour
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
