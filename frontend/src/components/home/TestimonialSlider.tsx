'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface Testimonial {
    user: string;
    name: string;
    city: string;
}

export default function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
    return (
        <div className="togo-testimonial-slider-wrap" style={{ position: 'relative' }}>
            <div className="togo-testimonial-slider mb-30">
                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        nextEl: '.togo-testimonial-next',
                        prevEl: '.togo-testimonial-prev',
                    }}
                    spaceBetween={24}
                    slidesPerView={1}
                    className="togo-testimonial-active"
                >
                    {testimonials.map(({ user, name, city }) => (
                        <SwiperSlide key={name}>
                            <div className="togo-testimonial-item">
                                <div className="togo-testimonial-item-content">
                                    <p>The camping journey in the Primeval Forest of the Central Highlands was absolutely incredible and exceeded all my expectations! The guides were incredibly dedicated, knowledgeable, and made the trip feel safe and enjoyable, even for a first-time camper like me.</p>
                                </div>
                                <div className="togo-testimonial-item-user d-flex align-items-center">
                                    <div className="togo-testimonial-item-user-thumb">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={`/assets/img/testimonial/${user}`} alt={name} />
                                    </div>
                                    <div className="togo-testimonial-item-user-content">
                                        <h4>{name}</h4>
                                        <p>{city}</p>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Nav buttons — inside the same wrapper as Swiper so they're found on init */}
            <div className="togo-testimonial-arrows d-flex align-items-center gap-2 mt-20">
                <button className="togo-testimonial-prev">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="13" viewBox="0 0 7 13" fill="none">
                            <path d="M6.25 0.75L0.75 6.25L6.25 11.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>
                <button className="togo-testimonial-next">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="13" viewBox="0 0 7 13" fill="none">
                            <path d="M0.75 11.75L6.25 6.25L0.75 0.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    );
}
