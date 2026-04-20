'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/src/store/useAuthStore';
import toast from 'react-hot-toast';
import axios from '@/src/lib/api/axios';
import { getErrorMessage } from '@lib/utils/error-handler';

/** Key used to persist booking redirect intent across OAuth redirects */
export const BOOKING_REDIRECT_KEY = 'booking_redirect_intent';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number (e.g. +1234567890)'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
});

type RegisterValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser, setTokens, setLoading: setGlobalLoading } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    /** After registration, go to the ?redirect param or the stored redirect, else /dashboard */
    const getPostLoginRedirect = () => {
        const param = searchParams?.get('redirect');
        const stored = typeof window !== 'undefined'
            ? localStorage.getItem(BOOKING_REDIRECT_KEY)
            : null;

        // Prioritize actual URL param over stored intent
        return param || stored || '/dashboard';
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterValues) => {
        try
        {
            setIsLoading(true);
            setGlobalLoading(true);

            const payload = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password
            };

            const response = await axios.post('/auth/register', payload);
            const { user, accessToken, refreshToken } = response.data.data;

            setTokens(accessToken, refreshToken);
            setUser(user);

            toast.success('Registration successful!');

            // Clear stored booking intent and redirect there
            const redirectTo = getPostLoginRedirect();
            if (typeof window !== 'undefined')
            {
                localStorage.removeItem(BOOKING_REDIRECT_KEY);
                // Using window.location.href for definitive redirect after auth change
                window.location.href = redirectTo;
            }
        } catch (error: any)
        {
            toast.error(getErrorMessage(error, 'Failed to register. Please try again.'));
        } finally
        {
            setIsLoading(false);
            setGlobalLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        // Store where the user should go AFTER Google OAuth completes
        const param = searchParams?.get('redirect');
        if (param && typeof window !== 'undefined')
        {
            localStorage.setItem(BOOKING_REDIRECT_KEY, param);
        }
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`;
    };

    return (
        <div className="togo-contact-sec d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
            <div className="container container-1240">
                <div className="row justify-content-center">
                    <div className="col-lg-5">
                        <div className="togo-contact-wrapper shadow-lg rounded-4 bg-white" style={{ border: '1px solid #f0f0f0' }}>
                            <div className="togo-contact-form">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="togo-sign-in-heading text-center mb-30">
                                                <h4 className="togo-section-title fs-48 mb-10">Sign Up</h4>
                                                <p>Already have an account? <Link href={`/login${searchParams?.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}>Sign In</Link></p>
                                            </div>
                                            <div className="togo-contact-input mb-10">
                                                <label>Name *</label>
                                                <input
                                                    type="text"
                                                    {...register('name')}
                                                    placeholder="Your full name"
                                                    style={{ height: '45px' }}
                                                />
                                                {errors.name && <span className="text-danger mt-1 d-block" style={{ fontSize: '14px' }}>{errors.name.message}</span>}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="togo-contact-input mb-10">
                                                <label>Email *</label>
                                                <input
                                                    type="email"
                                                    {...register('email')}
                                                    placeholder="Your email address"
                                                    style={{ height: '45px' }}
                                                />
                                                {errors.email && <span className="text-danger mt-1 d-block" style={{ fontSize: '14px' }}>{errors.email.message}</span>}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="togo-contact-input mb-10">
                                                <label>Phone *</label>
                                                <input
                                                    type="tel"
                                                    {...register('phone')}
                                                    placeholder="Your phone number"
                                                    style={{ height: '45px' }}
                                                />
                                                {errors.phone && <span className="text-danger mt-1 d-block" style={{ fontSize: '14px' }}>{errors.phone.message}</span>}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="togo-contact-input mb-10">
                                                <label>Password *</label>
                                                <input
                                                    type="password"
                                                    {...register('password')}
                                                    placeholder="Create a password"
                                                    style={{ height: '45px' }}
                                                />
                                                {errors.password && <span className="text-danger mt-1 d-block" style={{ fontSize: '14px' }}>{errors.password.message}</span>}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="togo-contact-input mb-10">
                                                <label>Confirm Password *</label>
                                                <input
                                                    type="password"
                                                    {...register('passwordConfirm')}
                                                    placeholder="Confirm your password"
                                                    style={{ height: '45px' }}
                                                />
                                                {errors.passwordConfirm && <span className="text-danger mt-1 d-block" style={{ fontSize: '14px' }}>{errors.passwordConfirm.message}</span>}
                                            </div>
                                        </div>
                                        <div className="col-xl-12">
                                            <button
                                                className="togo-btn-primary w-100 d-block mb-3 mt-3"
                                                type="submit"
                                                disabled={isLoading}
                                                style={{ height: '45px', borderRadius: '6px', fontSize: '15px', fontWeight: 600 }}
                                            >
                                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                                            </button>

                                            <div className="text-center mt-3 pt-3 border-top">
                                                <span className="d-block mb-3 text-muted" style={{ fontSize: '14px' }}>Or continue with</span>
                                                <button
                                                    type="button"
                                                    onClick={handleGoogleRegister}
                                                    className="w-100 d-flex align-items-center justify-content-center"
                                                    style={{ gap: '10px', height: '45px', borderRadius: '6px', border: '1px solid #e1e1e1', backgroundColor: '#fff', color: '#444', fontWeight: '600', transition: 'all 0.3s', fontSize: '15px' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.borderColor = '#d1d1d1'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e1e1e1'; }}
                                                >
                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                    </svg>
                                                    Google
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default RegisterForm;