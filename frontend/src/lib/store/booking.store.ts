import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PickupPoint, TourDate } from '@lib/types/tour.types';
import { BookingTraveler } from '@lib/types/booking.types';
import { Gender } from '@lib/constants/enums';

export interface BookingSelection {
    tourId: string;
    tourSlug: string;
    tourTitle: string;
    tourThumbnail?: string;
    tourDateId: string;
    pickupOptionIndex: number;
    travelerCount: number;
    // Computed labels for display
    selectedDate?: TourDate;
    selectedPickup?: PickupPoint;
}

export interface BookingPricing {
    baseAmount: number;
    perPersonPrice: number;
    subtotal: number;
    couponDiscount: number;
    taxAmount: number;
    taxRate: number;
    totalAmount: number;
    appliedCoupon: string | null;
    pickupOption?: PickupPoint;
    pricingSummary?: string;
}

export interface BookingStore {
    // Selection state
    selection: BookingSelection | null;
    travelers: Omit<BookingTraveler, '_id'>[];
    contactEmail: string;
    contactPhone: string;
    additionalRequests: string;
    couponCode: string;
    pricing: BookingPricing | null;
    bookingId: string | null;
    bookingNumber: string | null;
    paymentType: 'FULL' | 'PARTIAL';
    selectedPercentage: 25 | 50 | 75 | 100;
    partialAmount: number;

    // Actions
    setSelection: (selection: BookingSelection) => void;
    setTravelers: (travelers: Omit<BookingTraveler, '_id'>[]) => void;
    setContactDetails: (email: string, phone: string) => void;
    setAdditionalRequests: (requests: string) => void;
    setCouponCode: (code: string) => void;
    setPricing: (pricing: BookingPricing) => void;
    setBookingResult: (bookingId: string, bookingNumber: string) => void;
    setPaymentType: (type: 'FULL' | 'PARTIAL', percentage: 25 | 50 | 75 | 100, amount: number) => void;
    reset: () => void;
}

const defaultTraveler = (): Omit<BookingTraveler, '_id'> => ({
    fullName: '',
    age: 18,
    gender: Gender.MALE,
    phone: '',
    idNumber: '',
});

export const useBookingStore = create<BookingStore>()(
    persist(
        (set) => ({
            selection: null,
            travelers: [defaultTraveler()],
            contactEmail: '',
            contactPhone: '',
            additionalRequests: '',
            couponCode: '',
            pricing: null,
            bookingId: null,
            bookingNumber: null,
            paymentType: 'FULL',
            selectedPercentage: 100,
            partialAmount: 0,

            setSelection: (selection) =>
                set((state) => {
                    // Re-initialize travelers array when count changes
                    const count = selection.travelerCount;
                    const current = state.travelers;
                    let travelers = current.slice(0, count);
                    while (travelers.length < count)
                    {
                        travelers.push(defaultTraveler());
                    }
                    // Reset stale booking IDs when starting a fresh selection
                    return {
                        selection,
                        travelers,
                        bookingId: null,
                        bookingNumber: null,
                        pricing: null, // Also reset stale pricing
                        paymentType: 'FULL',
                        selectedPercentage: 100,
                        partialAmount: 0
                    };
                }),

            setTravelers: (travelers) => set({ travelers }),

            setContactDetails: (email, phone) =>
                set({ contactEmail: email, contactPhone: phone }),

            setAdditionalRequests: (requests) =>
                set({ additionalRequests: requests }),

            setCouponCode: (code) => set({ couponCode: code }),

            setPricing: (pricing) => set({ pricing }),

            setBookingResult: (bookingId, bookingNumber) =>
                set({ bookingId, bookingNumber }),

            setPaymentType: (type, percentage, amount) =>
                set({ paymentType: type, selectedPercentage: percentage, partialAmount: amount }),

            reset: () =>
                set({
                    selection: null,
                    travelers: [defaultTraveler()],
                    contactEmail: '',
                    contactPhone: '',
                    additionalRequests: '',
                    couponCode: '',
                    pricing: null,
                    bookingId: null,
                    bookingNumber: null,
                    paymentType: 'FULL',
                    selectedPercentage: 100,
                    partialAmount: 0
                }),
        }),
        {
            name: 'booking-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
