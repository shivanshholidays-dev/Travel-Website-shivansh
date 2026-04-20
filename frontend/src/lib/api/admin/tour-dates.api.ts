import axiosInstance from '../axios';
import { TourDate, CreateTourDatePayload, UpdateTourDatePayload } from '../../types/tour.types';

export const adminTourDatesApi = {
    getByTour: (tourId: string) =>
        axiosInstance.get<TourDate[]>(`/admin/tour-dates/${tourId}`).then(r => r.data),

    add: (data: CreateTourDatePayload) =>
        axiosInstance.post<TourDate>(`/admin/tour-dates`, data).then(r => r.data),

    update: (dateId: string, data: UpdateTourDatePayload) =>
        axiosInstance.patch<TourDate>(`/admin/tour-dates/${dateId}`, data).then(r => r.data),

    delete: (dateId: string) =>
        axiosInstance.delete(`/admin/tour-dates/${dateId}`).then(r => r.data),
};
