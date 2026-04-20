import axiosInstance from './axios';
import { Setting, UpdateSettingPayload, PolicyContent } from '../types/settings.types';

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}

export const settingsApi = {
    getSettings: () =>
        axiosInstance.get<ApiResponse<Setting>>('/settings').then(r => r.data.data),

    getAdminSettings: () =>
        axiosInstance.get<ApiResponse<Setting>>('/settings/admin').then(r => r.data.data),

    getPolicies: () =>
        axiosInstance.get<ApiResponse<PolicyContent>>('/settings/policies').then(r => r.data.data),

    updateSettings: (payload: UpdateSettingPayload) =>
        axiosInstance.put<ApiResponse<Setting>>('/settings', payload).then(r => r.data.data),

    uploadQr: (formData: FormData) =>
        axiosInstance.post<ApiResponse<{ url: string }>>('/settings/upload-qr', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(r => r.data.data),

    uploadHero: (formData: FormData) =>
        axiosInstance.post<ApiResponse<{ url: string }>>('/settings/upload-hero', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(r => r.data.data),
};
