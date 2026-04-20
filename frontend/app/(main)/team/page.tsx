'use client';

import { useTeamHooks } from '@hooks/useTeamHooks';
import { TeamMember } from '@lib/types/team-member.types';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Users } from 'lucide-react';

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
        <div
            style={{
                background: '#fff',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
            }}
            className="team-member-card"
        >
            {/* Image */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '85%', overflow: 'hidden', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                {member.image ? (
                    <img
                        src={member.image}
                        alt={member.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        className="team-card-img"
                    />
                ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 72, fontWeight: 900, color: 'rgba(255,255,255,0.7)', fontFamily: 'sans-serif' }}>
                            {member.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Overlay with socials on hover */}
                {hasSocials && (
                    <div
                        className="team-social-overlay"
                        style={{
                            position: 'absolute', inset: 0, background: 'rgba(26,26,46,0.75)',
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                            paddingBottom: 28, opacity: 0, transition: 'opacity 0.3s ease',
                        }}
                    >
                        <div style={{ display: 'flex', gap: 10 }}>
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
                                            width: 38, height: 38, borderRadius: '50%', background: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: color, textDecoration: 'none',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                        }}
                                        className="social-btn"
                                    >
                                        <Icon size={17} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '22px 24px 24px' }}>
                <h3 style={{ fontWeight: 800, fontSize: '18px', color: '#111', marginBottom: 4, lineHeight: 1.3 }}>
                    {member.name}
                </h3>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#f97316', marginBottom: member.bio ? 12 : 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {member.designation}
                </p>
                {member.bio && (
                    <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.65, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {member.bio}
                    </p>
                )}
                {/* Inline socials for no-hover devices */}
                {hasSocials && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }} className="team-socials-inline">
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
                                        width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: color, textDecoration: 'none', transition: 'transform 0.2s, background 0.2s',
                                    }}
                                    className="social-btn-inline"
                                >
                                    <Icon size={15} />
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TeamPage() {
    const { useTeamMembers } = useTeamHooks();
    const { data: members, isLoading, error } = useTeamMembers();

    const list: TeamMember[] = Array.isArray(members) ? members : (members as any)?.data ?? [];

    return (
        <>
            <style>{`
                .team-member-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.12) !important;
                }
                .team-member-card:hover .team-card-img {
                    transform: scale(1.08);
                }
                .team-member-card:hover .team-social-overlay {
                    opacity: 1 !important;
                }
                .social-btn:hover,
                .social-btn-inline:hover {
                    transform: scale(1.15);
                    background: #f0f0f0 !important;
                }
                .team-skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @media (max-width: 768px) {
                    .team-social-overlay { display: none !important; }
                    .team-socials-inline { display: flex !important; }
                }
            `}</style>

            {/* Page Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
                padding: '90px 20px 80px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(249,115,22,0.08)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(102,126,234,0.12)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{ display: 'inline-block', background: 'rgba(249,115,22,0.15)', color: '#f97316', borderRadius: '100px', padding: '6px 20px', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20, border: '1px solid rgba(249,115,22,0.3)' }}>
                        Our People
                    </span>
                    <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 18, lineHeight: 1.15 }}>
                        Meet Our Expert Team
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
                        Dedicated travel professionals who craft unforgettable experiences, one journey at a time.
                    </p>
                </div>
            </div>

            {/* Team Grid Section */}
            <div style={{ background: '#f8f9fc', padding: '80px 20px' }}>
                <div className="container">

                    {/* Loading Skeleton */}
                    {isLoading && (
                        <div className="row g-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="col-6 col-md-4 col-lg-3">
                                    <div style={{ borderRadius: '24px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                        <div className="team-skeleton" style={{ height: 220 }} />
                                        <div style={{ padding: '20px 22px' }}>
                                            <div className="team-skeleton" style={{ height: 18, borderRadius: 8, marginBottom: 10, width: '70%' }} />
                                            <div className="team-skeleton" style={{ height: 13, borderRadius: 8, width: '50%' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="text-center py-5">
                            <p style={{ color: '#ef4444', fontWeight: 600 }}>Failed to load team members. Please try again later.</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && list.length === 0 && (
                        <div className="text-center py-5">
                            <div style={{ background: '#fff', borderRadius: '24px', padding: '60px 40px', maxWidth: 480, margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <Users size={64} style={{ color: '#ddd', marginBottom: 20 }} />
                                <h4 style={{ fontWeight: 800, color: '#333', marginBottom: 12 }}>No Team Members Yet</h4>
                                <p style={{ color: '#888', fontSize: 15, lineHeight: 1.6, marginBottom: 0 }}>
                                    We're building our amazing team. Check back soon!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Team Grid */}
                    {!isLoading && list.length > 0 && (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: 56 }}>
                                <p style={{ color: '#888', fontSize: 15, margin: 0 }}>
                                    {list.length} team member{list.length !== 1 ? 's' : ''} and counting
                                </p>
                            </div>
                            <div className="row g-4">
                                {list.map((member) => (
                                    <div key={member._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <TeamMemberCard member={member} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div style={{ background: '#fff', padding: '80px 20px', textAlign: 'center', borderTop: '1px solid #f1f3f9' }}>
                <div className="container" style={{ maxWidth: 660 }}>
                    <h2 style={{ fontWeight: 900, fontSize: 'clamp(24px, 4vw, 38px)', color: '#111', marginBottom: 16 }}>
                        Want to Join Our Team?
                    </h2>
                    <p style={{ color: '#666', fontSize: 16, lineHeight: 1.75, marginBottom: 32 }}>
                        We're always looking for passionate travel enthusiasts to join our growing family. Let's create amazing experiences together.
                    </p>
                    <a
                        href="/contact"
                        className="togo-btn-primary"
                        style={{ display: 'inline-block', padding: '14px 40px', borderRadius: '50px', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}
                    >
                        Get in Touch
                    </a>
                </div>
            </div>
        </>
    );
}
