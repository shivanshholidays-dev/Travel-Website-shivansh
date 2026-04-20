'use client';

import { homeApi } from '@lib/api/home.api';
import { CareerContent } from '@lib/types/settings.types';
import Breadcrumb from '@components/shared/Breadcrumb';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CareersPage() {
    const { data: homeData, isLoading } = useQuery({
        queryKey: ['homeData'],
        queryFn: homeApi.homeData,
    });

    if (isLoading)
    {
        return (
            <div className="container pt-100 pb-100 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const careerContent: CareerContent | undefined = homeData?.data?.settings?.careerContent;

    const title = careerContent?.heroTitle || 'Join Our Journey';
    const subtitle = careerContent?.heroSubtitle || 'Build a career that lets you explore the world while creating unforgettable experiences for others.';
    const culture = careerContent?.cultureDescription || "At our core, we believe that travel transforms lives. We're a team of passionate explorers, meticulous planners, and customer-obsessed professionals. We foster a culture of inclusivity, continuous learning, and boundless curiosity. Join us in our mission to make the world accessible to everyone.";
    const benefits = careerContent?.benefits || [
        'Flexible working hours and remote options',
        'Comprehensive health, dental, and vision insurance',
        'Generous paid time off and travel allowances',
        'Continuous learning and professional development budgets',
        'Discounted tours for friends and family',
        'A vibrant, supportive, and diverse team environment'
    ];
    const jobs = careerContent?.jobs || [];

    return (
        <div className="careers-page">
            <style>{`
                .benefit-card {
                    background: #fff;
                    border-radius: 16px;
                    padding: 24px;
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    border: 1px solid rgba(0,0,0,0.04);
                    transition: transform 0.3s ease;
                    height: 100%;
                }
                .benefit-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.08);
                    border-color: rgba(59, 130, 246, 0.2);
                }
                .job-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 35px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.04);
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                }
                .job-card:hover {
                    box-shadow: 0 15px 35px rgba(0,0,0,0.08);
                    border-color: #3b82f6;
                    transform: translateY(-4px);
                }
                .job-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 50px;
                    font-size: 13px;
                    font-weight: 600;
                    background: #f1f5f9;
                    color: #475569;
                }
                .job-btn {
                    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                    padding: 12px 24px; border-radius: 50px; font-weight: 700; font-size: 15px;
                    background: #fff; color: #3b82f6; border: 2px solid #3b82f6;
                    text-decoration: none; transition: all 0.3s; width: 100%;
                }
                .job-card:hover .job-btn {
                    background: #3b82f6; color: #fff;
                }
            `}</style>

            <Breadcrumb title="Careers" items={[{ label: 'Home', href: '/' }, { label: 'Careers' }]} />

            {/* Introduction & Culture */}
            <section className="pt-50 pb-60">
                <div className="container">
                    <div className="row justify-content-center text-center mb-0">
                        <div className="col-lg-8">
                            <span style={{ color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '15px' }}>
                                Work With Us
                            </span>
                            <h2 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 900, color: '#111', lineHeight: 1.2, marginBottom: '24px' }}>
                                {subtitle}
                            </h2>
                            <p style={{ color: '#555', fontSize: '18px', lineHeight: 1.8, margin: 0 }}>
                                {culture}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            {benefits.length > 0 && (
                <section className="pt-80 pb-80" style={{ background: '#f8fafc' }}>
                    <div className="container">
                        <div className="text-center mb-60">
                            <h3 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: '#111', margin: 0 }}>
                                Perks & Benefits
                            </h3>
                            <p style={{ color: '#64748b', marginTop: 12, fontSize: 16 }}>Why you'll love working here</p>
                        </div>
                        <div className="row g-4">
                            {benefits.map((benefit, idx) => (
                                <div className="col-lg-4 col-md-6" key={idx}>
                                    <div className="benefit-card">
                                        <div style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }}>
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <p style={{ margin: 0, color: '#334155', fontWeight: 500, lineHeight: 1.6 }}>
                                            {benefit}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Open Positions Section */}
            <section className="pt-0 pb-100" id="open-positions">
                <div className="container">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-25 gap-3">
                        <div>
                            <h3 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: '#111', margin: 0 }}>
                                Open Positions
                            </h3>
                            <p style={{ color: '#64748b', marginTop: 8, fontSize: 16, marginBottom: 0 }}>
                                {jobs.length > 0 ? `We have ${jobs.length} open roles. Find your fit.` : "There are currently no open positions. Check back later!"}
                            </p>
                        </div>
                        {jobs.length > 0 && (
                            <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '10px 24px', borderRadius: '50px', fontWeight: 800 }}>
                                {jobs.length} Position{jobs.length > 1 ? 's' : ''} Available
                            </div>
                        )}
                    </div>

                    <div className="row g-4">
                        {jobs.map((job, idx) => (
                            <div className="col-lg-4 col-md-6" key={idx}>
                                <div className="job-card">
                                    <div>
                                        <div className="mb-4 d-flex flex-wrap gap-2">
                                            {job.type && (
                                                <span className="job-tag">
                                                    <Clock size={14} /> {job.type}
                                                </span>
                                            )}
                                            {job.location && (
                                                <span className="job-tag">
                                                    <MapPin size={14} /> {job.location}
                                                </span>
                                            )}
                                        </div>
                                        <h4 style={{ fontWeight: 800, fontSize: '22px', color: '#0f172a', marginBottom: '16px' }}>
                                            {job.title}
                                        </h4>
                                        <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: 15, marginBottom: '30px' }}>
                                            {job.description}
                                        </p>
                                    </div>
                                    <div>
                                        <Link href="/contact" className="job-btn">
                                            Apply Now <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
