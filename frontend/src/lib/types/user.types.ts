import { Gender, UserRole } from '../constants/enums';

export type Role = UserRole | string;

export interface SavedTraveler {
    _id?: string;
    fullName: string;
    age: number;
    gender: Gender | string;
    idNumber: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    gender?: Gender | string;
    dateOfBirth?: string;
    country?: string;
    contactAddress?: string;
    role: Role;
    isVerified: boolean;
    isBlocked: boolean;
    lastLogin?: string;
    wishlist?: string[] | any[]; // Array of ObjectIds or Populated Tours
    savedTravelers?: SavedTraveler[];
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}
