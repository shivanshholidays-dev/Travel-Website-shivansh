'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useHomeHooks } from '@/src/lib/hooks/useHomeHooks';
import { getImgUrl } from '@/src/lib/utils/image';

import 'swiper/css';
import 'swiper/css/navigation';

// Finalized static fallback removed

export default function TopDestinationsSection() {
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    const { useToursByState } = useHomeHooks();
    const { data: destRes, isLoading } = useToursByState();
    const destinations = destRes?.data || [];

    if (isLoading) return null;
    if (destinations.length === 0) return null;

    return (
        <div className="togo-destination-3-sec pb-80">
            <div className="container container-1440">
                <div className="row align-items-center">
                    <div className="col-lg-6">
                        <div className="togo-destination-heading mb-40 fade-anim">
                            <h3 className="togo-section-title">Top Destinations</h3>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="togo-destination-right mb-40 fade-anim">
                            <div className="togo-destination-arrows d-flex align-items-center justify-content-lg-end">
                                <button ref={prevRef} className="togo-tour-prev">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="13" viewBox="0 0 7 13" fill="none">
                                            <path d="M6.25 0.75L0.75 6.25L6.25 11.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                                <button ref={nextRef} className="togo-tour-next">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="13" viewBox="0 0 7 13" fill="none">
                                            <path d="M0.75 11.75L6.25 6.25L0.75 0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="togo-destination-3-slider-wrapper">
                        <Swiper
                            modules={[Navigation]}
                            grabCursor={true}
                            loop={true}
                            onBeforeInit={(swiper) => {
                                if (typeof swiper.params?.navigation !== 'boolean' && swiper.params?.navigation)
                                {
                                    swiper.params.navigation.prevEl = prevRef.current;
                                    swiper.params.navigation.nextEl = nextRef.current;
                                }
                            }}
                            onSwiper={(swiper) => {
                                setTimeout(() => {
                                    if (typeof swiper.params?.navigation !== 'boolean' && swiper.params?.navigation)
                                    {
                                        swiper.params.navigation.prevEl = prevRef.current;
                                        swiper.params.navigation.nextEl = nextRef.current;
                                    }
                                    swiper.navigation?.destroy();
                                    swiper.navigation?.init();
                                    swiper.navigation?.update();
                                });
                            }}
                            spaceBetween={24}
                            slidesPerView={1}
                            breakpoints={{
                                640: { slidesPerView: 1 },
                                768: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                                1440: { slidesPerView: 5 },
                            }}
                            className="togo-tour-2-active togo-slide-transtion"
                        >
                            {destinations.map((dest: any, idx: number) => (
                                <SwiperSlide key={idx}>
                                    <div className="togo-destination-item style-3">
                                        <div className="togo-destination-item-thumb">
                                            <Link href={`/tours/grid?state=${encodeURIComponent(dest.state)}`}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={getImgUrl(dest.sampleTours?.[0]?.thumbnailImage || dest.sampleTours?.[0]?.images?.[0], '/assets/img/destination/home-3/thumbnail-1.jpg')}
                                                    alt={dest.state}
                                                    style={{ width: '100%', height: '350px', objectFit: 'cover' }}
                                                />
                                            </Link>
                                        </div>
                                        <div className="togo-destination-item-wrap d-flex justify-content-between">
                                            <div className="togo-destination-item-content">
                                                <h4 className="togo-destination-item-title">
                                                    <Link href={`/tours/grid?state=${encodeURIComponent(dest.state)}`}>{dest.state}</Link>
                                                </h4>
                                                <span className="togo-destination-item-count">{dest.tourCount} tours</span>
                                            </div>
                                            <div className="togo-destination-3-btn">
                                                <Link href={`/tours/grid?state=${encodeURIComponent(dest.state)}`}>
                                                    <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                            <path d="M0.75 10.8333L10.8333 0.75M10.8333 0.75H2.58333M10.8333 0.75V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </div>
    );
}
