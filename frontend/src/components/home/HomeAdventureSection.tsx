'use client';

export default function HomeAdventureSection() {
    return (
        <div className="togo-adventure-sec p-relative pb-60">
            <div className="togo-adventure-bg-shape">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/img/adventure/shape-1.png" alt="" />
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="togo-adventure-heading text-center mb-40">
                            <h3 className="togo-section-title ff-playfair fw-600 fade-anim">How to book your adventure?</h3>
                            <div className="togo-adventure-text fade-anim">
                                <p>Booking your dream camping tour has never been easier! <br /> Follow these four super simple steps.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container container-1440">
                <div className="togo-adventure-item-wrap p-relative">
                    <div className="row">
                        <div className="col-lg-3 col-sm-6">
                            <div className="togo-adventure-item mb-30 fade-anim">
                                <div className="togo-adventure-item-point p-relative">
                                    <span className="togo-adventure-item-icon">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src="/assets/img/adventure/icon-1.svg" alt="" />
                                    </span>
                                    <span className="togo-adventure-item-number">01</span>
                                </div>
                                <h4 className="togo-adventure-item-title">Explore & Select tour</h4>
                                <p>Lorem ipsum dolor sit amet consectetur. <br /> Pellentesque urna tortor bibendum.</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="togo-adventure-item mb-30 fade-anim">
                                <div className="togo-adventure-item-point p-relative">
                                    <span className="togo-adventure-item-icon">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src="/assets/img/adventure/icon-2.svg" alt="" />
                                    </span>
                                    <span className="togo-adventure-item-number">02</span>
                                </div>
                                <h4 className="togo-adventure-item-title">Fill information</h4>
                                <p>Lorem ipsum dolor sit amet consectetur. <br /> Pellentesque urna tortor bibendum.</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="togo-adventure-item mb-30 fade-anim">
                                <div className="togo-adventure-item-point p-relative">
                                    <span className="togo-adventure-item-icon">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src="/assets/img/adventure/icon-3.svg" alt="" />
                                    </span>
                                    <span className="togo-adventure-item-number">03</span>
                                </div>
                                <h4 className="togo-adventure-item-title">Make payment</h4>
                                <p>Lorem ipsum dolor sit amet consectetur. <br /> Pellentesque urna tortor bibendum.</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="togo-adventure-item mb-30 fade-anim">
                                <div className="togo-adventure-item-point p-relative">
                                    <span className="togo-adventure-item-icon">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src="/assets/img/adventure/icon-4.svg" alt="" />
                                    </span>
                                    <span className="togo-adventure-item-number">04</span>
                                </div>
                                <h4 className="togo-adventure-item-title">Get confirm & Finish</h4>
                                <p>Lorem ipsum dolor sit amet consectetur. <br /> Pellentesque urna tortor bibendum.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
