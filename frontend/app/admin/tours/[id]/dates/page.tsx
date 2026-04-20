'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminTourDateHooks } from '@hooks/admin/useAdminTourDateHooks';
import { adminToursApi } from '@lib/api/admin/tours.api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { CreateTourDatePayload } from '@lib/types/tour.types';
import { DateUtils } from '@lib/utils/date-utils';
import { TourDateStatus } from '@lib/constants/enums';
import Modal from '@components/ui/Modal';
import { Trash2 } from 'lucide-react';

export default function AdminTourDatesPage() {
    const params = useParams();
    const router = useRouter();
    const tourId = params.id as string;

    const { useTourDatesByTour, useAddTourDate, useUpdateTourDate, useDeleteTourDate } = useAdminTourDateHooks();

    const { data: datesResponse, isLoading } = useTourDatesByTour(tourId);
    const addMutation = useAddTourDate();
    const updateMutation = useUpdateTourDate();
    const deleteMutation = useDeleteTourDate();

    const [tourName, setTourName] = useState('Loading...');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [dateToDelete, setDateToDelete] = useState<string | null>(null);

    const initialFormState: CreateTourDatePayload = {
        tour: tourId,
        startDate: '',
        endDate: '',
        totalSeats: 30,
        priceOverride: undefined,
        departureNote: '',
    };

    const [formData, setFormData] = useState<any>(initialFormState);

    useEffect(() => {
        // Fetch tour name to display in the header
        if (tourId)
        {
            adminToursApi.getById(tourId).then((res: any) => {
                setTourName(res.data?.title || res.title || 'Unknown Tour');
            }).catch(() => setTourName('Tour Data Unavailable'));
        }
    }, [tourId]);

    const dates = Array.isArray(datesResponse) ? datesResponse : ((datesResponse as any)?.data?.items || (datesResponse as any)?.data || []);

    const handleOpenForm = (date?: any) => {
        if (date)
        {
            setEditingId(date._id || date.id);
            setFormData({
                tour: tourId,
                startDate: date.startDate ? DateUtils.formatDateForInput(date.startDate) : '',
                endDate: date.endDate ? DateUtils.formatDateForInput(date.endDate) : '',
                totalSeats: date.totalSeats || 30,
                priceOverride: date.priceOverride || '',
                departureNote: date.departureNote || '',
                status: date.status || TourDateStatus.UPCOMING
            });
        } else
        {
            setEditingId(null);
            setFormData(initialFormState);
        }
        setIsFormVisible(true);
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
        setEditingId(null);
        setFormData(initialFormState);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let finalValue: any = value;
        if (type === 'number' && name !== 'priceOverride') finalValue = value === '' ? undefined : Number(value);
        if (name === 'priceOverride' && value !== '') finalValue = Number(value);
        setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try
        {
            const payload = { ...formData };
            if (payload.priceOverride === '')
            {
                payload.priceOverride = null;
            }

            if (editingId)
            {
                await updateMutation.mutateAsync({
                    tourId,
                    dateId: editingId,
                    data: payload
                });
                toast.success('Tour date updated successfully');
            } else
            {
                await addMutation.mutateAsync({ data: payload });
                toast.success('Tour date added successfully');
            }
            handleCloseForm();
        } catch (err: any)
        {
            let errMsg = err.response?.data?.message || 'Failed to save tour date';
            if (Array.isArray(errMsg)) errMsg = errMsg[0];
            toast.error(errMsg);
        }
    };

    const handleDelete = async (dateId: string) => {
        setDateToDelete(dateId);
    };

    const confirmDelete = async () => {
        if (!dateToDelete) return;
        try
        {
            await deleteMutation.mutateAsync({ tourId, dateId: dateToDelete });
            toast.success('Tour date deleted');
            setDateToDelete(null);
        } catch (err)
        {
            toast.error('Failed to delete tour date');
        }
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-0">Scheduled Dates</h4>
                        <p className="text-muted mt-2 mb-0">Tour: <strong style={{ color: '#1a73e8' }}>{tourName}</strong></p>
                    </div>
                    <div className="d-flex gap-2">
                        {!isFormVisible && (
                            <button onClick={() => handleOpenForm()} className="togo-btn-primary" style={{ background: '#2d8a4e', border: 'none' }}>
                                + Add Dates
                            </button>
                        )}
                        <Link href="/admin/tours" className="togo-btn-primary" style={{ background: '#f1f3f9', color: '#111' }}>
                            Back to Tours
                        </Link>
                    </div>
                </div>

                {isFormVisible && (
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #1a73e8', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                        <h5 className="mb-20">{editingId ? 'Edit Scheduled Date' : 'Add Scheduled Date'}</h5>
                        <form onSubmit={handleSubmit} className="row">
                            <div className="col-md-6 mb-20">
                                <label className="form-label font-bold mb-10">Start Date</label>
                                <input type="date" className="form-control" name="startDate" value={formData.startDate} onChange={handleChange} required style={{ borderRadius: '8px' }} />
                            </div>
                            <div className="col-md-6 mb-20">
                                <label className="form-label font-bold mb-10">End Date</label>
                                <input type="date" className="form-control" name="endDate" value={formData.endDate} onChange={handleChange} required style={{ borderRadius: '8px' }} />
                            </div>
                            <div className="col-md-4 mb-20">
                                <label className="form-label font-bold mb-10">Total Seats</label>
                                <input type="number" className="form-control" name="totalSeats" value={formData.totalSeats || ''} onChange={handleChange} required min="1" style={{ borderRadius: '8px' }} />
                            </div>
                            <div className="col-md-4 mb-20">
                                <label className="form-label font-bold mb-10">Special Price Override (opt)</label>
                                <input type="number" step="0.01" className="form-control" name="priceOverride" value={formData.priceOverride || ''} onChange={handleChange} min="0" placeholder="Base price if blank" style={{ borderRadius: '8px' }} />
                            </div>
                            {editingId && (
                                <div className="col-md-4 mb-20">
                                    <label className="form-label font-bold mb-10">Status</label>
                                    <select className="form-select" name="status" value={formData.status} onChange={handleChange} style={{ borderRadius: '8px' }}>
                                        <option value={TourDateStatus.UPCOMING}>Upcoming</option>
                                        <option value={TourDateStatus.FULL}>Full</option>
                                        <option value={TourDateStatus.COMPLETED}>Completed</option>
                                        <option value={TourDateStatus.CANCELLED}>Cancelled</option>
                                    </select>
                                </div>
                            )}
                            <div className="col-12 mb-20">
                                <label className="form-label font-bold mb-10">Departure Notes (opt)</label>
                                <textarea className="form-control" rows={2} name="departureNote" value={formData.departureNote} onChange={handleChange} placeholder="e.g. Special Holiday Departure" style={{ borderRadius: '8px' }} />
                            </div>
                            <div className="col-12 d-flex gap-2">
                                <button type="submit" disabled={addMutation.isPending || updateMutation.isPending} className="togo-btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none' }}>
                                    {(addMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save Dates'}
                                </button>
                                <button type="button" onClick={handleCloseForm} className="togo-btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#f1f3f9', color: '#111' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="togo-dashboard-table-container" style={{ background: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ verticalAlign: 'middle' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th className="ps-4 py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Dates</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Availability</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Price</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Notes</th>
                                    <th className="py-3" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                    <th className="pe-4 py-3 text-end" style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={6} className="text-center py-5 text-muted">Loading tour dates...</td></tr>
                                ) : !Array.isArray(dates) || dates.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-5 text-muted">No scheduled dates found for this tour.</td></tr>
                                ) : (
                                    dates.map((d: any) => (
                                        <tr key={d._id || d.id} style={{ borderBottom: '1px solid #f1f3f9' }}>
                                            <td className="ps-4">
                                                <div style={{ fontWeight: 600, color: '#111' }}>
                                                    {DateUtils.formatToIST(d.startDate, 'DD MMM YYYY')}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#888' }}>
                                                    to {DateUtils.formatToIST(d.endDate, 'DD MMM YYYY')}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: (d.availableSeats ?? (d.totalSeats - (d.bookedSeats || 0))) <= 5 ? '#e55' : '#111' }}>
                                                    {d.availableSeats ?? (d.totalSeats - (d.bookedSeats || 0))} / {d.totalSeats} <span style={{ fontWeight: 400, color: '#888', fontSize: '12px' }}>left</span>
                                                </div>
                                                <div className="progress mt-1" style={{ height: '4px', width: '80px', borderRadius: '4px' }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width: `${Math.min(100, (d.bookedSeats / d.totalSeats) * 100)}%`,
                                                            backgroundColor: (d.bookedSeats / d.totalSeats) > 0.8 ? '#e55' : '#2d8a4e'
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 700, color: d.priceOverride ? '#2d8a4e' : '#111' }}>
                                                    {d.priceOverride ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(d.priceOverride) : 'Standard'}
                                                </div>
                                                {d.priceOverride && <div style={{ fontSize: '10px', color: '#888', textDecoration: 'line-through' }}>Original Price</div>}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '12px', color: '#555', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.departureNote}>
                                                    {d.departureNote || '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: 'inline-block', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                                    backgroundColor: d.status === TourDateStatus.UPCOMING ? '#E3F2FD' : d.status === TourDateStatus.FULL ? '#FFF3E0' : d.status === TourDateStatus.COMPLETED ? '#E8F5E9' : '#FFEBEE',
                                                    color: d.status === TourDateStatus.UPCOMING ? '#1976D2' : d.status === TourDateStatus.FULL ? '#E65100' : d.status === TourDateStatus.COMPLETED ? '#2E7D32' : '#C62828'
                                                }}>
                                                    {d.status || TourDateStatus.UPCOMING}
                                                </span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenForm(d)}
                                                        className="btn btn-sm btn-light"
                                                        style={{ borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(d._id || d.id)}
                                                        disabled={deleteMutation.isPending}
                                                        className="btn btn-sm btn-outline-danger"
                                                        style={{ borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Deletion Confirmation Modal */}
            <Modal
                isOpen={!!dateToDelete}
                onClose={() => setDateToDelete(null)}
                title="Confirm Date Deletion"
                size="sm"
                footer={(
                    <>
                        <button type="button" onClick={() => setDateToDelete(null)}
                            style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="button"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete Date'}
                        </button>
                    </>
                )}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ background: '#fef2f2', color: '#dc2626', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Trash2 size={24} />
                    </div>
                    <p style={{ margin: 0, color: '#111827', fontWeight: 700, fontSize: 16 }}>Are you sure?</p>
                    <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>
                        This scheduled date will be removed. This action cannot be undone and may affect existing bookings.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
