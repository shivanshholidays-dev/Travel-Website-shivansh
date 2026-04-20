'use client';

import Link from 'next/link';
import { useHomeHooks } from '@/src/lib/hooks/useHomeHooks';
import TourCard from '../tours/TourCard';

// Static data removed to use dynamic backend data

export default function PopularToursSection() {
    const { useFeaturedTours } = useHomeHooks();
    const { data: featuredRes, isLoading } = useFeaturedTours();
    const tours = featuredRes?.data?.slice(0, 4) || []; // Limit to 4 for the static grid

    if (isLoading) return null;
    if (tours.length === 0) return null;

    return (
        <div className="togo-tour-3-sec p-relative bg-pos pt-140 pb-140" style={{ backgroundImage: 'url(/assets/img/tour/home-3/tour-3-bg.jpg)' }}>
            <div className="togo-tour-3-overlay"></div>
            <div className="togo-tour-3-shape">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="shape-1" src="/assets/img/tour/home-3/tour-3-shape-1.png" alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="shape-2" src="/assets/img/tour/home-3/tour-3-shape-2.png" alt="" />
            </div>
            <div className="container container-1440">
                <div className="row align-items-center mb-40">
                    <div className="col-lg-6">
                        <div className="togo-tour-3-heading z-index-1">
                            <h3 className="togo-section-title fade-anim">Trending Adventure Tours</h3>
                        </div>
                    </div>
                    <div className="col-lg-6 text-lg-end">
                        <div className="togo-tour-3-right z-index-1 fade-anim">
                            <Link className="togo-btn-primary bdr-style" href="/tours/grid">
                                View all tours
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {tours.map((tour: any) => (
                        <div key={tour._id} className="col-xl-3 col-lg-4 col-sm-6 mb-24">
                            <TourCard tour={tour} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
