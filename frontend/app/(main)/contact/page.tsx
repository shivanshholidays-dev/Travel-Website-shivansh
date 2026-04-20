'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import Breadcrumb from '@/src/components/shared/Breadcrumb';
import { Mail, Phone, MapPin, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { homeApi } from '@/src/lib/api/home.api';
import { useQuery } from '@tanstack/react-query';
import { FaqItem } from '@/src/lib/types/settings.types';

export default function ContactPage() {
    const { data: homeData, isLoading: isHomeLoading } = useQuery({
        queryKey: ['homeData'],
        queryFn: homeApi.homeData,
    });

    const [openFaq, setOpenFaq] = useState<number | null>(0);

    if (isHomeLoading)
    {
        return (
            <div className="container pt-100 pb-100 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const business = homeData?.data?.settings?.businessDetails;
    const faqs: FaqItem[] = homeData?.data?.settings?.faqs || [];

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="contact-page">
            <style>{`
                .contact-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 40px 30px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.03);
                    text-align: center;
                    transition: all 0.3s ease;
                    height: 100%;
                }
                .contact-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(249, 115, 22, 0.08);
                }
                .contact-icon-wrapper {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: rgba(249, 115, 22, 0.1);
                    color: #f97316;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    transition: all 0.3s ease;
                }
                .contact-card:hover .contact-icon-wrapper {
                    background: #f97316;
                    color: #fff;
                    transform: scale(1.1);
                }
                .faq-item {
                    background: #fff;
                    border-radius: 12px;
                    margin-bottom: 16px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .faq-item.active {
                    border-color: #f97316;
                    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.08);
                }
                .faq-question {
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    font-weight: 700;
                    color: #0f172a;
                    background: #fff;
                    transition: all 0.3s;
                }
                .faq-question:hover {
                    color: #f97316;
                }
                .faq-answer {
                    padding: 0 24px 24px;
                    color: #475569;
                    line-height: 1.7;
                    display: none;
                }
                .faq-item.active .faq-answer {
                    display: block;
                }
                .faq-icon {
                    color: #94a3b8;
                    transition: transform 0.3s;
                }
                .faq-item.active .faq-icon {
                    color: #f97316;
                }
            `}</style>

            <Breadcrumb title="Contact Us" items={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]} />

            {/* Contact Info Cards */}
            <section className="pt-80 pb-80">
                <div className="container">
                    <div className="row g-4 justify-content-center">
                        <div className="col-lg-4 col-md-6">
                            <div className="contact-card">
                                <div className="contact-icon-wrapper">
                                    <MapPin size={32} />
                                </div>
                                <h4 style={{ fontWeight: 800, fontSize: '20px', color: '#111', marginBottom: '16px' }}>Office Address</h4>
                                <p style={{ color: '#666', lineHeight: 1.7, margin: 0 }}>
                                    {business?.officeAddress || 'Global Headquarters, City Center, New Delhi, India'}
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="contact-card">
                                <div className="contact-icon-wrapper">
                                    <Phone size={32} />
                                </div>
                                <h4 style={{ fontWeight: 800, fontSize: '20px', color: '#111', marginBottom: '16px' }}>Phone Number</h4>
                                <p style={{ color: '#666', lineHeight: 1.7, margin: 0 }}>
                                    <a href={`tel:${business?.phoneNumber || '+91 98765 43210'}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                        {business?.phoneNumber || '+91 98765 43210'}
                                    </a>
                                    <br />
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="contact-card">
                                <div className="contact-icon-wrapper">
                                    <Mail size={32} />
                                </div>
                                <h4 style={{ fontWeight: 800, fontSize: '20px', color: '#111', marginBottom: '16px' }}>Email Address</h4>
                                <p style={{ color: '#666', lineHeight: 1.7, margin: 0 }}>
                                    <a href={`mailto:${business?.supportEmail || 'support@toursandtravels.in'}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                        {business?.supportEmail || 'support@toursandtravels.in'}
                                    </a>
                                    <br />
                                    {business?.businessEmail && (
                                        <a href={`mailto:${business?.businessEmail}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                                            {business?.businessEmail}
                                        </a>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form & Map */}
            <section className="pb-100">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-6">
                            <div style={{ background: '#f8f9fc', borderRadius: '24px', padding: '40px', height: '100%' }}>
                                <h3 style={{ fontWeight: 900, fontSize: '32px', color: '#0f172a', marginBottom: '12px' }}>Send a Message</h3>
                                <p style={{ color: '#64748b', marginBottom: '32px' }}>Fill out the form below and our team will get back to you within 24 hours.</p>

                                <form onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully! We will get back to you shortly.'); }}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <input type="text" className="form-control" placeholder="Your Name *" required style={{ padding: '15px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <input type="email" className="form-control" placeholder="Your Email *" required style={{ padding: '15px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <input type="tel" className="form-control" placeholder="Phone Number" style={{ padding: '15px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <input type="text" className="form-control" placeholder="Subject" style={{ padding: '15px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                        </div>
                                        <div className="col-12">
                                            <textarea className="form-control" placeholder="Write your message here... *" rows={5} required style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}></textarea>
                                        </div>
                                        <div className="col-12 mt-4">
                                            <button type="submit" className="togo-btn-primary w-100" style={{ padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                Send Message <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div style={{ borderRadius: '24px', overflow: 'hidden', height: '100%', minHeight: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7411.999575035015!2d72.13824471564615!3d21.741533935696566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395f51004b0b9277%3A0x436bc233f5bc5491!2sShiv%20Shakti%20laxuriya!5e0!3m2!1sen!2sin!4v1773310302818!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: '400px' }}
                                    allowFullScreen={true}
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs Section */}
            {faqs.length > 0 && (
                <section className="pt-80 pb-100" style={{ background: '#f8fafc' }}>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8 text-center mb-50">
                                <span style={{ color: '#f97316', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '15px' }}>
                                    Have Questions?
                                </span>
                                <h2 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 900, color: '#111', margin: 0 }}>
                                    Frequently Asked Questions
                                </h2>
                            </div>
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="faq-container">
                                    {faqs.map((faq, index) => (
                                        <div key={index} className={`faq-item ${openFaq === index ? 'active' : ''}`}>
                                            <div className="faq-question" onClick={() => toggleFaq(index)}>
                                                <span>{faq.question}</span>
                                                <div className="faq-icon">
                                                    {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </div>
                                            </div>
                                            <div className="faq-answer">
                                                {faq.answer?.split('\n').map((line, i) => (
                                                    <p key={i} style={{ marginBottom: line.trim() === '' ? '10px' : '4px' }}>
                                                        {line}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
