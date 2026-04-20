'use client';

import { useEffect, useState } from 'react';
import { homeApi } from '@lib/api/home.api';
import { useTeamHooks } from '@hooks/useTeamHooks';
import { TeamMember } from '@lib/types/team-member.types';
import { AboutContent } from '@lib/types/settings.types';
import Breadcrumb from '@components/shared/Breadcrumb';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, CheckCircle, Shield, Award, Users, Globe, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const SOCIAL_ICONS = {
    facebook: { icon: Facebook, color: '#1877f2', label: 'Facebook' },
    instagram: { icon: Instagram, color: '#e1306c', label: 'Instagram' },
    twitter: { icon: Twitter, color: '#1da1f2', label: 'Twitter' },
    linkedin: { icon: Linkedin, color: '#0077b5', label: 'LinkedIn' },
    youtube: { icon: Youtube, color: '#ff0000', label: 'YouTube' },
};

function TeamMemberCard({ member }: { member: TeamMember }) {
    const socials = member.socialLinks || {};
    const hasSocials = Object.values(socials).some(v => v);

    return (
        <div className="team-member-card" style={{
            background: '#fff', borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default',
        }}>
            <div style={{ position: 'relative', width: '100%', paddingTop: '85%', overflow: 'hidden', background: '#f8f9fc' }}>
                {member.image ? (
                    <img src={member.image} alt={member.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="team-card-img" />
                ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 72, fontWeight: 900, color: '#ccc' }}>{member.name.charAt(0).toUpperCase()}</span>
                    </div>
                )}
                {hasSocials && (
                    <div className="team-social-overlay" style={{
                        position: 'absolute', inset: 0, background: 'rgba(26,26,46,0.75)',
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        paddingBottom: 28, opacity: 0, transition: 'opacity 0.3s ease',
                    }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {(Object.entries(SOCIAL_ICONS) as [string, any][]).map(([key, { icon: Icon, color, label }]) => {
                                const url = (socials as any)[key];
                                if (!url) return null;
                                return (
                                    <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}
                                        style={{
                                            width: 38, height: 38, borderRadius: '50%', background: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: color, textDecoration: 'none', transition: 'transform 0.2s',
                                        }} className="social-btn"
                                    >
                                        <Icon size={17} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            <div style={{ padding: '22px 24px 24px', textAlign: 'center' }}>
                <h3 style={{ fontWeight: 800, fontSize: '18px', color: '#111', marginBottom: 4 }}>{member.name}</h3>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{member.designation}</p>
            </div>
        </div>
    );
}

// Map string icon names from admin panel to Lucide components
const IconMap: Record<string, any> = {
    'CheckCircle': CheckCircle,
    'Shield': Shield,
    'Award': Award,
    'Users': Users,
    'Globe': Globe,
    'MapPin': MapPin
};

export default function AboutPage() {
    const { useTeamMembers } = useTeamHooks();
    const { data: membersResponse, isLoading: isTeamLoading } = useTeamMembers();

    const { data: homeData, isLoading: isHomeLoading } = useQuery({
        queryKey: ['homeData'],
        queryFn: homeApi.homeData,
    });

    const aboutContent: AboutContent | undefined = homeData?.data?.settings?.aboutContent;
    const members: TeamMember[] = Array.isArray(membersResponse) ? membersResponse : (membersResponse as any)?.data ?? [];

    const isLoading = isHomeLoading || isTeamLoading;

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

    const title = aboutContent?.heroTitle || 'Discover Our Story';
    const subtitle = aboutContent?.heroSubtitle || 'Passionate about crafting unforgettable travel experiences since our inception.';
    const mission = aboutContent?.missionStatement || 'Our mission is to empower travelers to explore the world with confidence, offering exceptional service, unparalleled expertise, and curated journeys that inspire and delight. We believe in sustainable tourism and creating positive impacts on the communities we visit.';
    const whyChooseUs = aboutContent?.whyChooseUs?.length ? aboutContent.whyChooseUs : [
        { title: 'Expert Guides', description: 'Our certified local guides bring destinations to life with deep knowledge and passion.', icon: 'Users' },
        { title: 'Trusted Security', description: 'Your safety is our priority. We partner with verified providers globally.', icon: 'Shield' },
        { title: 'Award Winning', description: 'Recognized for excellence in travel experiences and customer satisfaction.', icon: 'Award' }
    ];

    return (
        <div className="about-page">
            <style>{`
                .team-member-card:hover { transform: translateY(-8px); boxShadow: 0 20px 50px rgba(0,0,0,0.12) !important; }
                .team-member-card:hover .team-card-img { transform: scale(1.08); }
                .team-member-card:hover .team-social-overlay { opacity: 1 !important; }
                .social-btn:hover { transform: scale(1.15) !important; }
                
                .why-choose-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 40px 30px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.03);
                    transition: all 0.3s ease;
                    height: 100%;
                }
                .why-choose-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(249, 115, 22, 0.08);
                    border-color: rgba(249, 115, 22, 0.2);
                }
                .icon-wrapper {
                    width: 70px;
                    height: 70px;
                    border-radius: 20px;
                    background: rgba(249, 115, 22, 0.1);
                    color: #f97316;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    transition: all 0.3s ease;
                }
                .why-choose-card:hover .icon-wrapper {
                    background: #f97316;
                    color: #fff;
                    transform: rotateY(180deg);
                }
            `}</style>

            <Breadcrumb title="About Us" items={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />

            {/* Mission Section */}
            <section className="pt-80 pb-80">
                <div className="container">
                    <div className="row align-items-center mb-5">
                        <div className="col-lg-6 mb-50">
                            <span style={{ color: '#f97316', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '15px' }}>
                                Who We Are
                            </span>
                            <h2 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 900, color: '#111', lineHeight: 1.2, marginBottom: '24px' }}>
                                {title}
                            </h2>
                            <h5 style={{ color: '#555', lineHeight: 1.6, fontWeight: 400, marginBottom: '30px' }}>
                                {subtitle}
                            </h5>
                            <p style={{ color: '#666', lineHeight: 1.8, fontSize: '17px', marginBottom: '40px' }}>
                                {mission}
                            </p>
                            <Link href="/contact" className="togo-btn-primary" style={{ display: 'inline-flex', padding: '15px 36px', borderRadius: '50px', fontWeight: 700, fontSize: '16px', textDecoration: 'none' }}>
                                Contact Us Today
                            </Link>
                        </div>
                        <div className="col-lg-6">
                            <div className="position-relative" style={{ paddingLeft: '40px', paddingBottom: '40px' }}>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '80%', height: '80%', background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', borderRadius: '30px', zIndex: 0 }}></div>
                                <img src="/assets/img/about/about-1.webp" alt="About Us" style={{ width: '100%', borderRadius: '30px', position: 'relative', zIndex: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop'; }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            {whyChooseUs.length > 0 && (
                <section className="pt-80 pb-80" style={{ background: '#f8f9fc' }}>
                    <div className="container">
                        <div className="text-center mb-60">
                            <span style={{ color: '#f97316', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '15px' }}>
                                Our Value
                            </span>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#111', margin: 0 }}>
                                Why Choose Us
                            </h2>
                        </div>
                        <div className="row g-4 justify-content-center">
                            {whyChooseUs.map((item, index) => {
                                const IconComponent = IconMap[item.icon as string] || CheckCircle;
                                return (
                                    <div className="col-lg-4 col-md-6" key={index}>
                                        <div className="why-choose-card text-center text-md-start">
                                            <div className="d-flex justify-content-center justify-content-md-start">
                                                <div className="icon-wrapper">
                                                    <IconComponent size={32} />
                                                </div>
                                            </div>
                                            <h4 style={{ fontWeight: 800, fontSize: '20px', color: '#111', marginBottom: '16px' }}>{item.title}</h4>
                                            <p style={{ color: '#666', lineHeight: 1.7, margin: 0 }}>{item.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Team Section */}
            {members.length > 0 && (
                <section className="pt-40 pb-60">
                    <div className="container">
                        <div className="text-center mb-60">
                            <span style={{ color: '#f97316', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '15px' }}>
                                Leadership
                            </span>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#111', margin: 0 }}>
                                Meet Our Team
                            </h2>
                        </div>
                        <div className="row g-4 justify-content-center">
                            {members.map(member => (
                                <div key={member._id} className="col-12 col-sm-6 col-lg-3 col-md-4">
                                    <TeamMemberCard member={member} />
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-50">
                            <Link href="/team" className="btn btn-outline-dark" style={{ borderRadius: '50px', padding: '12px 30px', fontWeight: 700 }}>
                                View Full Team
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
