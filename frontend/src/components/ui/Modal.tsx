'use client';

import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    footer?: React.ReactNode;
}

const sizeMap = { sm: 400, md: 560, lg: 720, xl: 900 };

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{ position: 'absolute', inset: 0, background: 'rgba(17,17,17,0.6)' }}
            />
            {/* Modal box */}
            <div
                style={{
                    position: 'relative', zIndex: 1,
                    background: '#fff', borderRadius: 8,
                    width: '100%', maxWidth: sizeMap[size], margin: '0 16px',
                    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    animation: 'modalIn 0.2s ease',
                }}
            >
                <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); }}`}</style>

                {/* Header */}
                {title && (
                    <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h5 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 600, color: '#111' }}>{title}</h5>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#666', lineHeight: 1, padding: 0 }}>×</button>
                    </div>
                )}

                {/* Body */}
                <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>{children}</div>

                {/* Footer */}
                {footer && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
