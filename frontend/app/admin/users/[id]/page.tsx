'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminUserHooks } from '@hooks/admin/useAdminUserHooks';
import toast from 'react-hot-toast';
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Ban,
    CheckCircle2,
    ChevronLeft,
    CreditCard,
    ClipboardCopy,
    StickyNote,
    Ticket,
    Heart,
    Users as UsersIcon,
    ArrowUpRight
} from 'lucide-react';
import { DateUtils } from '@lib/utils/date-utils';
import { UserRole } from '@lib/constants/enums';

export default function AdminUserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const { useUserById, useBlockUser, useUnblockUser, useAddNote } = useAdminUserHooks();
    const { data: response, isLoading } = useUserById(userId);

    const blockMutation = useBlockUser();
    const unblockMutation = useUnblockUser();
    const addNoteMutation = useAddNote();

    const userData = (response as any)?.data?.user || (response as any)?.user || response || {};
    const user = userData;
    const totalBookings = (response as any)?.data?.totalBookings ?? (response as any)?.totalBookings ?? 0;
    const totalSpent = (response as any)?.data?.totalSpent ?? (response as any)?.totalSpent ?? 0;
    const bookings = Array.isArray((response as any)?.data?.bookings) ? (response as any)?.data?.bookings : Array.isArray((response as any)?.bookings) ? (response as any)?.bookings : Array.isArray(user?.bookings) ? user.bookings : [];

    const [noteInput, setNoteInput] = useState('');

    const handleBlockToggle = async () => {
        if (!user) return;
        if (user.isBlocked)
        {
            try
            {
                await unblockMutation.mutateAsync(userId);
                toast.success('User unblocked successfully');
            } catch (err)
            {
                toast.error('Failed to unblock user');
            }
        } else
        {
            const reason = window.prompt("Reason for blocking this user (optional):");
            if (reason !== null)
            {
                try
                {
                    await blockMutation.mutateAsync({ id: userId, reason });
                    toast.success('User blocked successfully');
                } catch (err)
                {
                    toast.error('Failed to block user');
                }
            }
        }
    };

    const handleAddNote = async () => {
        if (!noteInput.trim()) return;
        try
        {
            await addNoteMutation.mutateAsync({ id: userId, note: noteInput });
            toast.success('Note added successfully');
            setNoteInput('');
        } catch (err)
        {
            toast.error('Failed to add note');
        }
    };

    if (isLoading) return <div className="p-5 text-center">Loading user details...</div>;
    if (!user) return <div className="p-5 text-center">User not found</div>;

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-30">
                    <button onClick={() => router.push('/admin/users')} className="btn btn-light d-flex align-items-center gap-2" style={{ borderRadius: '10px', fontWeight: 600 }}>
                        <ChevronLeft size={18} /> Back to Directory
                    </button>
                    <div className="d-flex gap-2">
                        <button
                            onClick={handleBlockToggle}
                            disabled={blockMutation.isPending || unblockMutation.isPending}
                            className={`btn ${user.isBlocked ? 'btn-success' : 'btn-danger'} d-flex align-items-center gap-2`}
                            style={{ borderRadius: '10px', fontWeight: 700, padding: '10px 20px' }}
                        >
                            {user.isBlocked ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                            {user.isBlocked ? 'Unblock Account' : 'Suspend Account'}
                        </button>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Left Column: Essential Profile */}
                    <div className="col-lg-4 mb-30 mb-lg-0">
                        <div style={{ background: '#fff', borderRadius: '20px', padding: '35px 25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center', border: '1px solid #f1f3f9' }}>
                            <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: '#F4F7FC', margin: '0 auto 24px', overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}>
                                <img src={user.avatar || user.profileImage || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h5 style={{ fontWeight: 800, margin: '0 0 10px', fontSize: '22px', color: '#111', letterSpacing: '-0.5px' }}>{user.name}</h5>
                            <div className="d-flex align-items-center justify-content-center gap-2 mb-25">
                                <span style={{ padding: '6px 14px', borderRadius: '30px', fontSize: '11px', fontWeight: 800, backgroundColor: user.role?.toUpperCase() === UserRole.ADMIN ? '#EEF2FF' : '#F3F4F6', color: user.role?.toUpperCase() === UserRole.ADMIN ? '#4F46E5' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {user.role}
                                </span>
                                <span style={{ padding: '6px 14px', borderRadius: '30px', fontSize: '11px', fontWeight: 800, backgroundColor: user.isBlocked ? '#FFEBEE' : '#E8F5E9', color: user.isBlocked ? '#C62828' : '#2E7D32', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {user.isBlocked ? 'SUSPENDED' : 'ACTIVE'}
                                </span>
                            </div>

                            <div className="text-start border-top pt-25 mt-20">
                                <div className="mb-20 d-flex align-items-center gap-3">
                                    <div style={{ padding: '10px', background: '#eef2ff', borderRadius: '12px', color: '#4f46e5' }}><Mail size={18} /></div>
                                    <div className="min-w-0 flex-grow-1">
                                        <p style={{ fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Email Address</p>
                                        <p style={{ fontWeight: 600, margin: 0, fontSize: '14px', color: '#222', wordBreak: 'break-all' }}>{user.email}</p>
                                    </div>
                                    <a href={`mailto:${user.email}`} title="Send Email" style={{ color: '#aaa', padding: '6px' }} className="btn-light rounded-circle"><ArrowUpRight size={16} /></a>
                                </div>
                                <div className="mb-20 d-flex align-items-center gap-3">
                                    <div style={{ padding: '10px', background: '#eef2ff', borderRadius: '12px', color: '#4f46e5' }}><Phone size={18} /></div>
                                    <div className="flex-grow-1">
                                        <p style={{ fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Phone Number</p>
                                        <p style={{ fontWeight: 600, margin: 0, fontSize: '14px', color: '#222' }}>{user.phone || 'Not provided'}</p>
                                    </div>
                                    {user.phone && <a href={`tel:${user.phone}`} title="Call Phone" style={{ color: '#aaa', padding: '6px' }} className="btn-light rounded-circle"><ArrowUpRight size={16} /></a>}
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{ padding: '10px', background: '#F4F7FC', borderRadius: '12px', color: '#1a73e8' }}><Calendar size={18} /></div>
                                    <div>
                                        <p style={{ fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Joined Date</p>
                                        <p style={{ fontWeight: 600, margin: 0, fontSize: '14px', color: '#222' }}>{DateUtils.formatToIST(user.createdAt || user.date, 'DD MMMM YYYY')}</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3 mt-3 pt-3 border-top">
                                    <div style={{ padding: '10px', background: '#F4F7FC', borderRadius: '12px', color: '#1a73e8' }}><Ticket size={18} /></div>
                                    <div>
                                        <p style={{ fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Total Bookings</p>
                                        <p style={{ fontWeight: 600, margin: 0, fontSize: '14px', color: '#222' }}>{totalBookings} Booking(s)</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3 mt-3">
                                    <div style={{ padding: '10px', background: '#eef2ff', borderRadius: '12px', color: '#4f46e5' }}><CreditCard size={18} /></div>
                                    <div>
                                        <p style={{ fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Total Spent</p>
                                        <p style={{ fontWeight: 600, margin: 0, fontSize: '14px', color: '#10b981' }}>₹{totalSpent.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats & Content Details */}
                        <div className="d-flex gap-3 mb-4 mt-4">
                            <div className="flex-fill" style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f3f9' }}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Wishlist</p>
                                    <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '10px', color: '#ef4444' }}><Heart size={16} /></div>
                                </div>
                                <h4 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>{user.wishlist?.length || 0}</h4>
                                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 10px', fontWeight: 600 }}>Saved Tours</p>

                                {user.wishlist && user.wishlist.length > 0 && (
                                    <div className="d-flex flex-column gap-2 mt-2 pt-2 border-top">
                                        {user.wishlist.slice(0, 3).map((tour: any, i: number) => (
                                            <a key={i} href={`/tours/${tour.slug}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none d-flex align-items-center gap-2" style={{ padding: '6px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                <img src={tour.thumbnailImage} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                                                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{tour.title}</p>
                                            </a>
                                        ))}
                                        {user.wishlist.length > 3 && (
                                            <p className="text-center mb-0 mt-1" style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>+{user.wishlist.length - 3} more</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* <div className="flex-fill" style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f3f9' }}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Travelers</p>
                                    <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '10px', color: '#22c55e' }}><UsersIcon size={16} /></div>
                                </div>
                                <h4 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>{user.savedTravelers?.length || 0}</h4>
                                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 10px', fontWeight: 600 }}>Profiles</p>

                                {user.savedTravelers && user.savedTravelers.length > 0 && (
                                    <div className="d-flex flex-column gap-2 mt-2 pt-2 border-top">
                                        {user.savedTravelers.slice(0, 3).map((traveler: any, i: number) => (
                                            <div key={i} className="d-flex align-items-center gap-2" style={{ padding: '8px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>
                                                    {traveler.fullName?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex-grow-1 min-w-0">
                                                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{traveler.fullName}</p>
                                                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{traveler.age} yrs • {traveler.gender}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {user.savedTravelers.length > 3 && (
                                            <p className="text-center mb-0 mt-1" style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>+{user.savedTravelers.length - 3} more</p>
                                        )}
                                    </div>
                                )}
                            </div> */}
                        </div>
                    </div>

                    {/* Right Column: Activity & Notes */}
                    <div className="col-lg-8">
                        {/* Address Card */}
                        <div style={{ background: '#fff', borderRadius: '20px', padding: '25px 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f3f9', marginBottom: '24px' }}>
                            <h6 style={{ fontWeight: 800, marginBottom: '20px', color: '#111', fontSize: '16px' }} className="d-flex align-items-center gap-2">
                                <div style={{ padding: '6px', background: '#EEF2FF', borderRadius: '8px', color: '#4F46E5' }}><MapPin size={16} /></div>
                                Primary Address
                            </h6>
                            <p style={{ color: '#555', fontSize: '14.5px', margin: 0, lineHeight: '1.7' }}>
                                {user.address?.street ? (
                                    <>
                                        <span style={{ fontWeight: 600, color: '#222' }}>{user.address.street}</span><br />
                                        {user.address.city}, {user.address.state || ''} {user.address.zipCode || ''}<br />
                                        {user.address.country}
                                    </>
                                ) : (
                                    <span style={{ color: '#888', fontStyle: 'italic', fontSize: '14px' }}>Address information not registered.</span>
                                )}
                            </p>
                        </div>

                        {/* Recent Activity Card */}
                        <div style={{ background: '#fff', borderRadius: '20px', padding: '25px 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f3f9', marginBottom: '24px' }}>
                            <h6 style={{ fontWeight: 800, marginBottom: '20px', color: '#111', fontSize: '16px' }} className="d-flex align-items-center gap-2">
                                <div style={{ padding: '6px', background: '#EEF2FF', borderRadius: '8px', color: '#4F46E5' }}><CreditCard size={16} /></div>
                                Booking Activity
                            </h6>
                            {bookings && bookings.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-borderless mb-0">
                                        <thead>
                                            <tr style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
                                                <th className="px-0 pb-3 border-bottom">Ref ID</th>
                                                <th className="pb-3 border-bottom">Date</th>
                                                <th className="pb-3 border-bottom">Paid Amount</th>
                                                <th className="px-0 pb-3 border-bottom text-end">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((b: any, i: number) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f8f9fa', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => router.push(`/admin/bookings/${b._id}`)}>
                                                    <td className="px-0 py-3" style={{ fontSize: '13.5px', fontWeight: 700, color: '#333' }}>
                                                        <span className="text-primary text-decoration-underline">#{b.bookingNumber || b.id?.slice(-8) || b._id?.slice(-8)}</span>
                                                    </td>
                                                    <td className="py-3" style={{ fontSize: '13.5px', color: '#666', fontWeight: 500 }}>{DateUtils.formatToIST(b.createdAt || b.date, 'DD MMM YYYY')}</td>
                                                    <td className="py-3" style={{ fontSize: '14px', fontWeight: 800, color: '#111' }}>
                                                        ₹{(b.paidAmount || 0).toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="px-0 py-3 text-end">
                                                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '5px 12px', borderRadius: '6px', backgroundColor: b.status?.toUpperCase() === 'CANCELLED' ? '#FEE2E2' : '#EFF6FF', color: b.status?.toUpperCase() === 'CANCELLED' ? '#EF4444' : '#3B82F6', textTransform: 'uppercase' }}>{b.status || 'PAID'}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-4" style={{ background: '#F9FAFB', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
                                    <p className="text-muted mb-0" style={{ fontSize: '14px', fontWeight: 500 }}>No booking transactions recorded for this user.</p>
                                </div>
                            )}
                        </div>

                        {/* Admin Notes Card */}
                        <div style={{ background: '#fff', borderRadius: '20px', padding: '25px 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f3f9' }}>
                            <h6 style={{ fontWeight: 800, marginBottom: '20px', color: '#111', fontSize: '16px' }} className="d-flex align-items-center gap-2">
                                <div style={{ padding: '6px', background: '#EEF2FF', borderRadius: '8px', color: '#4F46E5' }}><StickyNote size={16} /></div>
                                Internal Admin Notes
                            </h6>
                            <div className="mb-25">
                                <div className="d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Type an internal note here..."
                                        value={noteInput}
                                        onChange={(e) => setNoteInput(e.target.value)}
                                        style={{ fontSize: '14px', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '12px 18px', backgroundColor: '#F9FAFB' }}
                                    />
                                    <button
                                        onClick={handleAddNote}
                                        disabled={addNoteMutation.isPending || !noteInput.trim()}
                                        className="btn btn-dark"
                                        style={{ padding: '10px 24px', borderRadius: '12px', fontWeight: 700, flexShrink: 0, backgroundColor: '#111', border: 'none' }}
                                    >
                                        {addNoteMutation.isPending ? 'Saving...' : 'Post Note'}
                                    </button>
                                </div>
                            </div>

                            {user.adminNotes && user.adminNotes.length > 0 ? (
                                <div className="d-flex flex-column gap-3">
                                    {user.adminNotes.map((note: any, i: number) => (
                                        <div key={i} className="p-3" style={{ backgroundColor: '#F8F9FA', borderRadius: '14px', border: '1px solid #F1F3F9' }}>
                                            <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#333', lineHeight: '1.6', fontWeight: 500 }}>{note.note}</p>
                                            <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                                <span className="badge bg-white text-dark border" style={{ fontSize: '10px', fontWeight: 800, padding: '4px 8px', letterSpacing: '0.5px' }}>INTERNAL LOG</span>
                                                <span style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>
                                                    {DateUtils.formatToIST(note.createdAt || note.addedAt || note.date, 'DD MMM YYYY, hh:mm A')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4" style={{ background: '#F9FAFB', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
                                    <p className="mb-0" style={{ fontSize: '14px', color: '#888', fontStyle: 'italic' }}>No internal notes added yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
