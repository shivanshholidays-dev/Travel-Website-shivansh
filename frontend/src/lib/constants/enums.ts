export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum RefundStatus {
    NONE = 'NONE',
    REQUESTED = 'REQUESTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PROCESSED = 'PROCESSED',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    REJECTED = 'REJECTED',
    FAILED = 'FAILED',
}

export enum PaymentMethod {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
}

export enum PaymentType {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    PARTIAL = 'PARTIAL',
}

export enum TourCategory {
    ADVENTURE = 'ADVENTURE',
    BEACH = 'BEACH',
    LEISURE = 'LEISURE',
    CULTURAL = 'CULTURAL',
    NATURE = 'NATURE',
    SPIRITUAL = 'SPIRITUAL',
    SOLO_TRAVEL = 'SOLO_TRAVEL',
    ROAD_TRIPS = 'ROAD_TRIPS',
}

export enum ReviewStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN',
}

export enum BlogStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
}

export enum CouponType {
    PERCENT = 'PERCENT',
    FLAT = 'FLAT',
}

export enum TransactionType {
    ONLINE_RECEIPT = 'ONLINE_RECEIPT',
    OFFLINE_PAYMENT = 'OFFLINE_PAYMENT',
    REFUND = 'REFUND',
    MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export enum PickupType {
    NON_AC_TRAIN = 'NON_AC_TRAIN',
    THREE_TIER_AC_TRAIN = '3TIER_AC_TRAIN',
    BOTH_SIDE_FLIGHT = 'BOTH_SIDE_FLIGHT',
    ONE_SIDE_FLIGHT = 'ONE_SIDE_FLIGHT',
    LAND_PACKAGE = 'LAND_PACKAGE',
    LUXURY_BUS = 'LUXURY_BUS',
}

export enum BlogCategory {
    TRAVEL_TIPS = 'TRAVEL_TIPS',
    DESTINATION_GUIDE = 'DESTINATION_GUIDE',
    SOLO_TRAVEL = 'SOLO_TRAVEL',
    ROAD_TRIPS = 'ROAD_TRIPS',
    ADVENTURE = 'ADVENTURE',
    CULTURAL = 'CULTURAL',
    NATURE = 'NATURE',
    GENERAL = 'GENERAL',
}

export enum TourDateStatus {
    UPCOMING = 'UPCOMING',
    FULL = 'FULL',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}
export enum NotificationType {
    BOOKING_CREATED = 'booking_created',
    BOOKING_CONFIRMED = 'booking_confirmed',
    BOOKING_CANCELLED = 'booking_cancelled',
    PAYMENT_SUCCESS = 'payment_success',
    PAYMENT_FAILED = 'payment_failed',
    TRIP_REMINDER = 'trip_reminder',
    OFFER = 'offer',
    GENERAL = 'general',
    REFUND_REQUESTED = 'refund_requested',
    REFUND_APPROVED = 'refund_approved',
    REFUND_REJECTED = 'refund_rejected',
    REFUND_PROCESSED = 'refund_processed',
}
