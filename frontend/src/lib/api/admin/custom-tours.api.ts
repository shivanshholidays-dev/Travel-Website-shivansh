import axiosInstance from '../axios';

export const adminCustomToursApi = {
    getStats: () =>
        axiosInstance.get('/admin/custom-tours/stats').then(r => r.data),

    getAll: (params?: Record<string, any>) =>
        axiosInstance.get('/admin/custom-tours', { params }).then(r => r.data),

    getById: (id: string) =>
        axiosInstance.get(`/admin/custom-tours/${id}`).then(r => r.data),

    updateStatus: (id: string, status: string, adminNotes?: string) =>
        axiosInstance.patch(`/admin/custom-tours/${id}/status`, { status, adminNotes }).then(r => r.data),
};
