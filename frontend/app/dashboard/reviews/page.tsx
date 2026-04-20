'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useReviewHooks } from '@lib/hooks/useReviewHooks';
import { useMyBookings } from '@lib/hooks/useBookingHooks';
import { Review } from '@lib/types/review.types';
import { DateUtils } from '@lib/utils/date-utils';
import toast from 'react-hot-toast';
import { BookingStatus, ReviewStatus } from '@lib/constants/enums';
import { getImgUrl } from '@lib/utils/image';

function Stars({ rating, editable = false, onChange }: { rating: number; editable?: boolean; onChange?: (r: number) => void }) {
    return (
        <div className="d-flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={18}
                    fill={i <= rating ? '#FFA800' : 'none'}
                    stroke={i <= rating ? '#FFA800' : '#ccc'}
                    style={editable ? { cursor: 'pointer' } : {}}
                    onClick={() => editable && onChange?.(i)}
                />
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status?: string }) {
    const s = status?.toUpperCase();
    if (s === ReviewStatus.APPROVED)
    {
        return (
            <span className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-medium" style={{ background: '#d1fae5', color: '#065f46', fontSize: 12 }}>
                <CheckCircle size={12} /> Approved
            </span>
        );
    }
    if (s === ReviewStatus.REJECTED)
    {
        return (
            <span className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-medium" style={{ background: '#fee2e2', color: '#991b1b', fontSize: 12 }}>
                <XCircle size={12} /> Rejected
            </span>
        );
    }
    return (
        <span className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-medium" style={{ background: '#fef9c3', color: '#854d0e', fontSize: 12 }}>
            <Clock size={12} /> Pending Review
        </span>
    );
}

