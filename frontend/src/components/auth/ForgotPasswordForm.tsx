'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import axios from '@/src/lib/api/axios';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordValues) => {
        try
        {
            setIsLoading(true);
            await axios.post('/auth/forgot-password', data);

            toast.success('OTP sent to your email!');
            router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
        } catch (error: any)
        {
            const errResponse = error.response?.data?.message;
            const displayError = Array.isArray(errResponse) ? errResponse[0] : errResponse;
            toast.error(displayError || 'Failed to send reset link. Please try again.');
        } finally
        {
            setIsLoading(false);
        }
    };

    return (
        <div className="togo-contact-sec d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
            <div className="container container-1440">
                <div className="row justify-content-center">
                    <div className="col-lg-5">
                        <div className="togo-contact-wrapper shadow-lg p-4 p-md-4 rounded-4 bg-white" style={{ border: '1px solid #f0f0f0' }}>
                            <div className="togo-contact-form">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="togo-sign-in-heading text-center mb-30">
                                                <h4 className="togo-section-title fs-48 mb-10">Forgot Password</h4>
                                                <p>Remember your password? <Link href="/login">Sign In</Link></p>
                                            </div>
                                            <div className="togo-contact-input mb-15">
                                                <label>Email *</label>
                                                <input
                                                    type="email"
                                                    {...register('email')}
                                                    placeholder="Your email address"
                                                    style={{ height: '50px' }}
                                                />
                                                {errors.email && <span className="text-danger mt-1 d-block" style={{ fontSize: '14px' }}>{errors.email.message}</span>}
                                            </div>
                                        </div>
                                        <div className="col-xl-12">
                                            <button
                                                className="togo-btn-primary w-100 d-block mt-3"
                                                type="submit"
                                                disabled={isLoading}
                                                style={{ height: '50px', borderRadius: '6px', fontSize: '15px', fontWeight: 600 }}
                                            >
                                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                                            </button>
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

export default ForgotPasswordForm;
