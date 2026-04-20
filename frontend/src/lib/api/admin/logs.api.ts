import axiosInstance from '../axios';

export interface AdminLog {
    _id: string;
    adminId: any;
    action: string;
    details: string;
    createdAt: string;
}

export const adminLogsApi = {
    getAll: (params?: Record<string, any>) =>
        axiosInstance.get<{ data: AdminLog[], meta: any }>('/admin/logs', { params }).then(r => r.data),
};
