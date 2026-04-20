'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info' | 'success' | 'warning';
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info',
    isLoading = false
}) => {
    const [mounted, setMounted] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        if (isOpen)
        {
            setMounted(true);
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

    const icons = {
        danger: <Trash2 className="text-danger" size={28} />,
        warning: <AlertTriangle className="text-warning" size={28} />,
        info: <Info className="text-primary" size={28} />,
        success: <CheckCircle className="text-success" size={28} />
    };

    const confirmColors = {
        danger: 'btn-danger',
        warning: 'btn-warning',
        info: 'btn-primary',
        success: 'btn-success'
    };

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
                    maxWidth: '450px',
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
                            backgroundColor: type === 'danger' ? '#fee2e2' :
                                type === 'warning' ? '#fef3c7' :
                                    type === 'success' ? '#dcfce7' : '#dbeafe'
                        }}
                    >
                        {icons[type]}
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
                    <p className="text-muted mb-0" style={{ fontSize: '15px', lineHeight: '1.6' }}>{message}</p>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-light d-flex gap-2 justify-content-end">
                    <button
                        onClick={onClose}
                        className="btn btn-light border rounded-pill px-4 fw-medium text-muted"
                        style={{ fontSize: '14px' }}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`btn ${confirmColors[type]} rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2`}
                        style={{
                            fontSize: '14px',
                            minWidth: '100px',
                            justifyContent: 'center'
                        }}
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        )}
                        {confirmText}
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
            `}</style>
        </div>
    );
};

export default ConfirmationModal;
