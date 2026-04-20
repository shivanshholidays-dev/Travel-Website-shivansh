'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/src/store/useAuthStore';
import axios from '@/src/lib/api/axios';
import { UserRole } from '@/src/lib/constants/enums';

const CallbackContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setTokens, setUser } = useAuthStore();
    const [error, setError] = useState('');

    useEffect(() => {
        const processAuthCallback = async () => {
            const accessToken = searchParams.get('accessToken');
            const refreshToken = searchParams.get('refreshToken');

            if (accessToken && refreshToken)
            {
                try
                {
                    // Set tokens temporarily to allow API fetch
                    setTokens(accessToken, refreshToken);

                    // Fetch current user details since the redirect only provided tokens
                    const response = await axios.get('/auth/me');
                    const userData = response.data;
                    setUser(userData);

                    const userRole = (userData?.role || userData?.data?.role || '').toString().toLowerCase();

                    if (userRole === UserRole.ADMIN.toLowerCase())
                    {
                        window.location.href = '/admin';
                    } else
                    {
                        // Return user to their booking page if they were redirected mid-booking
                        const bookingIntent = localStorage.getItem('booking_redirect_intent');
                        if (bookingIntent)
                        {
                            localStorage.removeItem('booking_redirect_intent');
                            router.push(bookingIntent);
                        } else
                        {
                            router.push('/dashboard');
                        }
                    }
                } catch (err)
                {
                    setError('Failed to fetch user profile. Please try logging in again.');
                }
            } else
            {
                setError('Authentication failed: Missing tokens.');
            }
        };

        processAuthCallback();
    }, [searchParams, router, setTokens, setUser]);

    if (error)
    {
        return (
            <div className="togo-contact-sec pt-150 pb-100">
                <div className="container container-1440 text-center">
                    <h2 className="text-danger mb-4">Authentication Error</h2>
                    <p>{error}</p>
                    <button className="togo-btn-primary mt-4" onClick={() => router.push('/login')}>
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="togo-contact-sec pt-150 pb-100">
            <div className="container container-1440 text-center">
                <h2>Completing sign in...</h2>
                <div className="spinner-border text-primary mt-4" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );
};

export default function CallbackPage() {
    return (
        <Suspense fallback={<div className="text-center pt-150 pb-100"><h2>Loading...</h2></div>}>
            <CallbackContent />
        </Suspense>
    );
}
