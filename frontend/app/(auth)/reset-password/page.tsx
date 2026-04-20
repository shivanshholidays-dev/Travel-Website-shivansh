import React, { Suspense } from 'react';
import ResetPasswordForm from '@/src/components/auth/ResetPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Reset your Shivansh Holidays account password.',
};

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center pt-150 pb-100"><h2>Loading...</h2></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
