'use client';

import { useEffect, useState, useRef } from 'react';

function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLSpanElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting)
                {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (countRef.current)
        {
            observer.observe(countRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let start = 0;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end)
            {
                setCount(end);
                clearInterval(timer);
            } else
            {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [isVisible, end]);

    return <span ref={countRef}>{count}{suffix}</span>;
}

export default function HomeCounterSection() {
    return (
        <div className="togo-counter-sec">
            <div className="container container-1440">
                <div className="togo-counter-wrapper">
                    <div className="row">
                        <div className="col-lg-3 col-sm-6">
                            <div className="togo-counter-item text-center mb-24">
                                <div className="togo-counter-item-icon">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/assets/img/icon/home-3/counter/icon-1.svg" alt="Icon" />
                                </div>
                                <div className="togo-counter-item-content">
                                    <h4 className="togo-counter-item-title">
                                        <Counter end={45} suffix="K+" />
                                    </h4>
                                    <p>Happy campers</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="togo-counter-item text-center mb-24">
                                <div className="togo-counter-item-icon">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/assets/img/icon/home-3/counter/icon-2.svg" alt="Icon" />
                                </div>
                                <div className="togo-counter-item-content">
                                    <h4 className="togo-counter-item-title">
                                        <Counter end={60} suffix="+" />
                                    </h4>
                                    <p>Destinations</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="togo-counter-item text-center mb-24">
                                <div className="togo-counter-item-icon">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/assets/img/icon/home-3/counter/icon-3.svg" alt="Icon" />
                                </div>
                                <div className="togo-counter-item-content">
                                    <h4 className="togo-counter-item-title">
                                        <Counter end={1500} suffix="+" />
                                    </h4>
                                    <p>Trips sold</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="togo-counter-item text-center mb-24">
                                <div className="togo-counter-item-icon">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/assets/img/icon/home-3/counter/icon-4.svg" alt="Icon" />
                                </div>
                                <div className="togo-counter-item-content">
                                    <h4 className="togo-counter-item-title">
                                        <Counter end={150} suffix="+" />
                                    </h4>
                                    <p>Travel buddies</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
