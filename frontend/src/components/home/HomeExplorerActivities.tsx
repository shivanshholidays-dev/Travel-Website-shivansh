'use client';

import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Link from 'next/link';
import { useHomeHooks } from '@/src/lib/hooks/useHomeHooks';
import { getTourCategoryLabel } from '@/src/lib/utils/enum-mappings';

// Category list removed to use dynamic home data

const HomeExplorerActivities: React.FC = () => {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
    const { useHomeData } = useHomeHooks();
    const { data: homeRes, isLoading } = useHomeData();

    const allowedCategories = ['ADVENTURE', 'BEACH', 'CULTURAL', 'LEISURE', 'NATURE', 'SPIRITUAL'];
    const fetchedCategories = (homeRes?.data?.filterOptions?.categories || []).filter((cat: string) => allowedCategories.includes(cat));

    // To make infinite loop work when there are only 4 items, we duplicate them
    const categories = fetchedCategories.length > 0 && fetchedCategories.length <= 4
        ? [...fetchedCategories, ...fetchedCategories]
        : fetchedCategories;

    // Fallback images for categories
    const categoryImages: Record<string, string> = {
        'ADVENTURE': '/assets/img/explor/Adventure.jpg',
        'BEACH': '/assets/img/explor/Beach.jpg',
        'CULTURAL': '/assets/img/explor/Cultural.jpg',
        'LEISURE': '/assets/img/explor/Leisure.jpg',
        'NATURE': '/assets/img/explor/Nature.jpg',
        'SPIRITUAL': '/assets/img/explor/Spiritual.jpg'
    };

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (isLoading) return null;
    if (categories.length === 0) return null;

    return (
        <div className="togo-explor-sec fix pt-80 pb-80" style={{ background: '#fff' }}>
            <div className="container container-1440">
                <div className="row align-items-center">
                    {/* Title Section on the left */}
                    <div className="col-lg-3">
                        <div className="togo-chose-3-heading" style={{ borderLeft: '4px solid #111', paddingLeft: '24px' }}>
                            <span className="togo-section-subtitle" style={{ color: '#FD4621', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                                Travel Your Way
                            </span>
                            <h2 className="togo-section-title" style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.1, color: '#111', margin: 0 }}>
                                Explorer Activities
                            </h2>
                        </div>
                    </div>

                    {/* Slider Section on the right */}
                    <div className="col-lg-9">
                        <div className="togo-explor-slider-wrapper" style={{ position: 'relative', padding: '0 50px' }}>
                            {/* Navigation Arrows */}
                            <button
                                ref={(node) => setPrevEl(node)}
                                style={{
                                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    border: '1px solid #eee', background: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 10, cursor: 'pointer', transition: 'all 0.3s',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = '#FD4621'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#FD4621'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111'; e.currentTarget.style.borderColor = '#eee'; }}
                            >
                                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 13L1 7L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <button
                                ref={(node) => setNextEl(node)}
                                style={{
                                    position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    border: '1px solid #eee', background: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 10, cursor: 'pointer', transition: 'all 0.3s',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = '#FD4621'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#FD4621'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111'; e.currentTarget.style.borderColor = '#eee'; }}
                            >
                                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <Swiper
                                modules={[Navigation]}
                                grabCursor={true}
                                loop={true}
                                navigation={{
                                    prevEl: prevEl,
                                    nextEl: nextEl,
                                }}
                                spaceBetween={24}
                                slidesPerView={1}
                                breakpoints={{
                                    576: { slidesPerView: 2 },
                                    992: { slidesPerView: 3 },
                                    1200: { slidesPerView: 4 },
                                }}
                                className="togo-explor-slider"
                            >
                                {categories.map((cat: string, index: number) => {
                                    const isHovered = hoveredIndex === index;
                                    return (
                                        <SwiperSlide key={index}>
                                            <Link
                                                href={`/tours/grid?category=${cat}`}
                                                style={{ display: 'block' }}
                                                onMouseEnter={() => setHoveredIndex(index)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                            >
                                                <div
                                                    className="togo-explor-item"
                                                    style={{
                                                        position: 'relative',
                                                        borderRadius: '50%',
                                                        overflow: 'hidden',
                                                        aspectRatio: '1/1',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        transition: 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
                                                        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                                                    }}>
                                                        <img
                                                            src={categoryImages[cat] || '/assets/img/explor/thumb-1.jpg'}
                                                            alt={cat}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>

                                                    {/* Dark Overlay */}
                                                    <div style={{
                                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                        background: isHovered
                                                            ? 'rgba(0,0,0,0.4)'
                                                            : 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5))',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'all 0.4s ease'
                                                    }}>
                                                        <h4 style={{
                                                            color: '#fff', fontSize: '18px', fontWeight: 700, textAlign: 'center',
                                                            textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                                                            marginBottom: 0,
                                                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                                            transition: 'transform 0.4s ease'
                                                        }}>
                                                            {getTourCategoryLabel(cat)}
                                                        </h4>
                                                    </div>
                                                </div>
                                            </Link>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeExplorerActivities;
