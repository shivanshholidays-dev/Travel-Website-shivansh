import { NotificationType as NotificationTypeEnum } from '../constants/enums';
import { User } from './user.types';

export type NotificationType = NotificationTypeEnum | string;

export interface Notification {
    _id: string;
    user: User | string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    readAt?: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
}
