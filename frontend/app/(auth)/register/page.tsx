import React, { Suspense } from 'react';
import RegisterForm from '@/src/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up',
    description: 'Create a new Shivansh Holidays account.',
};

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}><div className="spinner-border text-primary" role="status" /></div>}>
            <RegisterForm />
        </Suspense>
    );
}
