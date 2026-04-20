'use client';

import { useAdminLogHooks } from '@hooks/admin/useAdminLogHooks';
import Link from 'next/link';
import { DateUtils } from '@lib/utils/date-utils';
import Pagination from '@components/ui/Pagination';
import { useState } from 'react';
import { Search, Filter, Shield, Activity, Clock, User, Eye, Info, RefreshCw, X, ChevronRight, Hash } from 'lucide-react';
import Modal from '@components/ui/Modal';

export default function AdminLogsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const limit = 15;
    const { useLogsList } = useAdminLogHooks();

    // Construct params for filtering
    const params = {
        page,
        limit,
        sort: 'createdAt',
        order: 'desc',
        ...(search ? { search } : {}),
        ...(moduleFilter ? { module: moduleFilter } : {})
    };

    const { data: response, isLoading, refetch, isFetching } = useLogsList(params);

    const result = (response as any)?.data ?? response;
    const logs = result?.items || [];
    const totalPages = result?.totalPages || 1;
    const totalLogs = result?.total || 0;

    const modules = ['TOUR', 'BOOKING', 'USER', 'PAYMENT', 'COUPON', 'BLOG', 'REVIEW', 'CATEGORY', 'DASHBOARD'];

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' };
        if (action.includes('UPDATE')) return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
        if (action.includes('DELETE')) return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
        if (action.includes('LOGIN')) return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
        return { bg: '#f9fafb', text: '#374151', border: '#e5e7eb' };
    };

    return (
        <div className="togo-dashboard-booking-sec pt-40 pl-15 pr-15 pb-60" style={{ background: '#f8fafc' }}>
            <div className="container container-1440">
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <div style={{ background: '#4f46e5', color: '#fff', padding: '6px', borderRadius: '10px' }}>
                                <Shield size={20} />
                            </div>
                            <h4 className="togo-dashboard-account-title mb-0" style={{ fontSize: '24px', fontWeight: 800 }}>Security & Audit Logs</h4>
                        </div>
                        <p className="text-muted small mb-0">Monitor all administrative actions and system events for security tracking.</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className={`btn btn-white shadow-sm d-flex align-items-center gap-2 ${isFetching ? 'disabled' : ''}`}
                        style={{ borderRadius: '12px', padding: '10px 18px', fontWeight: 600, border: '1px solid #e2e8f0', background: '#fff' }}
                    >
                        <RefreshCw size={16} className={isFetching ? 'spinner-border-sm' : ''} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
                        {isFetching ? 'Refreshing...' : 'Refresh Logs'}
                    </button>
                </div>

                {/* Filters Section */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', background: '#fff' }}>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-md-5">
                                <div className="position-relative">
                                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search by action, module, or details..."
                                        className="form-control"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                        style={{
                                            paddingLeft: '48px',
                                            borderRadius: '12px',
                                            height: '48px',
                                            border: '1.5px solid #f1f5f9',
                                            fontSize: '14px',
                                            background: '#f8fafc'
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="position-relative">
                                    <Filter size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <select
                                        className="form-select"
                                        value={moduleFilter}
                                        onChange={(e) => {
                                            setModuleFilter(e.target.value);
                                            setPage(1);
                                        }}
                                        style={{
                                            paddingLeft: '48px',
                                            borderRadius: '12px',
                                            height: '48px',
                                            border: '1.5px solid #f1f5f9',
                                            fontSize: '14px',
                                            background: '#f8fafc'
                                        }}
                                    >
                                        <option value="">All Modules</option>
                                        {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-4 d-flex align-items-center justify-content-end gap-3 px-4">
                                <div className="text-end">
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Records</div>
                                    <div style={{ fontSize: '20px', color: '#0f172a', fontWeight: 800 }}>{totalLogs.toLocaleString()}</div>
                                </div>
                                <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }}></div>
                                <div className="text-end">
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Page</div>
                                    <div style={{ fontSize: '20px', color: '#4f46e5', fontWeight: 800 }}>{page}<span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>/{totalPages}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logs Table Section */}
                <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '20px', background: '#fff' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' }}>
                                <tr>
                                    <th className="ps-4 py-4" style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administrator</th>
                                    <th className="py-4" style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action & Module</th>
                                    <th className="py-4" style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity Details</th>
                                    <th className="py-4" style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Device/IP</th>
                                    <th className="py-4" style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                                    <th className="pe-4 py-4 text-end" style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                            <div className="mt-3 text-muted fw-500">Retrieving audit trails...</div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5">
                                            <div style={{ opacity: 0.15, marginBottom: '16px' }}>
                                                <Activity size={64} />
                                            </div>
                                            <div className="fw-bold text-dark h5 mb-1">No logs found</div>
                                            <div className="text-muted small">No activity matches your current filters.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log: any) => {
                                        const colors = getActionColor(log.action);
                                        return (
                                            <tr key={log._id || log.id} className="log-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}>
                                                <td className="ps-4 py-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                                            <User size={18} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{log.adminId?.name || 'Unknown Admin'}</div>
                                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{log.adminId?.email || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="mb-1">
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '4px 10px',
                                                            borderRadius: '8px',
                                                            fontSize: '11px',
                                                            fontWeight: 800,
                                                            backgroundColor: colors.bg,
                                                            color: colors.text,
                                                            border: `1px solid ${colors.border}`,
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {log.action}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-1" style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                                                        <Hash size={12} /> {log.module}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-truncate" style={{ fontSize: '13px', color: '#334155', maxWidth: '280px', fontWeight: 500 }}>
                                                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                                    </div>
                                                    {log.targetId && (
                                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {log.targetId}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{log.ipAddress || log.ip || 'Unknown IP'}</div>
                                                    <div className="text-muted" style={{ fontSize: '11px' }}>{log.userAgent ? (log.userAgent.includes('Chrome') ? 'Chrome' : log.userAgent.includes('Safari') ? 'Safari' : 'External Client') : 'System Agent'}</div>
                                                </td>
                                                <td>
                                                    <div style={{ color: '#0f172a', fontSize: '13px', fontWeight: 600 }}>
                                                        <Clock size={12} className="me-1" color="#94a3b8" />
                                                        {DateUtils.formatToIST(log.createdAt, 'DD MMM, YYYY')}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        {DateUtils.formatToIST(log.createdAt, 'hh:mm:ss A')}
                                                    </div>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="btn btn-sm btn-light p-2"
                                                        style={{ borderRadius: '10px', background: '#f1f5f9', border: 'none' }}
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} color="#475569" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="mt-40 d-flex justify-content-center">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title="System Log Details"
                size="md"
                footer={
                    <button
                        onClick={() => setSelectedLog(null)}
                        className="btn btn-dark"
                        style={{ borderRadius: '12px', padding: '10px 24px', fontWeight: 700 }}
                    >
                        Close Details
                    </button>
                }
            >
                {selectedLog && (
                    <div className="log-details-wrap">
                        <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '14px',
                                background: getActionColor(selectedLog.action).bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: getActionColor(selectedLog.action).text
                            }}>
                                <Info size={24} />
                            </div>
                            <div>
                                <h6 className="mb-0 fw-bold" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedLog.action}</h6>
                                <p className="mb-0 text-muted small">{selectedLog.module} Module Activity</p>
                            </div>
                        </div>

                        <div className="row g-4">
                            <div className="col-6">
                                <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Performed By</label>
                                <div className="d-flex align-items-center gap-2">
                                    <User size={14} color="#4f46e5" />
                                    <span className="fw-700">{selectedLog.adminId?.name || 'N/A'}</span>
                                </div>
                                <div className="text-muted small ps-4">{selectedLog.adminId?.email || 'N/A'}</div>
                            </div>
                            <div className="col-6">
                                <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Timestamp</label>
                                <div className="d-flex align-items-center gap-2">
                                    <Clock size={14} color="#4f46e5" />
                                    <span className="fw-700">{DateUtils.formatToIST(selectedLog.createdAt, 'DD MMMM YYYY')}</span>
                                </div>
                                <div className="text-muted small ps-4">{DateUtils.formatToIST(selectedLog.createdAt, 'hh:mm:ss A')} (IST)</div>
                            </div>
                            <div className="col-6">
                                <label className="text-muted small fw-bold text-uppercase mb-2 d-block">IP address</label>
                                <div className="fw-700">{selectedLog.ipAddress || selectedLog.ip || 'Unknown'}</div>
                            </div>
                            <div className="col-6">
                                <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Target Record</label>
                                <div className="fw-700" style={{ fontFamily: 'monospace', color: '#2563eb' }}>{selectedLog.targetId || 'N/A'}</div>
                            </div>
                            <div className="col-12">
                                <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Activity details</label>
                                <div
                                    className="p-3 rounded-3"
                                    style={{
                                        background: '#0f172a',
                                        color: '#cbd5e1',
                                        fontSize: '13px',
                                        fontFamily: 'monospace',
                                        maxHeight: '200px',
                                        overflow: 'auto',
                                        lineHeight: '1.6'
                                    }}
                                >
                                    <pre style={{ color: 'inherit', margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {typeof selectedLog.details === 'object' ? JSON.stringify(selectedLog.details, null, 2) : selectedLog.details}
                                    </pre>
                                </div>
                            </div>
                            <div className="col-12">
                                <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Browser User Agent</label>
                                <div className="p-3 rounded-3 small text-muted" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', wordBreak: 'break-all' }}>
                                    {selectedLog.userAgent || 'No data'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .log-row:hover {
                    background-color: #f8fafc !important;
                }
                .fw-700 { font-weight: 700; }
                .fw-800 { font-weight: 800; }
            `}</style>
        </div>
    );
}

