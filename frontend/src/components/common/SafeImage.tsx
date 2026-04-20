'use client';
import React, { useState, useEffect } from 'react';
import { getImgUrl } from '@/src/lib/utils/image';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

/**
 * A wrapper around standard <img> that provides robust fallback handling
 * and defaults to lazy loading.
 */
export default function SafeImage({
    src,
    fallbackSrc = '/assets/img/tour/home-9/thumb-5.jpg',
    alt,
    ...props
}: SafeImageProps) {
    const [imgSrc, setImgSrc] = useState<string>(fallbackSrc);

    // Update src when prop changes
    useEffect(() => {
        const urlToResolve = typeof src === 'string' ? src : undefined;
        setImgSrc(getImgUrl(urlToResolve, fallbackSrc));
    }, [src, fallbackSrc]);

    return (
        <img
            {...props}
            src={imgSrc}
            alt={alt || 'Image'}
            onError={() => {
                if (imgSrc !== fallbackSrc)
                {
                    setImgSrc(fallbackSrc);
                }
            }}
            loading={props.loading || 'lazy'}
        />
    );
}
