'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAdminTourHooks } from '@hooks/admin/useAdminTourHooks';
import toast from 'react-hot-toast';
import TourForm from '@/src/components/admin/tours/TourForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AdminTourEditPage() {
    const router = useRouter();
    const params = useParams();
    const tourId = params.id as string;

    const { useTourById, useUpdateTour, useDeleteImage } = useAdminTourHooks();
    const { data: response, isLoading: isTourLoading } = useTourById(tourId);

    const updateMutation = useUpdateTour();
    const deleteImageMutation = useDeleteImage();

    const tour = (response as any)?.data || response;

    const onSubmit = async (formData: FormData) => {
        try
        {
            await updateMutation.mutateAsync({ id: tourId, data: formData });
            toast.success('Tour updated successfully!');
            router.push('/admin/tours');
        } catch (err: any)
        {
            toast.error(err?.response?.data?.message || 'Failed to update tour');
        }
    };

    const handleDeleteImage = async (imageUrl: string) => {
        try
        {
            await deleteImageMutation.mutateAsync({ id: tourId, imageUrl });
            toast.success('Image deleted successfully');
        } catch (err)
        {
            toast.error('Failed to delete image');
        }
    };

    if (isTourLoading)
    {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-500 font-medium">Loading tour details...</p>
            </div>
        );
    }

    if (!tour)
    {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h4 className="text-xl font-bold text-gray-800">Tour not found</h4>
                <Link href="/admin/tours" className="mt-4 text-primary font-bold underline">Back to List</Link>
            </div>
        );
    }

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-0">Edit Tour Details</h4>
                        <p className="text-muted mt-2 mb-0">Tour: <strong style={{ color: '#1a73e8' }}>{tour?.title || 'Loading...'}</strong></p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link href={`/admin/tours/${tourId}/dates`} className="togo-btn-primary" style={{ background: '#2d8a4e', border: 'none' }}>
                            View Dates
                        </Link>
                        <Link href="/admin/tours" className="togo-btn-primary" style={{ background: '#f1f3f9', color: '#111' }}>
                            Back to Tours
                        </Link>
                    </div>
                </div>

                <TourForm
                    initialData={tour}
                    onSubmit={onSubmit}
                    isSubmitting={updateMutation.isPending}
                    mode="edit"
                    onDeleteImage={handleDeleteImage}
                />
            </div>
        </div>
    );
}
