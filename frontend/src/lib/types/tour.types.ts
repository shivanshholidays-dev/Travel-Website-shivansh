import { TourDateStatus, TourCategory, PickupType } from '../constants/enums';

export interface TourDate {
    _id: string;
    tour: string | any; // Populated or ID
    startDate: string;
    endDate: string;
    totalSeats: number;
    bookedSeats: number;
    availableSeats?: number;
    priceOverride?: number;
    departureNote?: string;
    status: TourDateStatus;
}

export interface ItineraryPoint {
    text: string;
    description?: string;
}

export interface ItineraryDay {
    dayNumber: number;
    title: string;
    points: ItineraryPoint[];
}

export interface PickupPoint {
    fromCity?: string;
    toCity?: string;
    type: PickupType | string; // required
    departureTimeAndPlace?: string;
    totalDays: number; // required
    totalNights: number; // required
    priceAdjustment?: number; // optional in DTO
}

export interface Tour {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    basePrice: number;
    minAge?: number;
    maxAge?: number;
    category?: TourCategory | string;
    location?: string;
    state?: string;
    country?: string;
    highlights?: string[];
    departureOptions?: PickupPoint[];
    itinerary?: ItineraryDay[];
    inclusions?: string[];
    exclusions?: string[];
    faqs?: { question: string; answer: string }[];
    images?: string[];
    thumbnailImage?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    duration?: string;
    brochureUrl?: string;
    viewCount?: number;
    averageRating?: number;
    reviewCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export type CreateTourPayload = Omit<Tour, '_id' | 'slug' | 'duration' | 'viewCount' | 'averageRating' | 'reviewCount' | 'createdAt' | 'updatedAt'>;
export type UpdateTourPayload = Partial<CreateTourPayload>;

export type CreateTourDatePayload = Omit<TourDate, '_id' | 'tour' | 'bookedSeats' | 'availableSeats' | 'status'> & { tour: string };
export type UpdateTourDatePayload = Partial<CreateTourDatePayload> & { status?: TourDateStatus | string };
