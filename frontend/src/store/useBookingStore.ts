import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Gender } from '@lib/constants/enums';

export interface BookingSelection {
    tourId: string;
    tourDateId: string;
    pickupOptionIndex: number;
    travelerCount: number;
}

export interface TravelerInfo {
    fullName: string;
    age: number;
    gender: Gender | string;
    phone?: string;
    idNumber?: string;
}

export interface PricingBreakdown {
    baseAmount: number;
    perPersonPrice: number;
    subtotal: number;
    couponDiscount: number;
    taxAmount: number;
    totalAmount: number;
    appliedCoupon: any | null;
    pricingSummary?: string;
}

interface BookingState {
    selection: BookingSelection | null;
    travelers: TravelerInfo[];
    pricing: PricingBreakdown | null;
    currentBookingId: string | null;

    // Actions
    setSelection: (selection: BookingSelection) => void;
    setTravelers: (travelers: TravelerInfo[]) => void;
    setPricing: (pricing: PricingBreakdown) => void;
    setBookingId: (id: string) => void;
    resetBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set) => ({
            selection: null,
            travelers: [],
            pricing: null,
            currentBookingId: null,

            setSelection: (selection) => set({ selection }),
            setTravelers: (travelers) => set({ travelers }),
            setPricing: (pricing) => set({ pricing }),
            setBookingId: (currentBookingId) => set({ currentBookingId }),
            resetBooking: () => set({
                selection: null,
                travelers: [],
                pricing: null,
                currentBookingId: null
            }),
        }),
        {
            name: 'booking-storage',
        }
    )
);
