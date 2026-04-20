import axiosInstance from '../axios';

export const adminNotificationsApi = {
    sendEmail: (data: { emails: string[]; subject: string; message: string; templateName?: string; templateData?: any }) =>
        axiosInstance.post('/admin/notifications/email', data).then(r => r.data),

    sendWhatsApp: (data: { phones: string[]; message: string; templateName?: string; templateData?: any }) =>
        axiosInstance.post('/admin/notifications/whatsapp', data).then(r => r.data),

    getRecent: (limit = 5) =>
        axiosInstance.get('/notifications', { params: { limit, page: 1 } }).then(r => r.data),

    markAllRead: () =>
        axiosInstance.patch('/notifications/read-all').then(r => r.data),
};
