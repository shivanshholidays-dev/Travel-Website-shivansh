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

export default function CustomTourPage() {
    const [form, setForm] = useState(INITIAL);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    const { useSubmitRequest } = useCustomTourHooks();
    const submitMutation = useSubmitRequest();

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
        if (!form.phone.trim()) e.phone = 'Phone is required';
        if (!form.destination.trim()) e.destination = 'Destination is required';
        if (!form.message.trim()) e.message = 'Please describe your requirements';
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
        <>
            {/* ── Page Banner ── */}
            <div
                className="togo-breadcrumb-section"
                style={{
                    backgroundImage: 'url(/assets/img/banner/home-10/megamenu-1.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    padding: '100px 0 80px',
                }}
            >
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)' }} />
                <div className="container container-1440" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="text-center text-white">
                        <span
                            style={{
                                display: 'inline-block', background: '#FD4621', color: '#fff',
                                borderRadius: 30, padding: '5px 18px', fontSize: 13,
                                fontWeight: 700, letterSpacing: 1, marginBottom: 16,
                                textTransform: 'uppercase',
                            }}
                        >
                            Tailor-Made Travel
                        </span>
                        <h1 style={{ fontWeight: 900, fontSize: 'clamp(32px,5vw,54px)', color: '#fff', marginBottom: 16, lineHeight: 1.15 }}>
                            Design Your Dream Tour
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, maxWidth: 540, margin: '0 auto 24px' }}>
                            Can&apos;t find the perfect trip? We&apos;ll craft a completely personalised itinerary just for you.
                        </p>
                        {/* Breadcrumb */}
                        <nav style={{ display: 'flex', justifyContent: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Home</Link>
                            <span>›</span>
                            <span style={{ color: '#FD4621', fontWeight: 600 }}>Custom Tour</span>
                        </nav>
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="togo-contact-sec pt-60 pb-80" style={{ background: '#F8F9FA' }}>
                <div className="container container-1440">

                    {/* Trust Stats Row */}
                    <div className="row g-3 mb-50 justify-content-center">
                        {[
                            { icon: '🗺️', val: '500+', lbl: 'Happy Travellers' },
                            { icon: '✨', val: '200+', lbl: 'Custom Tours Done' },
                            { icon: '⭐', val: '4.9 / 5', lbl: 'Average Rating' },
                            { icon: '⚡', val: '24HR', lbl: 'Response Time' },
                        ].map(({ icon, val, lbl }) => (
                            <div className="col-6 col-md-3" key={lbl}>
                                <div style={{ background: '#fff', borderRadius: 16, padding: '22px 18px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
                                    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                                    <div style={{ fontWeight: 900, fontSize: 22, color: '#FD4621' }}>{val}</div>
                                    <div style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{lbl}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {success ? (
                        <div className="row justify-content-center">
                            <div className="col-lg-6">
                                <div style={{ background: '#fff', borderRadius: 24, padding: '60px 40px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.07)' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FD4621', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </div>
                                    <h3 style={{ fontWeight: 800, color: '#111', marginBottom: 14 }}>Request Received! 🎉</h3>
                                    <p style={{ color: '#666', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
                                        Thank you! Our travel experts will review your request and contact you within <strong>24 hours</strong> with a personalised itinerary.
                                    </p>
                                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                                        <Link href="/" className="togo-btn-primary">Back to Home</Link>
                                        <button onClick={() => setSuccess(false)} className="togo-btn-secondary" style={{ cursor: 'pointer' }}>Submit Another</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4 align-items-start">

                            {/* ── Left: Form ── */}
                            <div className="col-lg-8">
                                <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(24px,4vw,48px)', boxShadow: '0 6px 30px rgba(0,0,0,0.05)' }}>

                                    <h4 style={{ fontWeight: 800, color: '#111', marginBottom: 6 }}>Tell us about your dream trip</h4>
                                    <p style={{ color: '#888', fontSize: 14, marginBottom: 30 }}>Fill in the form below — all required fields are marked with *</p>

                                    <form onSubmit={handleSubmit} noValidate>

                                        {/* Section label */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FD4621', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>1</div>
                                            <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Personal Information</span>
                                        </div>

                                        <div className="row g-3 mb-30">
                                            <div className="col-md-4">
                                                <label className="ct-label">Full Name *</label>
                                                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className={`ct-input${errors.name ? ' ct-input-err' : ''}`} />
                                                {errors.name && <span className="ct-err">{errors.name}</span>}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="ct-label">Email Address *</label>
                                                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={`ct-input${errors.email ? ' ct-input-err' : ''}`} />
                                                {errors.email && <span className="ct-err">{errors.email}</span>}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="ct-label">Phone Number *</label>
                                                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className={`ct-input${errors.phone ? ' ct-input-err' : ''}`} />
                                                {errors.phone && <span className="ct-err">{errors.phone}</span>}
                                            </div>
                                        </div>

                                        {/* Section 2 */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FD4621', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>2</div>
                                            <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Trip Details</span>
                                        </div>

                                        <div className="row g-3 mb-30">
                                            <div className="col-md-5">
                                                <label className="ct-label">Destination *</label>
                                                <input type="text" name="destination" value={form.destination} onChange={handleChange} placeholder="e.g. Rajasthan, Ladakh, Goa..." className={`ct-input${errors.destination ? ' ct-input-err' : ''}`} />
                                                {errors.destination && <span className="ct-err">{errors.destination}</span>}
                                            </div>
                                            <div className="col-md-4">
                                                <label className="ct-label">Travel Dates</label>
                                                <input type="text" name="travelDates" value={form.travelDates} onChange={handleChange} placeholder="e.g. Mar 2025 or flexible" className="ct-input" />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="ct-label">Group Size</label>
                                                <input type="number" name="groupSize" value={form.groupSize} onChange={handleChange} min={1} max={200} className="ct-input" />
                                            </div>
                                        </div>

                                        {/* Section 3 */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FD4621', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>3</div>
                                            <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Preferences</span>
                                        </div>

                                        <div className="mb-25">
                                            <label className="ct-label">Tour Type</label>
                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                {TOUR_TYPES.map(t => (
                                                    <button key={t} type="button" onClick={() => setForm(p => ({ ...p, tourType: p.tourType === t ? '' : t }))}
                                                        style={{ padding: '7px 18px', borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: form.tourType === t ? '2px solid #FD4621' : '2px solid #E8E8E8', background: form.tourType === t ? '#FD4621' : '#fff', color: form.tourType === t ? '#fff' : '#555' }}>
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-30">
                                            <label className="ct-label">Budget Range (per person)</label>
                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                {BUDGETS.map(b => (
                                                    <button key={b} type="button" onClick={() => setForm(p => ({ ...p, budget: p.budget === b ? '' : b }))}
                                                        style={{ padding: '7px 18px', borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: form.budget === b ? '2px solid #FD4621' : '2px solid #E8E8E8', background: form.budget === b ? '#FD4621' : '#fff', color: form.budget === b ? '#fff' : '#555' }}>
                                                        {b}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Section 4 */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FD4621', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>4</div>
                                            <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Special Requirements *</span>
                                        </div>

                                        <div className="mb-30">
                                            <textarea name="message" value={form.message} onChange={handleChange} rows={15}
                                                placeholder="Tell us about your dream trip — special occasions, places you'd love to visit, activities, dietary preferences, accessibility needs, or anything else..."
                                                className={`ct-input${errors.message ? ' ct-input-err' : ''}`}
                                                style={{ resize: 'vertical', lineHeight: 1.7 , height: '150px'}} />
                                            {errors.message && <span className="ct-err">{errors.message}</span>}
                                        </div>

                                        <button type="submit" disabled={submitMutation.isPending} className="togo-btn-primary"
                                            style={{ width: '100%', fontSize: 16, padding: '15px', opacity: submitMutation.isPending ? 0.7 : 1 }}>
                                            {submitMutation.isPending ? 'Sending your request…' : 'Submit Custom Tour Request →'}
                                        </button>
                                        <p style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 14, marginBottom: 0 }}>
                                            No commitment required · We respond within 24 hours · 100% free consultation
                                        </p>
                                    </form>
                                </div>
                            </div>

                            {/* ── Right: Why Choose Us Card ── */}
                            <div className="col-lg-4">
                                {/* Info card */}
                                <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', boxShadow: '0 6px 30px rgba(0,0,0,0.05)', marginBottom: 20 }}>
                                    <h5 style={{ fontWeight: 800, color: '#111', marginBottom: 20 }}>Why Choose a Custom Tour?</h5>
                                    {[
                                        { icon: '🗺️', title: '100% Personalised', desc: 'Every detail crafted around your preferences' },
                                        { icon: '💰', title: 'Best Price', desc: 'We negotiate the best deals for you' },
                                        { icon: '👨‍💼', title: 'Dedicated Expert', desc: 'A travel expert assigned just to your trip' },
                                        { icon: '📞', title: '24/7 Support', desc: 'Round-the-clock assistance during your trip' },
                                    ].map(({ icon, title, desc }) => (
                                        <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF1EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 3 }}>{title}</div>
                                                <div style={{ fontSize: 13, color: '#888' }}>{desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Contact shortcuts */}
                                <div style={{ background: '#fff', borderRadius: 20, padding: '28px', boxShadow: '0 6px 30px rgba(0,0,0,0.05)', marginBottom: 20 }}>
                                    <h6 style={{ fontWeight: 800, color: '#111', marginBottom: 16 }}>Prefer to talk directly?</h6>
                                    <Link href="/contact" className="togo-btn-primary" style={{ display: 'block', textAlign: 'center', marginBottom: 12 }}>
                                        📩 Send Us a Message
                                    </Link>
                                    <Link href="/" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 8, border: '1.5px solid #E8E8E8', fontWeight: 600, fontSize: 14, color: '#444', textDecoration: 'none' }}>
                                        ← Back to Home
                                    </Link>
                                </div>

                                {/* Popular Destinations tags */}
                                <div style={{ background: '#fff', borderRadius: 20, padding: '22px 24px', boxShadow: '0 6px 30px rgba(0,0,0,0.05)' }}>
                                    <h6 style={{ fontWeight: 800, color: '#111', marginBottom: 16 }}>Popular Destinations</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {['Rajasthan', 'Ladakh', 'Goa', 'Kerala', 'Himachal', 'Uttarakhand', 'Andaman', 'Manali'].map(d => (
                                            <button key={d} type="button" onClick={() => setForm(p => ({ ...p, destination: d }))}
                                                style={{ padding: '5px 14px', borderRadius: 30, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: form.destination === d ? '2px solid #FD4621' : '2px solid #E8E8E8', background: form.destination === d ? '#FFF1EE' : '#F8F9FA', color: form.destination === d ? '#FD4621' : '#555', transition: 'all 0.2s' }}>
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: 12, color: '#bbb', marginTop: 12, marginBottom: 0 }}>Click a destination to auto-fill the form</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Scoped styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .ct-label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 7px; }
                .ct-input {
                    width: 100%; padding: 11px 16px; border-radius: 10px;
                    border: 1.5px solid #E8E8E8; font-size: 14px; color: #111;
                    background: #FAFAFA; outline: none; transition: border 0.2s;
                    display: block; font-family: inherit;
                }
                .ct-input:focus { border-color: #FD4621; background: #fff; }
                .ct-input-err { border-color: #FD4621 !important; background: #fff9f9 !important; }
                textarea.ct-input { resize: vertical; }
                .ct-err { font-size: 11px; color: #FD4621; margin-top: 4px; display: block; }
                .togo-btn-secondary {
                    display: inline-block; padding: 12px 28px;
                    border-radius: 8px; border: 2px solid #E8E8E8;
                    background: #fff; font-weight: 700; font-size: 14px;
                    color: #444; cursor: pointer; transition: all 0.2s;
                    text-decoration: none;
                }
                .togo-btn-secondary:hover { border-color: #FD4621; color: #FD4621; }
            `}} />
        </>
    );
}
