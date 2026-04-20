'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import axios from '@/src/lib/api/axios';

const resetPasswordSchema = z.object({
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordValues) => {
        if (!email)
        {
            toast.error('Invalid or missing email address.');
            return;
        }

        try
        {
            setIsLoading(true);
            await axios.post('/auth/reset-password', {
                email,
                otp: data.otp,
                newPassword: data.password,
            });

            toast.success('Password successfully reset! You can now login.');
            router.push('/login');
        } catch (error: any)
        {
            const errResponse = error.response?.data?.message;
            const displayError = Array.isArray(errResponse) ? errResponse[0] : errResponse;
            toast.error(displayError || 'Failed to reset password. OTP may have expired or is invalid.');
        } finally
        {
            setIsLoading(false);
        }
    };

    return (
        <div className="togo-contact-sec d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
            <div className="container container-1240">
                <div className="row justify-content-center">
                    <div className="col-lg-5">
                        <div className="togo-contact-wrapper shadow-lg rounded-4 bg-white" style={{ border: '1px solid #f0f0f0' }}>
                            <div className="togo-contact-form">
                                <div className="togo-sign-in-heading text-center mb-30">
                                    <h4 className="togo-section-title fs-48 mb-10">Reset Password</h4>
                                    <p>Enter the 6-digit OTP and new password.</p>
                                </div>
                                {!email ? (
                                    <div className="alert alert-danger text-center">
                                        Missing email address. <Link href="/forgot-password" style={{ textDecoration: 'underline' }}>Request a new OTP</Link>.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="togo-contact-input mb-15">
                                                    <label>6-Digit OTP *</label>
                                                    <input
                                                        type="text"
                                                        {...register('otp')}
                                                        placeholder="Enter OTP from email"
                                                        maxLength={6}
                                                        style={{ height: '45px' }}
                                                    />
                                                    {errors.otp && <span className="text-danger mt-1 d-block" style={{ fontSize: '14px' }}>{errors.otp.message}</span>}
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="togo-contact-input mb-15">
                                                    <label>New Password *</label>
                                                    <input
                                                        type="password"
                                                        {...register('password')}
                                                        placeholder="Create a new password"
                                                        style={{ height: '45px' }}
                                                    />
                                                    {errors.password && <span className="text-danger mt-1 d-block" style={{ fontSize: '14px' }}>{errors.password.message}</span>}
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="togo-contact-input mb-15">
                                                    <label>Confirm New Password *</label>
                                                    <input
                                                        type="password"
                                                        {...register('passwordConfirm')}
                                                        placeholder="Confirm your new password"
                                                        style={{ height: '45px' }}
                                                    />
                                                    {errors.passwordConfirm && <span className="text-danger mt-1 d-block" style={{ fontSize: '14px' }}>{errors.passwordConfirm.message}</span>}
                                                </div>
                                            </div>
                                            <div className="col-xl-12">
                                                <button
                                                    className="togo-btn-primary w-100 d-block mt-3"
                                                    type="submit"
                                                    disabled={isLoading}
                                                    style={{ height: '45px', borderRadius: '6px', fontSize: '15px', fontWeight: 600 }}
                                                >
                                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordForm;
