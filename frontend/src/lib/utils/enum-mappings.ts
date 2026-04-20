import { BookingStatus, PaymentStatus, TourCategory, Gender, PickupType, BlogCategory, ReviewStatus, NotificationType, RefundStatus } from '../constants/enums';

export const getNotificationTypeLabel = (type: string | NotificationType): string => {
    const labels: Record<string, string> = {
        [NotificationType.BOOKING_CREATED]: 'Booking Created',
        [NotificationType.BOOKING_CONFIRMED]: 'Booking Confirmed',
        [NotificationType.BOOKING_CANCELLED]: 'Booking Cancelled',
        [NotificationType.PAYMENT_SUCCESS]: 'Payment Success',
        [NotificationType.PAYMENT_FAILED]: 'Payment Failed',
        [NotificationType.TRIP_REMINDER]: 'Trip Reminder',
        [NotificationType.OFFER]: 'Special Offer',
        [NotificationType.GENERAL]: 'General Notification',
        [NotificationType.REFUND_REQUESTED]: 'Refund Requested',
        [NotificationType.REFUND_APPROVED]: 'Refund Approved',
        [NotificationType.REFUND_REJECTED]: 'Refund Rejected',
        [NotificationType.REFUND_PROCESSED]: 'Refund Processed',
    };
    return labels[type.toString()] || type.toString().replace(/_/g, ' ');
};

export const getReviewStatusLabel = (status: string | ReviewStatus): string => {
    const labels: Record<string, string> = {
        [ReviewStatus.PENDING]: 'Pending',
        [ReviewStatus.APPROVED]: 'Approved',
        [ReviewStatus.REJECTED]: 'Rejected',
    };
    return labels[status.toString().toUpperCase()] || status.toString();
};

export const getBookingStatusLabel = (status: string | BookingStatus): string => {
    const labels: Record<string, string> = {
        [BookingStatus.PENDING]: 'Pending',
        [BookingStatus.CONFIRMED]: 'Confirmed',
        [BookingStatus.COMPLETED]: 'Completed',
        [BookingStatus.CANCELLED]: 'Cancelled',
    };
    return labels[status.toString().toUpperCase()] || status.toString();
};

export const getRefundStatusLabel = (status: string | RefundStatus): string => {
    const labels: Record<string, string> = {
        [RefundStatus.NONE]: 'None',
        [RefundStatus.REQUESTED]: 'Requested',
        [RefundStatus.APPROVED]: 'Approved',
        [RefundStatus.REJECTED]: 'Rejected',
        [RefundStatus.PROCESSED]: 'Processed',
    };
    return labels[(status || '').toString().toUpperCase()] || (status || '').toString();
};

export const getRefundStatusBadgeClass = (status: string | RefundStatus): string => {
    const s = (status || '').toString().toUpperCase();
    if (s === 'APPROVED' || s === 'PROCESSED')
        return 'text-success bg-success bg-opacity-10';
    if (s === 'REQUESTED')
        return 'text-warning bg-warning bg-opacity-10';
    if (s === 'REJECTED')
        return 'text-danger bg-danger bg-opacity-10';
    return 'text-secondary bg-secondary bg-opacity-10';
};

export const getPaymentStatusLabel = (status: string | PaymentStatus): string => {
    const labels: Record<string, string> = {
        [PaymentStatus.PENDING]: 'Pending',
        [PaymentStatus.SUCCESS]: 'Success',
        [PaymentStatus.REJECTED]: 'Rejected',
        [PaymentStatus.FAILED]: 'Failed',
    };
    return labels[status.toString().toUpperCase()] || status.toString();
};

export const getTourCategoryLabel = (category: string | TourCategory): string => {
    const labels: Record<string, string> = {
        [TourCategory.ADVENTURE]: 'Adventure',
        [TourCategory.BEACH]: 'Beach',
        [TourCategory.LEISURE]: 'Leisure',
        [TourCategory.CULTURAL]: 'Cultural',
        [TourCategory.NATURE]: 'Nature',
        [TourCategory.SPIRITUAL]: 'Spiritual',
        [TourCategory.SOLO_TRAVEL]: 'Solo Travel',
        [TourCategory.ROAD_TRIPS]: 'Road Trips',
    };
    return labels[category.toString().toUpperCase()] || category.toString();
};

export const getBlogCategoryLabel = (category: string | BlogCategory): string => {
    const labels: Record<string, string> = {
        [BlogCategory.TRAVEL_TIPS]: 'Travel Tips',
        [BlogCategory.DESTINATION_GUIDE]: 'Destination Guide',
        [BlogCategory.SOLO_TRAVEL]: 'Solo Travel',
        [BlogCategory.ROAD_TRIPS]: 'Road Trips',
        [BlogCategory.ADVENTURE]: 'Adventure',
        [BlogCategory.CULTURAL]: 'Cultural',
        [BlogCategory.NATURE]: 'Nature',
        [BlogCategory.GENERAL]: 'General',
    };
    return labels[category.toString().toUpperCase()] || category.toString();
};

export const getGenderLabel = (gender: string | Gender): string => {
    const labels: Record<string, string> = {
        [Gender.MALE]: 'Male',
        [Gender.FEMALE]: 'Female',
        [Gender.OTHER]: 'Other',
    };
    return labels[gender.toString().toUpperCase()] || gender.toString();
};

export const getPickupTypeLabel = (type: string | PickupType): string => {
    const labels: Record<string, string> = {
        [PickupType.NON_AC_TRAIN]: 'Non-AC Train',
        [PickupType.THREE_TIER_AC_TRAIN]: '3-Tier AC Train',
        [PickupType.BOTH_SIDE_FLIGHT]: 'Both Side Flight',
        [PickupType.ONE_SIDE_FLIGHT]: 'One Side Flight',
        [PickupType.LAND_PACKAGE]: 'Land Package',
        [PickupType.LUXURY_BUS]: 'Luxury Bus',
    };
    return labels[type.toString().toUpperCase()] || labels[type.toString()] || type.toString();
};

export const getStatusBadgeClass = (status: string): string => {
    const s = (status || '').toUpperCase();
    if (['CONFIRMED', 'SUCCESS', 'APPROVED', 'UPCOMING'].includes(s))
        return 'text-success bg-success bg-opacity-10';
    if (['PENDING', 'FULL'].includes(s))
        return 'text-warning bg-warning bg-opacity-10';
    if (['CANCELLED', 'REJECTED', 'FAILED'].includes(s))
        return 'text-danger bg-danger bg-opacity-10';
    if (s === 'COMPLETED')
        return 'text-primary bg-primary bg-opacity-10';
    return 'text-secondary bg-secondary bg-opacity-10';
};
