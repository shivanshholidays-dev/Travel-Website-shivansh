'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCustomTourHooks } from '@lib/hooks/useCustomTourHooks';

const TOUR_TYPES = ['Adventure', 'Family', 'Honeymoon', 'Spiritual', 'Wildlife', 'Other'];
const BUDGETS = ['Under ₹25,000', '₹25k – ₹50k', '₹50k – ₹1L', 'Above ₹1L'];

const INITIAL = {
    name: '', email: '', phone: '', destination: '',
    travelDates: '', groupSize: '2', budget: '', tourType: '', message: '',
};

export default function HomeCustomTourSection() {
    const [form, setForm] = useState(INITIAL);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    const { useSubmitRequest } = useCustomTourHooks();
    const submitMutation = useSubmitRequest();

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Required';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
        if (!form.phone.trim()) e.phone = 'Required';
        if (!form.destination.trim()) e.destination = 'Required';
        if (!form.message.trim()) e.message = 'Required';
        return e;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const handleSubmit = async (evt: React.FormEvent) => {
        evt.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        try
        {
            await submitMutation.mutateAsync({ ...form, groupSize: Number(form.groupSize) || 1 });
            setSuccess(true);
            setForm(INITIAL);
        } catch
        {
            toast.error('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="togo-faq-sec fix pt-60 pb-0" style={{ background: 'transparent' }}>
            <div className="container container-1440">

                {/* Section Heading */}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="togo-faq-heading text-center mb-50">
                            <span className="togo-section-subtitle fade-anim" data-delay=".3">Plan Your Trip</span>
                            <h3 className="togo-section-title mb-15 fade-anim" data-delay=".5">
                                Request a Custom Tour
                            </h3>
                            <div className="togo-faq-text fade-anim" data-delay=".7">
                                <p>
                                    Can&apos;t find the perfect trip? Tell us your dream destination and we&apos;ll<br />
                                    craft a completely personalised itinerary just for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {success ? (
                    <div className="row justify-content-center">
                        <div className="col-lg-6 text-center">
                            <div style={{ background: '#fff', borderRadius: 20, padding: '50px 30px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FD4621', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <h4 style={{ fontWeight: 800, color: '#111', marginBottom: 12 }}>Request Received! 🎉</h4>
                                <p style={{ color: '#666', marginBottom: 28 }}>Our travel experts will contact you within 24 hours with a personalised itinerary.</p>
                                <button onClick={() => setSuccess(false)} className="togo-btn-primary">Submit Another</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="row align-items-start fade-anim" data-delay=".5">
                        {/* ── Left: Form ── */}
                        <div className="col-lg-8 mb-4 mb-lg-0">
                            <div className="togo-custom-form-card" style={{ borderRadius: 20 }}>
                                <form onSubmit={handleSubmit} noValidate>

                                    {/* Row 1 – Personal */}
                                    <div className="row g-3 mb-20">
                                        <div className="col-md-4">
                                            <label className="togo-label">Full Name *</label>
                                            <input
                                                type="text" name="name" value={form.name} onChange={handleChange}
                                                placeholder="Your full name"
                                                className={`togo-input${errors.name ? ' togo-input-error' : ''}`}
                                            />
                                            {errors.name && <span className="togo-error-msg">{errors.name}</span>}
                                        </div>
                                        <div className="col-md-4">
                                            <label className="togo-label">Email Address *</label>
                                            <input
                                                type="email" name="email" value={form.email} onChange={handleChange}
                                                placeholder="you@example.com"
                                                className={`togo-input${errors.email ? ' togo-input-error' : ''}`}
                                            />
                                            {errors.email && <span className="togo-error-msg">{errors.email}</span>}
                                        </div>
                                        <div className="col-md-4">
                                            <label className="togo-label">Phone Number *</label>
                                            <input
                                                type="tel" name="phone" value={form.phone} onChange={handleChange}
                                                placeholder="+91 98765 43210"
                                                className={`togo-input${errors.phone ? ' togo-input-error' : ''}`}
                                            />
                                            {errors.phone && <span className="togo-error-msg">{errors.phone}</span>}
                                        </div>
                                    </div>

                                    {/* Row 2 – Trip */}
                                    <div className="row g-3 mb-20">
                                        <div className="col-md-5">
                                            <label className="togo-label">Destination *</label>
                                            <input
                                                type="text" name="destination" value={form.destination} onChange={handleChange}
                                                placeholder="e.g. Rajasthan, Ladakh, Goa..."
                                                className={`togo-input${errors.destination ? ' togo-input-error' : ''}`}
                                            />
                                            {errors.destination && <span className="togo-error-msg">{errors.destination}</span>}
                                        </div>
                                        <div className="col-md-4">
                                            <label className="togo-label">Travel Dates</label>
                                            <input
                                                type="text" name="travelDates" value={form.travelDates} onChange={handleChange}
                                                placeholder="e.g. Mar 2025 or flexible"
                                                className="togo-input"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="togo-label">Group Size</label>
                                            <input
                                                type="number" name="groupSize" value={form.groupSize} onChange={handleChange}
                                                min={1} max={100}
                                                className="togo-input"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3 – Tour Type chips */}
                                    <div className="mb-20">
                                        <label className="togo-label">Tour Type</label>
                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                            {TOUR_TYPES.map(t => (
                                                <button
                                                    key={t} type="button"
                                                    onClick={() => setForm(p => ({ ...p, tourType: p.tourType === t ? '' : t }))}
                                                    style={{
                                                        padding: '7px 16px', borderRadius: 30, fontSize: 13, fontWeight: 600,
                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                        border: form.tourType === t ? '2px solid #FD4621' : '2px solid #E8E8E8',
                                                        background: form.tourType === t ? '#FD4621' : '#fff',
                                                        color: form.tourType === t ? '#fff' : '#555',
                                                    }}
                                                >{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Row 4 – Budget chips */}
                                    <div className="mb-20">
                                        <label className="togo-label">Budget (per person)</label>
                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                            {BUDGETS.map(b => (
                                                <button
                                                    key={b} type="button"
                                                    onClick={() => setForm(p => ({ ...p, budget: p.budget === b ? '' : b }))}
                                                    style={{
                                                        padding: '7px 16px', borderRadius: 30, fontSize: 13, fontWeight: 600,
                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                        border: form.budget === b ? '2px solid #FD4621' : '2px solid #E8E8E8',
                                                        background: form.budget === b ? '#FD4621' : '#fff',
                                                        color: form.budget === b ? '#fff' : '#555',
                                                    }}
                                                >{b}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Row 5 – Message */}
                                    <div className="mb-25">
                                        <label className="togo-label">Special Requirements *</label>
                                        <textarea
                                            name="message" value={form.message} onChange={handleChange} rows={4}
                                            placeholder="Tell us about your dream trip — occasions, activities, dietary needs, accessibility requirements..."
                                            className={`togo-input${errors.message ? ' togo-input-error' : ''}`}
                                            style={{ resize: 'vertical', lineHeight: 1.6, paddingTop: 12 , height : "100px" }}
                                        />
                                        {errors.message && <span className="togo-error-msg">{errors.message}</span>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitMutation.isPending}
                                        className="togo-btn-primary"
                                        style={{ width: '100%', fontSize: 16, padding: '14px', opacity: submitMutation.isPending ? 0.7 : 1 }}
                                    >
                                        {submitMutation.isPending ? 'Sending Request…' : 'Submit Custom Tour Request →'}
                                    </button>

                                    <p style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 14, marginBottom: 0 }}>
                                        No commitment · We respond within 24 hours · Free consultation
                                    </p>
                                </form>
                            </div>
                        </div>

                        {/* ── Right: Info Card (same style as FAQ card) ── */}
                        <div className="col-lg-4 mt-4 mt-lg-0">
                            <div className="fade-anim" data-delay=".7" style={{ background: '#fff', borderRadius: 20, padding: '40px', boxShadow: '0 6px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
                                <div style={{ marginBottom: 20, width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff5f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src="/assets/img/banner/home-3/message-icon.svg" alt="Custom Tour" style={{ width: 32 }} />
                                    </div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left', width: '100%' }}>
                                    <h4 style={{ fontWeight: 800, fontSize: 22, color: '#111', marginBottom: 12, textAlign: 'center' }}>Want to talk first?</h4>
                                    <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, marginBottom: 24, textAlign: 'center' }}>Our travel experts are ready to help you plan the perfect trip tailored to your budget and preferences.</p>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                                        {['100% Customised Itinerary', 'Best Price Guarantee', 'Dedicated Travel Expert', '24/7 Support During Trip'].map(f => (
                                            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#444', fontWeight: 500, justifyContent: 'flex-start' }}>
                                                <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#FD4621', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <div style={{ marginTop: 'auto' }}>
                                        <Link className="togo-btn-primary" href="/contact" style={{ width: '100%', display: 'block', padding: '14px', fontSize: 16, textAlign: 'center' }}>Contact Us</Link>
                                    </div>
                                </div>
                            </div>

                            {/* Mini trust badges */}
                            <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginTop: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                <div className="row text-center g-0">
                                    {[['500+', 'Happy Travellers'], ['200+', 'Custom Tours Done'], ['4.9★', 'Average Rating']].map(([val, lbl]) => (
                                        <div className="col-4" key={lbl}>
                                            <div style={{ fontSize: 18, fontWeight: 800, color: '#FD4621' }}>{val}</div>
                                            <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginTop: 2 }}>{lbl}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <style dangerouslySetInnerHTML={{
                    __html: `
                        .togo-custom-form-card { background: #fff; padding: 40px; box-shadow: 0 6px 30px rgba(0,0,0,0.05); }
                        @media (max-width: 768px) { .togo-custom-form-card { padding: 24px; } }
                        .togo-label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 7px; }
                        .togo-input {
                            width: 100%; padding: 11px 16px; border-radius: 8px;
                            border: 1.5px solid #E8E8E8; font-size: 14px; color: #111;
                            background: transparent; outline: none; transition: border 0.2s;
                            display: block;
                        }
                        .togo-input:focus { border-color: #FD4621; }
                        .togo-input-error { border-color: #FD4621 !important; }
                        textarea.togo-input { font-family: inherit; }
                        .togo-error-msg { font-size: 11px; color: #FD4621; margin-top: 4px; display: block; }
                    `}} />
            </div>
        </div>
    );
}
