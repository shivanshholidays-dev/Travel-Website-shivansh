'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

const Skeleton = ({ className = '', style }: SkeletonProps) => (
    <div
        className={className}
        style={{
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px',
            ...style,
        }}
    />
);

export const BlogListSkeleton = () => (
    <div className="togo-sidebar-box">
        <style>{`
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `}</style>
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="togo-sidebar-item d-flex align-items-center mb-50">
                <div className="togo-sidebar-item-thumb" style={{ minWidth: 200 }}>
                    <Skeleton style={{ width: '200px', height: '150px' }} />
                </div>
                <div className="togo-sidebar-item-content" style={{ flex: 1, padding: '0 20px' }}>
                    <Skeleton style={{ width: '80px', height: '20px', marginBottom: '12px' }} />
                    <Skeleton style={{ width: '100%', height: '24px', marginBottom: '8px' }} />
                    <Skeleton style={{ width: '90%', height: '24px', marginBottom: '12px' }} />
                    <Skeleton style={{ width: '70%', height: '16px', marginBottom: '8px' }} />
                    <Skeleton style={{ width: '80%', height: '16px', marginBottom: '16px' }} />
                    <Skeleton style={{ width: '100px', height: '36px' }} />
                </div>
            </div>
        ))}
    </div>
);

export const BlogDetailSkeleton = () => (
    <div className="togo-postbox-box">
        <style>{`
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `}</style>
        <Skeleton style={{ width: '200px', height: '24px', marginBottom: '16px' }} />
        <Skeleton style={{ width: '80%', height: '36px', marginBottom: '12px' }} />
        <Skeleton style={{ width: '60%', height: '36px', marginBottom: '24px' }} />
        <Skeleton style={{ width: '100%', height: '450px', marginBottom: '24px' }} />
        {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} style={{ width: '100%', height: '20px', marginBottom: '12px' }} />
        ))}
    </div>
);

export const HomeBlogSkeleton = () => (
    <div className="row gx-45">
        <style>{`
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `}</style>
        <div className="col-lg-5">
            <div className="togo-blog-item mb-24">
                <Skeleton style={{ width: '100%', height: '320px', borderRadius: '12px', marginBottom: '16px' }} />
                <Skeleton style={{ width: '100px', height: '20px', marginBottom: '10px' }} />
                <Skeleton style={{ width: '90%', height: '28px', marginBottom: '8px' }} />
                <Skeleton style={{ width: '70%', height: '28px', marginBottom: '12px' }} />
                <Skeleton style={{ width: '80%', height: '16px', marginBottom: '16px' }} />
                <Skeleton style={{ width: '120px', height: '36px' }} />
            </div>
        </div>
        <div className="col-lg-7">
            {[1, 2, 3].map((i) => (
                <div key={i} className="togo-blog-item blog-style-2 mb-24">
                    <div className="d-flex gap-3">
                        <Skeleton style={{ width: '120px', height: '100px', borderRadius: '8px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <Skeleton style={{ width: '60px', height: '18px', marginBottom: '8px' }} />
                            <Skeleton style={{ width: '100%', height: '22px', marginBottom: '6px' }} />
                            <Skeleton style={{ width: '85%', height: '22px', marginBottom: '10px' }} />
                            <Skeleton style={{ width: '90px', height: '30px' }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default Skeleton;
