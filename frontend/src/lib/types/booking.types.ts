import { Tour, PickupPoint, TourDate } from './tour.types';
import { User } from './user.types';
import { BookingStatus, PaymentMethod, Gender } from '../constants/enums';

export { BookingStatus };

export interface BookingTraveler {
    _id?: string;
    fullName: string;
    age: number;
    gender: Gender | string;
    phone: string;
    idNumber: string;
}

export interface InternalNote {
    note: string;
    createdAt: string;
    adminId?: string;
}

export interface Booking {
    _id: string;
    bookingNumber: string;
    user: User | string;
    tour: Tour | string;
    tourDate: TourDate | string;
    pickupOption?: PickupPoint;
    travelers: BookingTraveler[];
    totalTravelers: number;
    baseAmount: number;
    discountAmount: number;
    couponCode?: string;
    totalAmount: number;
    taxAmount: number;
    taxRate?: number;
    perPersonPrice?: number;
    paidAmount: number;
    pendingAmount: number;
    paymentType?: PaymentMethod | string;
    status: BookingStatus;
    additionalRequests?: string;
    transactionId?: string;
    receiptImage?: string;
    paymentVerifiedAt?: string;
    internalNotes?: InternalNote[];
    pricingSummary?: string;
    refundStatus?: string;
    refundAmount?: number;
    refundReason?: string;
    refundRequestedAt?: string;
    refundProcessedAt?: string;
    createdAt: string;
    updatedAt: string;
}
