'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

export default function TextSlider() {
    return (
        <div className="togo-text-slider-sec fix pt-80 pb-60">
            <div className="togo-text-slider-wrapper">
                <Swiper
                    modules={[Autoplay]}
                    spaceBetween={30}
                    slidesPerView="auto"
                    loop={true}
                    speed={5000}
                    autoplay={{ delay: 0, disableOnInteraction: false }}
                    className="togo-text-slide-active"
                    wrapperClass="swiper-wrapper togo-slide-transtion"
                >
                    {[1, 2, 3, 4, 5, 1, 2, 3].map((n, idx) => (
                        <SwiperSlide key={idx} style={{ width: 'auto' }}>
                            <div className="togo-text-slider-item">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`/assets/img/text-slider/text-icon-${n > 5 ? n - 5 : n}.svg`} alt="" />
                                <span>Your next adventure starts here</span>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="togo-text-slider-bg-wrapper">
                <Swiper
                    modules={[Autoplay]}
                    spaceBetween={30}
                    slidesPerView="auto"
                    loop={true}
                    speed={5000}
                    autoplay={{ delay: 0, disableOnInteraction: false, reverseDirection: true }}
                    className="togo-text-slide-2-active"
                    wrapperClass="swiper-wrapper togo-slide-transtion"
                    dir="rtl"
                >
                    {[1, 2, 3, 4, 5, 1, 2, 3].map((n, idx) => (
                        <SwiperSlide key={idx} style={{ width: 'auto' }}>
                            <div className="togo-text-slider-bg-item">
                                <span>Bringing you unforgettable journeys</span>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}
