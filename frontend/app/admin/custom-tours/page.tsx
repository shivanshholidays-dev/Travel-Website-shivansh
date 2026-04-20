'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAdminCustomTourHooks } from '@lib/hooks/admin/useAdminCustomTourHooks';
import { getErrorMessage } from '@lib/utils/error-handler';
import { DateUtils } from '@lib/utils/date-utils';
import {
    Search, RefreshCw, MapPin, Users, ChevronDown, ChevronUp,
    Phone, Mail, Calendar, Tag, DollarSign, MessageSquare, ChevronLeft, ChevronRight, Save
} from 'lucide-react';

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'CLOSED'] as const;
type Status = typeof STATUS_OPTIONS[number];

const STATUS_STYLES: Record<Status, { bg: string; color: string; label: string }> = {
    NEW: { bg: '#fef3c7', color: '#92400e', label: 'New' },
    CONTACTED: { bg: '#dbeafe', color: '#1e40af', label: 'Contacted' },
    CLOSED: { bg: '#dcfce7', color: '#15803d', label: 'Closed' },
};

function StatCard({ label, value, bg, color }: { label: string; value: any; bg: string; color: string }) {
    return (
        <div className="col-6 col-md-3">
            <div style={{ background: bg, borderRadius: 16, padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color, letterSpacing: 0.8, marginBottom: 4, opacity: 0.8 }}>{label}</p>
                <h4 style={{ fontWeight: 900, color, fontSize: 26, marginBottom: 0 }}>{value}</h4>
            </div>
        </div>
    );
}

