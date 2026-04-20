'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAdminReviewHooks } from '@hooks/admin/useAdminReviewHooks';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ReviewStatus } from '@lib/constants/enums';
import { DateUtils } from '@lib/utils/date-utils';

export default function AdminReviewDetailPage() {
    const params = useParams();
    const router = useRouter();
    const reviewId = params.id as string;

    const { useReviewById, useApproveReview, useRejectReview } = useAdminReviewHooks();

    const { data: response, isLoading } = useReviewById(reviewId);
    const approveMutation = useApproveReview();
    const rejectMutation = useRejectReview();

    const review = (response as any)?.data || response;

    const handleApprove = async () => {
        if (!window.confirm('Are you sure you want to approve this review and make it public?')) return;
        try
        {
            await approveMutation.mutateAsync(reviewId);
            toast.success('Review approved and published');
        } catch (err)
        {
            toast.error('Failed to approve review');
        }
    };

    const handleReject = async () => {
        const reason = window.prompt('Please enter a reason for rejecting this review:');
        if (reason === null) return; // User cancelled
        if (!reason.trim()) return toast.error('A rejection reason is required');

        try
        {
            await rejectMutation.mutateAsync({ id: reviewId, reason });
            toast.success('Review rejected');
        } catch (err)
        {
            toast.error('Failed to reject review');
        }
    };

    if (isLoading) return <div className="p-5 text-center">Loading review details...</div>;
    if (!review) return <div className="p-5 text-center text-danger">Review not found</div>;

    const renderStars = (rating: number) => {
        return (
            <div className="d-flex text-warning fs-5">
                {[1, 2, 3, 4, 5].map(star => (
                    <i key={star} className={`fas fa-star ${star <= rating ? '' : 'text-muted opacity-25'}`}></i>
                ))}
                <span className="ms-2 text-dark fs-6 align-self-center">({rating}/5)</span>
            </div>
        );
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <h4 className="togo-dashboard-account-title mb-0">Review Details</h4>
                    <Link href="/admin/reviews" className="togo-btn-primary" style={{ background: '#f1f3f9', color: '#111' }}>
                        Back to Reviews
                    </Link>
                </div>

                <div className="row">
                    <div className="col-lg-8 mx-auto mb-30">
                        <div style={{ background: '#fff', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <div className="d-flex justify-content-between align-items-start mb-20 pb-20 border-bottom">
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{ width: '50px', height: '50px', background: '#e8f0fe', color: '#1a73e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                                        {review.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h5 className="mb-1" style={{ fontWeight: 600 }}>{review.user?.name || 'Guest User'}</h5>
                                        <span style={{ fontSize: '13px', color: '#888' }}>
                                            Posted on {DateUtils.formatToIST(review.createdAt, 'DD MMM YYYY, hh:mm A')}
                                        </span>
                                    </div>
                                </div>
                                <span style={{
                                    display: 'inline-block', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
                                    backgroundColor: review.status === ReviewStatus.APPROVED ? '#EAF8E7' : review.status === ReviewStatus.REJECTED ? '#FFF2F5' : '#FFF6E4',
                                    color: review.status === ReviewStatus.APPROVED ? '#2d8a4e' : review.status === ReviewStatus.REJECTED ? '#e55' : '#e5a323'
                                }}>
                                    {review.status || 'PENDING'}
                                </span>
                            </div>

                            <div className="mb-20">
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Tour Reviewed</div>
                                <div style={{ fontWeight: 600, fontSize: '16px', color: '#1a73e8' }}>
                                    <Link href={`/tours/${review.tour?.slug || review.tour?._id || ''}`} target="_blank" style={{ color: '#1a73e8', textDecoration: 'none' }}>
                                        {review.tour?.title || review.tour?._id || 'Unknown Tour'} ↗
                                    </Link>
                                </div>
                            </div>

                            <div className="mb-20">
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                                    Overall Rating
                                </div>
                                {renderStars(review.rating)}
                            </div>

                            <div className="mb-30">
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Review Comment</div>
                                <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.6', background: '#f8f9fa', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #1a73e8' }}>
                                    &ldquo;{review.comment}&rdquo;
                                </div>
                            </div>

                            {review.status === ReviewStatus.PENDING && (
                                <div className="d-flex gap-3 pt-20 border-top mt-20">
                                    <button
                                        className="togo-btn-primary flex-grow-1"
                                        onClick={handleApprove}
                                        disabled={approveMutation.isPending || rejectMutation.isPending}
                                        style={{ background: '#2d8a4e', border: 'none' }}
                                    >
                                        Approve & Publish
                                    </button>
                                    <button
                                        className="togo-btn-primary flex-grow-1"
                                        onClick={handleReject}
                                        disabled={approveMutation.isPending || rejectMutation.isPending}
                                        style={{ background: '#FFF2F5', color: '#e55', border: 'none' }}
                                    >
                                        Reject Review
                                    </button>
                                </div>
                            )}

                            {review.status === ReviewStatus.REJECTED && review.adminNote && (
                                <div className="mt-20 p-3" style={{ background: '#FFF2F5', borderLeft: '4px solid #e55', borderRadius: '4px' }}>
                                    <strong style={{ display: 'block', color: '#e55', marginBottom: '5px' }}>Rejection Reason (Admin Note)</strong>
                                    {review.adminNote}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
