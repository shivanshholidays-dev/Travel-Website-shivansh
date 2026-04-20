'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useAdminTeamMemberHooks } from '@hooks/admin/useAdminTeamMemberHooks';
import { TeamMember } from '@lib/types/team-member.types';
import toast from 'react-hot-toast';
import Pagination from '@components/ui/Pagination';
import Modal from '@components/ui/Modal';
import { Trash2, Edit, Users, ToggleLeft, ToggleRight, Plus } from 'lucide-react';

export default function AdminTeamPage() {
    const [page, setPage] = useState(1);
    const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
    const limit = 12;

    const { useTeamMembersList, useDeleteTeamMember, useToggleActiveTeamMember } = useAdminTeamMemberHooks();
    const { data: response, isLoading } = useTeamMembersList({ page, limit });
    const deleteMutation = useDeleteTeamMember();
    const toggleMutation = useToggleActiveTeamMember();

    const result = (response as any)?.data ?? response;
    const members: TeamMember[] = result?.items || [];
    const totalPages = result?.totalPages || 1;
    const total = result?.total || 0;

    const handleDelete = (id: string, name: string) => setMemberToDelete({ id, name });

    const confirmDelete = async () => {
        if (!memberToDelete) return;
        try
        {
            await deleteMutation.mutateAsync(memberToDelete.id);
            toast.success('Team member deleted');
            setMemberToDelete(null);
        } catch
        {
            toast.error('Failed to delete team member');
        }
    };

    const handleToggle = async (id: string) => {
        try
        {
            await toggleMutation.mutateAsync(id);
            toast.success('Status updated');
        } catch
        {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-30">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-1" style={{ fontWeight: 900 }}>
                            Team Members
                        </h4>
                        <p className="text-muted small mb-0">{total} member{total !== 1 ? 's' : ''} total</p>
                    </div>
                    <Link
                        href="/admin/team/new"
                        className="btn d-flex align-items-center gap-2"
                        style={{ background: '#111', color: '#fff', borderRadius: '12px', padding: '10px 22px', fontWeight: 700, fontSize: '14px' }}
                    >
                        <Plus size={16} />
                        Add Member
                    </Link>
                </div>

                {/* Table */}
                <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th className="ps-4 py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', width: '40%' }}>Member</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Designation</th>
                                    <th className="py-3 text-center" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Order</th>
                                    <th className="py-3 text-center" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                    <th className="pe-4 py-3 text-end" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={5} className="text-center py-5 text-muted">Loading team members...</td></tr>
                                ) : members.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-5">
                                            <Users size={40} style={{ color: '#ddd', marginBottom: 12 }} />
                                            <p className="text-muted mb-0">No team members yet. Add your first one!</p>
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((m) => (
                                        <tr key={m._id} style={{ borderBottom: '1px solid #f1f3f9' }}>
                                            {/* Member */}
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#f1f3f9', border: '2px solid #eee' }}>
                                                        {m.image ? (
                                                            <img src={m.image} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 800, fontSize: 18 }}>
                                                                {m.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{m.name}</div>
                                                        {m.bio && (
                                                            <div style={{ fontSize: 12, color: '#888', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {m.bio}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Designation */}
                                            <td style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>{m.designation}</td>
                                            {/* Order */}
                                            <td className="text-center">
                                                <span style={{ display: 'inline-block', background: '#f3f4f6', borderRadius: 8, padding: '3px 12px', fontSize: 13, fontWeight: 700, color: '#374151' }}>
                                                    #{m.order}
                                                </span>
                                            </td>
                                            {/* Status */}
                                            <td className="text-center">
                                                <button
                                                    onClick={() => handleToggle(m._id)}
                                                    disabled={toggleMutation.isPending}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                                    title={m.isActive ? 'Click to deactivate' : 'Click to activate'}
                                                >
                                                    {m.isActive ? (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#e8f5e9', color: '#2E7D32', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                                                            <ToggleRight size={14} /> Active
                                                        </span>
                                                    ) : (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f3f4f6', color: '#6b7280', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                                                            <ToggleLeft size={14} /> Inactive
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                            {/* Actions */}
                                            <td className="pe-4 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Link
                                                        href={`/admin/team/${m._id}/edit`}
                                                        className="btn btn-sm btn-light"
                                                        style={{ fontWeight: 600, fontSize: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}
                                                    >
                                                        <Edit size={13} /> Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(m._id, m.name)}
                                                        disabled={deleteMutation.isPending}
                                                        className="btn btn-sm btn-outline-danger"
                                                        style={{ fontWeight: 600, fontSize: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}
                                                    >
                                                        <Trash2 size={13} /> Delete
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-30 d-flex justify-content-center">
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!memberToDelete}
                onClose={() => setMemberToDelete(null)}
                title="Delete Team Member"
                size="sm"
                footer={(
                    <>
                        <button
                            type="button"
                            onClick={() => setMemberToDelete(null)}
                            style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete Member'}
                        </button>
                    </>
                )}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ background: '#fef2f2', color: '#dc2626', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Trash2 size={24} />
                    </div>
                    <p style={{ margin: 0, color: '#111827', fontWeight: 700, fontSize: 16 }}>
                        Delete "<span style={{ color: '#dc2626' }}>{memberToDelete?.name}</span>"?
                    </p>
                    <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>
                        This team member will be permanently removed. This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
