import { User } from './user.types';
import { Tour } from './tour.types';
import { Booking } from './booking.types';
import { ReviewStatus } from '../constants/enums';


export interface Review {
    _id: string;
    user: User | string;
    tour: Tour | string;
    booking: Booking | string;
    rating: number; // 1 to 5
    comment: string;
    status: ReviewStatus;
    adminNote?: string;
    createdAt: string;
    updatedAt: string;
}
