import axiosInstance from './axios';

export interface Notification {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type?: string;
}

export const notificationsApi = {
    getAll: (params?: { page?: number; limit?: number }) =>
        axiosInstance.get('/notifications', { params }).then((r) => r.data),

    markRead: (id: string) =>
        axiosInstance.patch(`/notifications/${id}/read`).then((r) => r.data),

    markAllRead: () =>
        axiosInstance.patch('/notifications/read-all').then((r) => r.data),

    getUnreadCount: () =>
        axiosInstance.get('/notifications/unread-count').then((r) => r.data),
};
