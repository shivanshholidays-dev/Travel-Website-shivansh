'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminTeamMemberHooks } from '@hooks/admin/useAdminTeamMemberHooks';
import toast from 'react-hot-toast';
import { Users, ArrowLeft, Upload, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

const inputStyle: React.CSSProperties = {
    borderRadius: '12px', padding: '12px 16px', border: '1px solid #eee',
    fontSize: '14px', background: '#fcfcfc', width: '100%',
    outline: 'none', transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
    fontWeight: 700, fontSize: '12px', color: '#555',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block',
};

export default function AdminTeamNewPage() {
    const router = useRouter();
    const { useCreateTeamMember } = useAdminTeamMemberHooks();
    const createMutation = useCreateTeamMember();

    const [name, setName] = useState('');
    const [designation, setDesignation] = useState('');
    const [bio, setBio] = useState('');
    const [order, setOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [socialLinks, setSocialLinks] = useState({ facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file)
        {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSocialChange = (key: string, value: string) => {
        setSocialLinks(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Name is required');
        if (!designation.trim()) return toast.error('Designation is required');

        try
        {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('designation', designation.trim());
            if (bio.trim()) formData.append('bio', bio.trim());
            formData.append('order', String(order));
            formData.append('isActive', String(isActive));

            // Only include non-empty social links
            const filledLinks = Object.fromEntries(
                Object.entries(socialLinks).filter(([, v]) => v.trim())
            );
            if (Object.keys(filledLinks).length > 0)
            {
                formData.append('socialLinks', JSON.stringify(filledLinks));
            }

            if (imageFile) formData.append('image', imageFile);

            await createMutation.mutateAsync(formData as any);
            toast.success('Team member added successfully!');
            router.push('/admin/team');
        } catch (err: any)
        {
            toast.error(err?.response?.data?.message || 'Failed to add team member');
        }
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-40">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-1" style={{ fontWeight: 900, fontSize: '28px' }}>
                            Add Team Member
                        </h4>
                        <p className="text-muted small mb-0">Create a new member profile for the team page.</p>
                    </div>
                    <button
                        onClick={() => router.push('/admin/team')}
                        className="btn btn-light d-flex align-items-center gap-2"
                        style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600, border: '1px solid #eee' }}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                        {/* Main Fields */}
                        <div className="col-lg-8">
                            <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f3f9' }}>
                                <h5 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '28px' }}>Member Information</h5>

                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label style={labelStyle}>Full Name *</label>
                                        <input
                                            type="text" value={name} onChange={e => setName(e.target.value)}
                                            placeholder="e.g. John Smith"
                                            style={inputStyle} required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label style={labelStyle}>Designation *</label>
                                        <input
                                            type="text" value={designation} onChange={e => setDesignation(e.target.value)}
                                            placeholder="e.g. Senior Tour Guide"
                                            style={inputStyle} required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label style={labelStyle}>Bio / Description</label>
                                    <textarea
                                        value={bio} onChange={e => setBio(e.target.value)}
                                        rows={4}
                                        placeholder="Write a short bio about this team member..."
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                    />
                                </div>

                                {/* Social Links */}
                                <div className="mt-30">
                                    <h6 style={{ fontWeight: 800, fontSize: '15px', marginBottom: '20px', color: '#333' }}>
                                        Social Media Links
                                    </h6>
                                    <div className="row g-3">
                                        {[
                                            { key: 'facebook', icon: <Facebook size={16} />, placeholder: 'https://facebook.com/...', color: '#1877f2' },
                                            { key: 'instagram', icon: <Instagram size={16} />, placeholder: 'https://instagram.com/...', color: '#e1306c' },
                                            { key: 'twitter', icon: <Twitter size={16} />, placeholder: 'https://twitter.com/...', color: '#1da1f2' },
                                            { key: 'linkedin', icon: <Linkedin size={16} />, placeholder: 'https://linkedin.com/in/...', color: '#0077b5' },
                                            { key: 'youtube', icon: <Youtube size={16} />, placeholder: 'https://youtube.com/@...', color: '#ff0000' },
                                        ].map(({ key, icon, placeholder, color }) => (
                                            <div className="col-md-6" key={key}>
                                                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ color }}>{icon}</span>
                                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                                </label>
                                                <input
                                                    type="url"
                                                    value={(socialLinks as any)[key]}
                                                    onChange={e => handleSocialChange(key, e.target.value)}
                                                    placeholder={placeholder}
                                                    style={inputStyle}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="col-lg-4">
                            <div style={{ background: '#fff', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f3f9', position: 'sticky', top: '20px' }}>
                                <h5 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '24px' }}>Settings</h5>

                                {/* Image Upload */}
                                <div className="mb-25">
                                    <label style={labelStyle}>Profile Photo</label>
                                    <div
                                        style={{ border: '2px dashed #ddd', borderRadius: '16px', padding: '20px', textAlign: 'center', background: '#fafafa', position: 'relative', overflow: 'hidden' }}
                                    >
                                        {imagePreview && (
                                            <img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 12, border: '3px solid #eee' }} />
                                        )}
                                        <input type="file" id="member-image" accept="image/*" className="d-none" onChange={handleImageChange} />
                                        <label htmlFor="member-image" style={{ cursor: 'pointer', margin: 0 }}>
                                            <div className="d-flex flex-column align-items-center" style={{ gap: 6 }}>
                                                <Upload size={24} style={{ color: '#aaa' }} />
                                                <span style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>
                                                    {imageFile ? imageFile.name : 'Click to upload photo'}
                                                </span>
                                                <span style={{ fontSize: 11, color: '#999' }}>PNG, JPG, WEBP up to 5MB</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Display Order */}
                                <div className="mb-25">
                                    <label style={labelStyle}>Display Order</label>
                                    <input
                                        type="number" min={0} value={order} onChange={e => setOrder(Number(e.target.value))}
                                        style={inputStyle}
                                    />
                                    <p style={{ fontSize: 11, color: '#999', marginTop: 6, marginBottom: 0 }}>
                                        Lower number = shown first
                                    </p>
                                </div>

                                {/* Active Toggle */}
                                <div className="mb-30 d-flex align-items-center justify-content-between p-3" style={{ background: '#f8f9fa', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>Active</div>
                                        <div style={{ fontSize: 12, color: '#888' }}>Show on public team page</div>
                                    </div>
                                    <div
                                        onClick={() => setIsActive(!isActive)}
                                        style={{ width: 48, height: 26, background: isActive ? '#22c55e' : '#d1d5db', borderRadius: 13, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
                                    >
                                        <div style={{ position: 'absolute', top: 3, left: isActive ? 25 : 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="btn w-100"
                                    style={{ background: '#111', color: '#fff', padding: '14px', borderRadius: '14px', fontWeight: 800, fontSize: '15px' }}
                                >
                                    {createMutation.isPending ? 'Adding Member...' : 'Add Team Member'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
