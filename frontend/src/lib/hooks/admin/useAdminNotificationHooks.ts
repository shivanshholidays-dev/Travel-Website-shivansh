import { useMutation } from '@tanstack/react-query';
import { adminNotificationsApi } from '../../api/admin/notifications.api';

export const useAdminNotificationHooks = () => {
    const useSendBulkEmail = () => useMutation({
        mutationFn: (data: Parameters<typeof adminNotificationsApi.sendEmail>[0]) => adminNotificationsApi.sendEmail(data),
    });

    const useSendBulkWhatsApp = () => useMutation({
        mutationFn: (data: Parameters<typeof adminNotificationsApi.sendWhatsApp>[0]) => adminNotificationsApi.sendWhatsApp(data),
    });

    return {
        useSendBulkEmail,
        useSendBulkWhatsApp,
    };
};
