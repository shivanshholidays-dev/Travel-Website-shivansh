'use client';

import { useState } from 'react';
import {
    Mail,
    MailOpen,
    Search,
    Trash2,
    Star,
    MoreHorizontal,
    Filter,
    CheckCheck,
    Bell,
    ExternalLink,
    Clock
} from 'lucide-react';
import { useNotificationHooks } from '@hooks/useNotificationHooks';
import { DateUtils } from '@lib/utils/date-utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminMessagesPage() {
    const { useNotifications, useMarkRead, useMarkAllRead } = useNotificationHooks();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: response, isLoading } = useNotifications({ page, limit });
    const markReadMutation = useMarkRead();
    const markAllReadMutation = useMarkAllRead();

    // Data handling - align with backend paginate() and potential response wrapper
    const notifications = response?.data?.items || response?.items || response?.data?.notifications || response?.notifications || [];
    const meta = response?.data || response || {};
    const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

    const handleMarkRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try
        {
            await markReadMutation.mutateAsync(id);
        } catch (err)
        {
            toast.error('Failed to update notification');
        }
    };

    const handleMarkAllRead = async () => {
        try
        {
            await markAllReadMutation.mutateAsync();
            toast.success('All notifications marked as read');
        } catch (err)
        {
            toast.error('Failed to update notifications');
        }
    };

    const getIcon = (type: string) => {
        switch (type?.toUpperCase())
        {
            case 'BOOKING': return <Star size={16} color="#f5a623" fill="#f5a623" />;
            case 'PAYMENT': return <Star size={16} color="#10b981" fill="#10b981" />;
            default: return <Bell size={16} color="#1a73e8" />;
        }
    };

    if (isLoading) return <div className="p-5 text-center">Loading notifications...</div>;

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-end mb-30">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-0">System Notifications</h4>
                        <p className="text-muted small mb-0">Monitor platform activity, new bookings, and system alerts.</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0 || markAllReadMutation.isPending}
                            className="btn btn-light d-flex align-items-center gap-2"
                            style={{ borderRadius: '10px', padding: '10px 15px', fontWeight: 600, border: '1px solid #eee' }}
                        >
                            <CheckCheck size={16} /> Mark all read
                        </button>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="d-flex border-bottom p-3 align-items-center justify-content-between bg-light">
                        <div className="d-flex gap-4">
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a73e8', borderBottom: '2px solid #1a73e8', paddingBottom: '4px', cursor: 'pointer' }}>All Alerts</span>
                        </div>
                        <div className="d-flex gap-3">
                            <span className="text-muted small"><strong>{unreadCount}</strong> new notifications</span>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover mb-0" style={{ verticalAlign: 'middle' }}>
                            <tbody>
                                {notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-5 text-muted">
                                            No notifications found.
                                        </td>
                                    </tr>
                                ) : (
                                    notifications.map((n: any) => (
                                        <tr
                                            key={n._id}
                                            onClick={() => handleMarkRead(n._id, n.isRead)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: n.isRead ? '#fff' : 'rgba(26, 115, 232, 0.04)',
                                                borderBottom: '1px solid #f1f3f9',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <td className="ps-4" style={{ width: '50px' }}>
                                                {getIcon(n.type)}
                                            </td>
                                            <td style={{ width: '220px' }}>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="min-w-0">
                                                        <div style={{ fontWeight: n.isRead ? 600 : 800, fontSize: '14px', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {n.title}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', fontWeight: 700 }}>
                                                            {n.type || 'General'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {!n.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a73e8', flexShrink: 0 }} />}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <span style={{ fontWeight: n.isRead ? 400 : 600, fontSize: '14px', color: '#333' }}>
                                                            {n.message}
                                                        </span>
                                                        {n.metadata?.link && (
                                                            <Link href={n.metadata.link} className="ms-2 text-primary" style={{ fontSize: '12px', fontWeight: 600 }}>
                                                                View Details <ExternalLink size={12} className="d-inline mb-1" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ width: '150px' }}>
                                                <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '12px', fontWeight: 500 }}>
                                                    <Clock size={12} />
                                                    {DateUtils.formatToIST(n.createdAt, 'DD MMM, hh:mm A')}
                                                </div>
                                            </td>
                                            <td className="pe-4 text-end" style={{ width: '60px' }}>
                                                {!n.isRead && (
                                                    <button
                                                        className="btn btn-sm btn-light p-1"
                                                        title="Mark as read"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkRead(n._id, n.isRead);
                                                        }}
                                                    >
                                                        <MailOpen size={14} color="#1a73e8" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {meta.totalPages > 1 && (
                        <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center">
                            <span className="small text-muted">Page {page} of {meta.totalPages}</span>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                    disabled={page === meta.totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

