'use client';

import Link from 'next/link';

export default function HomeBannerSection() {
    return (
        <div className="togo-banner-3-sec">
            <div className="container container-1440">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="togo-banner-3-heading text-center pb-20 pt-40">
                            <h4 className="togo-section-title mb-15 fade-anim" data-delay=".3">Ready to Explore? Let&apos;s Chat About <br /> Your Dream Trip</h4>
                            <div className="togo-banner-3-text fade-anim" data-delay=".5">
                                <p>Let your wanderlust soar! Start exploring today and <br /> let unforgettable experiences await!</p>
                            </div>
                            <div className="togo-banner-3-btn fade-anim" data-delay=".7">
                                <Link className="togo-btn-primary" href="/contact">Plan your trip</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="togo-banne-3-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/img/banner/home-3/banner-bg.png" alt="Banner Background" />
            </div>
        </div>
    );
}
