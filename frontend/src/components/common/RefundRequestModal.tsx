'use client';

import React, { useEffect, useState } from 'react';
import { X, RefreshCcw } from 'lucide-react';

interface RefundRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title: string;
    bookingNumber: string;
    amountToRefund: number;
    isLoading?: boolean;
}

const RefundRequestModal: React.FC<RefundRequestModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    bookingNumber,
    amountToRefund,
    isLoading = false
}) => {
    const [mounted, setMounted] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (isOpen)
        {
            setMounted(true);
            setReason('');
            setTimeout(() => setAnimateIn(true), 10);
            document.body.style.overflow = 'hidden';
        } else
        {
            setAnimateIn(false);
            const timer = setTimeout(() => {
                setMounted(false);
                document.body.style.overflow = 'auto';
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!mounted) return null;

    return (
        <div
            className={`fixed-top w-100 h-100 d-flex align-items-center justify-content-center px-3`}
            style={{
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                opacity: animateIn ? 1 : 0,
                transition: 'opacity 0.3s ease-out',
                position: 'fixed'
            }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-4 shadow-lg overflow-hidden"
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    transform: animateIn ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    border: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="p-4 pb-0 d-flex justify-content-between align-items-start">
                    <div
                        className={`rounded-3 d-flex align-items-center justify-content-center mb-3`}
                        style={{
                            width: '52px',
                            height: '52px',
                            backgroundColor: '#e0f2fe'
                        }}
                    >
                        <RefreshCcw className="text-primary" size={28} />
                    </div>
                    <button
                        onClick={onClose}
                        className="btn border-0 p-1 text-muted hover-dark transition-all"
                        style={{ background: 'transparent' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-4 pb-4">
                    <h3 className="fw-bold text-dark mb-2" style={{ fontSize: '20px', letterSpacing: '-0.3px' }}>{title}</h3>
                    <p className="text-muted mb-4" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                        You are requesting a refund for booking <strong>#{bookingNumber}</strong>.
                        The amount paid to be considered for refund is <strong>₹{new Intl.NumberFormat('en-IN').format(amountToRefund)}</strong>.
                    </p>

                    <div className="form-group mb-0">
                        <label className="form-label fw-bold text-dark mb-2" style={{ fontSize: '14px' }}>
                            Reason for Refund <span className="text-danger">*</span>
                        </label>
                        <textarea
                            className="form-control rounded-3 border-light-subtle"
                            placeholder="Please explain why you are requesting a refund..."
                            rows={4}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            style={{ fontSize: '14px', resize: 'none', backgroundColor: '#fcfcfc' }}
                        ></textarea>
                        <p className="mt-2 text-muted" style={{ fontSize: '12px' }}>
                            Our team will review your request according to the cancellation policy.
                        </p>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-light d-flex gap-2 justify-content-end">
                    <button
                        onClick={onClose}
                        className="btn btn-light border rounded-pill px-4 fw-medium text-muted"
                        style={{ fontSize: '14px' }}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        className={`btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2`}
                        style={{
                            fontSize: '14px',
                            minWidth: '150px',
                            justifyContent: 'center'
                        }}
                        disabled={isLoading || !reason.trim()}
                    >
                        {isLoading && (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        )}
                        Submit Request
                    </button>
                </div>
            </div>

            <style jsx>{`
                .hover-dark:hover {
                    color: #000 !important;
                    background: #f8f9fa !important;
                }
                .transition-all {
                    transition: all 0.2s ease;
                }
                .form-control:focus {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
                }
            `}</style>
        </div>
    );
};

export default RefundRequestModal;
