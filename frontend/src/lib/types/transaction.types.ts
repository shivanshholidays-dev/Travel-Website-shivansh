import { User } from './user.types';
import { Booking } from './booking.types';
import { Payment } from './payment.types';
import { TransactionStatus, TransactionType } from '../constants/enums';

export interface Transaction {
    _id: string;
    user: User | string;
    booking: Booking | string;
    payment?: Payment | string;
    amount: number;
    type: TransactionType | string;
    paymentMethod?: string;
    transactionId?: string;
    description: string;
    processedBy?: User | string;
    processedAt?: string;
    metadata?: any;
    status: TransactionStatus | string;
    createdAt: string;
    updatedAt: string;
}
