import React, { Suspense } from 'react';
import LoginForm from '@/src/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Sign in to your Shivansh Holidays account.',
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}><div className="spinner-border text-primary" role="status" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
