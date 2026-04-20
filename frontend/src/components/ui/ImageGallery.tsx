'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import SafeImage from '@/src/components/common/SafeImage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ImageGalleryProps {
    images: string[];
    className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev: number) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev: number) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className={cn("togo-image-gallery", className)}>
            <div className="row g-2">
                {images.slice(0, 4).map((img, idx) => (
                    <div
                        key={idx}
                        className={cn("col-6 cursor-pointer overflow-hidden rounded", idx === 0 ? "col-12" : "")}
                        onClick={() => openLightbox(idx)}
                    >
                        <div className="p-relative w-100 bg-light" style={{ aspectRatio: idx === 0 ? '16/9' : '1/1' }}>
                            <SafeImage
                                src={img}
                                alt={`Gallery image ${idx + 1}`}
                                fallbackSrc="/assets/img/tour/tour-thumb-1.jpg"
                                className="object-cover transition-transform hover-scale scale-105 duration-300"
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {idx === 3 && images.length > 4 && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
                                    <span className="text-white fs-4 fw-bold">+{images.length - 4}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 z-max bg-dark bg-opacity-90 d-flex align-items-center justify-content-center"
                    onClick={closeLightbox}
                    style={{ zIndex: 9999 }}
                >
                    <button
                        className="position-absolute top-0 end-0 m-4 bg-transparent border-0 text-white"
                        onClick={closeLightbox}
                        style={{ width: 40, height: 40 }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <button
                        className="position-absolute start-0 ms-4 bg-white bg-opacity-25 rounded-circle border-0 text-white d-flex align-items-center justify-content-center hover:bg-opacity-50 transition-colors"
                        onClick={prevImage}
                        style={{ width: 50, height: 50 }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>

                    <div className="p-relative w-75 h-75 d-flex align-items-center justify-content-center" onClick={e => e.stopPropagation()}>
                        <SafeImage
                            src={images[currentIndex]}
                            alt={`Gallery image ${currentIndex + 1}`}
                            fallbackSrc="/assets/img/tour/tour-thumb-1.jpg"
                            className="max-w-100 max-h-100 object-contain rounded"
                        />
                    </div>

                    <button
                        className="position-absolute end-0 me-4 bg-white bg-opacity-25 rounded-circle border-0 text-white d-flex align-items-center justify-content-center hover:bg-opacity-50 transition-colors"
                        onClick={nextImage}
                        style={{ width: 50, height: 50 }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>

                    <div className="position-absolute bottom-0 mb-4 text-white">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </div>
    );
};
