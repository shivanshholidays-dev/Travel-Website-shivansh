'use client';

import { useState } from 'react';
import {
    Download,
    Calendar,
    BarChart3,
    TrendingUp,
    PieChart,
    Users,
    Globe,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Search
} from 'lucide-react';

export default function AdminReportsPage() {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-end mb-40">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-0">Reporting & Intelligence</h4>
                        <p className="text-muted small mb-0">Deep dive into platform analytics and export financial statements.</p>
                    </div>
                    <div className="d-flex gap-3 align-items-center">
                        <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #eee' }}>
                            <Calendar size={16} color="#1a73e8" />
                            <input
                                type="date"
                                className="border-0 small fw-bold"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                style={{ outline: 'none' }}
                            />
                            <span className="text-muted">to</span>
                            <input
                                type="date"
                                className="border-0 small fw-bold"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                style={{ outline: 'none' }}
                            />
                        </div>
                        <button className="btn btn-dark d-flex align-items-center gap-2" style={{ borderRadius: '12px', padding: '12px 24px', fontWeight: 700 }}>
                            <Download size={18} /> Export All
                        </button>
                    </div>
                </div>

                <div className="row">
                    {/* Revenue Intelligence Card */}
                    <div className="col-xl-8 mb-30">
                        <div style={{ background: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f3f9' }}>
                            <div className="d-flex justify-content-between align-items-start mb-30">
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{ padding: '12px', background: '#e8f0fe', color: '#1a73e8', borderRadius: '12px' }}>
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <h5 style={{ fontWeight: 800, margin: 0, color: '#111' }}>Financial Intelligence</h5>
                                        <p className="text-muted small mb-0">Monthly revenue distributions and profit margins.</p>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <div className="d-flex align-items-center gap-1 text-success small fw-bold mb-1">
                                        <ArrowUpRight size={14} /> +12.4%
                                    </div>
                                    <h4 style={{ fontWeight: 900, fontSize: '24px', margin: 0 }}>₹74,400</h4>
                                </div>
                            </div>

                            <div className="row g-4">
                                {[
                                    { label: 'Platform Fees', value: '₹8,240', progress: 65, color: '#1a73e8' },
                                    { label: 'Booking Volume', value: '₹66,160', progress: 82, color: '#2d8a4e' },
                                    { label: 'Coupon Usage', value: '-₹2,100', progress: 15, color: '#e55' },
                                ].map((stat) => (
                                    <div key={stat.label} className="col-md-4">
                                        <div className="p-20" style={{ background: '#f8f9fa', borderRadius: '16px', border: '1px solid #f1f3f9' }}>
                                            <p style={{ fontSize: '11px', fontWeight: 800, color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>{stat.label}</p>
                                            <h4 style={{ fontWeight: 900, marginBottom: '15px', color: '#111' }}>{stat.value}</h4>
                                            <div style={{ height: '6px', background: '#eef2f6', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${stat.progress}%`, height: '100%', background: stat.color }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="btn w-100 mt-30 d-flex align-items-center justify-content-center gap-2" style={{ background: '#f8f9fa', color: '#666', fontWeight: 700, borderRadius: '12px', padding: '14px' }}>
                                Detailed Financial Breakdown <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Insights Sidebar */}
                    <div className="col-xl-4 mb-30">
                        <div className="d-flex flex-column gap-3">
                            <div style={{ background: 'linear-gradient(135deg, #1a73e8, #4F46E5)', borderRadius: '20px', padding: '24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
                                    <TrendingUp size={120} />
                                </div>
                                <h6 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Booking Growth</h6>
                                <h3 style={{ fontWeight: 900, fontSize: '32px', marginBottom: '4px' }}>24.8%</h3>
                                <p style={{ fontSize: '12px', opacity: 0.8, fontWeight: 500 }}>Increase in tour reservations compared to the previous quarter.</p>
                                <button className="btn btn-sm px-3 py-2 mt-10" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px' }}>
                                    View Trends
                                </button>
                            </div>

                            <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>
                                <h6 style={{ fontWeight: 800, marginBottom: '20px', color: '#111' }} className="d-flex align-items-center gap-2">
                                    <PieChart size={18} color="#1a73e8" /> Demographic Split
                                </h6>
                                <div className="d-flex flex-column gap-3">
                                    {[
                                        { label: 'Europe', percent: 45, color: '#1a73e8' },
                                        { label: 'Domestic (Asia)', percent: 32, color: '#2d8a4e' },
                                        { label: 'North America', percent: 23, color: '#f5a623' },
                                    ].map((d) => (
                                        <div key={d.label}>
                                            <div className="d-flex justify-content-between mb-1">
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>{d.label}</span>
                                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#111' }}>{d.percent}%</span>
                                            </div>
                                            <div style={{ height: '6px', background: '#f1f3f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${d.percent}%`, height: '100%', background: d.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Metrics Row */}
                    <div className="col-12">
                        <div className="row">
                            {[
                                { title: 'User Conversion', value: '3.2%', icon: <Users size={20} />, status: 'up', color: '#1a73e8', bg: '#e8f0fe' },
                                { title: 'Global Reach', value: '14 Countries', icon: <Globe size={20} />, status: 'up', color: '#2d8a4e', bg: '#eaf8e7' },
                                { title: 'Average Ticket', value: '₹156.40', icon: <BarChart3 size={20} />, status: 'down', color: '#e55', bg: '#fff2f5' },
                            ].map((m) => (
                                <div key={m.title} className="col-md-4 mb-30">
                                    <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ width: '56px', height: '56px', background: m.bg, color: m.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {m.icon}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>{m.title}</p>
                                            <div className="d-flex align-items-center gap-2">
                                                <h4 style={{ fontWeight: 900, margin: 0, color: '#111' }}>{m.value}</h4>
                                                {m.status === 'up' ? <ArrowUpRight size={14} color="#2d8a4e" /> : <ArrowDownRight size={14} color="#e55" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
