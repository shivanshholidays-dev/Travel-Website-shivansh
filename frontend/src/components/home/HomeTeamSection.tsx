'use client';

import { useTeamHooks } from '@hooks/useTeamHooks';
import { TeamMember } from '@lib/types/team-member.types';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SafeImage from '@/src/components/common/SafeImage';

const SOCIAL_ICONS = {
    facebook: { icon: Facebook, color: '#1877f2', label: 'Facebook' },
    instagram: { icon: Instagram, color: '#e1306c', label: 'Instagram' },
    twitter: { icon: Twitter, color: '#1da1f2', label: 'Twitter' },
    linkedin: { icon: Linkedin, color: '#0077b5', label: 'LinkedIn' },
    youtube: { icon: Youtube, color: '#ff0000', label: 'YouTube' },
};

function HomeTeamMemberCard({ member }: { member: TeamMember }) {
    const socials = member.socialLinks || {};
    const hasSocials = Object.values(socials).some(v => v);

    return (
        <div
            className="home-team-card"
            style={{
                background: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                border: '1px solid #f1f3f9',
                transition: 'all 0.3s ease',
            }}
        >
            {/* Image */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', background: '#f8f9fc' }}>
                {member.image ? (
                    <SafeImage
                        src={member.image}
                        alt={member.name}
                        fallbackSrc="/assets/img/team/team-1.jpg"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        className="home-team-img"
                    />
                ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)' }}>
                        <span style={{ fontSize: 64, fontWeight: 900, color: '#fff' }}>
                            {member.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Hover overlay with socials */}
                {hasSocials && (
                    <div
                        className="home-team-socials"
                        style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                            padding: '40px 20px 20px',
                            display: 'flex', justifyContent: 'center', gap: 12,
                            opacity: 0, transform: 'translateY(20px)',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {(Object.entries(SOCIAL_ICONS) as [string, any][]).map(([key, { icon: Icon, color, label }]) => {
                            const url = (socials as any)[key];
                            if (!url) return null;
                            return (
                                <a
                                    key={key}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    style={{
                                        width: 36, height: 36, borderRadius: '50%', background: color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                        transition: 'transform 0.2s',
                                    }}
                                    className="home-social-link"
                                >
                                    <Icon size={16} />
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                <h4 style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b', marginBottom: 4 }}>
                    {member.name}
                </h4>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#f97316', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {member.designation}
                </p>
            </div>
        </div>
    );
}

export default function HomeTeamSection() {
    const { useTeamMembers } = useTeamHooks();
    const { data: members, isLoading, error } = useTeamMembers();

    // Only show up to 4 members on the homepage
    const list: TeamMember[] = Array.isArray(members) ? members : (members as any)?.data ?? [];
    const displayMembers = list.slice(0, 4);

    if (isLoading || error || displayMembers.length === 0)
    {
        return null; // Don't show the section if loading, error, or no data on homepage
    }

    return (
        <section style={{ paddingTop: '20px', paddingBottom: '120px', background: 'linear-gradient(to bottom, #fff 0%, #fcfdfd 100%)', position: 'relative' }}>
            <style>{`
                .home-team-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
                }
                .home-team-card:hover .home-team-img {
                    transform: scale(1.08);
                }
                .home-team-card:hover .home-team-socials {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
                .home-social-link:hover {
                    transform: scale(1.15) !important;
                }
            `}</style>
            <div className="container">
                <div className="row align-items-center mb-60">
                    <div className="col-12 text-center text-md-start d-md-flex justify-content-between align-items-end">
                        <div className="togo-section-title-wrap mb-4 mb-md-0 mx-auto mx-md-0" style={{ maxWidth: '600px' }}>
                            <span className="togo-section-subtitle" style={{ color: '#f97316', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                                Our Experts
                            </span>
                            <h2 className="togo-section-title" style={{ fontSize: 'clamp(32px, 5vw, 46px)', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                                Meet The Team <br className="d-none d-md-block" /> Behind The Magic
                            </h2>
                        </div>
                        <div className="mt-4 mt-md-0 mx-auto mx-md-0">
                            <Link href="/team" className="togo-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: '50px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.3s' }}>
                                View All Members <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className={`row g-4 ${displayMembers.length < 4 ? 'justify-content-center' : ''}`}>
                    {displayMembers.map((member) => (
                        <div key={member._id} className="col-12 col-sm-6 col-lg-3 col-md-4">
                            <HomeTeamMemberCard member={member} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
