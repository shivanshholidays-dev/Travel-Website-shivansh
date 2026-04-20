'use client';

import { useState } from 'react';
import { useAdminNotificationHooks } from '@hooks/admin/useAdminNotificationHooks';
import toast from 'react-hot-toast';
import {
    Send,
    Mail,
    MessageSquare,
    Info,
    CheckCircle2,
    Users,
    AlertCircle
} from 'lucide-react';

export default function AdminBroadcastNotificationPage() {
    const { useSendBulkEmail, useSendBulkWhatsApp } = useAdminNotificationHooks();
    const emailMutation = useSendBulkEmail();
    const whatsappMutation = useSendBulkWhatsApp();

    const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
    const [recipients, setRecipients] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!recipients.trim() || !message.trim())
        {
            return toast.error('Recipients and Message are required');
        }

        const recipientList = recipients.split(',').map(r => r.trim()).filter(r => r);

        try
        {
            if (channel === 'email')
            {
                if (!subject.trim()) return toast.error('Subject is required for emails');
                await emailMutation.mutateAsync({
                    emails: recipientList,
                    subject,
                    message
                });
                toast.success('Emails sent successfully');
            } else
            {
                await whatsappMutation.mutateAsync({
                    phones: recipientList,
                    message
                });
                toast.success('WhatsApp messages sent successfully');
            }

            // Reset form on success
            setRecipients('');
            setSubject('');
            setMessage('');
        } catch (err: any)
        {
            toast.error(err.response?.data?.message || `Failed to send ${channel} messages`);
        }
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="mb-30">
                    <h4 className="togo-dashboard-account-title mb-0">Broadcast Center</h4>
                    <p className="text-muted mt-2">Send announcements, offers, or alerts to multiple users simultaneously.</p>
                </div>

                <div className="row">
                    <div className="col-lg-8">
                        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9' }}>

                            {/* Channel Selection */}
                            <div className="row g-3 mb-30 border-bottom pb-30">
                                <div className="col-sm-6">
                                    <div
                                        onClick={() => setChannel('email')}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            border: channel === 'email' ? '2px solid #1a73e8' : '2px solid #f1f3f9',
                                            background: channel === 'email' ? '#f0f7ff' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div style={{ padding: '10px', background: channel === 'email' ? '#1a73e8' : '#f1f3f9', color: channel === 'email' ? '#fff' : '#666', borderRadius: '10px' }}>
                                                <Mail size={20} />
                                            </div>
                                            {channel === 'email' && <CheckCircle2 size={18} color="#1a73e8" />}
                                        </div>
                                        <h6 style={{ fontWeight: 700, margin: '10px 0 4px', color: channel === 'email' ? '#1a73e8' : '#333' }}>Email Broadcast</h6>
                                        <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Send HTML formatted emails to multiple addresses.</p>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div
                                        onClick={() => setChannel('whatsapp')}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            border: channel === 'whatsapp' ? '2px solid #2d8a4e' : '2px solid #f1f3f9',
                                            background: channel === 'whatsapp' ? '#f0fff4' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div style={{ padding: '10px', background: channel === 'whatsapp' ? '#2d8a4e' : '#f1f3f9', color: channel === 'whatsapp' ? '#fff' : '#666', borderRadius: '10px' }}>
                                                <MessageSquare size={20} />
                                            </div>
                                            {channel === 'whatsapp' && <CheckCircle2 size={18} color="#2d8a4e" />}
                                        </div>
                                        <h6 style={{ fontWeight: 700, margin: '10px 0 4px', color: channel === 'whatsapp' ? '#2d8a4e' : '#333' }}>WhatsApp Broadcast</h6>
                                        <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Direct instant messaging via official WhatsApp API.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-24">
                                    <label className="form-label font-bold mb-10 d-flex align-items-center gap-2">
                                        <Users size={16} />
                                        Recipients ({channel === 'email' ? 'Email Addresses' : 'Phone Numbers'})
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        placeholder={channel === 'email' ? "user1@example.com, user2@example.com" : "+919876543210, +918765432109"}
                                        value={recipients}
                                        onChange={(e) => setRecipients(e.target.value)}
                                        style={{ borderRadius: '10px', padding: '15px', fontSize: '14px', border: '1px solid #ddd' }}
                                    />
                                    <div className="mt-10 d-flex align-items-center gap-2 text-muted" style={{ fontSize: '11px' }}>
                                        <Info size={14} /> Use commas to separate multiple {channel === 'email' ? 'emails' : 'phone numbers'}.
                                    </div>
                                </div>

                                {channel === 'email' && (
                                    <div className="mb-24">
                                        <label className="form-label font-bold mb-10">Email Subject</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="Enter compelling subject line..."
                                            style={{ borderRadius: '10px', padding: '12px', fontSize: '14px', border: '1px solid #ddd' }}
                                        />
                                    </div>
                                )}

                                <div className="mb-30">
                                    <label className="form-label font-bold mb-10">Message Content</label>
                                    <textarea
                                        className="form-control"
                                        rows={6}
                                        placeholder="Compose your broadcast message here..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        style={{ borderRadius: '10px', padding: '15px', fontSize: '14px', border: '1px solid #ddd' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                                    disabled={emailMutation.isPending || whatsappMutation.isPending}
                                    style={{
                                        padding: '14px',
                                        borderRadius: '10px',
                                        background: channel === 'email' ? '#1a73e8' : '#2d8a4e',
                                        border: 'none',
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        opacity: (emailMutation.isPending || whatsappMutation.isPending) ? 0.7 : 1
                                    }}
                                >
                                    {(emailMutation.isPending || whatsappMutation.isPending) ? (
                                        <>Executing...</>
                                    ) : (
                                        <><Send size={18} /> Launch {channel === 'email' ? 'Email' : 'WhatsApp'} Campaign</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="col-lg-4 mt-4 mt-lg-0">
                        <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '16px', border: '1px solid #eee' }}>
                            <h6 className="mb-20 d-flex align-items-center gap-2" style={{ fontWeight: 700 }}>
                                <AlertCircle size={18} color="#1a73e8" />
                                Broadcast Best Practices
                            </h6>
                            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
                                <li className="mb-20 d-flex gap-3">
                                    <div style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>1</div>
                                    <span>Maintain a clear and concise subject line to avoid spam filters.</span>
                                </li>
                                <li className="mb-20 d-flex gap-3">
                                    <div style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>2</div>
                                    <span>Phone numbers must include country code (e.g., <strong>+91</strong> for India).</span>
                                </li>
                                <li className="mb-20 d-flex gap-3">
                                    <div style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>3</div>
                                    <span>Variable placeholders are coming soon. For now, use generic greetings.</span>
                                </li>
                                <li className="d-flex gap-3">
                                    <div style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>4</div>
                                    <span>Review all recipients carefully before hitting the "Launch" button.</span>
                                </li>
                            </ul>

                            <div className="mt-30 p-20" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eef2f6' }}>
                                <h6 style={{ fontSize: '12px', fontWeight: 800, color: '#111', textTransform: 'uppercase', marginBottom: '10px' }}>Current Limits</h6>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span style={{ fontSize: '12px', color: '#666' }}>Daily Email Limit</span>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#2d8a4e' }}>94% left</span>
                                </div>
                                <div style={{ height: '6px', background: '#f1f3f9', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: '6%', height: '100%', background: '#2d8a4e' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
