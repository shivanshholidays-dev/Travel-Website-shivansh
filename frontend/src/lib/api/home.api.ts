import axiosInstance from './axios';
import { Tour } from '../types/tour.types';
import { Blog } from '../types/blog.types';

export const homeApi = {
    homeData: () =>
        axiosInstance.get<{ success: boolean, data: any }>('/home/home-data').then(r => r.data),

    featuredTours: () =>
        axiosInstance.get<{ success: boolean, data: Tour[] }>('/home/featured-tours').then(r => r.data),

    upcomingDepartures: () =>
        axiosInstance.get<{ success: boolean, data: any[] }>('/home/upcoming-departures').then(r => r.data),

    offers: () =>
        axiosInstance.get<{ success: boolean, data: any[] }>('/home/offers').then(r => r.data),

    blogs: () =>
        axiosInstance.get<{ success: boolean, data: Blog[] }>('/home/blogs').then(r => r.data),

    toursByState: () =>
        axiosInstance.get<{ success: boolean, data: any }>('/home/tours-by-state').then(r => r.data),

    recentlyViewed: () =>
        axiosInstance.get<{ success: boolean, data: Tour[] }>('/home/recently-viewed').then(r => r.data),
};