export default function DashboardReviewsPage() {
    const [activeTab, setActiveTab] = useState<'submitted' | 'pending_review'>('submitted');
    const { useMyReviews, useCreateReview } = useReviewHooks();
    const { data: reviews, isLoading: reviewsLoading } = useMyReviews();
    const { data: bookingsData, isLoading: bookingsLoading } = useMyBookings({ status: BookingStatus.COMPLETED, limit: 50 });
    const createReviewMutation = useCreateReview();

    const extractArray = (data: any) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.items)) return data.items;
        if (data?.data && Array.isArray(data.data.items)) return data.data.items;
        return [];
    };
    const reviewList: Review[] = extractArray(reviews);
    const allBookings: any[] = extractArray(bookingsData);

    // Find tours that are completed but not yet reviewed
    const reviewedTourIds = new Set(reviewList.map(r => (r.tour as any)?._id || r.tour));
    const completedBookings = allBookings.filter((b: any) => b.status === BookingStatus.COMPLETED);
    const pendingToursMap = new Map();
    completedBookings.forEach((b: any) => {
        const tourId = (b.tour as any)?._id || b.tour;
        if (tourId && !reviewedTourIds.has(tourId))
        {
            pendingToursMap.set(tourId, { tour: b.tour, bookingId: b._id });
        }
    });
    const pendingItems = Array.from(pendingToursMap.values());

    const [reviewForm, setReviewForm] = useState<{ [tourId: string]: { rating: number; comment: string } }>({});

    const handleRatingChange = (tourId: string, rating: number) => {
        setReviewForm(prev => ({ ...prev, [tourId]: { ...(prev[tourId] || { comment: '' }), rating } }));
    };
    const handleCommentChange = (tourId: string, comment: string) => {
        setReviewForm(prev => ({ ...prev, [tourId]: { ...(prev[tourId] || { rating: 0 }), comment } }));
    };

    const handleSubmitReview = (e: React.FormEvent, tourId: string, bookingId: string) => {
        e.preventDefault();
        const data = reviewForm[tourId];
        if (!data || !data.rating)
        {
            toast.error('Please select a rating');
            return;
        }
        createReviewMutation.mutate({ tourId, bookingId, rating: data.rating, comment: data.comment || '' }, {
            onSuccess: () => {
                toast.success('Review submitted! It will be visible after admin approval.');
                setActiveTab('submitted');
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Failed to submit review');
            }
        });
    };

    const isLoading = reviewsLoading || bookingsLoading;

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h4 className="togo-dashboard-account-title mb-20">Your Reviews</h4>

                        {/* ── Tabs ── */}
                        <div className="togo-dashboard-booking-tab pb-30">
                            <ul className="nav nav-pills gap-3 flex-wrap">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link px-4 rounded-pill fw-medium border-0 ${activeTab === 'submitted' ? 'text-white' : 'bg-light text-dark'}`}
                                        style={activeTab === 'submitted' ? { background: '#FD4621' } : {}}
                                        onClick={() => setActiveTab('submitted')}
                                    >
                                        Submitted Reviews
                                        <span className="ms-2 badge rounded-pill" style={{ background: activeTab === 'submitted' ? 'rgba(255,255,255,0.3)' : '#eee', color: activeTab === 'submitted' ? '#fff' : '#555', fontSize: 11 }}>
                                            {reviewList.length}
                                        </span>
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link px-4 rounded-pill fw-medium border-0 ${activeTab === 'pending_review' ? 'text-white' : 'bg-light text-dark'}`}
                                        style={activeTab === 'pending_review' ? { background: '#FD4621' } : {}}
                                        onClick={() => setActiveTab('pending_review')}
                                    >
                                        Pending Reviews
                                        {pendingItems.length > 0 && (
                                            <span className="ms-2 badge rounded-pill" style={{ background: activeTab === 'pending_review' ? 'rgba(255,255,255,0.3)' : '#FD4621', color: '#fff', fontSize: 11 }}>
                                                {pendingItems.length}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* ── Content ── */}
                        {isLoading ? (
                            <div className="row">
                                {[1, 2].map(i => (
                                    <div key={i} className="col-12 mb-4">
                                        <div className="bg-white p-4 rounded-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                            <div className="skeleton mb-3" style={{ height: 20, width: '60%', borderRadius: 4 }} />
                                            <div className="skeleton mb-2" style={{ height: 16, width: '40%', borderRadius: 4 }} />
                                            <div className="skeleton" style={{ height: 60, borderRadius: 4 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : activeTab === 'submitted' ? (
                            reviewList.length === 0 ? (
                                /* Empty state */
                                <div className="bg-white p-5 rounded-4 text-center" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                    <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: 80, height: 80, background: '#fff8f0' }}>
                                        <Star size={36} fill="#FFA800" stroke="#FFA800" style={{ opacity: 0.5 }} />
                                    </div>
                                    <h5 className="mb-2 fw-bold">No reviews yet</h5>
                                    <p className="text-muted mb-4" style={{ maxWidth: 380, margin: '0 auto 16px' }}>
                                        You haven't submitted any reviews. Complete a trip and share your experience!
                                    </p>
                                    {pendingItems.length > 0 ? (
                                        <button
                                            className="togo-btn-primary px-4 py-2"
                                            onClick={() => setActiveTab('pending_review')}
                                        >
                                            Write Your First Review
                                        </button>
                                    ) : (
                                        <Link href="/tours" className="togo-btn-primary px-4 py-2">
                                            Explore Tours
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="row">
                                    {reviewList.map(review => (
                                        <div key={review._id} className="col-12 mb-4">
                                            <div className="bg-white p-4 rounded-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                                {/* Header row */}
                                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 border-bottom pb-4 mb-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                                                            <img
                                                                src={getImgUrl((review.tour as any)?.thumbnailImage || (review.tour as any)?.images?.[0])}
                                                                alt=""
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Tour</div>
                                                            <div className="fw-bold" style={{ fontSize: 15 }}>
                                                                <Link
                                                                    href={`/tours/${(review.tour as any)?.slug || (review.tour as any)?._id || (review.tour as string)}`}
                                                                    className="text-dark text-decoration-none"
                                                                >
                                                                    {(review.tour as any)?.title || 'Tour'}
                                                                </Link>
                                                            </div>
                                                            <div className="mt-1">
                                                                <Stars rating={review.rating} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex flex-column align-items-end gap-2">
                                                        <StatusBadge status={(review as any).status} />
                                                        <span className="text-muted" style={{ fontSize: 12 }}>
                                                            {review.createdAt ? DateUtils.formatToIST(review.createdAt, 'DD MMM YYYY') : ''}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Review text */}
                                                {review.comment ? (
                                                    <p className="text-muted mb-0" style={{ fontSize: 14, lineHeight: 1.8 }}>"{review.comment}"</p>
                                                ) : (
                                                    <p className="text-muted mb-0 fst-italic" style={{ fontSize: 13 }}>No comment left.</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : pendingItems.length > 0 ? (
                            <div className="row">
                                {pendingItems.map((item: any) => {
                                    const tour = item.tour;
                                    const bookingId = item.bookingId;
                                    const tourId = tour._id;
                                    const formState = reviewForm[tourId] || { rating: 0, comment: '' };
                                    const tourImg = getImgUrl(tour.thumbnailImage || tour.images?.[0]);
                                    return (
                                        <div key={tourId} className="col-12 mb-4">
                                            <div className="bg-white p-4 rounded-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                                {/* Tour header */}
                                                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                                                    <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                                                        <img src={tourImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                    <div>
                                                        <h5 className="mb-1 fw-bold" style={{ fontSize: 16 }}>{tour.title}</h5>
                                                        <div className="text-muted" style={{ fontSize: 13 }}>Share your experience about this trip</div>
                                                    </div>
                                                    <span className="ms-auto px-3 py-1 rounded-pill fw-medium" style={{ background: '#fff0e0', color: '#c05e00', fontSize: 12, whiteSpace: 'nowrap' }}>
                                                        Awaiting Review
                                                    </span>
                                                </div>

                                                <form onSubmit={(e) => handleSubmitReview(e, tourId, bookingId)}>
                                                    {/* Star picker */}
                                                    <div className="mb-3">
                                                        <label className="fw-bold d-block mb-2" style={{ fontSize: 13 }}>
                                                            Your Rating <span className="text-danger">*</span>
                                                        </label>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <Stars rating={formState.rating} editable onChange={(r) => handleRatingChange(tourId, r)} />
                                                            {formState.rating > 0 && (
                                                                <span className="text-muted" style={{ fontSize: 13 }}>
                                                                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formState.rating]}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mb-4">
                                                        <label className="fw-bold d-block mb-2" style={{ fontSize: 13 }}>Your Review <span className="text-muted fw-normal">(optional)</span></label>
                                                        <textarea
                                                            className="form-control"
                                                            rows={4}
                                                            placeholder="Write about your experience — what you loved, highlights, tips for other travelers..."
                                                            value={formState.comment}
                                                            onChange={(e) => handleCommentChange(tourId, e.target.value)}
                                                            style={{ border: '1.5px solid #e8ecf0', borderRadius: 10, padding: '12px 16px', resize: 'none', fontSize: 14 }}
                                                        />
                                                    </div>

                                                    <div className="d-flex justify-content-end">
                                                        <button
                                                            type="submit"
                                                            className="togo-btn-primary px-5 py-2 w-100 w-md-auto"
                                                            disabled={createReviewMutation.isPending || !formState.rating}
                                                            style={{ borderRadius: 8 }}
                                                        >
                                                            {createReviewMutation.isPending ? 'Submitting…' : 'Submit Review'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white p-5 rounded-4 text-center" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: 80, height: 80, background: '#f0fdf4' }}>
                                    <CheckCircle size={36} style={{ color: '#22c55e', opacity: 0.7 }} />
                                </div>
                                <h5 className="mb-2 fw-bold">All caught up!</h5>
                                <p className="text-muted mb-4">You've reviewed all your completed trips. Explore more destinations!</p>
                                <Link href="/tours" className="togo-btn-primary px-4 py-2">Explore Tours</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
