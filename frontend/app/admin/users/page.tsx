'use client';

import Link from 'next/link';
import { useAdminUserHooks } from '@hooks/admin/useAdminUserHooks';
import toast from 'react-hot-toast';
import {
    User,
    Shield,
    Ban,
    CheckCircle2,
    Search,
    MoreVertical,
    ExternalLink,
    Mail,
    Calendar
} from 'lucide-react';
import { DateUtils } from '@lib/utils/date-utils';
import { UserRole } from '@lib/constants/enums';
import { getGenderLabel, getStatusBadgeClass } from '@lib/utils/enum-mappings';
import Pagination from '@components/ui/Pagination';
import { TableRowSkeleton } from '@/src/components/ui/Skeleton';
import { useState } from 'react';

export default function AdminUsersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { useUsersList, useBlockUser, useUnblockUser } = useAdminUserHooks();
    const { data: response, isLoading } = useUsersList({ page, limit: 10, search });
    const blockMutation = useBlockUser();
    const unblockMutation = useUnblockUser();

    const result = (response as any)?.data ?? response;
    const users = result?.items || [];
    const totalPages = result?.totalPages || 1;

    const handleBlockToggle = async (user: any) => {
        if (user.isBlocked)
        {
            try
            {
                await unblockMutation.mutateAsync(user.id || user._id);
                toast.success('User unblocked successfully');
            } catch (err)
            {
                toast.error('Failed to unblock user');
            }
        } else
        {
            const reason = window.prompt("Reason for blocking this user (optional):");
            if (reason !== null)
            {
                try
                {
                    await blockMutation.mutateAsync({ id: user.id || user._id, reason });
                    toast.success('User blocked successfully');
                } catch (err)
                {
                    toast.error('Failed to block user');
                }
            }
        }
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-end mb-30">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-0">User Directory</h4>
                        <p className="text-muted small mb-0">Manage platform members, adjust roles, and monitor account statuses.</p>
                    </div>
                    <div className="d-flex gap-2">
                        <div className="position-relative">
                            <Search size={16} color="#aaa" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                className="form-control"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                style={{ paddingLeft: '35px', borderRadius: '10px', fontSize: '13px', width: '300px', border: '1px solid #eee' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th className="ps-4 py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Member Profile</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Contact</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Privileges</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Joined</th>
                                    <th className="pe-4 py-3 text-end" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <>
                                        <TableRowSkeleton cols={6} />
                                        <TableRowSkeleton cols={6} />
                                        <TableRowSkeleton cols={6} />
                                        <TableRowSkeleton cols={6} />
                                        <TableRowSkeleton cols={6} />
                                    </>
                                ) : !users || users.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-5 text-muted">No users found.</td></tr>
                                ) : (
                                    users.map((u: any) => (
                                        <tr key={u.id || u._id} style={{ borderBottom: '1px solid #f1f3f9' }}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f1f3f9', flexShrink: 0, overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                                        <img
                                                            src={u.avatar || u.profileImage || `https://ui-avatars.com/api/?name=${u.name || 'User'}&background=random`}
                                                            alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Link href={`/admin/users/${u.id || u._id}`} style={{ fontWeight: 800, fontSize: '14.5px', color: '#111', textDecoration: 'none' }}>
                                                            {u.name || 'Guest User'}
                                                        </Link>
                                                        <div style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>UID: {u.id?.slice(-8) || u._id?.slice(-8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3" style={{ fontSize: '13.5px', color: '#555', fontWeight: 500 }}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Mail size={14} color="#1a73e8" /> {u.email}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center gap-1">
                                                    {u.role === UserRole.ADMIN && <Shield size={14} color="#4F46E5" />}
                                                    <span style={{
                                                        display: 'inline-block', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800,
                                                        backgroundColor: u.role === UserRole.ADMIN ? '#EEF2FF' : '#F3F4F6',
                                                        color: u.role === UserRole.ADMIN ? '#4F46E5' : '#6B7280',
                                                        textTransform: 'uppercase'
                                                    }}>{u.role || 'CUSTOMER'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span style={{
                                                    display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                                    backgroundColor: u.isBlocked ? '#FFEBEE' : '#E8F5E9',
                                                    color: u.isBlocked ? '#C62828' : '#2E7D32'
                                                }}>
                                                    {u.isBlocked ? 'SUSPENDED' : 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td className="py-3" style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Calendar size={14} color="#ccc" />
                                                    {DateUtils.formatToIST(u.createdAt || u.date, 'DD MMM YYYY')}
                                                </div>
                                            </td>
                                            <td className="pe-4 py-3 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Link href={`/admin/users/${u.id || u._id}`} className="btn btn-sm btn-light p-2" title="View Profile" style={{ borderRadius: '8px' }}>
                                                        <ExternalLink size={16} color="#666" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleBlockToggle(u)}
                                                        disabled={blockMutation.isPending || unblockMutation.isPending}
                                                        className="btn btn-sm btn-light p-2 hover-bg"
                                                        title={u.isBlocked ? 'Unblock' : 'Block'}
                                                        style={{ borderRadius: '8px' }}
                                                    >
                                                        <Ban size={16} color={u.isBlocked ? '#2E7D32' : '#C62828'} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-30 d-flex justify-content-center">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            </div>
            <style jsx>{`
                .hover-bg:hover {
                    background-color: #f8f9fa !important;
                }
            `}</style>
        </div>
    );
}
