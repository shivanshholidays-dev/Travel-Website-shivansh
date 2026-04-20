'use client';

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useHomeHooks } from '@/src/lib/hooks/useHomeHooks';
import { getImgUrl } from '@/src/lib/utils/image';

export default function HomeHeroSection() {
    const { useHomeData } = useHomeHooks();
    const { data: homeRes } = useHomeData();
    const settings = homeRes?.data?.settings;

    // Support multiple sliders from new schema, fallback to legacy heroContent
    const sliders = settings?.heroSliders && settings.heroSliders.length > 0
        ? settings.heroSliders
        : [settings?.heroContent || {
            heroTitle: 'The Adventure <br /> Travel Experts.',
            heroSubtitle: 'Asia holidays created by specialists',
            heroCta: 'Explore Tours',
            heroCtaUrl: '/tours/grid',
            heroBannerImage: '/assets/img/hero/home-3/bg-hero.jpg',
            heroHighlights: ['5000+ Happy Travelers']
        }];

    return (
        <div className="togo-hero-3-sec position-relative overflow-hidden">
            <Swiper
                modules={[Autoplay, EffectFade, Navigation, Pagination]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                speed={1500}
                autoplay={{
                    delay: 6000,
                    disableOnInteraction: false,
                }}
                loop={sliders.length > 1}
                navigation={{
                    nextEl: '.custom-swiper-button-next',
                    prevEl: '.custom-swiper-button-prev',
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true
                }}
                onSlideChangeTransitionStart={(swiper) => {
                    const activeSlide = swiper.slides[swiper.activeIndex];
                    const zoomBg = activeSlide?.querySelector('.zoom-bg');
                    if (zoomBg)
                    {
                        zoomBg.classList.add('zoom-active');
                    }
                }}
                onSlideChangeTransitionEnd={(swiper) => {
                    swiper.slides.forEach((slide, idx) => {
                        const zoomBg = slide.querySelector('.zoom-bg');
                        if (zoomBg && idx !== swiper.activeIndex)
                        {
                            zoomBg.classList.remove('zoom-active');
                        }
                    });
                }}
                className="togo-hero-3-swiper"
                style={{ height: '90vh' }}
            >
                {sliders.map((slide: any, index: number) => {
                    // Logic to treat "Title" and "Subtitle" as empty/placeholders as requested
                    const title = (slide.heroTitle && slide.heroTitle.trim() !== 'Title' && slide.heroTitle.trim() !== '') ? slide.heroTitle : '';
                    const subtitle = (slide.heroSubtitle && slide.heroSubtitle.trim() !== 'Subtitle' && slide.heroSubtitle.trim() !== '') ? slide.heroSubtitle : '';
                    const ctaText = slide.heroCta || 'Explore Tours';
                    const ctaUrl = slide.heroCtaUrl || '/tours/grid';
                    const bannerImage = getImgUrl(slide.heroBannerImage, '/assets/img/hero/home-3/bg-hero.jpg');

                    // Filter out meaningless highlights
                    const highlights = (slide.heroHighlights || []).filter((h: string) => h && h !== 'Highlights (Comma Separated)' && h.trim() !== '');

                    return (
                        <SwiperSlide key={index}>
                            <div className="togo-hero-3-wrapper p-relative" style={{ height: '90vh' }}>
                                {/* Background Image with Zoom Effect */}
                                <div
                                    className="togo-hero-2-bg zoom-bg"
                                    style={{
                                        backgroundImage: `url(${bannerImage})`,
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        zIndex: -2,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        transition: 'transform 8s ease-out'
                                    }}
                                ></div>

                                {/* Lighter Overlay for Premium Cinematic Feel */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)',
                                    zIndex: -1
                                }}></div>

                                {/* Decorative Mountain Shape Divider */}
                                <div className="togo-hero-3-bottom-shape" style={{ opacity: 1, bottom: '-1px', zIndex: 5 }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/assets/img/hero/home-3/bg-hero-shape.png" alt="Mountains" style={{ width: '100%', display: 'block', filter: 'brightness(0) invert(1)' }} />
                                </div>

                                <div className="togo-hero-3-item togo-hero-hight d-flex align-items-center justify-content-center" style={{ height: '100%', padding: '0 !important' }}>
                                    <div className="container container-1440" style={{ padding: 0 }}>
                                        <div className="row justify-content-center text-center m-0">
                                            <div className="col-lg-10 col-xl-9">
                                                <div className="togo-hero-2-heading d-flex flex-column align-items-center justify-content-center gap-4">
                                                    {/* Highlights Badges */}
                                                    {highlights.length > 0 && (
                                                        <div className="d-flex flex-wrap justify-content-center gap-2 mb-2 slide-up-animation" style={{ animationDelay: '0.2s' }}>
                                                            {highlights.map((highlight: string, idx: number) => (
                                                                <span key={idx} className="badge px-4 py-2 fs-14 fw-semibold" style={{
                                                                    borderRadius: '50px',
                                                                    background: 'rgba(255, 255, 255, 0.15)',
                                                                    backdropFilter: 'blur(10px)',
                                                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                                                    color: '#fff',
                                                                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                                                    letterSpacing: '0.5px'
                                                                }}>
                                                                    {highlight}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {title && (
                                                        <h1
                                                            className="togo-hero-2-title slide-up-animation m-0"
                                                            style={{
                                                                fontSize: 'calc(2.5rem + 3vw)',
                                                                fontWeight: 800,
                                                                lineHeight: 1.1,
                                                                animationDelay: '0.4s',
                                                                color: '#fff',
                                                                textShadow: '0 4px 15px rgba(0,0,0,0.4)',
                                                                letterSpacing: '-1.5px',
                                                                fontFamily: '"Playfair Display", serif'
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: title }}
                                                        ></h1>
                                                    )}

                                                    {subtitle && (
                                                        <p
                                                            className="fs-22 text-white slide-up-animation m-0"
                                                            style={{
                                                                maxWidth: '800px',
                                                                opacity: 0.95,
                                                                animationDelay: '0.6s',
                                                                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                                                lineHeight: 1.6,
                                                                fontWeight: 400,
                                                                fontFamily: '"Inter", sans-serif'
                                                            }}
                                                        >
                                                            {subtitle}
                                                        </p>
                                                    )}

                                                    <div className="togo-hero-3-btn mt-2 slide-up-animation" style={{ animationDelay: '0.8s' }}>
                                                        <Link
                                                            className="togo-btn-primary px-5 py-3 fs-18 fw-bold d-inline-flex align-items-center gap-2"
                                                            style={{
                                                                borderRadius: '50px',
                                                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                                boxShadow: '0 10px 25px rgba(255, 78, 0, 0.3)'
                                                            }}
                                                            href={ctaUrl || '/tours/grid'}
                                                        >
                                                            {ctaText}
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {/* Custom Navigation Arrows to avoid duplicates */}
            <div className="hero-nav-wrapper">
                <div className="custom-swiper-button-prev hero-arrow-btn">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </div>
                <div className="custom-swiper-button-next hero-arrow-btn">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600&display=swap');

                .togo-hero-3-sec {
                    background: #000;
                }

                /* Robust Centering: Wipe out theme paddings and force center alignment */
                .togo-hero-3-item,
                .togo-hero-hight,
                .togo-hero-1-item {
                    padding: 0 !important;
                    height: 90vh !important;
                    min-height: 90vh !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    margin-top: 0 !important;
                    position: relative !important;
                }
                
                /* Prevent Fade Overlap: Strictly only show the active slide */
                .togo-hero-3-swiper .swiper-slide {
                    opacity: 0 !important;
                    pointer-events: none !important;
                    transition: opacity 1.5s ease-in-out;
                }
                .togo-hero-3-swiper .swiper-slide-active {
                    opacity: 1 !important;
                    pointer-events: auto !important;
                }

                .togo-hero-3-bottom-shape {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    z-index: 5;
                    pointer-events: none;
                }

                .zoom-bg {
                    transform: scale(1);
                }

                .swiper-slide-active .zoom-bg {
                    transform: scale(1.15);
                }
                
                .slide-up-animation {
                    opacity: 0;
                    transform: translateY(30px);
                    animation: slideUp 0.8s forwards ease-out;
                }
                
                @keyframes slideUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .togo-hero-3-swiper .swiper-pagination-bullet {
                    background: #fff;
                    opacity: 0.4;
                    width: 10px;
                    height: 10px;
                    transition: all 0.3s ease;
                }
                .togo-hero-3-swiper .swiper-pagination-bullet-active {
                    opacity: 1;
                    background: var(--togo-primary);
                    width: 35px;
                    border-radius: 6px;
                }
                
                .hero-nav-wrapper {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    transform: translateY(-50%);
                    display: flex;
                    justify-content: space-between;
                    padding: 0 40px;
                    z-index: 10;
                    pointer-events: none;
                }

                .hero-arrow-btn {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    pointer-events: auto;
                }

                .hero-arrow-btn:hover {
                    background: var(--togo-primary);
                    border-color: var(--togo-primary);
                    transform: scale(1.1);
                }

                /* Hide default swiper buttons if they appear */
                .togo-hero-3-swiper .swiper-button-next,
                .togo-hero-3-swiper .swiper-button-prev {
                    display: none !important;
                }
                
                @media (max-width: 768px) {
                    .togo-hero-2-title {
                        font-size: 2.2rem !important;
                    }
                    .hero-nav-wrapper {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}

