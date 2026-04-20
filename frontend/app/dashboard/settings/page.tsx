'use client';

import { useState, useEffect, useRef } from 'react';
import { useUserHooks } from '@lib/hooks/useUserHooks';
import { Gender } from '@lib/constants/enums';
import toast from 'react-hot-toast';
import ConfirmationModal from '@components/common/ConfirmationModal';
import { getImgUrl } from '@lib/utils/image';

export default function DashboardSettingsPage() {
    const [activeTab, setActiveTab] = useState<'basic' | 'password' | 'travelers'>('basic');
    const [mounted, setMounted] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const { useProfile, useUpdateProfile, useChangePassword, useSavedTravelers, useAddTraveler, useRemoveTraveler } = useUserHooks();
    const { data: profileResponse, isLoading: profileLoading } = useProfile();
    const profile = (profileResponse as any)?.data || profileResponse;
    const updateMutation = useUpdateProfile();
    const passwordMutation = useChangePassword();
    const { data: travelersData, isLoading: travelersLoading } = useSavedTravelers();
    const addTravelerMutation = useAddTraveler();
    const removeTravelerMutation = useRemoveTraveler();

    // ── Modal State ──
    const [modal, setModal] = useState({
        isOpen: false,
        travelerId: '',
        title: '',
        message: ''
    });

    const extractArray = (data: any) => Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
    const travelers = extractArray(travelersData);

    // ── Form state matches UpdateProfileDto exactly ──
    const [form, setForm] = useState({
        name: '',
        phone: '',       // must be E.164 format e.g. +919876543210
        gender: '',
        dateOfBirth: '', // ISO date string e.g. 1995-06-13
        country: '',
        contactAddress: '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [travelerForm, setTravelerForm] = useState({ fullName: '', age: '', gender: '', idNumber: '' });

    // Client-only mount guard — prevents SSR hydration mismatch
    useEffect(() => { setMounted(true); }, []);

    // Pre-fill form when profile data arrives
    useEffect(() => {
        if (!profile) return;
        setForm({
            name: profile.name || '',
            phone: profile.phone || '',
            gender: profile.gender || '',
            dateOfBirth: profile.dateOfBirth
                ? profile.dateOfBirth.split('T')[0]  // convert ISO to YYYY-MM-DD
                : '',
            country: profile.country || '',
            contactAddress: (profile as any).contactAddress || '',
        });
    }, [profile]);

    // ── Handle avatar file selection (local preview only) ──
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    // ── Save Basic Info ──
    const handleBasicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', form.name);
        if (form.phone) formData.append('phone', form.phone);
        if (form.gender) formData.append('gender', form.gender);
        if (form.dateOfBirth) formData.append('dateOfBirth', form.dateOfBirth);
        if (form.country) formData.append('country', form.country);
        if (form.contactAddress) formData.append('contactAddress', form.contactAddress);

        // Include file if selected
        const file = fileRef.current?.files?.[0];
        if (file)
        {
            formData.append('avatarFile', file);
        }

        try
        {
            await updateMutation.mutateAsync(formData as any);
            toast.success('Profile updated successfully!');
            // Clear file input after success
            if (fileRef.current) fileRef.current.value = '';
            setAvatarPreview(null); // Reset preview to show the new uploaded avatar from profile
        } catch (err: any)
        {
            const msg = err?.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg || 'Failed to update profile.'));
        }
    };

    // ── Change Password ──
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword)
        {
            toast.error('New passwords do not match.'); return;
        }
        try
        {
            await passwordMutation.mutateAsync({
                oldPassword: pwForm.currentPassword,   // backend expects 'oldPassword'
                newPassword: pwForm.newPassword,
            });
            toast.success('Password changed successfully!');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any)
        {
            const msg = err?.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg || 'Failed to change password.'));
        }
    };

    // ── Saved Travelers ──
    const handleAddTraveler = async (e: React.FormEvent) => {
        e.preventDefault();
        try
        {
            await addTravelerMutation.mutateAsync({
                fullName: travelerForm.fullName,
                age: Number(travelerForm.age),
                gender: travelerForm.gender,
                idNumber: travelerForm.idNumber,
            });
            toast.success('Traveler added successfully!');
            setTravelerForm({ fullName: '', age: '', gender: '', idNumber: '' });
        } catch (err: any)
        {
            const msg = err?.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg || 'Failed to add traveler.'));
        }
    };

    const handleRemoveTraveler = (id: string) => {
        const traveler = travelers.find((t: any) => t._id === id);
        setModal({
            isOpen: true,
            travelerId: id,
            title: 'Remove Traveler',
            message: `Are you sure you want to remove ${traveler?.fullName || 'this traveler'}? This action cannot be undone.`
        });
    };

    const confirmRemoveTraveler = async () => {
        try
        {
            await removeTravelerMutation.mutateAsync(modal.travelerId);
            toast.success('Traveler removed!');
            setModal({ ...modal, isOpen: false });
        } catch (err: any)
        {
            toast.error('Failed to remove traveler.');
        }
    };

    const getInitials = () => {
        const name = form.name || profile?.name || 'U';
        return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const tabs = [
        { id: 'basic' as const, label: 'Basic Info' },
        { id: 'password' as const, label: 'Password' },
        { id: 'travelers' as const, label: 'Saved Travelers' }
    ];

    // Stable server skeleton — avoids hydration mismatch
    if (!mounted)
    {
        return (
            <div className="togo-dashboard-booking-sec pt-25 pb-60">
                <div className="container">
                    <div className="row">
                        <h4 className="togo-dashboard-account-title mb-20">Profile Settings</h4>
                    </div>
                </div>
            </div>
        );
    }

    const currentAvatar = avatarPreview || profile?.avatar;

    return (
        <div className="togo-dashboard-booking-sec pt-25 pb-60">
            <div className="container">
                <div className="row">
                    <h4 className="togo-dashboard-account-title mb-20">Profile Settings</h4>

                    <div className="togo-dashboard-setting-wrap">

                        {/* ── Tabs ── */}
                        <div className="togo-dashboard-booking-tab pb-30">
                            <div className="togo-dashboard-setting-tabs">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={activeTab === tab.id ? 'active' : ''}
                                        type="button"
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ═══════════════════════════════════
                            BASIC INFO TAB
                        ═══════════════════════════════════ */}
                        {activeTab === 'basic' && (
                            <div className="togo-dashboard-setting-info pb-50">

                                {/* Avatar */}
                                <div className="d-flex align-items-center gap-4 flex-wrap mb-30">
                                    <div
                                        className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                                        style={{
                                            width: 72, height: 72, flexShrink: 0, fontSize: 24,
                                            background: currentAvatar ? 'transparent' : '#FD4621',
                                            border: currentAvatar ? '2px solid #fff' : 'none'
                                        }}
                                    >
                                        {currentAvatar
                                            ? <img src={getImgUrl(currentAvatar)} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : getInitials()
                                        }
                                    </div>
                                    <div>
                                        <span className="d-block fw-bold">Change avatar</span>
                                        <p className="text-muted mb-0" style={{ fontSize: 13 }}>PNG or JPG</p>
                                    </div>
                                    <div className="position-relative d-inline-block">
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/png,image/jpeg"
                                            onChange={handleAvatarChange}
                                            className="position-absolute w-100 h-100 opacity-0"
                                            style={{ cursor: 'pointer', zIndex: 2, top: 0, left: 0 }}
                                        />
                                        <span className="togo-btn-primary d-inline-block px-4 py-2" style={{ zIndex: 1, pointerEvents: 'none' }}>
                                            Upload
                                        </span>
                                    </div>
                                </div>

                                {profileLoading ? (
                                    /* Skeleton while profile loads */
                                    <div>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="skeleton mb-3" style={{ height: 50, borderRadius: 6 }} />
                                        ))}
                                    </div>
                                ) : (
                                    <form onSubmit={handleBasicSubmit}>
                                        <div className="togo-dashboard-setting-grid">

                                            {/* Name */}
                                            <div className="togo-contact-input">
                                                <input
                                                    type="text"
                                                    placeholder="Full name *"
                                                    value={form.name}
                                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            {/* Email (read-only) */}
                                            <div className="togo-contact-input">
                                                <input
                                                    type="email"
                                                    placeholder="Email (cannot be changed)"
                                                    value={profile?.email || ''}
                                                    disabled
                                                    style={{ background: '#f5f5f5', color: '#999', cursor: 'not-allowed' }}
                                                />
                                            </div>

                                            {/* Phone — E.164 format */}
                                            <div className="togo-contact-input">
                                                <input
                                                    type="tel"
                                                    placeholder="Phone (e.g. +919876543210)"
                                                    value={form.phone}
                                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                                />
                                                <small className="text-muted" style={{ fontSize: 11 }}>
                                                    Use international format: +[country code][number]
                                                </small>
                                            </div>

                                            {/* Date of Birth */}
                                            <div className="togo-contact-input">
                                                <input
                                                    type="date"
                                                    placeholder="Date of birth"
                                                    value={form.dateOfBirth}
                                                    onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                                                />
                                            </div>

                                            {/* Gender */}
                                            <div className="togo-contact-input">
                                                <select
                                                    value={form.gender}
                                                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value={Gender.MALE}>Male</option>
                                                    <option value={Gender.FEMALE}>Female</option>
                                                    <option value={Gender.OTHER}>Other</option>
                                                </select>
                                            </div>

                                            {/* Country */}
                                            <div className="togo-contact-input">
                                                <input
                                                    type="text"
                                                    placeholder="Country"
                                                    value={form.country}
                                                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                                                />
                                            </div>

                                            {/* Contact Address (full-width) */}
                                            <div className="togo-contact-input" style={{ gridColumn: '1 / -1' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Contact address"
                                                    value={form.contactAddress}
                                                    onChange={e => setForm(f => ({ ...f, contactAddress: e.target.value }))}
                                                />
                                            </div>

                                        </div>

                                        <div className="togo-dashboard-setting-info-btn mt-4">
                                            <button
                                                type="submit"
                                                className="togo-btn-primary"
                                                disabled={updateMutation.isPending}
                                            >
                                                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* ═══════════════════════════════════
                            PASSWORD TAB
                        ═══════════════════════════════════ */}
                        {activeTab === 'password' && (
                            <div className="togo-dashboard-setting-info pb-50">
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="togo-contact-input mb-20">
                                                <input
                                                    type="password"
                                                    placeholder="Current password *"
                                                    value={pwForm.currentPassword}
                                                    onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="togo-contact-input mb-20">
                                                <input
                                                    type="password"
                                                    placeholder="New password * (min 6 characters)"
                                                    value={pwForm.newPassword}
                                                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="togo-contact-input mb-24">
                                                <input
                                                    type="password"
                                                    placeholder="Confirm new password *"
                                                    value={pwForm.confirmPassword}
                                                    onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="togo-dashboard-setting-info-btn">
                                        <button
                                            type="submit"
                                            className="togo-btn-primary"
                                            disabled={passwordMutation.isPending}
                                        >
                                            {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ═══════════════════════════════════
                            TRAVELERS TAB
                        ═══════════════════════════════════ */}
                        {activeTab === 'travelers' && (
                            <div className="togo-dashboard-setting-info pb-50">
                                <h5 className="mb-4">Your Saved Travelers</h5>
                                {travelersLoading ? (
                                    <div className="text-muted mb-4">Loading travelers...</div>
                                ) : travelers && travelers.length > 0 ? (
                                    <div className="row mb-5">
                                        {travelers.map((t: any) => (
                                            <div key={t._id} className="col-md-6 mb-3">
                                                <div className="border rounded p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f9f9f9', borderColor: '#eee' }}>
                                                    <div>
                                                        <strong className="d-block text-dark mb-1" style={{ fontSize: 15 }}>{t.fullName}</strong>
                                                        <small className="text-muted d-block" style={{ fontSize: 12 }}>Age: {t.age} • Gender: {t.gender}</small>
                                                        <small className="text-muted" style={{ fontSize: 12 }}>ID: {t.idNumber}</small>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveTraveler(t._id)}
                                                        disabled={removeTravelerMutation.isPending}
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Remove Traveler"
                                                        style={{ width: 32, height: 32, padding: 0, borderRadius: '50%' }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted mb-5">No travelers saved yet.</div>
                                )}

                                <h5 className="mb-4">Add New Traveler</h5>
                                <form onSubmit={handleAddTraveler}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <div className="togo-contact-input">
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    value={travelerForm.fullName}
                                                    onChange={e => setTravelerForm(f => ({ ...f, fullName: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="togo-contact-input">
                                                <input
                                                    type="number"
                                                    placeholder="Age"
                                                    value={travelerForm.age}
                                                    onChange={e => setTravelerForm(f => ({ ...f, age: e.target.value }))}
                                                    required
                                                    min="0"
                                                    max="120"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="togo-contact-input">
                                                <select
                                                    value={travelerForm.gender}
                                                    onChange={e => setTravelerForm(f => ({ ...f, gender: e.target.value }))}
                                                    required
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value={Gender.MALE}>Male</option>
                                                    <option value={Gender.FEMALE}>Female</option>
                                                    <option value={Gender.OTHER}>Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="togo-contact-input">
                                                <input
                                                    type="text"
                                                    placeholder="ID Number (Passport/DL)"
                                                    value={travelerForm.idNumber}
                                                    onChange={e => setTravelerForm(f => ({ ...f, idNumber: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="togo-dashboard-setting-info-btn mt-3">
                                        <button
                                            type="submit"
                                            className="togo-btn-primary"
                                            disabled={addTravelerMutation.isPending}
                                        >
                                            {addTravelerMutation.isPending ? 'Adding…' : 'Add Traveler'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ═══════════════════════════════════
                            SETTINGS TAB
                        ═══════════════════════════════════ */}
                        {/* {activeTab === 'settings' && (
                            <div className="togo-dashboard-setting-info pb-50">
                                <form onSubmit={e => { e.preventDefault(); toast.success('Settings saved!'); }}>
                                    <div className="row">
                                        <div className="col-12">
                                            <label className="fw-medium text-dark mb-2 d-block" style={{ fontSize: 14 }}>
                                                Display Language
                                            </label>
                                            <div className="togo-contact-input mb-20">
                                                <select defaultValue="en">
                                                    <option value="en">English</option>
                                                    <option value="es">Spanish</option>
                                                    <option value="fr">French</option>
                                                    <option value="hi">Hindi</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <label className="fw-medium text-dark mb-2 d-block" style={{ fontSize: 14 }}>
                                                Time Zone
                                            </label>
                                            <div className="togo-contact-input mb-24">
                                                <select defaultValue="IST">
                                                    <option value="UTC">UTC — Coordinated Universal Time</option>
                                                    <option value="IST">IST — India Standard Time (UTC+5:30)</option>
                                                    <option value="EST">EST — US Eastern Standard Time (UTC-5)</option>
                                                    <option value="PST">PST — US Pacific Standard Time (UTC-8)</option>
                                                    <option value="GMT">GMT — Greenwich Mean Time</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="togo-dashboard-setting-info-btn">
                                        <button type="submit" className="togo-btn-primary">Save Settings</button>
                                    </div>
                                </form>
                            </div>
                        )} */}

                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={confirmRemoveTraveler}
                title={modal.title}
                message={modal.message}
                type="danger"
                confirmText="Remove"
                isLoading={removeTravelerMutation.isPending}
            />
        </div>
    );
}
