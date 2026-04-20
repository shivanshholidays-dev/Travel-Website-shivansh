import { User } from './user.types';
import { Booking } from './booking.types';
import { PaymentStatus, PaymentMethod } from '../constants/enums';

export type PaymentType = PaymentMethod | string;

export interface Payment {
    _id: string;
    booking: Booking | string;
    user: User | string;
    amount: number;
    currency: string;
    type: string;
    paymentMethod?: string;
    transactionId?: string;
    receiptImage?: string;
    processedBy?: User | string;
    processedAt?: string;
    status: PaymentStatus | string;
    rejectionReason?: string;
    description?: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
}
