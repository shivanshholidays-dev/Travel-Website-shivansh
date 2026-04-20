'use client';

import Link from 'next/link';
import { useSettingsStore } from '@/src/store/useSettingsStore';

export default function HomeGuideSection() {
    const settings = useSettingsStore(state => state.settings);
    const aboutContent = settings?.aboutContent;
    const phoneNumber = settings?.businessDetails?.phoneNumber || "+ (00) 234 777";

    return (
        <div className="togo-guid-3-sec pt-100 pb-40">
            <div className="container container-1440">
                <div className="row">
                    <div className="col-lg-5">
                        <div className="togo-guide-3-heading mb-50">
                            <span className="togo-section-subtitle mb-10 fade-anim">WHO WE ARE</span>
                            <h4 className="togo-section-title mb-15 fade-anim">{aboutContent?.heroSubtitle || 'Bringing Your Travel Dreams to Life'}</h4>
                            <div className="togo-guide-3-text fade-anim">
                                <p className="mb-25">{aboutContent?.missionStatement || 'Shivansh Holidays is a dynamic travel company dedicated to crafting unforgettable experiences for adventurers, explorers, and vacationers alike.'}</p>
                            </div>
                            <div className="togo-guide-2-btn-box d-flex align-items-center fade-anim">
                                <Link className="togo-btn-primary" href="/contact">Contact Us</Link>
                                <a className="togo-btn-tel" href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                            <path d="M14.3 13.3113C12.1046 15.622 6.5045 10.0722 8.70828 7.75274C10.0538 6.33657 8.53383 4.71815 7.69249 3.52856C6.11347 1.29596 2.64707 4.37837 2.75235 6.33915C3.08433 12.5224 9.77308 19.8501 16.2502 19.2109C18.2765 19.011 20.6047 15.3516 18.2805 14.0142C17.1183 13.3454 15.523 12.0241 14.3 13.3113Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M13.75 6.875L17.875 2.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M14.668 2.75L17.8763 2.75L17.8763 5.95833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    {phoneNumber}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="togo-guide-3-thumb-wrapper p-relative">
                            <div className="togo-guide-item-shape fade-anim" data-delay=".9" data-fade-from="top" data-ease="bounce">
                                <div className="togo-guide-item-shape-main p-relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/assets/img/icon/home-1/tent.svg" alt="Icon" />
                                    <div className="togo-guide-item-shape-ani">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src="/assets/img/icon/home-1/tent-text.svg" alt="Icon Text" />
                                    </div>
                                </div>
                            </div>
                            <div className="togo-guide-3-shape-1">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/assets/img/guide/home-3/guide-shape.svg" alt="Shape" />
                            </div>
                            <div className="togo-guide-3-thumb-1 fade-anim">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/assets/img/guide/home-3/thumb-1.webp" alt="Thumb 1" />
                            </div>
                            <div className="togo-guide-3-thumb-2 fade-anim">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/assets/img/guide/home-3/thumb-2.webp" alt="Thumb 2" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
