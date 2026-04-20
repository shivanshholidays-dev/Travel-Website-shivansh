import React from 'react';
import ForgotPasswordForm from '@/src/components/auth/ForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password',
    description: 'Reset your Shivansh Holidays account password.',
};

export default function ForgotPasswordPage() {
    return (
        <React.Fragment>
            <ForgotPasswordForm />
        </React.Fragment>
    );
}