export default function AdminCustomToursPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({});
    const [pendingNotes, setPendingNotes] = useState<Record<string, string>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    const { useStats, useRequestsList, useUpdateStatus } = useAdminCustomTourHooks();
    const { data: stats } = useStats();
    const statsData = (stats as any)?.data ?? stats ?? {};

    const params = {
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        page,
        limit: 12,
    };

    const { data: response, isLoading, refetch } = useRequestsList(params);
    const updateMutation = useUpdateStatus();

    const raw = (response as any)?.data ?? response;
    const items: any[] = Array.isArray(raw?.items) ? raw.items : (Array.isArray(raw) ? raw : []);
    const total: number = raw?.total ?? 0;
    const totalPages: number = raw?.totalPages ?? 1;

    const handleReset = () => { setSearch(''); setStatusFilter(''); setPage(1); };

    const handleSave = async (id: string, currentStatus: string, currentNotes: string) => {
        const status = pendingStatus[id] ?? currentStatus;
        const adminNotes = pendingNotes[id] ?? currentNotes;
        setSavingId(id);
        try
        {
            await updateMutation.mutateAsync({ id, status, adminNotes });
            toast.success('Request updated');
            // Clear pending state
            setPendingStatus(p => { const n = { ...p }; delete n[id]; return n; });
            setPendingNotes(p => { const n = { ...p }; delete n[id]; return n; });
        } catch (err)
        {
            toast.error(getErrorMessage(err, 'Failed to update'));
        } finally
        {
            setSavingId(null);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: 40, paddingBottom: 60 }}>
            <div className="container container-1440">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 style={{ fontWeight: 900, fontSize: 28, color: '#0f172a', marginBottom: 4 }}>Custom Tour Requests</h3>
                        <span style={{ background: '#e2e8f0', color: '#475569', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
                            {total} total requests
                        </span>
                    </div>
                    <button onClick={() => refetch()} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="row g-3 mb-4">
                    <StatCard label="Total" value={statsData.total ?? '–'} bg="#eef2ff" color="#6366f1" />
                    <StatCard label="New" value={statsData.new ?? '–'} bg="#fffbeb" color="#f59e0b" />
                    <StatCard label="Contacted" value={statsData.contacted ?? '–'} bg="#eff6ff" color="#3b82f6" />
                    <StatCard label="Closed" value={statsData.closed ?? '–'} bg="#f0fdf4" color="#22c55e" />
                </div>

                {/* Filters */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #edf2f7', marginBottom: 24 }}>
                    <div className="row g-3">
                        <div className="col-lg-6">
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input className="form-control" style={{ paddingLeft: 42, borderRadius: 10, fontSize: 14, border: '1.5px solid #e2e8f0' }}
                                    placeholder="Search by name, email, phone or destination..."
                                    value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                            </div>
                        </div>
                        <div className="col-lg-3">
                            <select className="form-select" style={{ borderRadius: 10, fontSize: 14, border: '1.5px solid #e2e8f0' }}
                                value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                                <option value="">All Statuses</option>
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
                            </select>
                        </div>
                        <div className="col-lg-3">
                            <button onClick={handleReset} className="btn btn-light w-100" style={{ borderRadius: 10, fontWeight: 700, fontSize: 14 }}>Reset</button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    {['Name & Contact', 'Destination', 'Group Size', 'Tour Type', 'Budget', 'Status', 'Date', ''].map(h => (
                                        <th key={h} style={{ padding: '14px 16px', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 8 }).map((_, j) => (
                                                <td key={j} style={{ padding: '14px 16px' }}>
                                                    <div style={{ height: 16, background: '#f1f5f9', borderRadius: 4, width: j === 0 ? '80%' : '60%' }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                                            <MapPin size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                                            <p style={{ margin: 0, fontWeight: 600 }}>No requests found</p>
                                        </td>
                                    </tr>
                                ) : items.map((item: any) => {
                                    const status: Status = item.status as Status;
                                    const style = STATUS_STYLES[status] ?? STATUS_STYLES.NEW;
                                    const isExpanded = expandedId === item._id;

                                    return (
                                        <React.Fragment key={item._id}>
                                            <tr style={{ borderBottom: '1px solid #f8f9fa', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : item._id)}>
                                                {/* Name & Contact */}
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{item.name}</div>
                                                    <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>{item.email}</div>
                                                    <div style={{ fontSize: 12, color: '#64748b' }}>{item.phone}</div>
                                                </td>
                                                {/* Destination */}
                                                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <MapPin size={13} color="#f97316" />
                                                        {item.destination}
                                                    </div>
                                                </td>
                                                {/* Group Size */}
                                                <td style={{ padding: '14px 16px', fontSize: 14 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        <Users size={13} color="#64748b" />
                                                        {item.groupSize || 1}
                                                    </div>
                                                </td>
                                                {/* Tour Type */}
                                                <td style={{ padding: '14px 16px' }}>
                                                    {item.tourType ? (
                                                        <span style={{ background: '#f0f9ff', color: '#0284c7', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{item.tourType}</span>
                                                    ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                                                </td>
                                                {/* Budget */}
                                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>
                                                    {item.budget || <span style={{ color: '#cbd5e1' }}>—</span>}
                                                </td>
                                                {/* Status */}
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ background: style.bg, color: style.color, borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
                                                        {style.label}
                                                    </span>
                                                </td>
                                                {/* Date */}
                                                <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                                    {item.createdAt ? DateUtils.formatToIST(item.createdAt, 'DD MMM YYYY') : '—'}
                                                </td>
                                                {/* Expand toggle */}
                                                <td style={{ padding: '14px 16px' }}>
                                                    {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                                                </td>
                                            </tr>

                                            {/* Expanded detail row */}
                                            {isExpanded && (
                                                <tr key={`${item._id}-detail`} style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                                    <td colSpan={8} style={{ padding: '24px 24px' }}>
                                                        <div className="row g-4">
                                                            {/* Left: full details */}
                                                            <div className="col-md-7">
                                                                <h6 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Request Details</h6>
                                                                <div className="row g-2">
                                                                    {[
                                                                        { icon: <Mail size={13} />, label: 'Email', value: item.email },
                                                                        { icon: <Phone size={13} />, label: 'Phone', value: item.phone },
                                                                        { icon: <MapPin size={13} />, label: 'Destination', value: item.destination },
                                                                        { icon: <Calendar size={13} />, label: 'Travel Dates', value: item.travelDates || '—' },
                                                                        { icon: <Users size={13} />, label: 'Group Size', value: item.groupSize || 1 },
                                                                        { icon: <Tag size={13} />, label: 'Tour Type', value: item.tourType || '—' },
                                                                        { icon: <DollarSign size={13} />, label: 'Budget', value: item.budget || '—' },
                                                                    ].map(({ icon, label, value }) => (
                                                                        <div className="col-6" key={label}>
                                                                            <div style={{ background: '#fff', borderRadius: 10, padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                                                                                    {icon} {label}
                                                                                </div>
                                                                                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{value}</div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div style={{ background: '#fff', borderRadius: 10, padding: '14px', border: '1px solid #e2e8f0', marginTop: 12 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                                                                        <MessageSquare size={13} /> Special Requirements
                                                                    </div>
                                                                    <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.7 }}>{item.message}</p>
                                                                </div>

                                                                {/* Quick contact actions */}
                                                                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                                                    <a href={`mailto:${item.email}?subject=Regarding Your Custom Tour Request`}
                                                                        style={{ flex: 1, background: '#4f46e5', color: '#fff', borderRadius: 10, padding: '10px', textAlign: 'center', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                                        <Mail size={14} /> Send Email
                                                                    </a>
                                                                    <a href={`tel:${item.phone}`}
                                                                        style={{ flex: 1, background: '#22c55e', color: '#fff', borderRadius: 10, padding: '10px', textAlign: 'center', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                                        <Phone size={14} /> Call Now
                                                                    </a>
                                                                    <a href={`https://wa.me/${item.phone.replace(/\D/g, '')}?text=Hi ${item.name}, we received your custom tour request for ${item.destination}.`}
                                                                        target="_blank" rel="noopener noreferrer"
                                                                        style={{ flex: 1, background: '#16a34a', color: '#fff', borderRadius: 10, padding: '10px', textAlign: 'center', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                                        WhatsApp
                                                                    </a>
                                                                </div>
                                                            </div>

                                                            {/* Right: admin controls */}
                                                            <div className="col-md-5">
                                                                <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
                                                                    <h6 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Admin Actions</h6>

                                                                    <label style={{ fontWeight: 600, fontSize: 13, color: '#475569', marginBottom: 6, display: 'block' }}>Update Status</label>
                                                                    <select
                                                                        className="form-select mb-3"
                                                                        style={{ borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1.5px solid #e2e8f0' }}
                                                                        value={pendingStatus[item._id] ?? item.status}
                                                                        onChange={e => setPendingStatus(p => ({ ...p, [item._id]: e.target.value }))}>
                                                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
                                                                    </select>

                                                                    <label style={{ fontWeight: 600, fontSize: 13, color: '#475569', marginBottom: 6, display: 'block' }}>Admin Notes</label>
                                                                    <textarea
                                                                        rows={4}
                                                                        className="form-control mb-3"
                                                                        style={{ borderRadius: 10, fontSize: 13, border: '1.5px solid #e2e8f0', resize: 'vertical' }}
                                                                        placeholder="Internal notes (not visible to user)..."
                                                                        value={pendingNotes[item._id] ?? (item.adminNotes || '')}
                                                                        onChange={e => setPendingNotes(p => ({ ...p, [item._id]: e.target.value }))} />

                                                                    <button
                                                                        onClick={() => handleSave(item._id, item.status, item.adminNotes || '')}
                                                                        disabled={savingId === item._id}
                                                                        style={{ width: '100%', background: savingId === item._id ? '#94a3b8' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontWeight: 700, fontSize: 14, cursor: savingId === item._id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                                        <Save size={14} /> {savingId === item._id ? 'Saving…' : 'Save Changes'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #f1f3f9' }}>
                            <span style={{ fontSize: 13, color: '#888' }}>Page {page} of {totalPages} · {total} total</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: 8, padding: '6px 12px', cursor: page <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                                    <ChevronLeft size={14} /> Prev
                                </button>
                                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: 8, padding: '6px 12px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
