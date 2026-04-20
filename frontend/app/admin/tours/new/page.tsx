'use client';

import { useRouter } from 'next/navigation';
import { useAdminTourHooks } from '@hooks/admin/useAdminTourHooks';
import toast from 'react-hot-toast';
import TourForm from '@/src/components/admin/tours/TourForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AdminTourNewPage() {
    const router = useRouter();
    const { useCreateTour } = useAdminTourHooks();
    const createMutation = useCreateTour();

    const onSubmit = async (formData: FormData) => {
        try
        {
            await createMutation.mutateAsync(formData);
            toast.success('Tour created successfully!');
            router.push('/admin/tours');
        } catch (err: any)
        {
            toast.error(err?.response?.data?.message || 'Failed to create tour');
        }
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-0">Publish New Tour</h4>
                        <p className="text-muted mt-2 mb-0">Create a high-quality travel package</p>
                    </div>
                    <Link href="/admin/tours" className="togo-btn-primary" style={{ background: '#f1f3f9', color: '#111' }}>
                        Back to Tours
                    </Link>
                </div>

                <TourForm
                    onSubmit={onSubmit}
                    isSubmitting={createMutation.isPending}
                    mode="create"
                />
            </div>
        </div>
    );
}
