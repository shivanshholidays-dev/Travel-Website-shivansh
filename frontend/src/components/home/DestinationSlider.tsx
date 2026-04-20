'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/mousewheel';
import Link from 'next/link';
import { getImgUrl } from '@lib/utils/image';

interface Destination {
    img?: string;
    image?: string;
    name: string;
    count: number;
}

function getResolvedImg(dest: Destination): string {
    const img = dest.image || dest.img;
    return getImgUrl(img, '/assets/img/destination/thumb-1.jpg');
}

interface DestinationSliderProps {
    destinations: Destination[];
    prevRef: React.RefObject<HTMLButtonElement | null>;
    nextRef: React.RefObject<HTMLButtonElement | null>;
}

export default function DestinationSlider({ destinations, prevRef, nextRef }: DestinationSliderProps) {
    return (
        <div className="togo-destination-slider-wrapper" style={{ position: 'relative' }}>
            <Swiper
                modules={[Navigation, Mousewheel]}
                grabCursor={true}
                loop={true}
                mousewheel={{
                    forceToAxis: true,
                    sensitivity: 1,
                    releaseOnEdges: true,
                }}
                navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                }}
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
                watchSlidesProgress={true}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    992: { slidesPerView: 3 },
                    1200: { slidesPerView: 4 },
                }}
                className="togo-destination-active"
            >
                {destinations?.map((dest) => {
                    const stateParam = encodeURIComponent(dest.name);

                    return (
                        <SwiperSlide key={dest.name}>
                            <div className="togo-destination-item">
                                <div className="togo-destination-item-thumb">
                                    <Link href={`/tours/grid?state=${stateParam}`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={getResolvedImg(dest)}
                                            alt={dest.name}
                                            style={{ width: '100%', height: '350px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    '/assets/img/destination/thumb-1.jpg';
                                            }}
                                        />
                                    </Link>
                                </div>

                                <div className="togo-destination-item-content">
                                    <h4 className="togo-destination-item-title">
                                        <Link href={`/tours/grid?state=${stateParam}`}>{dest.name}</Link>
                                    </h4>
                                    <span className="togo-destination-item-count">
                                        {dest.count} tours
                                    </span>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}